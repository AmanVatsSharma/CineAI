import pytest

from src.campaigns import Brief
from src.campaigns.planner import TemplatePlanner, beats_for, split_duration


def brief(**kw):
    base = dict(
        title="t",
        product="the course",
        key_message="Learn well.",
        cta="Begin today",
        channels=["instagram_reel"],
    )
    return Brief(**{**base, **kw})


@pytest.mark.parametrize("total", [6, 7, 15, 16, 30, 31, 45, 90, 180])
def test_split_duration_sums_and_respects_minimum(total):
    beats = beats_for(total)
    parts = split_duration(total, [1.0] * len(beats))
    assert sum(parts) == total and min(parts) >= 2 and len(parts) == len(beats)


def test_split_duration_follows_weights():
    parts = split_duration(40, [0.2, 0.2, 0.3, 0.2, 0.1])
    assert parts[2] == max(parts) and parts[4] == min(parts)


def test_split_duration_rejects_impossible():
    with pytest.raises(ValueError):
        split_duration(5, [1, 1, 1])


def test_beats_scale_with_length():
    assert beats_for(10) == ["hook", "solution", "cta"]
    assert beats_for(30) == ["hook", "problem", "solution", "cta"]
    assert beats_for(60) == ["hook", "problem", "solution", "proof", "cta"]


def test_plan_covers_brief_duration_and_story_order(vedpragya):
    scenes = TemplatePlanner().plan(vedpragya, brief(total_duration_s=45))
    assert sum(s.duration_s for s in scenes) == 45
    assert [s.index for s in scenes] == list(range(1, len(scenes) + 1))
    assert scenes[0].beat == "hook" and scenes[-1].beat == "cta"
    assert scenes[-1].on_screen_text == "Begin today"
    assert "Vedpragya" in scenes[-1].visual  # end card carries the brand


def test_plan_uses_brief_audience_override(vedpragya):
    scenes = TemplatePlanner().plan(vedpragya, brief(audience="first-time founders"))
    assert any("first-time founders" in s.visual for s in scenes)
