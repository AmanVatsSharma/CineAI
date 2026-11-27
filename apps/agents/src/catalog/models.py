"""Model catalog + router: pick the right AI model for a brand deliverable.

Quality / speed / cost numbers are placeholders until Phase 4 provider
benchmarks replace them — the routing logic is what matters here.
"""

import math
from enum import StrEnum
from typing import Literal

from ..common import WireModel


class Modality(StrEnum):
    VIDEO = "video"
    IMAGE = "image"
    VOICE = "voice"
    MUSIC = "music"
    SFX = "sfx"
    COPY = "copy"


Unit = Literal["second", "image", "1k_chars", "track", "clip", "request"]
Priority = Literal["quality", "speed", "cost", "balanced"]

USE_CASES = (
    "brand_film",
    "social_ad",
    "product_shot",
    "social_post",
    "logo_design",
    "explainer",
    "spokesperson",
    "voiceover",
    "localization",
    "background_music",
    "jingle",
    "ambient",
    "script",
    "ad_copy",
)


class ModelSpec(WireModel):
    id: str
    name: str
    provider: str
    modality: Modality
    use_cases: list[str]
    capabilities: list[str] = []
    quality: int  # 0-100
    speed: int  # 0-100, higher is faster
    credit_cost: int
    unit: Unit
    max_duration_s: int | None = None
    badge: str | None = None


def _m(
    id: str, name: str, provider: str, modality: Modality, use_cases: list[str],
    caps: list[str], quality: int, speed: int, cost: int, unit: Unit,
    max_duration_s: int | None = None, badge: str | None = None,
) -> ModelSpec:
    return ModelSpec(
        id=id, name=name, provider=provider, modality=modality, use_cases=use_cases,
        capabilities=caps, quality=quality, speed=speed, credit_cost=cost, unit=unit,
        max_duration_s=max_duration_s, badge=badge,
    )


VID, IMG, VOX, MUS, SFX, CPY = (
    Modality.VIDEO, Modality.IMAGE, Modality.VOICE,
    Modality.MUSIC, Modality.SFX, Modality.COPY,
)

CATALOG: list[ModelSpec] = [
    # ── Video ──
    _m("kling-2-6", "Kling 2.6", "Kuaishou", VID, ["brand_film", "social_ad", "product_shot"],
       ["reference_images", "image_to_video"], 96, 78, 8, "second", 120, "TOP"),
    _m("veo-3-1", "Veo 3.1", "Google DeepMind", VID, ["brand_film", "social_ad", "explainer"],
       ["native_audio", "image_to_video"], 94, 82, 7, "second", 20, "NEW"),
    _m("sora-2-pro", "Sora 2 Pro", "OpenAI", VID, ["brand_film", "product_shot"],
       ["native_audio", "physics"], 91, 65, 10, "second", 60),
    _m("runway-gen-4-5", "Runway Gen-4.5", "Runway ML", VID, ["brand_film", "social_ad"],
       ["reference_images", "image_to_video", "style_lock"], 93, 88, 6, "second", 15),
    _m("luma-ray3", "Luma Ray3", "Luma AI", VID, ["product_shot", "brand_film"],
       ["reference_images", "hdr"], 90, 90, 9, "second", 10),
    _m("pika-2-2", "Pika 2.2", "Pika Labs", VID, ["social_ad", "social_post"],
       ["image_to_video"], 84, 95, 5, "second", 8, "FAST"),
    _m("heygen-avatar-4", "HeyGen Avatar 4", "HeyGen", VID, ["spokesperson", "explainer", "localization"],
       ["lipsync", "voice_clone", "multilingual"], 88, 80, 6, "second", 300),
    # ── Image ──
    _m("flux-1-1-pro", "Flux 1.1 Pro", "Black Forest Labs", IMG, ["brand_film", "product_shot", "social_post"],
       ["reference_images", "brand_lora"], 93, 85, 4, "image", None, "TOP"),
    _m("imagen-4", "Imagen 4", "Google", IMG, ["product_shot", "social_post"],
       ["text_in_image"], 94, 80, 5, "image"),
    _m("ideogram-3", "Ideogram 3", "Ideogram", IMG, ["social_ad", "logo_design"],
       ["text_in_image", "style_lock"], 91, 82, 4, "image"),
    _m("recraft-v3", "Recraft V3", "Recraft", IMG, ["logo_design", "social_post"],
       ["text_in_image", "vector", "style_lock"], 90, 78, 5, "image"),
    _m("gpt-image-1", "GPT Image 1", "OpenAI", IMG, ["social_ad", "social_post"],
       ["text_in_image", "reference_images", "inpainting"], 92, 70, 6, "image"),
    # ── Voice ──
    _m("elevenlabs-v3", "ElevenLabs v3", "ElevenLabs", VOX, ["voiceover", "explainer", "localization"],
       ["voice_clone", "multilingual", "emotion"], 96, 80, 3, "1k_chars", None, "TOP"),
    _m("openai-tts-hd", "OpenAI TTS HD", "OpenAI", VOX, ["voiceover", "explainer"],
       ["multilingual"], 86, 92, 1, "1k_chars"),
    # ── Music ──
    _m("suno-v5", "Suno v5", "Suno", MUS, ["jingle", "background_music"],
       ["vocals", "lyrics"], 92, 75, 12, "track"),
    _m("udio-v2", "Udio v2", "Udio", MUS, ["jingle", "background_music"],
       ["vocals", "lyrics", "stems"], 90, 70, 12, "track"),
    _m("stable-audio-2-5", "Stable Audio 2.5", "Stability AI", MUS, ["background_music", "ambient"],
       ["instrumental", "tempo_control"], 84, 92, 4, "track"),
    # ── Sound effects ──
    _m("elevenlabs-sfx", "ElevenLabs SFX", "ElevenLabs", SFX, ["ambient"],
       ["loopable"], 90, 90, 2, "clip"),
    _m("stable-audio-sfx", "Stable Audio SFX", "Stability AI", SFX, ["ambient"],
       ["loopable"], 82, 94, 1, "clip"),
    # ── Copy ──
    _m("claude-sonnet", "Claude Sonnet", "Anthropic", CPY, ["script", "ad_copy", "localization"],
       ["long_context", "structured_output", "brand_voice"], 95, 78, 3, "request", None, "TOP"),
    _m("claude-haiku", "Claude Haiku", "Anthropic", CPY, ["ad_copy", "script"],
       ["structured_output", "brand_voice"], 86, 96, 1, "request"),
]

