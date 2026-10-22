"""Deterministic demo fixtures, produced by the real pipeline.

The web app's mock data (libs/mock-data/src/brand-os.json) is generated from this,
so the UI demo shows exactly what the agents emit. Regenerate with:

    cd apps/agents && python -m scripts.export_fixtures

tests/test_fixtures.py fails if the committed JSON drifts from this output.
"""

from datetime import UTC, datetime

from .brands.store import LUMEN_SKIN, VEDPRAGYA
from .campaigns import Brief, Orchestrator, new_campaign
from .catalog import CATALOG, Modality

FIXED_NOW = datetime(2026, 1, 12, 9, 0, tzinfo=UTC)

SAMPLE_BRIEF = Brief(
    title="Foundations course — spring launch",
    objective="launch",
    product="the Vedpragya Foundations course",
    key_message="A guaranteed path to learning timeless principles, with results you can measure.",
    cta="Buy now",
    total_duration_s=45,
    channels=["instagram_reel", "linkedin_feed"],
    modalities=[
        Modality.COPY,
        Modality.VOICE,
        Modality.IMAGE,
        Modality.VIDEO,
        Modality.MUSIC,
        Modality.SFX,
    ],
    priority="balanced",
)


async def build_fixtures() -> dict:
    campaign = new_campaign("cmp-sample", VEDPRAGYA, SAMPLE_BRIEF, FIXED_NOW)
    await Orchestrator(clock=lambda: FIXED_NOW).run(campaign, VEDPRAGYA)
    dump = {"mode": "json", "by_alias": True}
    return {
        "modelCatalog": [m.model_dump(**dump) for m in CATALOG],
        "brands": [b.model_dump(**dump) for b in (VEDPRAGYA, LUMEN_SKIN)],
        "sampleCampaign": campaign.model_dump(**dump),
    }
