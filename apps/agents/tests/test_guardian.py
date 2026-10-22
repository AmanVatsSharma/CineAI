from src.brands import (
    check_copy,
    check_visual_prompt,
    refine_copy,
    revise_copy,
    revise_visual_prompt,
)
from src.brands.guardian import missing_disclaimers, truncate_words


def codes(report):
    return [f.code for f in report.findings]


def test_clean_copy_passes(vedpragya):
    report = check_copy(vedpragya, "Begin a calmer way to learn.")
    assert report.passed and report.score == 100 and report.findings == []


def test_banned_word_is_error_and_whole_word_only(vedpragya):
    assert "banned_word" in codes(check_copy(vedpragya, "A GUARANTEED outcome."))
    # 'hack' is banned but 'shack' / 'hackneyed' are different words
    assert check_copy(vedpragya, "A quiet shack by the sea.").passed
    report = check_copy(vedpragya, "A guaranteed miracle.")
    assert not report.passed and report.score == 50


def test_preferred_term_is_warning(vedpragya):
    report = check_copy(vedpragya, "Our users love it.")
    assert codes(report) == ["preferred_term"]
    assert report.passed and report.score == 92


def test_competitor_mention(lumen):
    report = check_copy(lumen, "Better than Dermalux.")
    assert "competitor_mention" in codes(report) and not report.passed


def test_disclaimer_required_when_triggered(vedpragya):
    assert "missing_disclaimer" in codes(check_copy(vedpragya, "See real results."))
    ok = "See real results. Individual results vary."
    assert check_copy(vedpragya, ok).passed
    assert check_copy(vedpragya, "See real results.", require_disclaimers=False).passed


def test_disclaimer_trigger_context(vedpragya):
    # The headline triggers the rule; the body must carry the disclaimer.
    assert missing_disclaimers(vedpragya, "Start today.", "Real results") == [
        "Individual results vary."
    ]


def test_exclamations_and_channel_limit(vedpragya):
    assert "exclamation_overuse" in codes(check_copy(vedpragya, "Wow! Great! Amazing!"))
    long = "x" * 60
    report = check_copy(vedpragya, long, channel="instagram_reel", field="headline")
    assert "channel_limit" in codes(report)
    assert check_copy(vedpragya, long, field="headline").passed  # no channel, no limit


def test_cta_must_use_approved_phrase(vedpragya):
    assert "cta_off_brand" in codes(check_copy(vedpragya, "Click here", field="cta"))
    assert check_copy(vedpragya, "Start learning", field="cta").passed


def test_visual_prompt_checks(vedpragya):
    assert "avoid_visual" in codes(check_visual_prompt(vedpragya, "A neon street at night"))
    assert codes(check_visual_prompt(vedpragya, "Logo on #1E1B4B")) == []
    assert codes(check_visual_prompt(vedpragya, "Close to brand #1F1C4C")) == []  # within tolerance
    assert codes(check_visual_prompt(vedpragya, "A #FF0000 banner")) == ["off_palette_color"]
    assert codes(check_visual_prompt(vedpragya, "A #00FF00 banner")) == ["forbidden_color"]


def test_revise_copy_swaps_terms_and_keeps_case(vedpragya):
    assert revise_copy(vedpragya, "Buy now.") == "Begin today."
    assert revise_copy(vedpragya, "Join our users.") == "Join our learners."


def test_revise_copy_removes_banned_and_tidies(vedpragya):
    out = revise_copy(vedpragya, "A guaranteed path, with real insight.")
    assert out == "A path, with real insight."


def test_revise_copy_collapses_exclamation_runs(vedpragya):
    assert revise_copy(vedpragya, "Wow!! Great! Amazing!") == "Wow! Great. Amazing."


def test_revise_copy_appends_disclaimer_and_is_idempotent(vedpragya):
    once = revise_copy(vedpragya, "See real results.")
    assert once == "See real results. Individual results vary."
    assert revise_copy(vedpragya, once) == once


def test_revise_copy_trims_body_not_disclaimer(vedpragya):
    text = "Discover timeless principles you can apply to real results every single day."
    out = revise_copy(vedpragya, text, channel="instagram_reel", field="body")
    assert len(out) <= 125 and out.endswith("Individual results vary.")
    short = revise_copy(
        vedpragya,
        "Discover results that last and last and last.",
        channel="instagram_reel",
        field="headline",
        require_disclaimers=False,
    )
    assert len(short) <= 40


def test_refine_copy_clean_text_is_untouched(vedpragya):
    text, report, rounds = refine_copy(vedpragya, "Begin a calmer way to learn.")
    assert (text, rounds, report.findings) == ("Begin a calmer way to learn.", 0, [])


def test_refine_copy_flags_deleted_banned_words_for_proofreading(vedpragya):
    text, report, rounds = refine_copy(vedpragya, "No hack needed.")
    assert text == "No needed."  # the edit damaged the sentence ...
    assert report.passed and rounds == 1
    removed = [f for f in report.findings if f.code == "auto_removed"]
    assert [f.excerpt for f in removed] == ["hack"]  # ... so it must not pass silently
    assert report.score < 100


def test_refine_copy_swap_only_is_not_flagged(vedpragya):
    _, report, _ = refine_copy(vedpragya, "Buy now.")
    assert report.findings == []


def test_disclaimer_wins_over_a_limit_it_cannot_meet(vedpragya):
    brand = vedpragya.model_copy(deep=True)
    brand.channels[0].max_headline_chars = 20  # smaller than the disclaimer itself
    text, report, _ = refine_copy(
        brand, "Real results today.", channel="instagram_reel", field="headline"
    )
    assert text.endswith("Individual results vary.")  # compliance text is never trimmed
    assert codes(report) == ["channel_limit"]  # ... and the overflow stays visible for a human


def test_revise_visual_prompt(vedpragya):
    out = revise_visual_prompt(vedpragya, "A neon street, banner #FF0000 and #00FF00")
    report = check_visual_prompt(vedpragya, out)
    assert report.passed and report.findings == []
    assert "neon" not in out.lower()


def test_truncate_words():
    assert truncate_words("short", 10) == "short"
    assert truncate_words("one two three four", 12) == "one two…"
    assert truncate_words("abcdefghij", 5) == "abcd…"
