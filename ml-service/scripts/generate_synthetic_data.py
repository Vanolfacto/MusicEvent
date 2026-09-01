"""
Generate SYNTHETIC dataset for prototype only.
Do NOT present this data as real-world collected data.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import FEATURE_COLUMNS, RAW_DATA_FILE, RANDOM_SEED, TARGET_COLUMN  # noqa: E402

CITIES = ["BEOGRAD", "NOVI SAD", "NIS", "KRAGUJEVAC", "SUBOTICA", "ZRENJANIN"]
GENRES = ["ROCK", "POP", "JAZZ", "ELECTRONIC", "FOLK", "METAL", "HIP HOP", "CLASSICAL"]
EVENT_TYPES = [
    "CONCERT",
    "FESTIVAL",
    "PRIVATE_PARTY",
    "WEDDING",
    "CORPORATE",
    "CLUB_NIGHT",
    "OTHER",
]
ARTIST_TYPES = ["SOLO", "BAND", "DJ"]
ROWS = 2500


def _score_to_label(score: float, rng: np.random.Generator) -> int:
    probability = 1 / (1 + np.exp(-score))
    noise = rng.normal(0, 0.15)
    final_prob = np.clip(probability + noise, 0.02, 0.98)
    return int(rng.random() < final_prob)


def generate_rows(n_rows: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows: list[dict] = []

    for i in range(n_rows):
        event_type = rng.choice(EVENT_TYPES)
        preferred_artist_type = rng.choice(ARTIST_TYPES)
        artist_type = rng.choice(ARTIST_TYPES, p=[0.45, 0.35, 0.20])

        event_city = rng.choice(CITIES)
        artist_city = event_city if rng.random() < 0.55 else rng.choice(CITIES)
        same_city = float(event_city == artist_city)

        event_genres = set(rng.choice(GENRES, size=rng.integers(1, 4), replace=False))
        artist_genres = set(rng.choice(GENRES, size=rng.integers(1, 4), replace=False))
        overlap = len(event_genres.intersection(artist_genres))
        genre_match = overlap / max(len(event_genres), 1)

        budget_min = float(rng.integers(300, 4000))
        budget_max = budget_min + float(rng.integers(500, 8000))
        artist_fee_min = float(rng.integers(100, 5000))
        artist_fee_max = artist_fee_min + float(rng.integers(200, 6000))
        artist_fee_midpoint = (artist_fee_min + artist_fee_max) / 2

        if artist_fee_max < budget_min or artist_fee_min > budget_max:
            budget_match = 0.0
        elif artist_fee_min >= budget_min and artist_fee_max <= budget_max:
            budget_match = 1.0
        else:
            overlap_min = max(artist_fee_min, budget_min)
            overlap_max = min(artist_fee_max, budget_max)
            budget_match = max(0.0, (overlap_max - overlap_min) / (budget_max - budget_min))

        artist_type_match = float(preferred_artist_type == artist_type)
        average_rating = float(np.clip(rng.normal(4.0, 0.6), 2.0, 5.0))
        total_performances = int(rng.integers(0, 120))
        years_of_experience = int(rng.integers(0, 25))
        expected_audience = int(rng.integers(50, 5000))
        artist_available = float(rng.random() > 0.12)
        past_success_similar_events = float(np.clip(rng.beta(2, 2), 0, 1))

        latent_score = (
            1.6 * genre_match
            + 1.4 * budget_match
            + 0.9 * same_city
            + 1.0 * artist_type_match
            + 0.7 * (average_rating - 3.0)
            + 0.002 * total_performances
            + 0.03 * years_of_experience
            + 0.35 * artist_available
            + 0.8 * past_success_similar_events
            - 3.2
        )

        suitable = _score_to_label(latent_score, rng)

        rows.append(
            {
                "pair_id": i + 1,
                "event_id": int(rng.integers(1, 400)),
                "artist_id": int(rng.integers(1, 600)),
                "event_type": event_type,
                "preferred_artist_type": preferred_artist_type,
                "artist_type": artist_type,
                "event_city": event_city,
                "artist_city": artist_city,
                "genre_match": round(genre_match, 4),
                "budget_match": round(budget_match, 4),
                "same_city": same_city,
                "artist_type_match": artist_type_match,
                "average_rating": round(average_rating, 2),
                "total_performances": total_performances,
                "years_of_experience": years_of_experience,
                "expected_audience": expected_audience,
                "artist_fee_midpoint": round(artist_fee_midpoint, 2),
                "artist_fee_min": round(artist_fee_min, 2),
                "artist_fee_max": round(artist_fee_max, 2),
                "budget_min": round(budget_min, 2),
                "budget_max": round(budget_max, 2),
                "artist_available": artist_available,
                "past_success_similar_events": round(past_success_similar_events, 4),
                TARGET_COLUMN: suitable,
            }
        )

    df = pd.DataFrame(rows)
    return df[FEATURE_COLUMNS + [TARGET_COLUMN, "pair_id", "event_id", "artist_id", "event_city", "artist_city"]]


def main() -> None:
    RAW_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    df = generate_rows(ROWS, RANDOM_SEED)
    df.to_csv(RAW_DATA_FILE, index=False)

    positive_rate = df[TARGET_COLUMN].mean()
    print("=== SYNTHETIC DATASET (PROTOTYPE ONLY) ===")
    print(f"Saved: {RAW_DATA_FILE}")
    print(f"Rows: {len(df)}")
    print(f"Positive class rate: {positive_rate:.2%}")
    print("Note: Artificial data for prototype - not real-world data.")


if __name__ == "__main__":
    main()
