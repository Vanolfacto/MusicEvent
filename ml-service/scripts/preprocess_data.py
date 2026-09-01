"""Preprocess raw synthetic CSV into training-ready dataset."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import (  # noqa: E402
    FEATURE_COLUMNS,
    PROCESSED_DATA_FILE,
    RAW_DATA_FILE,
    TARGET_COLUMN,
)
from app.ml.preprocess import validate_dataset  # noqa: E402


def main() -> None:
    if not RAW_DATA_FILE.exists():
        raise FileNotFoundError(
            f"Sirovi dataset ne postoji: {RAW_DATA_FILE}. Pokrenite generate_synthetic_data.py"
        )

    raw_df = pd.read_csv(RAW_DATA_FILE)
    processed_df = validate_dataset(raw_df)

    keep_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    optional_meta = [col for col in ["pair_id", "event_id", "artist_id"] if col in processed_df.columns]
    processed_df = processed_df[keep_columns + optional_meta]

    PROCESSED_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    processed_df.to_csv(PROCESSED_DATA_FILE, index=False)

    print(f"Processed dataset saved: {PROCESSED_DATA_FILE}")
    print(f"Rows: {len(processed_df)}")
    print(f"Model columns: {', '.join(FEATURE_COLUMNS)}")


if __name__ == "__main__":
    main()
