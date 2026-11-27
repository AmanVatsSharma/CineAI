"""Campaign orchestrator: brief → scenes → brand-checked assets → ads → follow-ups.

Agents (all deterministic here, model-backed behind `GenerationProvider` later):
  Creative Director  plans scenes            Scriptwriter     owns voiceover + on-screen copy
  Brand Guardian     checks + revises        Image Artist     keyframes, end cards
  Video Producer     scene clips             Audio Producer   voice, music bed, ambience
  Ad Strategist      channel cuts            Follow-Up        tasks after generation

Mutates the Campaign in place so a poller sees live progress.
"""

import asyncio
import logging
from collections.abc import Callable
from datetime import UTC, datetime

from ..brands.guardian import (
    Finding,
    GuardianReport,
    merge_reports,
    missing_disclaimers,
    refine_copy,
    refine_visual_prompt,
)
from ..brands.schemas import Brand
from ..catalog import Modality, Priority, RoutingDecision, estimate_credits, get_model, route
from . import prompts
from .ads import build_ad
from .followups import plan_follow_ups
from .planner import Planner, TemplatePlanner
from .providers import AssetRequest, GenerationProvider, StubProvider
from .schemas import (
    AgentRole,
    AgentStep,
    Brief,
    Campaign,
    CampaignStatus,
    Deliverable,
    Scene,
)

log = logging.getLogger(__name__)

PRODUCTION_ORDER = [
    Modality.COPY,
    Modality.VOICE,
    Modality.IMAGE,
    Modality.VIDEO,
    Modality.MUSIC,
    Modality.SFX,
]
_AGENT = {
    Modality.COPY: AgentRole.SCRIPTWRITER,
    Modality.VOICE: AgentRole.AUDIO_PRODUCER,
    Modality.IMAGE: AgentRole.IMAGE_ARTIST,
    Modality.VIDEO: AgentRole.VIDEO_PRODUCER,
    Modality.MUSIC: AgentRole.AUDIO_PRODUCER,
    Modality.SFX: AgentRole.AUDIO_PRODUCER,
}


def _iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def validate_brief(brand: Brand, brief: Brief) -> None:
    known = {c.id for c in brand.channels}
    unknown = [c for c in brief.channels if c not in known]
    if unknown:
        raise ValueError(
            f"Unknown channel(s) for {brand.name}: {', '.join(unknown)}. "
            f"Available: {', '.join(sorted(known))}"
        )


def new_campaign(campaign_id: str, brand: Brand, brief: Brief, now: datetime) -> Campaign:
    validate_brief(brand, brief)
    return Campaign(
        id=campaign_id,
        brand_id=brand.id,
        brief=brief,
        created_at=_iso(now),
        updated_at=_iso(now),
    )


