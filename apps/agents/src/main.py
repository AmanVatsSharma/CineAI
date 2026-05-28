"""CineAI Agents — FastAPI worker service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, generations

app = FastAPI(title="CineAI Agents", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(generations.router, prefix="/generations")
