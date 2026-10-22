from datetime import UTC, datetime

import pytest

from src.campaigns import Brief, Orchestrator, new_campaign
from src.campaigns.ads import select_scenes
from src.campaigns.planner import TemplatePlanner
from src.campaigns.providers import AssetRequest, AssetResult
from src.catalog import Modality

NOW = datetime(2026, 1, 12, 9, 0, tzinfo=UTC)


def make_brief(**kw) -> Brief:
    base = dict(
        title="Launch",
        objective="launch",
        product="the Foundations course",
        key_message="Learn timeless principles.",
        cta="Begin today",
        total_duration_s=30,
        channels=["instagram_reel"],
    )
    return Brief(**{**base, **kw})


async def run(brand, **kw):
    campaign = new_campaign("cmp-t", brand, make_brief(**kw), NOW)
    return await Orchestrator(clock=lambda: NOW).run(campaign, brand)


async def test_clean_brief_produces_a_ready_campaign(vedpragya):
    c = await run(vedpragya)
    assert c.status == "ready" and c.progress == 100
    assert c.brand_score == 100
    assert all(d.status == "done" and d.uri for d in c.deliverables)
    assert c.total_credits == sum(d.credits for d in c.deliverables)
    assert [a.channel for a in c.ads] == ["instagram_reel"]


async def test_every_requested_modality_is_produced(vedpragya):
    c = await run(vedpragya, modalities=list(Modality))
    produced = {d.modality for d in c.deliverables}
    assert produced == set(Modality)
    per_scene = len(c.scenes)
    for m in (Modality.COPY, Modality.VOICE, Modality.IMAGE, Modality.VIDEO):
        assert sum(d.modality == m for d in c.deliverables) == per_scene
    assert sum(d.modality == Modality.MUSIC for d in c.deliverables) == 1  # campaign-level


async def test_only_requested_modalities(vedpragya):
    c = await run(vedpragya, modalities=[Modality.IMAGE])
    assert {d.modality for d in c.deliverables} == {Modality.IMAGE}


async def test_video_models_are_chosen_that_can_render_each_scene(vedpragya):
    c = await run(vedpragya, total_duration_s=90, modalities=[Modality.VIDEO], priority="speed")
    from src.catalog import get_model

    for d in c.deliverables:
        scene = next(s for s in c.scenes if s.index == d.scene_index)
        cap = get_model(d.model_id).max_duration_s
        assert cap is None or scene.duration_s <= cap


async def test_end_card_image_uses_a_text_capable_model(vedpragya):
    from src.catalog import get_model

    c = await run(vedpragya, modalities=[Modality.IMAGE])
    end_card = next(d for d in c.deliverables if d.scene_index == c.scenes[-1].index)
    assert "text_in_image" in get_model(end_card.model_id).capabilities


async def test_guardian_fixes_the_brief_before_anything_ships(vedpragya):
    c = await run(
        vedpragya,
        key_message="A guaranteed path with real results.",
        cta="Buy now",
        total_duration_s=15,
    )
    script = " ".join(s.voiceover + " " + s.on_screen_text for s in c.scenes).lower()
    assert "guaranteed" not in script and "buy now" not in script
    assert c.scenes[-1].voiceover.endswith(
        "Individual results vary."
    )  # disclaimer once, at the end
    assert sum("Individual results vary." in s.voiceover for s in c.scenes) == 1
    for ad in c.ads:
        assert "guaranteed" not in (ad.headline + ad.body).lower() and ad.cta == "Begin today"
        assert "Individual results vary." in ad.body


async def test_deleted_banned_words_are_surfaced_not_hidden(vedpragya):
    c = await run(vedpragya, key_message="No hack needed.")
    flagged = [d for d in c.deliverables if any(f.code == "auto_removed" for f in d.findings)]
    assert flagged and all(d.brand_score < 100 for d in flagged)
    assert any(f.title == "Proofread auto-edited copy" and f.owner == "human" for f in c.follow_ups)


async def test_ads_respect_channel_limits_and_formats(vedpragya):
    long = "Discover timeless principles you can apply to real results " * 3
    c = await run(
        vedpragya,
        key_message=long.strip()[:300],
        total_duration_s=45,
        channels=["instagram_reel", "linkedin_feed"],
    )
    by = {a.channel: a for a in c.ads}
    ig, li = by["instagram_reel"], by["linkedin_feed"]
    assert len(ig.headline) <= 40 and len(ig.body) <= 125
    assert len(li.headline) <= 70 and len(li.body) <= 200
    assert ig.duration_s <= 30 and li.duration_s <= 45
    assert ig.aspect_ratio == "9:16" and li.aspect_ratio == "1:1"
    # every cut keeps the hook and the CTA
    for a in c.ads:
        assert a.scene_indexes[0] == 1 and a.scene_indexes[-1] == c.scenes[-1].index


