"""Sklearn pipeline construction and model I/O."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.ml.constants import (
    BEST_MODEL_FILE,
    CATEGORICAL_FEATURES,
    MODEL_METADATA_FILE,
    NUMERIC_FEATURES,
    RANDOM_SEED,
)


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            ),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )


def build_model_pipeline(algorithm: str) -> Pipeline:
    if algorithm == "logistic_regression":
        classifier: Any = LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=RANDOM_SEED,
        )
    elif algorithm == "random_forest":
        classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight="balanced_subsample",
            random_state=RANDOM_SEED,
            n_jobs=-1,
        )
    elif algorithm == "gradient_boosting":
        classifier = GradientBoostingClassifier(random_state=RANDOM_SEED)
    else:
        raise ValueError(f"Nepoznat algoritam: {algorithm}")

    return Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("classifier", classifier),
        ]
    )


def get_feature_importance(model: Pipeline, top_n: int = 15) -> dict[str, float]:
    classifier = model.named_steps["classifier"]
    preprocessor = model.named_steps["preprocessor"]

    feature_names = preprocessor.get_feature_names_out()
    if hasattr(classifier, "feature_importances_"):
        values = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        values = np.mean(np.abs(classifier.coef_), axis=0)
    else:
        return {}

    pairs = sorted(
        zip(feature_names, values, strict=False),
        key=lambda item: item[1],
        reverse=True,
    )[:top_n]
    return {name: float(value) for name, value in pairs}


def save_model(
    model: Pipeline,
    metadata: dict[str, Any],
    model_path: Path = BEST_MODEL_FILE,
    metadata_path: Path = MODEL_METADATA_FILE,
) -> None:
    model_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    metadata_path.write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def load_model(model_path: Path = BEST_MODEL_FILE) -> Pipeline:
    if not model_path.exists():
        raise FileNotFoundError(f"Model nije pronađen: {model_path}")
    return joblib.load(model_path)


def load_metadata(metadata_path: Path = MODEL_METADATA_FILE) -> dict[str, Any]:
    if not metadata_path.exists():
        return {}
    return json.loads(metadata_path.read_text(encoding="utf-8"))
