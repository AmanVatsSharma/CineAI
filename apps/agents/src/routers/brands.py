from typing import Literal

from fastapi import APIRouter, HTTPException

from ..brands import (
    Brand,
    BrandFields,
    GuardianReport,
    check_copy,
    check_visual_prompt,
    revise_copy,
)
from ..brands import store as brand_store
from ..common import WireModel

router = APIRouter()


class CheckRequest(WireModel):
    text: str | None = None
    visual_prompt: str | None = None
    channel: str | None = None
    field: Literal["headline", "body", "cta"] = "body"


class CheckResponse(WireModel):
    text_report: GuardianReport | None = None
    visual_report: GuardianReport | None = None
    revised_text: str | None = None


def _brand_or_404(brand_id: str) -> Brand:
    brand = brand_store.get_brand(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.get("", response_model=list[Brand])
async def list_brands():
    return brand_store.list_brands()


@router.post("", response_model=Brand, status_code=201)
async def create_brand(fields: BrandFields):
    return brand_store.create_brand(fields)


@router.get("/{brand_id}", response_model=Brand)
async def get_brand(brand_id: str):
    return _brand_or_404(brand_id)


@router.put("/{brand_id}", response_model=Brand)
async def update_brand(brand_id: str, fields: BrandFields):
    brand = brand_store.update_brand(brand_id, fields)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("/{brand_id}/check", response_model=CheckResponse)
async def check(brand_id: str, req: CheckRequest):
    """Run the Brand Guardian over ad-hoc copy and/or an image/video prompt."""
    brand = _brand_or_404(brand_id)
    if req.text is None and req.visual_prompt is None:
        raise HTTPException(status_code=422, detail="Provide text and/or visualPrompt")
    out = CheckResponse()
    if req.text is not None:
        out.text_report = check_copy(brand, req.text, channel=req.channel, field=req.field)
        out.revised_text = revise_copy(brand, req.text, channel=req.channel, field=req.field)
    if req.visual_prompt is not None:
        out.visual_report = check_visual_prompt(brand, req.visual_prompt)
    return out
