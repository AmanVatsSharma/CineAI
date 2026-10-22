"""Creative Director: turn a brief into a beat-structured scene plan.

`TemplatePlanner` is the deterministic fallback. An LLM-backed planner implementing
the same `plan` signature replaces it once provider keys are wired (Phase 4).
"""

import math
from typing import Protocol

from ..brands.schemas import Brand
from .schemas import Brief, Scene

BEAT_WEIGHTS = {"hook": 0.20, "problem": 0.20, "solution": 0.30, "proof": 0.20, "cta": 0.10}
MIN_SCENE_S = 2


def beats_for(total_s: int) -> list[str]:
    if total_s <= 15:
        return ["hook", "solution", "cta"]
    if total_s <= 30:
        return ["hook", "problem", "solution", "cta"]
    return ["hook", "problem", "solution", "proof", "cta"]


def split_duration(total: int, weights: list[float], minimum: int = MIN_SCENE_S) -> list[int]:
    """Split `total` seconds by weight (largest-remainder), every part >= minimum."""
    n = len(weights)
    if total < minimum * n:
        raise ValueError(f"{total}s cannot fit {n} scenes of at least {minimum}s")
    spare = total - minimum * n
    wsum = sum(weights)
    shares = [spare * w / wsum for w in weights]
    parts = [math.floor(s) for s in shares]
    leftover = spare - sum(parts)
    by_remainder = sorted(range(n), key=lambda i: (-(shares[i] - parts[i]), i))
    for i in by_remainder[:leftover]:
        parts[i] += 1
    return [minimum + p for p in parts]


class Planner(Protocol):
    def plan(self, brand: Brand, brief: Brief) -> list[Scene]: ...


_HOOKS = {
    "awareness": "Meet {brand}.",
    "launch": "Introducing {product}.",
    "conversion": "Ready for {product}?",
    "consideration": "Still deciding? Here is why {product}.",
    "retention": "You know {brand}. Here is what is new.",
}
_CAMERA = {
    "hook": "slow push-in",
    "problem": "handheld, shallow depth of field",
    "solution": "smooth hero orbit",
    "proof": "locked-off medium shot",
    "cta": "static end card, gentle fade",
}
_MOOD = {
    "hook": "intriguing",
    "problem": "tense, restrained",
    "solution": "confident, uplifting",
    "proof": "authentic, grounded",
    "cta": "calm, inviting",
}


class TemplatePlanner:
    def plan(self, brand: Brand, brief: Brief) -> list[Scene]:
        beats = beats_for(brief.total_duration_s)
        durations = split_duration(brief.total_duration_s, [BEAT_WEIGHTS[b] for b in beats])
        audience = brief.audience or brand.audience
        return [
            self._scene(i, beat, dur, brand, brief, audience)
            for i, (beat, dur) in enumerate(zip(beats, durations, strict=True), start=1)
        ]

    def _scene(
        self, index: int, beat: str, dur: int, brand: Brand, brief: Brief, audience: str
    ) -> Scene:
        style = brand.visual.imagery_style
        content = {
            "hook": (
                "Hook",
                f"A scroll-stopping opening that places {audience} in the moment before "
                f"{brief.product}; {style}.",
                _HOOKS[brief.objective].format(brand=brand.name, product=brief.product),
                "",
            ),
            "problem": (
                "The gap",
                f"A quiet, relatable moment showing what is missing for {audience}; {style}.",
                f"Most options leave {audience} guessing.",
                "",
            ),
            "solution": (
                "The answer",
                f"Hero shot of {brief.product} in natural use, framed to feel effortless; {style}.",
                brief.key_message,
                brief.product,
            ),
            "proof": (
                "Proof",
                f"Real-use demonstration of {brief.product}; {style}.",
                "See it in action.",
                "",
            ),
            "cta": (
                "Call to action",
                f"End card with the {brand.name} logo lockup on a brand-colour background, "
                f"respecting logo clear space; {style}.",
                f"{brief.cta}.",
                brief.cta,
            ),
        }[beat]
        title, visual, voiceover, on_screen = content
        return Scene(
            index=index,
            beat=beat,
            title=title,
            visual=visual,
            voiceover=voiceover,
            on_screen_text=on_screen,
            duration_s=dur,
            camera=_CAMERA[beat],
            mood=_MOOD[beat],
        )
