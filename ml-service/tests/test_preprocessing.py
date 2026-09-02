import json
from pathlib import Path

import pandas as pd
import pytest

from app.ml.constants import FEATURE_COLUMNS, PROCESSED_DATA_FILE, TARGET_COLUMN
from app.ml.pipeline import build_model_pipeline, load_model, load_metadata
from app.ml.preprocess import split_features_target, validate_dataset


def sample_row(popular: int = 1) -> dict:
    return {
        "danceability": 0.65,
        "energy": 0.7,
        "key": 5,
        "loudness": -6.5,
        "mode": 1,
        "speechiness": 0.05,
        "acousticness": 0.2,
        "instrumentalness": 0.0,
        "liveness": 0.15,
        "valence": 0.6,
        "tempo": 120.0,
        "time_signature": 4,
        "duration_ms": 210000,
        "explicit": 0,
        "track_genre": "pop",
        TARGET_COLUMN: popular,
    }


def test_validate_dataset_accepts_valid_rows():
    df = pd.DataFrame([sample_row(1), sample_row(0)])
    result = validate_dataset(df)
    assert len(result) == 2
    assert set(result[TARGET_COLUMN].unique()) == {0, 1}


def test_validate_dataset_rejects_invalid_target():
    row = sample_row(1)
    row[TARGET_COLUMN] = 2
    df = pd.DataFrame([row])
    with pytest.raises(ValueError):
        validate_dataset(df)


def test_split_features_target_shapes():
    df = pd.DataFrame([sample_row(1), sample_row(0)])
    validated = validate_dataset(df)
    x, y = split_features_target(validated)
    assert list(x.columns) == FEATURE_COLUMNS
    assert len(y) == 2


@pytest.mark.skipif(not PROCESSED_DATA_FILE.exists(), reason="Processed dataset not generated")
def test_processed_dataset_has_minimum_rows():
    df = pd.read_csv(PROCESSED_DATA_FILE)
    assert len(df) >= 2000


def test_build_model_pipeline_runs_fit_predict():
    rows = []
    for i, popular in enumerate([1, 0, 1, 0]):
        row = sample_row(popular)
        row["danceability"] = 0.5 + i * 0.1
        row["energy"] = 0.4 + i * 0.1
        rows.append(row)
    df = pd.DataFrame(rows)
    validated = validate_dataset(df)
    x, y = split_features_target(validated)
    model = build_model_pipeline("logistic_regression")
    model.fit(x, y)
    preds = model.predict(x)
    assert len(preds) == 4


@pytest.mark.skipif(not Path("models/best_model.joblib").exists(), reason="Trained model missing")
def test_load_model_and_predict():
    model = load_model()
    metadata = load_metadata()
    assert metadata.get("modelVersion") is not None

    frame = pd.DataFrame([{k: sample_row()[k] for k in FEATURE_COLUMNS}])
    proba = model.predict_proba(frame)
    assert proba.shape == (1, 2)
