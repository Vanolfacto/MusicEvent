"""
Build a per-(event-type, genre) fit lookup from the manually collected,
real local-artist research dataset (ml-service/research/local_artists_v2.csv).

This is the local-data counterpart to build_genre_popularity.py: instead of
global Spotify streaming popularity, it captures which genres are actually
booked for which event types in the local live-music scene, based on 61 real
artists from 7 independent Serbian sources (see ../research/README.md).
Small sample size means most cells fall back to a default — an honest,
documented limitation (see docs/machine-learning-methodology.md), not hidden.

Run manually after updating research/local_artists_v2.csv. Used at inference
time by app/ml/predictor.py as one input in the recommendation formula,
alongside genre_popularity (global Spotify signal) and the platform's own
operational data.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import (  # noqa: E402
    APP_EVENT_TYPES,
    EVENT_TYPE_FIT_FILE,
    LOCAL_ARTISTS_RESEARCH_FILE,
)

MIN_SAMPLES_PER_GENRE = 3
MIN_POSITIVE_FOR_DEFAULT = 3
NEUTRAL_DEFAULT = 0.5


def main() -> None:
    if not LOCAL_ARTISTS_RESEARCH_FILE.exists():
        raise FileNotFoundError(
            f"Lokalni istraživački dataset ne postoji: {LOCAL_ARTISTS_RESEARCH_FILE}"
        )

    df = pd.read_csv(LOCAL_ARTISTS_RESEARCH_FILE)
    df = df[df["genre_bucket"] != "OTHER"].copy()
    df["event_type_list"] = df["all_event_types"].fillna("").str.split(";")

    result: dict[str, dict[str, float]] = {}
    for event_type in APP_EVENT_TYPES:
        has_type = df["event_type_list"].apply(lambda types, et=event_type: et in types)
        positive = int(has_type.sum())
        overall_default = (
            round(float(has_type.mean()), 4) if positive >= MIN_POSITIVE_FOR_DEFAULT else NEUTRAL_DEFAULT
        )

        per_genre: dict[str, float] = {"_default": overall_default}
        # Only break down by genre when the event type itself has enough real
        # signal overall — otherwise every genre would show a misleading exact
        # 0.0 (e.g. OTHER never appears in the data at all) instead of the
        # neutral _default above.
        if positive >= MIN_POSITIVE_FOR_DEFAULT:
            for genre, group in df.groupby("genre_bucket"):
                if len(group) < MIN_SAMPLES_PER_GENRE:
                    continue
                group_has_type = group["event_type_list"].apply(
                    lambda types, et=event_type: et in types
                )
                per_genre[genre] = round(float(group_has_type.mean()), 4)

        result[event_type] = per_genre

    EVENT_TYPE_FIT_FILE.parent.mkdir(parents=True, exist_ok=True)
    EVENT_TYPE_FIT_FILE.write_text(
        json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print("=== EVENT-TYPE FIT (iz realnog lokalnog istraživačkog dataseta) ===")
    for event_type, scores in result.items():
        print(f"  {event_type}: {scores}")
    print(f"Sačuvano: {EVENT_TYPE_FIT_FILE}")
    print(
        f"Napomena: minimalno {MIN_SAMPLES_PER_GENRE} uzoraka po žanru za "
        f"specifičan skor po žanru; minimalno {MIN_POSITIVE_FOR_DEFAULT} pozitivna "
        "uzorka za tip događaja da _default ne bude neutralnih 0.5."
    )


if __name__ == "__main__":
    main()
