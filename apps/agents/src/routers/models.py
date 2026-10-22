from fastapi import APIRouter, HTTPException

from ..catalog import (
    CATALOG,
    Modality,
    ModelSpec,
    NoModelAvailableError,
    Priority,
    RoutingDecision,
    route,
)
from ..common import WireModel

router = APIRouter()


class RouteRequest(WireModel):
    modality: Modality
    use_case: str | None = None
    priority: Priority = "balanced"
    require: list[str] = []
    max_unit_cost: int | None = None


@router.get("/catalog", response_model=list[ModelSpec])
async def list_models(modality: Modality | None = None, use_case: str | None = None):
    return [
        m
        for m in CATALOG
        if (modality is None or m.modality == modality)
        and (use_case is None or use_case in m.use_cases)
    ]


@router.post("/route", response_model=RoutingDecision)
async def route_model(req: RouteRequest):
    try:
        return route(
            req.modality,
            use_case=req.use_case,
            priority=req.priority,
            require=req.require,
            max_unit_cost=req.max_unit_cost,
        )
    except NoModelAvailableError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
