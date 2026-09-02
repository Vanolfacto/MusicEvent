"""
Download the real Spotify Tracks Dataset and prepare it as the raw training file.

Source: https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset
(public mirror of the Kaggle "Spotify Tracks Dataset" by maharshipandya —
114k real tracks with real audio features and real Spotify popularity scores).
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import (  # noqa: E402
    FEATURE_COLUMNS,
    RAW_DATA_FILE,
    SPOTIFY_DATASET_URL,
    TARGET_COLUMN,
)


def main() -> None:
    print(f"Preuzimanje realnog dataseta sa: {SPOTIFY_DATASET_URL}")
    df = pd.read_csv(SPOTIFY_DATASET_URL)
    print(f"Preuzeto {len(df)} redova (stvarne Spotify pesme).")

    df = df.drop(columns=[c for c in df.columns if c.startswith("Unnamed")], errors="ignore")
    df = df.dropna(subset=["popularity"] + FEATURE_COLUMNS).reset_index(drop=True)

    threshold = df["popularity"].median()
    df[TARGET_COLUMN] = (df["popularity"] >= threshold).astype(int)
    print(f"Prag popularnosti (medijan): {threshold}")
    print(f"Raspodela klasa: {df[TARGET_COLUMN].value_counts(normalize=True).to_dict()}")

    keep_columns = FEATURE_COLUMNS + [TARGET_COLUMN, "track_id", "artists", "track_name", "popularity"]
    df = df[[c for c in keep_columns if c in df.columns]]

    RAW_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(RAW_DATA_FILE, index=False)
    print(f"Sačuvano: {RAW_DATA_FILE}")
    print("Napomena: 100% realan, javno dostupan dataset — nije sintetički generisan.")


if __name__ == "__main__":
    main()
