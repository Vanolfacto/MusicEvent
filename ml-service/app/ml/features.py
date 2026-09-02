"""Feature engineering for event-artist pairs."""

from __future__ import annotations

from typing import Any


def _genre_overlap(event_genre_ids: list[int], artist_genre_ids: list[int]) -> float:
    if not event_genre_ids:
        return 0.0
    event_set = set(event_genre_ids)
    artist_set = set(artist_genre_ids)
    overlap = len(event_set.intersection(artist_set))
    return overlap / len(event_set)


def _budget_match(
    budget_min: float,
    budget_max: float,
    fee_min: float,
    fee_max: float,
) -> float:
    if fee_max < budget_min or fee_min > budget_max:
        return 0.0
    if fee_min >= budget_min and fee_max <= budget_max:
        return 1.0
    overlap_min = max(fee_min, budget_min)
    overlap_max = min(fee_max, budget_max)
    span = max(budget_max - budget_min, 1.0)
    return max(0.0, (overlap_max - overlap_min) / span)


def compute_genre_popularity(
    genre_names: list[str], genre_popularity: dict[str, float]
) -> float:
    default = genre_popularity.get("_default", 0.5)
    if not genre_names:
        return round(default, 4)
    scores = [
        genre_popularity.get(str(name).strip().upper(), default) for name in genre_names
    ]
    return round(sum(scores) / len(scores), 4)


def build_feature_row(event: dict[str, Any], artist: dict[str, Any]) -> dict[str, Any]:
    event_city = str(event.get("city", "")).strip().upper()
    artist_city = str(artist.get("city", "")).strip().upper()

    fee_min = float(artist.get("minimumFee", 0))
    fee_max = float(artist.get("maximumFee", 0))
    budget_min = float(event.get("minimumBudget", 0))
    budget_max = float(event.get("maximumBudget", 0))

    return {
        "genre_match": round(
            _genre_overlap(
                list(event.get("genreIds", [])),
                list(artist.get("genreIds", [])),
            ),
            4,
        ),
        "budget_match": round(_budget_match(budget_min, budget_max, fee_min, fee_max), 4),
        "same_city": float(event_city == artist_city and event_city != ""),
        "artist_type_match": float(
            str(event.get("preferredArtistType", "")).upper()
            == str(artist.get("artistType", "")).upper()
        ),
        "average_rating": float(artist.get("averageRating", 0)),
        "total_performances": int(artist.get("totalPerformances", 0)),
        "years_of_experience": int(artist.get("yearsOfExperience", 0)),
        "expected_audience": int(event.get("expectedAudience", 0)),
        "artist_fee_midpoint": round((fee_min + fee_max) / 2, 2),
        "artist_available": float(bool(artist.get("isAvailable", True))),
        "past_success_similar_events": float(
            artist.get("pastSuccessSimilarEvents", 0.5)
        ),
        "budget_min": budget_min,
        "budget_max": budget_max,
        "event_type": str(event.get("eventType", "OTHER")).upper(),
        "preferred_artist_type": str(event.get("preferredArtistType", "SOLO")).upper(),
        "artist_type": str(artist.get("artistType", "SOLO")).upper(),
    }
