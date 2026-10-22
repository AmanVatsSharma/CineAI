"""Ad Strategist: cut channel-specific variants from the scene plan.

Variants are assembly manifests (which scenes, what copy, what format). The
compositor that renders them is a Phase 4 agent.
"""

from ..brands.guardian import Finding, merge_reports, refine_copy
from ..brands.schemas import Brand, ChannelRule
from .schemas import AdVariant, Brief, Scene


def select_scenes(scenes: list[Scene], max_duration_s: int) -> list[Scene]:
    """Always keep the hook and the CTA; fill the middle in story order while it fits."""
    if len(scenes) <= 2:
        return list(scenes)
    chosen = {scenes[0].index, scenes[-1].index}
    total = scenes[0].duration_s + scenes[-1].duration_s
    for s in scenes[1:-1]:
        if total + s.duration_s <= max_duration_s:
            chosen.add(s.index)
            total += s.duration_s
    return [s for s in scenes if s.index in chosen]


def build_ad(
    brand: Brand, brief: Brief, scenes: list[Scene], rule: ChannelRule, ad_id: str
) -> AdVariant:
    cut = select_scenes(scenes, rule.max_duration_s)
    duration = sum(s.duration_s for s in cut)
    findings: list[Finding] = []
    revisions = 0

    headline, h_rep, r = refine_copy(
        brand, brief.key_message, channel=rule.id, field="headline", require_disclaimers=False
    )
    revisions += r
    draft = f"{brief.product}. {brief.key_message}"
    body, b_rep, r = refine_copy(
        brand,
        draft[:1].upper() + draft[1:],
        channel=rule.id,
        field="body",
        trigger_context=headline,
    )
    revisions += r
    cta, c_rep, r = refine_copy(
        brand, brief.cta, channel=rule.id, field="cta", require_disclaimers=False
    )
    revisions += r

    reports = [h_rep, b_rep, c_rep]
    findings.extend(merge_reports(*reports).findings)
    if duration > rule.max_duration_s:
        findings.append(
            Finding(
                code="channel_duration",
                severity="warning",
                message=f"Hook + CTA run {duration}s, over the {rule.max_duration_s}s limit.",
                suggestion="Shorten the opening/closing scenes or pick a longer-format channel.",
            )
        )
    score = round(sum(rep.score for rep in reports) / len(reports))
    return AdVariant(
        id=ad_id,
        channel=rule.id,
        channel_label=rule.label,
        aspect_ratio=rule.aspect_ratio,
        duration_s=duration,
        scene_indexes=[s.index for s in cut],
        headline=headline,
        body=body,
        cta=cta,
        revisions=revisions,
        brand_score=score,
        passed=all(rep.passed for rep in reports),
        findings=findings,
    )
