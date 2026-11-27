"""Campaign domain: brief in; scenes, deliverables, ads and follow-ups out."""

from enum import StrEnum
from typing import Literal

from pydantic import Field

from ..brands.guardian import Finding
from ..catalog import Modality, Priority
from ..common import WireModel


class AgentRole(StrEnum):
    CREATIVE_DIRECTOR = "creative_director"
    SCRIPTWRITER = "scriptwriter"
    BRAND_GUARDIAN = "brand_guardian"
    IMAGE_ARTIST = "image_artist"
    VIDEO_PRODUCER = "video_producer"
    AUDIO_PRODUCER = "audio_producer"
    AD_STRATEGIST = "ad_strategist"
    FOLLOW_UP = "follow_up"
    ORCHESTRATOR = "orchestrator"


Objective = Literal["awareness", "consideration", "conversion", "retention", "launch"]
CampaignStatus = Literal[
    "queued", "planning", "producing", "reviewing", "ready", "needs_attention", "failed"
]
DeliverableStatus = Literal["queued", "generating", "done", "needs_review", "failed"]
FollowUpStatus = Literal["open", "done", "dismissed"]


class Brief(WireModel):
    title: str = Field(min_length=1, max_length=120)
    objective: Objective = "awareness"
    product: str = Field(min_length=1, max_length=200)
    key_message: str = Field(min_length=1, max_length=300)
    cta: str = Field(min_length=1, max_length=60)
    audience: str | None = None
    total_duration_s: int = Field(default=30, ge=6, le=180)
    channels: list[str] = Field(min_length=1)
    modalities: list[Modality] = [
        Modality.COPY,
        Modality.IMAGE,
        Modality.VIDEO,
        Modality.VOICE,
        Modality.MUSIC,
    ]
    priority: Priority = "balanced"
    budget_credits: int | None = Field(default=None, ge=1)


class Scene(WireModel):
    index: int
    beat: str
    title: str
    visual: str
    voiceover: str
    on_screen_text: str
    duration_s: int
    camera: str
    mood: str


class Deliverable(WireModel):
    id: str
    scene_index: int | None  # None = campaign-level (music bed, ambience)
    modality: Modality
    agent: AgentRole
    model_id: str
    model_name: str
    prompt: str
    negative_prompt: str | None = None
    text: str | None = None
    status: DeliverableStatus = "queued"
    uri: str | None = None
    credits: int
    revisions: int = 0
    brand_score: int = 100
    findings: list[Finding] = []


class AdVariant(WireModel):
    id: str
    channel: str
    channel_label: str
    aspect_ratio: str
    duration_s: int
    scene_indexes: list[int]
    headline: str
    body: str
    cta: str
    revisions: int = 0
    brand_score: int = 100
    passed: bool = True
    findings: list[Finding] = []


class AgentStep(WireModel):
    at: str
    agent: AgentRole
    action: str
    detail: str


class FollowUp(WireModel):
    id: str
    title: str
    detail: str
    owner: Literal["agent", "human"]
    due_at: str
    status: FollowUpStatus = "open"
    related: str | None = None


class Campaign(WireModel):
    id: str
    brand_id: str
    brief: Brief
    status: CampaignStatus = "queued"
    progress: int = 0
    scenes: list[Scene] = []
    deliverables: list[Deliverable] = []
    ads: list[AdVariant] = []
    follow_ups: list[FollowUp] = []
    steps: list[AgentStep] = []
    total_credits: int = 0
    brand_score: int = 0
    created_at: str
    updated_at: str
