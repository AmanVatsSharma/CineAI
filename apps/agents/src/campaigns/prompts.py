"""Brand-conditioned prompt builders. Every generation prompt starts from the
brand kit, so no deliverable is written from a blank page."""

from ..brands.schemas import Brand
from .schemas import Scene

QUALITY_NEGATIVES = ["watermark", "distorted text", "off-brand colours"]


def visual_prompt(brand: Brand, scene: Scene, *, video: bool) -> str:
    v = brand.visual
    p = v.palette
    prompt = (
        f"{scene.visual} Lighting: {v.lighting}. "
        f"Brand palette {p.primary}, {p.secondary}, accent {p.accent}. "
        f"Mood: {scene.mood}. Camera: {scene.camera}."
    )
    if video:
        prompt += f" Duration {scene.duration_s}s."
    return prompt


def negative_prompt(brand: Brand) -> str:
    v = brand.visual
    return ", ".join(
        [*v.avoid_visuals, *brand.competitors, *v.palette.forbidden, *QUALITY_NEGATIVES]
    )


def voice_direction(brand: Brand, scene: Scene) -> str:
    return f"{brand.audio.voice_style}. Mood: {scene.mood}."


def music_prompt(brand: Brand, total_s: int) -> str:
    a = brand.audio
    sig = f" End on {a.sonic_logo}." if a.sonic_logo else ""
    return (
        f"{', '.join(a.music_mood)} instrumental, {a.bpm_min}-{a.bpm_max} BPM, {total_s}s, "
        f"building toward the final call to action.{sig}"
    )


def sfx_prompt(brand: Brand, total_s: int) -> str:
    return (
        f"Subtle ambient bed with soft transition stings matching {brand.visual.imagery_style}; "
        f"{total_s}s, no voices."
    )
