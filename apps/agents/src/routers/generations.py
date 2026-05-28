"""Generation job handler — stub implementation.

When real video models are wired in, replace the stub logic
in `_run_generation` with actual model calls.
"""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory store (replace with Redis/Postgres in Phase 4)
_jobs: dict[str, dict] = {}


class GenerationRequest(BaseModel):
    prompt: str
    model_name: str
    aspect_ratio: str = "16:9"
    duration_seconds: int = 8


class GenerationJob(BaseModel):
    id: str
    prompt: str
    model_name: str
    status: Literal["queued", "processing", "done", "error"]
    progress: int
    created_at: str


@router.post("", response_model=GenerationJob)
async def create_generation(req: GenerationRequest):
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "prompt": req.prompt,
        "model_name": req.model_name,
        "status": "queued",
        "progress": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _jobs[job_id] = job
    asyncio.create_task(_run_generation(job_id))
    return job


@router.get("/{job_id}", response_model=GenerationJob)
async def get_generation(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")
    return job


async def _run_generation(job_id: str):
    """Stub: simulate generation progress. Replace with real model calls."""
    steps = [(10, 1.0), (40, 3.0), (70, 5.5), (90, 7.0), (100, 9.0)]
    for progress, wait in steps:
        await asyncio.sleep(wait)
        if job_id in _jobs:
            _jobs[job_id]["status"] = "processing" if progress < 100 else "done"
            _jobs[job_id]["progress"] = progress
