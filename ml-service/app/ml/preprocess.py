"""Dataset validation and preparation helpers."""

from __future__ import annotations

import pandas as pd

from app.ml.constants import CATEGORICAL_FEATURES, FEATURE_COLUMNS, NUMERIC_FEATURES, TARGET_COLUMN


def validate_dataset(df: pd.DataFrame) -> pd.DataFrame:
    required = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing_cols = [col for col in required if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Nedostaju kolone u datasetu: {missing_cols}")

    data = df.copy()
    data = data.drop_duplicates().reset_index(drop=True)

    for column in NUMERIC_FEATURES + [TARGET_COLUMN]:
        data[column] = pd.to_numeric(data[column], errors="coerce")

    for column in CATEGORICAL_FEATURES:
        normalized = data[column].astype(str).str.strip().str.upper()
        data[column] = normalized.where(data[column].notna(), data[column])

    before = len(data)
    data = data.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN]).reset_index(drop=True)
    dropped = before - len(data)
    if dropped > 0:
        print(f"Uklonjeno {dropped} redova sa nedostajućim vrednostima.")

    data[TARGET_COLUMN] = data[TARGET_COLUMN].astype(int)
    if not set(data[TARGET_COLUMN].unique()).issubset({0, 1}):
        raise ValueError("Ciljna promenljiva mora biti 0 ili 1")

    return data


def split_features_target(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    x = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    return x, y
