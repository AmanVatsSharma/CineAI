"""CineAI Agents — FastAPI worker service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import brands, campaigns, generations, health, models

app = FastAPI(title="CineAI Agents", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(generations.router, prefix="/generations")
app.include_router(models.router, prefix="/models", tags=["models"])
app.include_router(brands.router, prefix="/brands", tags=["brands"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