def test_select_scenes_keeps_hook_and_cta_and_fits(vedpragya):
    scenes = TemplatePlanner().plan(vedpragya, make_brief(total_duration_s=60))
    cut = select_scenes(scenes, 20)
    assert cut[0].beat == "hook" and cut[-1].beat == "cta"
    assert sum(s.duration_s for s in cut) <= 20 or len(cut) == 2


async def test_regulated_brand_gets_its_own_rules(lumen):
    c = await run(
        lumen,
        product="Lumen Serum",
        cta="Shop now",
        key_message="Clinically shown, a miracle for fine lines.",
    )
    text = " ".join(s.voiceover for s in c.scenes).lower()
    assert "miracle" not in text
    assert "*Based on a consumer study; individual results may vary." in c.scenes[-1].voiceover


async def test_budget_triggers_cheaper_routing(vedpragya):
    rich = await run(vedpragya, priority="quality")
    budget = rich.total_credits - 40
    c = await run(vedpragya, priority="quality", budget_credits=budget)
    assert c.total_credits < rich.total_credits
    assert any(s.action == "re-routed to fit budget" for s in c.steps)


async def test_impossible_budget_needs_attention_with_follow_up(vedpragya):
    c = await run(vedpragya, budget_credits=1)
    assert c.status == "needs_attention"
    assert any(f.title == "Resolve credit shortfall" for f in c.follow_ups)


async def test_proof_scene_creates_evidence_follow_up(vedpragya):
    long = await run(vedpragya, total_duration_s=60)
    assert any(s.beat == "proof" for s in long.scenes)
    assert any(f.title == "Replace proof scene with verified evidence" for f in long.follow_ups)
    short = await run(vedpragya, total_duration_s=15)
    assert not any("proof" in f.title for f in short.follow_ups)


async def test_follow_ups_are_dated_from_the_clock(vedpragya):
    c = await run(vedpragya)
    approval = next(f for f in c.follow_ups if f.title == "Brand-owner approval")
    assert approval.owner == "human" and approval.due_at == "2026-01-14T09:00:00+00:00"
    assert [f.id for f in c.follow_ups] == [f"fu-{i}" for i in range(1, len(c.follow_ups) + 1)]
    schedule = [f for f in c.follow_ups if f.title.startswith("Schedule ")]
    assert len(schedule) == len(c.brief.channels)


async def test_agent_trace_names_every_agent_that_worked(vedpragya):
    c = await run(vedpragya, modalities=list(Modality))
    agents = {s.agent.value for s in c.steps}
    assert {
        "creative_director",
        "scriptwriter",
        "audio_producer",
        "image_artist",
        "video_producer",
        "ad_strategist",
        "follow_up",
        "orchestrator",
    } <= agents


async def test_a_failing_asset_does_not_sink_the_campaign(vedpragya):
    class Flaky:
        async def generate(self, request: AssetRequest) -> AssetResult:
            if request.model.modality is Modality.VIDEO:
                raise RuntimeError("GPU unavailable")
            return AssetResult(uri="ok://asset")

    campaign = new_campaign("cmp-f", vedpragya, make_brief(), NOW)
    c = await Orchestrator(provider=Flaky(), clock=lambda: NOW).run(campaign, vedpragya)
    failed = [d for d in c.deliverables if d.status == "failed"]
    assert failed and all(d.modality is Modality.VIDEO for d in failed)
    assert c.status == "needs_attention"
    assert any("GPU unavailable" in f.message for d in failed for f in d.findings)


async def test_crashing_planner_marks_campaign_failed(vedpragya):
    class Broken:
        def plan(self, brand, brief):
            raise RuntimeError("planner down")

    campaign = new_campaign("cmp-x", vedpragya, make_brief(), NOW)
    c = await Orchestrator(planner=Broken(), clock=lambda: NOW).run(campaign, vedpragya)
    assert c.status == "failed" and "planner down" in c.steps[-1].detail


def test_unknown_channel_is_rejected(vedpragya):
    with pytest.raises(ValueError, match="Unknown channel"):
        new_campaign("c", vedpragya, make_brief(channels=["tiktok"]), NOW)


def test_run_is_deterministic(vedpragya):
    import asyncio

    a = asyncio.run(run(vedpragya, key_message="A guaranteed path."))
    b = asyncio.run(run(vedpragya, key_message="A guaranteed path."))
    assert a.model_dump() == b.model_dump()


async def test_ad_findings_are_not_duplicated_across_fields(vedpragya):
    c = await run(vedpragya, key_message="A guaranteed path to learning.")
    for ad in c.ads:
        keys = [(f.code, f.message) for f in ad.findings]
        assert len(keys) == len(set(keys))
        assert [f.code for f in ad.findings].count("auto_removed") == 1
