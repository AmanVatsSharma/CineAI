from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "cineai-agents", "ts": datetime.now(timezone.utc).isoformat()}
