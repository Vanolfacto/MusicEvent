"""
Build a per-genre popularity lookup from the trained model's predictions
over the real dataset, bucketed into the app's 12 genre categories.

Run after train_model.py. Used at inference time by app/ml/predictor.py
as one real, data-grounded signal in the recommendation scoring formula.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import (  # noqa: E402
    APP_GENRES,
    GENRE_BUCKET_MAP,
    GENRE_POPULARITY_FILE,
    PROCESSED_DATA_FILE,
)
from app.ml.pipeline import load_model  # noqa: E402
from app.ml.preprocess import split_features_target, validate_dataset  # noqa: E402


def main() -> None:
    if not PROCESSED_DATA_FILE.exists():
        raise FileNotFoundError("Obrađeni dataset ne postoji. Pokrenite preprocess_data.py")

    model = load_model()
    df = validate_dataset(pd.read_csv(PROCESSED_DATA_FILE))
    x, _ = split_features_target(df)

    probabilities = model.predict_proba(x)[:, 1]
    df = df.assign(predicted_popularity=probabilities)
    df["app_genre"] = df["track_genre"].str.lower().map(GENRE_BUCKET_MAP)

    bucketed = df.dropna(subset=["app_genre"])
    genre_scores = bucketed.groupby("app_genre")["predicted_popularity"].mean()

    overall_default = float(df["predicted_popularity"].mean())
    result = {
        genre: round(float(genre_scores.get(genre, overall_default)), 4) for genre in APP_GENRES
    }
    result["_default"] = round(overall_default, 4)

    GENRE_POPULARITY_FILE.parent.mkdir(parents=True, exist_ok=True)
    GENRE_POPULARITY_FILE.write_text(
        json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print("=== GENRE POPULARITY (iz istreniranog modela nad realnim podacima) ===")
    for genre, score in result.items():
        print(f"  {genre}: {score}")
    print(f"Sačuvano: {GENRE_POPULARITY_FILE}")


if __name__ == "__main__":
    main()
