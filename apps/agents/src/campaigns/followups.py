"""Follow-up agent: the work that remains after generation.

Turns open findings and campaign state into dated, owned tasks, so nothing
ships unchecked and nothing is forgotten after launch.
"""

from datetime import datetime, timedelta
from typing import Literal

from .schemas import Campaign, FollowUp

Owner = Literal["agent", "human"]

LAUNCH_AFTER_DAYS = 3  # assumed gap between generation and go-live


def plan_follow_ups(
    campaign: Campaign, now: datetime, *, over_budget_by: int = 0
) -> list[FollowUp]:
    items: list[
        tuple[str, str, Owner, int, str | None]
    ] = []  # title, detail, owner, due days, related

    for d in campaign.deliverables:
        errors = [f for f in d.findings if f.severity == "error"]
        if d.status == "needs_review" and errors:
            where = f"scene {d.scene_index}" if d.scene_index else "campaign"
            items.append(
                (
                    f"Fix {d.modality.value} for {where}",
                    errors[0].message
                    + (f" {errors[0].suggestion}" if errors[0].suggestion else ""),
                    "human",
                    1,
                    d.id,
                )
            )
    for ad in campaign.ads:
        if not ad.passed:
            err = next((f for f in ad.findings if f.severity == "error"), None)
            items.append(
                (
                    f"Fix {ad.channel_label} ad copy",
                    err.message if err else "Ad copy needs a human pass before publishing.",
                    "human",
                    1,
                    ad.id,
                )
            )
    edited_scenes = sorted(
        {
            d.scene_index
            for d in campaign.deliverables
            if d.scene_index and any(f.code == "auto_removed" for f in d.findings)
        }
    )
    edited_ads = [
        a.channel_label for a in campaign.ads if any(f.code == "auto_removed" for f in a.findings)
    ]
    if edited_scenes or edited_ads:
        parts = ([f"scenes {edited_scenes}"] if edited_scenes else []) + (
            [f"{', '.join(edited_ads)} ad copy"] if edited_ads else []
        )
        items.append(
            (
                "Proofread auto-edited copy",
                f"The Brand Guardian removed banned words in {' and '.join(parts)}. "
                "Confirm each line still reads correctly.",
                "human",
                1,
                None,
            )
        )
    if over_budget_by > 0:
        items.append(
            (
                "Resolve credit shortfall",
                f"Planned production is {over_budget_by} credits over the "
                f"{campaign.brief.budget_credits}-credit "
                "budget even on the cheapest models. Raise the budget or cut scenes.",
                "human",
                1,
                None,
            )
        )
    if any(s.beat == "proof" for s in campaign.scenes):
        items.append(
            (
                "Replace proof scene with verified evidence",
                "The proof scene is a stand-in. Add a real testimonial or statistic "
                "you can substantiate.",
                "human",
                1,
                None,
            )
        )
    items.append(
        (
            "Brand-owner approval",
            "Review the full campaign against the brand book and approve for publishing.",
            "human",
            2,
            None,
        )
    )
    for ch in campaign.brief.channels:
        label = next((a.channel_label for a in campaign.ads if a.channel == ch), ch)
        items.append(
            (
                f"Schedule {label} posts",
                "Queue the approved cut with channel-appropriate captions.",
                "agent",
                LAUNCH_AFTER_DAYS,
                None,
            )
        )
    items.append(
        (
            "48-hour performance check",
            "Compare hook retention and click-through across channels; flag weak variants.",
            "agent",
            LAUNCH_AFTER_DAYS + 2,
            None,
        )
    )
    items.append(
        (
            "A/B test the hook",
            "Generate two alternative hook scenes and split-test against the winner.",
            "agent",
            LAUNCH_AFTER_DAYS + 2,
            None,
        )
    )
    items.append(
        (
            "Creative refresh",
            "Audience fatigue typically sets in within two weeks; draft a refreshed cut.",
            "agent",
            LAUNCH_AFTER_DAYS + 14,
            None,
        )
    )

    return [
        FollowUp(
            id=f"fu-{n}",
            title=title,
            detail=detail,
            owner=owner,
            due_at=(now + timedelta(days=days)).isoformat(),
            related=related,
        )
        for n, (title, detail, owner, days, related) in enumerate(items, start=1)
    ]
