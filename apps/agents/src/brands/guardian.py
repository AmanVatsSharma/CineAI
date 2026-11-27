"""Brand Guardian — deterministic compliance checks and auto-revision.

Every agent output (copy, scripts, image/video prompts, ads) passes through
here. Checks are rule-based on purpose: they must be reproducible and auditable.
An LLM reviewer can layer on top later, but never replaces these.
"""

import re
from typing import Literal

from ..common import WireModel
from .schemas import Brand

Severity = Literal["error", "warning", "info"]
CopyField = Literal["headline", "body", "cta"]

HEX_RE = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
# Euclidean RGB distance (max ≈ 441). Hexes closer than this to a brand colour count as on-palette.
PALETTE_TOLERANCE = 48
FORBIDDEN_TOLERANCE = 30


class Finding(WireModel):
    code: str
    severity: Severity
    message: str
    excerpt: str | None = None
    suggestion: str | None = None


class GuardianReport(WireModel):
    passed: bool
    score: int
    findings: list[Finding]


def _report(findings: list[Finding]) -> GuardianReport:
    seen: set[tuple[str, str]] = set()
    unique = []
    for f in findings:  # the same issue found in two fields is one issue
        if (f.code, f.message) not in seen:
            seen.add((f.code, f.message))
            unique.append(f)
    findings = unique
    errors = sum(f.severity == "error" for f in findings)
    warnings = sum(f.severity == "warning" for f in findings)
    return GuardianReport(
        passed=errors == 0,
        score=max(0, 100 - 25 * errors - 8 * warnings),
        findings=findings,
    )


def merge_reports(*reports: GuardianReport) -> GuardianReport:
    return _report([f for r in reports for f in r.findings])


def _term_re(term: str) -> re.Pattern[str]:
    return re.compile(rf"(?<!\w){re.escape(term)}(?!\w)", re.IGNORECASE)


def _rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _distance(a: str, b: str) -> float:
    (r1, g1, b1), (r2, g2, b2) = _rgb(a), _rgb(b)
    return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5


def _nearest(hex_color: str, options: list[str]) -> str:
    return min(options, key=lambda o: _distance(hex_color, o))


def truncate_words(text: str, limit: int) -> str:
    """Shorten to <= limit chars on a word boundary, ending with an ellipsis."""
    if len(text) <= limit:
        return text
    if limit <= 1:
        return text[:limit]
    cut = text[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(" ,;:-.") + "…"


def _tidy(text: str) -> str:
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"([,;:])\s*([.!?])", r"\2", text)
    return text.strip()


def _limit(brand: Brand, channel: str | None, field: CopyField) -> int | None:
    rule = brand.channel(channel) if channel else None
    if not rule or field == "cta":
        return None
    return rule.max_headline_chars if field == "headline" else rule.max_body_chars


def missing_disclaimers(brand: Brand, text: str, context: str = "") -> list[str]:
    """Disclaimer texts triggered by `text`/`context` but absent from `text`."""
    haystack = f"{context} {text}"
    return [
        rule.text
        for rule in brand.voice.disclaimers
        if any(_term_re(t).search(haystack) for t in rule.trigger_terms)
        and rule.text.casefold() not in text.casefold()
    ]


