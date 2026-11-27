import json
from pathlib import Path

from src.fixtures import build_fixtures

COMMITTED = Path(__file__).resolve().parents[3] / "libs" / "mock-data" / "src" / "brand-os.json"


async def test_web_fixtures_match_the_pipeline():
    """The web demo must show what the agents really emit. If this fails, run:
    cd apps/agents && python -m scripts.export_fixtures"""
    expected = json.loads(json.dumps(await build_fixtures(), ensure_ascii=False))
    assert COMMITTED.exists(), "run: python -m scripts.export_fixtures"
    assert json.loads(COMMITTED.read_text(encoding="utf-8")) == expected


async def test_sample_campaign_shows_the_headline_behaviours():
    c = (await build_fixtures())["sampleCampaign"]
    assert c["status"] == "ready"
    assert any(s["beat"] == "proof" for s in c["scenes"])
    channels = {a["channel"]: a for a in c["ads"]}
    assert channels["instagram_reel"]["durationS"] < channels["linkedin_feed"]["durationS"]
    assert any(f["title"] == "Proofread auto-edited copy" for f in c["followUps"])
