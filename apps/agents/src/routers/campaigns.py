import asyncio
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, HTTPException, Response

from ..brands import store as brand_store
from ..campaigns import Brief, Campaign, Orchestrator, new_campaign
from ..campaigns import store as campaign_store
from ..common import WireModel

router = APIRouter()

# Strong references so background runs are not garbage-collected mid-flight.
_running: set[asyncio.Task] = set()


class CreateCampaignRequest(WireModel):
    brand_id: str
    brief: Brief


class FollowUpPatch(WireModel):
    status: Literal["open", "done", "dismissed"]


@router.post("", response_model=Campaign)
async def create_campaign(req: CreateCampaignRequest, response: Response, wait: bool = False):
    """Start a campaign run. Returns 202 immediately and runs in the background;
    pass `?wait=true` to block until the agents finish (handy for scripts/tests)."""
    brand = brand_store.get_brand(req.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    try:
        campaign = new_campaign(campaign_store.next_id(), brand, req.brief, datetime.now(UTC))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    campaign_store.save(campaign)

    run = Orchestrator().run(campaign, brand)
    if wait:
        await run
        return campaign
    task = asyncio.create_task(run)
    _running.add(task)
    task.add_done_callback(_running.discard)
    response.status_code = 202
    return campaign


@router.get("", response_model=list[Campaign])
async def list_campaigns(brand_id: str | None = None):
    return campaign_store.list_all(brand_id)


@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    campaign = campaign_store.get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.patch("/{campaign_id}/follow-ups/{follow_up_id}", response_model=Campaign)
async def update_follow_up(campaign_id: str, follow_up_id: str, patch: FollowUpPatch):
    campaign = await get_campaign(campaign_id)
    item = next((f for f in campaign.follow_ups if f.id == follow_up_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    item.status = patch.status
    return campaign