def check_copy(
    brand: Brand,
    text: str,
    *,
    channel: str | None = None,
    field: CopyField = "body",
    require_disclaimers: bool = True,
    trigger_context: str = "",
) -> GuardianReport:
    findings: list[Finding] = []
    voice = brand.voice

    for word in voice.banned_words:
        if m := _term_re(word).search(text):
            findings.append(
                Finding(
                    code="banned_word",
                    severity="error",
                    message=f'"{m.group(0)}" is banned by the brand voice guide.',
                    excerpt=m.group(0),
                    suggestion="Remove it or rephrase.",
                )
            )
    for name in brand.competitors:
        if m := _term_re(name).search(text):
            findings.append(
                Finding(
                    code="competitor_mention",
                    severity="error",
                    message=f'Competitor "{m.group(0)}" must not appear in brand copy.',
                    excerpt=m.group(0),
                    suggestion="Remove the competitor reference.",
                )
            )
    for avoid, use in voice.preferred_terms.items():
        if m := _term_re(avoid).search(text):
            findings.append(
                Finding(
                    code="preferred_term",
                    severity="warning",
                    message=f'Brand prefers "{use}" over "{m.group(0)}".',
                    excerpt=m.group(0),
                    suggestion=f'Use "{use}".',
                )
            )
    if require_disclaimers:
        for disclaimer in missing_disclaimers(brand, text, trigger_context):
            findings.append(
                Finding(
                    code="missing_disclaimer",
                    severity="error",
                    message="Required disclaimer is missing.",
                    suggestion=f'Add: "{disclaimer}"',
                )
            )
    if text.count("!") > voice.max_exclamations:
        findings.append(
            Finding(
                code="exclamation_overuse",
                severity="warning",
                message=(
                    f"More than {voice.max_exclamations} exclamation mark(s); "
                    "brand tone is measured."
                ),
                suggestion="Replace extras with full stops.",
            )
        )
    limit = _limit(brand, channel, field)
    if limit is not None and len(text) > limit:
        findings.append(
            Finding(
                code="channel_limit",
                severity="warning",
                message=(
                    f"{len(text)} chars exceeds the {limit}-char {field} limit for this channel."
                ),
                suggestion=f"Shorten to {limit} characters.",
            )
        )
    if (
        field == "cta"
        and voice.cta_phrases
        and not any(p.casefold() in text.casefold() for p in voice.cta_phrases)
    ):
        findings.append(
            Finding(
                code="cta_off_brand",
                severity="warning",
                message="CTA does not use an approved brand phrase.",
                suggestion="Use one of: " + ", ".join(f'"{p}"' for p in voice.cta_phrases),
            )
        )
    return _report(findings)


def check_visual_prompt(brand: Brand, prompt: str) -> GuardianReport:
    findings: list[Finding] = []
    visual = brand.visual

    for term in visual.avoid_visuals:
        if m := _term_re(term).search(prompt):
            findings.append(
                Finding(
                    code="avoid_visual",
                    severity="error",
                    message=f'"{m.group(0)}" is on the brand\'s do-not-show list.',
                    excerpt=m.group(0),
                    suggestion="Remove it from the prompt.",
                )
            )
    for name in brand.competitors:
        if m := _term_re(name).search(prompt):
            findings.append(
                Finding(
                    code="competitor_mention",
                    severity="error",
                    message=f'Competitor "{m.group(0)}" must not appear in visuals.',
                    excerpt=m.group(0),
                    suggestion="Remove the competitor reference.",
                )
            )
    allowed = visual.palette.allowed()
    for m in HEX_RE.finditer(prompt):
        color = m.group(0)
        if any(_distance(color, f) <= FORBIDDEN_TOLERANCE for f in visual.palette.forbidden):
            findings.append(
                Finding(
                    code="forbidden_color",
                    severity="error",
                    message=f"{color} is a forbidden brand colour.",
                    excerpt=color,
                    suggestion=f"Use {_nearest(color, allowed)}.",
                )
            )
        elif not any(_distance(color, a) <= PALETTE_TOLERANCE for a in allowed):
            findings.append(
                Finding(
                    code="off_palette_color",
                    severity="warning",
                    message=f"{color} is not in the brand palette.",
                    excerpt=color,
                    suggestion=f"Use {_nearest(color, allowed)}.",
                )
            )
    return _report(findings)


# ── Auto-revision ──────────────────────────────────────────────────────────


def _match_case(original: str, replacement: str) -> str:
    return replacement[:1].upper() + replacement[1:] if original[:1].isupper() else replacement


