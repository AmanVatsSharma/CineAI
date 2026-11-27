import pytest

from src.catalog import (
    CATALOG,
    USE_CASES,
    Modality,
    NoModelAvailableError,
    estimate_credits,
    get_model,
    route,
)


def test_catalog_covers_every_modality():
    assert {m.modality for m in CATALOG} == set(Modality)


def test_catalog_ids_unique_and_use_cases_known():
    ids = [m.id for m in CATALOG]
    assert len(ids) == len(set(ids))
    for m in CATALOG:
        assert set(m.use_cases) <= set(USE_CASES), m.id
        assert 0 <= m.quality <= 100 and 0 <= m.speed <= 100


def test_priority_changes_the_winner():
    quality = route(Modality.VIDEO, priority="quality").model
    cost = route(Modality.VIDEO, priority="cost").model
    assert quality.id == "kling-2-6"
    assert cost.credit_cost < quality.credit_cost


def test_use_case_prefers_specialists():
    assert route(Modality.VIDEO, use_case="spokesperson").model.id == "heygen-avatar-4"
    assert route(Modality.IMAGE, use_case="logo_design").model.id in {"recraft-v3", "ideogram-3"}


def test_required_capability_is_a_hard_filter():
    decision = route(Modality.IMAGE, require=("vector",))
    assert decision.model.id == "recraft-v3"
    assert decision.alternatives == []  # only one image model can do vector


def test_budget_ceiling_filters_models():
    cheap = route(Modality.VIDEO, priority="quality", max_unit_cost=5)
    assert cheap.model.credit_cost <= 5


def test_no_model_raises():
    with pytest.raises(NoModelAvailableError):
        route(Modality.VOICE, require=("vector",))
    with pytest.raises(NoModelAvailableError):
        route(Modality.VIDEO, max_unit_cost=1)


def test_exclude_skips_models():
    first = route(Modality.MUSIC)
    second = route(Modality.MUSIC, exclude=[first.model.id])
    assert second.model.id != first.model.id


def test_routing_is_deterministic():
    assert route(Modality.COPY).model.id == route(Modality.COPY).model.id


def test_estimate_credits_by_unit():
    kling = get_model("kling-2-6")  # per second
    assert estimate_credits(kling, 10) == 80
    voice = get_model("elevenlabs-v3")  # per 1k chars, minimum one unit
    assert estimate_credits(voice, 40) == 3
    assert estimate_credits(voice, 2500) == 9
    assert estimate_credits(get_model("suno-v5"), 1) == 12


def test_get_model_unknown():
    with pytest.raises(KeyError):
        get_model("nope")
