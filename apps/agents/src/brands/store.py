"""In-memory brand store (Postgres in Phase 3) + sample brands.

Sample brand books are placeholders so the product works on day one —
replace them with the real guidelines via POST/PUT /brands.
"""

import re

from .schemas import (
    AudioIdentity,
    Brand,
    BrandFields,
    ChannelRule,
    DisclaimerRule,
    LogoRules,
    Palette,
    Typography,
    VisualStyle,
    Voice,
)

_STD_CHANNELS = [
    ChannelRule(
        id="instagram_reel",
        label="Instagram Reel",
        aspect_ratio="9:16",
        max_duration_s=30,
        max_headline_chars=40,
        max_body_chars=125,
    ),
    ChannelRule(
        id="youtube_preroll",
        label="YouTube Pre-roll",
        aspect_ratio="16:9",
        max_duration_s=30,
        max_headline_chars=60,
        max_body_chars=150,
    ),
    ChannelRule(
        id="linkedin_feed",
        label="LinkedIn Feed",
        aspect_ratio="1:1",
        max_duration_s=45,
        max_headline_chars=70,
        max_body_chars=200,
    ),
]

VEDPRAGYA = Brand(
    id="vedpragya",
    name="Vedpragya",
    tagline="Ancient wisdom. Modern craft.",
    industry="Knowledge & media",
    audience="curious professionals who want depth over noise",
    mission="Make timeless wisdom practical for modern life and work.",
    voice=Voice(
        persona="A calm guide who explains with clarity and never hypes.",
        tone=["grounded", "insightful", "warm"],
        dos=["Lead with the insight", "Use plain, precise language", "Invite, don't pressure"],
        donts=["Overpromise outcomes", "Use hype or urgency tricks", "Mock other traditions"],
        banned_words=["guaranteed", "miracle", "hack", "cheap", "get rich"],
        preferred_terms={"users": "learners", "buy now": "begin today"},
        disclaimers=[
            DisclaimerRule(
                trigger_terms=["results", "income", "earn"],
                text="Individual results vary.",
            )
        ],
        cta_phrases=["Begin today", "Start learning", "Explore"],
        max_exclamations=1,
    ),
    visual=VisualStyle(
        palette=Palette(
            primary="#1E1B4B",
            secondary="#F59E0B",
            accent="#D4A017",
            neutrals=["#FFF8E7", "#2B2B2B"],
            forbidden=["#00FF00"],
        ),
        typography=Typography(heading_font="Cormorant Garamond", body_font="Inter"),
        logo=LogoRules(
            clear_space_pct=12, min_width_px=64, allowed_backgrounds=["#1E1B4B", "#FFF8E7"]
        ),
        imagery_style="warm cinematic realism with rich indigo shadows and golden highlights",
        lighting="soft golden-hour light",
        avoid_visuals=["neon", "stock handshake", "clip art"],
    ),
    audio=AudioIdentity(
        voice_style="warm, unhurried baritone narrator with clear diction",
        music_mood=["contemplative", "uplifting", "organic"],
        bpm_min=70,
        bpm_max=95,
        sonic_logo="a single resonant temple-bell strike",
    ),
    channels=_STD_CHANNELS,
    competitors=[],
    sample=True,
)

LUMEN_SKIN = Brand(
    id="lumen-skin",
    name="Lumen Skin",
    tagline="Light, on your terms.",
    industry="Skincare (sample brand — regulated claims)",
    audience="skincare-conscious adults who read ingredient labels",
    mission="Honest, dermatologist-informed skincare without the noise.",
    voice=Voice(
        persona="A knowledgeable friend who explains the science without overselling it.",
        tone=["clear", "reassuring", "confident"],
        dos=["Cite the study behind any claim", "Keep claims modest and specific"],
        donts=["Make medical claims", "Shame skin conditions"],
        banned_words=["cure", "miracle", "guaranteed", "anti-aging"],
        preferred_terms={"wrinkles": "fine lines"},
        disclaimers=[
            DisclaimerRule(
                trigger_terms=["clinically", "dermatologist", "visibly", "results"],
                text="*Based on a consumer study; individual results may vary.",
            )
        ],
        cta_phrases=["Shop now", "Try it today"],
        max_exclamations=1,
    ),
    visual=VisualStyle(
        palette=Palette(
            primary="#0F766E",
            secondary="#F5F5F4",
            accent="#F4A261",
            neutrals=["#1C1917"],
            forbidden=["#FF00FF"],
        ),
        typography=Typography(heading_font="DM Serif Display", body_font="DM Sans"),
        imagery_style="clean, bright editorial beauty photography with natural skin texture",
        lighting="diffused daylight, no harsh shadows",
        avoid_visuals=["before and after", "airbrushed skin", "syringe"],
    ),
    audio=AudioIdentity(
        voice_style="friendly, reassuring female voice, conversational pace",
        music_mood=["airy", "optimistic", "minimal"],
        bpm_min=90,
        bpm_max=110,
        sonic_logo="a soft two-note chime",
    ),
    channels=_STD_CHANNELS,
    competitors=["Dermalux"],
    sample=True,
)

_brands: dict[str, Brand] = {}


def reset() -> None:
    """Restore the seeded state (used by tests)."""
    _brands.clear()
    for b in (VEDPRAGYA, LUMEN_SKIN):
        _brands[b.id] = b.model_copy(deep=True)


def list_brands() -> list[Brand]:
    return list(_brands.values())


def get_brand(brand_id: str) -> Brand | None:
    return _brands.get(brand_id)


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "brand"


def create_brand(fields: BrandFields) -> Brand:
    base = _slug(fields.name)
    brand_id, n = base, 2
    while brand_id in _brands:
        brand_id, n = f"{base}-{n}", n + 1
    brand = Brand(id=brand_id, **fields.model_dump())
    _brands[brand_id] = brand
    return brand


def update_brand(brand_id: str, fields: BrandFields) -> Brand | None:
    if brand_id not in _brands:
        return None
    brand = Brand(id=brand_id, **fields.model_dump())
    _brands[brand_id] = brand
    return brand


reset()
