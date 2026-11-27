"""Brand kit: the guidelines every agent must follow."""

from typing import Annotated

from pydantic import StringConstraints

from ..common import WireModel

HexColor = Annotated[str, StringConstraints(pattern=r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")]


class Palette(WireModel):
    primary: HexColor
    secondary: HexColor
    accent: HexColor
    neutrals: list[HexColor] = []
    forbidden: list[HexColor] = []

    def allowed(self) -> list[str]:
        return [self.primary, self.secondary, self.accent, *self.neutrals]


class Typography(WireModel):
    heading_font: str
    body_font: str


class LogoRules(WireModel):
    clear_space_pct: int = 10
    min_width_px: int = 48
    allowed_backgrounds: list[str] = []


class VisualStyle(WireModel):
    palette: Palette
    typography: Typography
    logo: LogoRules = LogoRules()
    imagery_style: str
    lighting: str
    avoid_visuals: list[str] = []


class DisclaimerRule(WireModel):
    """Copy containing any trigger term must carry `text`."""

    trigger_terms: list[str] = []
    text: str


class Voice(WireModel):
    persona: str
    tone: list[str]
    dos: list[str] = []
    donts: list[str] = []
    banned_words: list[str] = []
    preferred_terms: dict[str, str] = {}  # avoid -> use
    disclaimers: list[DisclaimerRule] = []
    cta_phrases: list[str] = []
    max_exclamations: int = 1


class AudioIdentity(WireModel):
    voice_style: str
    music_mood: list[str]
    bpm_min: int
    bpm_max: int
    sonic_logo: str | None = None


class ChannelRule(WireModel):
    id: str
    label: str
    aspect_ratio: str
    max_duration_s: int
    max_headline_chars: int
    max_body_chars: int
    requires_cta: bool = True


class BrandFields(WireModel):
    name: str
    tagline: str
    industry: str
    audience: str
    mission: str
    voice: Voice
    visual: VisualStyle
    audio: AudioIdentity
    channels: list[ChannelRule]
    competitors: list[str] = []
    sample: bool = False  # seeded demo data, not a customer's real brand book


class Brand(BrandFields):
    id: str

    def channel(self, channel_id: str) -> ChannelRule | None:
        return next((c for c in self.channels if c.id == channel_id), None)