def revise_copy(
    brand: Brand,
    text: str,
    *,
    channel: str | None = None,
    field: CopyField = "body",
    require_disclaimers: bool = True,
    trigger_context: str = "",
) -> str:
    """Apply the mechanical fixes: swap terms, drop banned words, tame '!', add
    disclaimers, trim to the channel limit (leaving room for the disclaimer)."""
    voice = brand.voice
    for avoid, use in voice.preferred_terms.items():
        text = _term_re(avoid).sub(lambda m, use=use: _match_case(m.group(0), use), text)
    for word in [*voice.banned_words, *brand.competitors]:
        text = _term_re(word).sub("", text)
    text = _tidy(text)

    # A run like "!!" counts once; runs past the brand's allowance become full stops.
    bangs = 0

    def tame(m: re.Match[str]) -> str:
        nonlocal bangs
        bangs += 1
        return "!" if bangs <= voice.max_exclamations else "."

    text = re.sub(r"!+", tame, text)

    # Disclaimers are untouchable: lift them out, trim the body to the limit minus their
    # length, then put them back. Doing this on every pass keeps revision idempotent, so a
    # later round can never trim a disclaimer an earlier round added.
    kept: list[str] = []
    if require_disclaimers:
        for rule in brand.voice.disclaimers:
            pattern = re.compile(re.escape(rule.text), re.IGNORECASE)
            if pattern.search(text):
                text = pattern.sub("", text)
                kept.append(rule.text)
        text = _tidy(text)
        kept += [
            rule.text
            for rule in brand.voice.disclaimers
            if rule.text not in kept
            and any(_term_re(t).search(f"{trigger_context} {text}") for t in rule.trigger_terms)
        ]
    suffix = (" " + " ".join(kept)) if kept else ""
    limit = _limit(brand, channel, field)
    if limit is not None:
        # If the disclaimers alone nearly fill the limit, trim to the limit and let the
        # channel_limit finding stand for a human to resolve.
        room = limit - len(suffix)
        text = truncate_words(text, room if room >= 10 else limit)
    return _tidy(text + suffix)


def revise_visual_prompt(brand: Brand, prompt: str) -> str:
    visual = brand.visual
    for term in [*visual.avoid_visuals, *brand.competitors]:
        prompt = _term_re(term).sub("", prompt)
    allowed = visual.palette.allowed()

    def fix_hex(m: re.Match[str]) -> str:
        color = m.group(0)
        forbidden = any(
            _distance(color, f) <= FORBIDDEN_TOLERANCE for f in visual.palette.forbidden
        )
        on_palette = any(_distance(color, a) <= PALETTE_TOLERANCE for a in allowed)
        return _nearest(color, allowed) if forbidden or not on_palette else color

    return _tidy(HEX_RE.sub(fix_hex, prompt))


# ── Revision loops ─────────────────────────────────────────────────────────


def refine_copy(
    brand: Brand, text: str, *, max_rounds: int = 2, **kwargs
) -> tuple[str, GuardianReport, int]:
    """Check → revise until clean or out of rounds. Returns (text, final report, rounds used).

    Term swaps are safe, but deleting a banned word can break the sentence, so every
    deletion is reported as an `auto_removed` warning for a human to proofread.
    """
    original = text
    rounds = 0
    report = check_copy(brand, text, **kwargs)
    while report.findings and rounds < max_rounds:
        revised = revise_copy(brand, text, **kwargs)
        if revised == text:
            break
        text, rounds = revised, rounds + 1
        report = check_copy(brand, text, **kwargs)

    removed = [
        m.group(0)
        for word in [*brand.voice.banned_words, *brand.competitors]
        if (m := _term_re(word).search(original)) and not _term_re(word).search(text)
    ]
    if removed:
        report = merge_reports(
            report,
            GuardianReport(
                passed=True,
                score=100,
                findings=[
                    Finding(
                        code="auto_removed",
                        severity="warning",
                        excerpt=word,
                        message=(
                            f'"{word}" was removed automatically; '
                            "check the sentence still reads well."
                        ),
                        suggestion="Proofread and reword if needed.",
                    )
                    for word in removed
                ],
            ),
        )
    return text, report, rounds


def refine_visual_prompt(
    brand: Brand, prompt: str, *, max_rounds: int = 2
) -> tuple[str, GuardianReport, int]:
    rounds = 0
    report = check_visual_prompt(brand, prompt)
    while report.findings and rounds < max_rounds:
        revised = revise_visual_prompt(brand, prompt)
        if revised == prompt:
            break
        prompt, rounds = revised, rounds + 1
        report = check_visual_prompt(brand, prompt)
    return prompt, report, rounds
