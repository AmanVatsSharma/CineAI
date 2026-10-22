"""Generation providers: the seam where real model APIs plug in (Phase 4).

The orchestrator only knows `GenerationProvider`. `StubProvider` is the default:
deterministic and offline, so the whole brand pipeline runs and is testable
without credentials.
"""

import hashlib
from dataclasses import dataclass
from typing import Protocol

from ..catalog import Modality, ModelSpec


@dataclass(frozen=True)
class AssetRequest:
    model: ModelSpec
    prompt: str
    negative_prompt: str | None = None
    text: str | None = None
    duration_s: int | None = None
    aspect_ratio: str | None = None


@dataclass(frozen=True)
class AssetResult:
    uri: str


class GenerationProvider(Protocol):
    async def generate(self, request: AssetRequest) -> AssetResult: ...


_EXT = {
    Modality.VIDEO: "mp4",
    Modality.IMAGE: "png",
    Modality.VOICE: "mp3",
    Modality.MUSIC: "mp3",
    Modality.SFX: "wav",
    Modality.COPY: "txt",
}


class StubProvider:
    async def generate(self, request: AssetRequest) -> AssetResult:
        digest = hashlib.sha1(
            f"{request.model.id}|{request.prompt}|{request.text}".encode()
        ).hexdigest()[:10]
        modality = request.model.modality
        return AssetResult(
            uri=f"stub://{modality.value}/{request.model.id}/{digest}.{_EXT[modality]}"
        )