_BY_ID = {m.id: m for m in CATALOG}


class NoModelAvailableError(ValueError):
    pass


class RoutingDecision(WireModel):
    model: ModelSpec
    score: float
    reason: str
    alternatives: list[str]


def get_model(model_id: str) -> ModelSpec:
    try:
        return _BY_ID[model_id]
    except KeyError:
        raise KeyError(f"Unknown model: {model_id}") from None


# (quality, speed, cost) weights per priority.
_WEIGHTS: dict[str, tuple[float, float, float]] = {
    "quality": (0.70, 0.10, 0.20),
    "speed": (0.20, 0.60, 0.20),
    "cost": (0.20, 0.20, 0.60),
    "balanced": (0.45, 0.25, 0.30),
}


def estimate_credits(spec: ModelSpec, quantity: float) -> int:
    """Credits for `quantity` units: seconds, images, characters (for 1k_chars), etc."""
    if spec.unit == "1k_chars":
        units = max(1, math.ceil(quantity / 1000))
    else:
        units = max(1, math.ceil(quantity))
    return units * spec.credit_cost


def route(
    modality: Modality,
    *,
    use_case: str | None = None,
    priority: Priority = "balanced",
    require: tuple[str, ...] | list[str] = (),
    max_unit_cost: int | None = None,
    exclude: tuple[str, ...] | list[str] = (),
) -> RoutingDecision:
    """Pick the best model for a modality.

    `require` and `max_unit_cost` are hard filters. `use_case` prefers models built for
    it (falling back to all candidates if none are). Within that pool, quality, speed
    and cost are min-max normalised across candidates and weighted by `priority`.
    """
    needed = set(require)
    candidates = [
        m for m in CATALOG
        if m.modality == modality
        and m.id not in exclude
        and needed <= set(m.capabilities)
        and (max_unit_cost is None or m.credit_cost <= max_unit_cost)
    ]
    if not candidates:
        raise NoModelAvailableError(
            f"No {modality.value} model satisfies require={sorted(needed)} "
            f"max_unit_cost={max_unit_cost}"
        )

    wq, ws, wc = _WEIGHTS[priority]

    def norm(values: list[int], v: int, *, higher_is_better: bool = True) -> float:
        lo, hi = min(values), max(values)
        if hi == lo:
            return 1.0
        x = (v - lo) / (hi - lo)
        return x if higher_is_better else 1 - x

    qualities = [m.quality for m in candidates]
    speeds = [m.speed for m in candidates]
    costs = [m.credit_cost for m in candidates]

    def score(m: ModelSpec) -> float:
        return (
            wq * norm(qualities, m.quality)
            + ws * norm(speeds, m.speed)
            + wc * norm(costs, m.credit_cost, higher_is_better=False)
        )

    # Models built for the use case always outrank general-purpose ones.
    def built_for(m: ModelSpec) -> bool:
        return bool(use_case) and use_case in m.use_cases

    prefer_specialists = any(built_for(m) for m in candidates)
    ranked = sorted(
        candidates,
        key=lambda m: (prefer_specialists and not built_for(m), -score(m), m.id),
    )
    best = ranked[0]
    bits = [f"best {priority} fit"]
    if use_case:
        bits.append(f"built for {use_case}" if built_for(best) else f"general fit for {use_case}")
    if needed:
        bits.append("has " + ", ".join(sorted(needed)))
    return RoutingDecision(
        model=best,
        score=round(score(best), 3),
        reason="; ".join(bits),
        alternatives=[m.id for m in ranked[1:3]],
    )
