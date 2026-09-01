"""Shared constants for ML pipeline."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

RAW_DATA_FILE = DATA_RAW_DIR / "synthetic_event_artist_pairs.csv"
PROCESSED_DATA_FILE = DATA_PROCESSED_DIR / "training_data.csv"
BEST_MODEL_FILE = MODELS_DIR / "best_model.joblib"
MODEL_METADATA_FILE = MODELS_DIR / "model_metadata.json"
MODEL_VERSION = "1.0.0"
RANDOM_SEED = 42

TARGET_COLUMN = "suitable"

NUMERIC_FEATURES = [
    "genre_match",
    "budget_match",
    "same_city",
    "artist_type_match",
    "average_rating",
    "total_performances",
    "years_of_experience",
    "expected_audience",
    "artist_fee_midpoint",
    "artist_available",
    "past_success_similar_events",
    "budget_min",
    "budget_max",
]

CATEGORICAL_FEATURES = [
    "event_type",
    "preferred_artist_type",
    "artist_type",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

ALGORITHMS = {
    "logistic_regression": "Logistic Regression",
    "random_forest": "Random Forest",
    "gradient_boosting": "Gradient Boosting",
}
