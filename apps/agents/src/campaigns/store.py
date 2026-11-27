"""In-memory campaign store (Postgres/Redis in Phase 3-4)."""

import itertools

from .schemas import Campaign

_campaigns: dict[str, Campaign] = {}
_ids = itertools.count(1)


def next_id() -> str:
    return f"cmp-{next(_ids)}"


def save(campaign: Campaign) -> Campaign:
    _campaigns[campaign.id] = campaign
    return campaign


def get(campaign_id: str) -> Campaign | None:
    return _campaigns.get(campaign_id)


def list_all(brand_id: str | None = None) -> list[Campaign]:
    items = [c for c in _campaigns.values() if brand_id in (None, c.brand_id)]
    return sorted(items, key=lambda c: c.created_at, reverse=True)


def reset() -> None:
    global _ids
    _campaigns.clear()
    _ids = itertools.count(1)
