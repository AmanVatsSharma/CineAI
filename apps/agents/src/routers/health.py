from datetime import UTC, datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "cineai-agents", "ts": datetime.now(UTC).isoformat()}