class Orchestrator:
    def __init__(
        self,
        *,
        provider: GenerationProvider | None = None,
        planner: Planner | None = None,
        clock: Callable[[], datetime] | None = None,
        max_revisions: int = 2,
    ) -> None:
        self.provider = provider or StubProvider()
        self.planner = planner or TemplatePlanner()
        self.clock = clock or (lambda: datetime.now(UTC))
        self.max_revisions = max_revisions

    # ── public ──

    async def run(self, campaign: Campaign, brand: Brand) -> Campaign:
        try:
            await self._run(campaign, brand)
        except Exception as exc:  # noqa: BLE001 - surface any failure on the campaign itself
            log.exception("campaign %s failed", campaign.id)
            self._set(campaign, "failed")
            self._log(campaign, AgentRole.ORCHESTRATOR, "failed", str(exc))
        return campaign

    # ── pipeline ──

    async def _run(self, campaign: Campaign, brand: Brand) -> None:
        brief = campaign.brief
        self._set(campaign, "planning")
        campaign.scenes = self.planner.plan(brand, brief)
        self._log(
            campaign,
            AgentRole.CREATIVE_DIRECTOR,
            "planned scenes",
            f"{len(campaign.scenes)} scenes · {brief.total_duration_s}s · "
            + " → ".join(s.beat for s in campaign.scenes),
        )
        await asyncio.sleep(0)

        script_reports = self._review_script(campaign, brand)
        await asyncio.sleep(0)

        plan, over_budget_by = self._plan_production(campaign, brand)
        campaign.deliverables = plan
        campaign.total_credits = sum(d.credits for d in plan)
        self._set(campaign, "producing")

        for i, d in enumerate(plan, start=1):
            await self._produce(campaign, brand, d, script_reports)
            campaign.progress = round(90 * i / len(plan))
            await asyncio.sleep(0)

        self._set(campaign, "reviewing")
        for n, ch in enumerate(brief.channels, start=1):
            rule = brand.channel(ch)
            assert rule is not None  # validated at creation
            ad = build_ad(brand, brief, campaign.scenes, rule, f"ad-{n}")
            campaign.ads.append(ad)
            self._log(
                campaign,
                AgentRole.AD_STRATEGIST,
                f"cut {rule.label} variant",
                f"{ad.duration_s}s · scenes {ad.scene_indexes} · brand score {ad.brand_score}",
            )
            await asyncio.sleep(0)

        scores = [d.brand_score for d in campaign.deliverables] + [
            a.brand_score for a in campaign.ads
        ]
        campaign.brand_score = round(sum(scores) / len(scores)) if scores else 100

        campaign.follow_ups = plan_follow_ups(campaign, self.clock(), over_budget_by=over_budget_by)
        self._log(
            campaign,
            AgentRole.FOLLOW_UP,
            "scheduled follow-ups",
            f"{len(campaign.follow_ups)} tasks "
            f"({sum(f.owner == 'human' for f in campaign.follow_ups)} need a human)",
        )

        blocked = any(d.status in ("needs_review", "failed") for d in campaign.deliverables) or any(
            not a.passed for a in campaign.ads
        )
        campaign.progress = 100
        self._set(campaign, "needs_attention" if blocked or over_budget_by else "ready")

    def _review_script(
        self, campaign: Campaign, brand: Brand
    ) -> dict[int, tuple[GuardianReport, int]]:
        """Scriptwriter drafts are already in the scenes; the Guardian cleans them in place."""
        reports: dict[int, tuple[GuardianReport, int]] = {}
        for s in campaign.scenes:
            revisions = 0
            s.voiceover, report, r = refine_copy(
                brand,
                s.voiceover,
                field="body",
                require_disclaimers=False,
                max_rounds=self.max_revisions,
            )
            revisions += r
            if s.on_screen_text:
                s.on_screen_text, ost_report, r = refine_copy(
                    brand,
                    s.on_screen_text,
                    field="headline",
                    require_disclaimers=False,
                    max_rounds=self.max_revisions,
                )
                revisions += r
                report = merge_reports(report, ost_report)
            reports[s.index] = (report, revisions)
            if revisions:
                self._log(
                    campaign,
                    AgentRole.BRAND_GUARDIAN,
                    f"revised scene {s.index} copy",
                    f"{revisions} revision round(s) to meet voice guide",
                )

        # Disclaimers apply to the finished piece once, not to every scene.
        script = " ".join(f"{s.voiceover} {s.on_screen_text}" for s in campaign.scenes)
        needed = missing_disclaimers(brand, script)
        if needed:
            last = campaign.scenes[-1]
            last.voiceover = f"{last.voiceover} {' '.join(needed)}"
            self._log(
                campaign,
                AgentRole.BRAND_GUARDIAN,
                "added required disclaimer",
                f'Appended to scene {last.index}: "{" ".join(needed)}"',
            )
        return reports

    def _plan_production(self, campaign: Campaign, brand: Brand) -> tuple[list[Deliverable], int]:
        brief = campaign.brief
        plan = self._build_plan(campaign, brand, brief.priority)
        total = sum(d.credits for d in plan)
        over_by = 0
        if brief.budget_credits and total > brief.budget_credits:
            if brief.priority != "cost":
                cheaper = self._build_plan(campaign, brand, "cost")
                self._log(
                    campaign,
                    AgentRole.ORCHESTRATOR,
                    "re-routed to fit budget",
                    f"{total} credits exceeds the {brief.budget_credits} budget; "
                    f"switched to cost priority ({sum(d.credits for d in cheaper)} credits)",
                )
                plan, total = cheaper, sum(d.credits for d in cheaper)
            over_by = max(0, total - brief.budget_credits)
        by_modality = ", ".join(
            f"{m.value}×{sum(d.modality == m for d in plan)}"
            for m in PRODUCTION_ORDER
            if any(d.modality == m for d in plan)
        )
        self._log(
            campaign,
            AgentRole.ORCHESTRATOR,
            "routed models",
            f"{len(plan)} deliverables ({by_modality}) · {total} credits",
        )
        return plan, over_by

    def _build_plan(
        self, campaign: Campaign, brand: Brand, priority: Priority
    ) -> list[Deliverable]:
        brief = campaign.brief
        wanted = [m for m in PRODUCTION_ORDER if m in brief.modalities]
        out: list[Deliverable] = []

        def add(
            modality: Modality,
            scene: Scene | None,
            decision: RoutingDecision,
            quantity: float,
            prompt: str,
            *,
            negative: str | None = None,
            text: str | None = None,
        ) -> None:
            out.append(
                Deliverable(
                    id=f"d-{len(out) + 1}",
                    scene_index=scene.index if scene else None,
                    modality=modality,
                    agent=_AGENT[modality],
                    model_id=decision.model.id,
                    model_name=decision.model.name,
                    prompt=prompt,
                    negative_prompt=negative,
                    text=text,
                    credits=estimate_credits(decision.model, quantity),
                )
            )

        for modality in wanted:
            if modality in (Modality.COPY, Modality.VOICE, Modality.IMAGE, Modality.VIDEO):
                for s in campaign.scenes:
                    if modality is Modality.COPY:
                        dec = route(modality, use_case="script", priority=priority)
                        add(
                            modality,
                            s,
                            dec,
                            1,
                            f"Write {s.beat} copy in the {brand.name} voice.",
                            text=s.voiceover,
                        )
                    elif modality is Modality.VOICE:
                        dec = route(modality, use_case="voiceover", priority=priority)
                        add(
                            modality,
                            s,
                            dec,
                            len(s.voiceover),
                            prompts.voice_direction(brand, s),
                            text=s.voiceover,
                        )
                    elif modality is Modality.IMAGE:
                        end_card = s.beat == "cta"
                        dec = route(
                            modality,
                            priority=priority,
                            require=("text_in_image",) if end_card else (),
                            use_case="social_ad"
                            if end_card
                            else "product_shot"
                            if s.beat == "solution"
                            else "brand_film",
                        )
                        add(
                            modality,
                            s,
                            dec,
                            1,
                            prompts.visual_prompt(brand, s, video=False),
                            negative=prompts.negative_prompt(brand),
                        )
                    else:
                        dec = self._route_video(s, priority, brief)
                        add(
                            modality,
                            s,
                            dec,
                            s.duration_s,
                            prompts.visual_prompt(brand, s, video=True),
                            negative=prompts.negative_prompt(brand),
                        )
            elif modality is Modality.MUSIC:
                dec = route(modality, use_case="background_music", priority=priority)
                add(modality, None, dec, 1, prompts.music_prompt(brand, brief.total_duration_s))
            else:
                dec = route(modality, use_case="ambient", priority=priority)
                add(modality, None, dec, 1, prompts.sfx_prompt(brand, brief.total_duration_s))
        return out

    def _route_video(self, scene: Scene, priority: Priority, brief: Brief) -> RoutingDecision:
        use_case = "social_ad" if brief.objective in ("conversion", "launch") else "brand_film"
        exclude: list[str] = []
        while True:  # skip models that cannot render a scene this long
            dec = route(Modality.VIDEO, use_case=use_case, priority=priority, exclude=exclude)
            cap = dec.model.max_duration_s
            if cap is None or scene.duration_s <= cap:
                return dec
            exclude.append(dec.model.id)

    async def _produce(
        self,
        campaign: Campaign,
        brand: Brand,
        d: Deliverable,
        script_reports: dict[int, tuple[GuardianReport, int]],
    ) -> None:
        d.status = "generating"
        scene = next((s for s in campaign.scenes if s.index == d.scene_index), None)
        report: GuardianReport | None = None

        if d.modality in (Modality.IMAGE, Modality.VIDEO):
            d.prompt, report, d.revisions = refine_visual_prompt(
                brand, d.prompt, max_rounds=self.max_revisions
            )
            if d.revisions:
                self._log(
                    campaign,
                    AgentRole.BRAND_GUARDIAN,
                    f"revised {d.id} prompt",
                    f"{d.revisions} round(s): brand palette / do-not-show list applied",
                )
        elif d.modality in (Modality.COPY, Modality.VOICE) and scene:
            report, revisions = script_reports.get(scene.index, (None, 0))
            if d.modality is Modality.COPY:
                d.revisions = revisions

        try:
            result = await self.provider.generate(
                AssetRequest(
                    model=get_model(d.model_id),
                    prompt=d.prompt,
                    negative_prompt=d.negative_prompt,
                    text=d.text,
                    duration_s=scene.duration_s if scene else campaign.brief.total_duration_s,
                    aspect_ratio=None,
                )
            )
        except Exception as exc:  # noqa: BLE001 - one bad asset must not sink the campaign
            d.status = "failed"
            d.findings = [Finding(code="provider_error", severity="error", message=str(exc))]
            d.brand_score = 0
            self._log(campaign, d.agent, f"{d.modality.value} failed", f"{d.id}: {exc}")
            return

        d.uri = result.uri
        if report:
            d.findings, d.brand_score = report.findings, report.score
        d.status = "needs_review" if report and not report.passed else "done"
        where = f"scene {scene.index}" if scene else "campaign"
        self._log(
            campaign,
            d.agent,
            f"generated {d.modality.value}",
            f"{where} · {d.model_name} · {d.credits} credits",
        )

    # ── helpers ──

    def _set(self, campaign: Campaign, status: CampaignStatus) -> None:
        campaign.status = status
        campaign.updated_at = _iso(self.clock())

    def _log(self, campaign: Campaign, agent: AgentRole, action: str, detail: str) -> None:
        campaign.steps.append(
            AgentStep(at=_iso(self.clock()), agent=agent, action=action, detail=detail)
        )
        campaign.updated_at = _iso(self.clock())


__all__ = ["Orchestrator", "new_campaign", "validate_brief"]
