import json
from pathlib import Path

import pandas as pd
import pytest

from app.ml.constants import FEATURE_COLUMNS, PROCESSED_DATA_FILE, TARGET_COLUMN
from app.ml.pipeline import build_model_pipeline, load_model, load_metadata
from app.ml.preprocess import split_features_target, validate_dataset


def sample_row(suitable: int = 1) -> dict:
    return {
        "genre_match": 0.8,
        "budget_match": 0.9,
        "same_city": 1.0,
        "artist_type_match": 1.0,
        "average_rating": 4.5,
        "total_performances": 25,
        "years_of_experience": 8,
        "expected_audience": 500,
        "artist_fee_midpoint": 1200,
        "artist_available": 1.0,
        "past_success_similar_events": 0.7,
        "budget_min": 800,
        "budget_max": 2000,
        "event_type": "CONCERT",
        "preferred_artist_type": "BAND",
        "artist_type": "BAND",
        TARGET_COLUMN: suitable,
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
    for i, suitable in enumerate([1, 0, 1, 0]):
        row = sample_row(suitable)
        row["genre_match"] = 0.5 + i * 0.1
        row["average_rating"] = 3.5 + i * 0.2
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
