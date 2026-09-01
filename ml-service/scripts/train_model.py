"""Train and compare ML algorithms, save best model."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import (  # noqa: E402
    ALGORITHMS,
    MODEL_VERSION,
    PROCESSED_DATA_FILE,
    RANDOM_SEED,
    REPORTS_DIR,
)
from app.ml.pipeline import build_model_pipeline, get_feature_importance, save_model  # noqa: E402
from app.ml.preprocess import split_features_target, validate_dataset  # noqa: E402

SCORING = {
    "accuracy": "accuracy",
    "precision": "precision",
    "recall": "recall",
    "f1": "f1",
    "roc_auc": "roc_auc",
}


def evaluate_algorithm(name: str, x_train, x_test, y_train, y_test):
    pipeline = build_model_pipeline(name)
    pipeline.fit(x_train, y_train)

    y_pred = pipeline.predict(x_test)
    y_prob = pipeline.predict_proba(x_test)[:, 1]

    test_metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    cv_scores = cross_validate(
        build_model_pipeline(name),
        x_train,
        y_train,
        cv=cv,
        scoring=SCORING,
        n_jobs=-1,
    )

    cv_metrics = {
        metric: float(np.mean(cv_scores[f"test_{metric}"]))
        for metric in SCORING
    }

    return {
        "algorithm_key": name,
        "algorithm": ALGORITHMS[name],
        "pipeline": pipeline,
        "test_metrics": test_metrics,
        "cv_metrics": cv_metrics,
        "feature_importance": get_feature_importance(pipeline),
    }


def plot_algorithm_comparison(results: list[dict], output_path: Path) -> None:
    labels = [item["algorithm"] for item in results]
    f1_scores = [item["test_metrics"]["f1"] for item in results]
    roc_scores = [item["test_metrics"]["roc_auc"] for item in results]

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - width / 2, f1_scores, width, label="F1 (test)")
    ax.bar(x + width / 2, roc_scores, width, label="ROC AUC (test)")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15)
    ax.set_ylim(0, 1)
    ax.set_title("Algorithm comparison - synthetic prototype dataset")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)


def plot_feature_importance(importance: dict[str, float], output_path: Path) -> None:
    if not importance:
        return

    names = list(importance.keys())[::-1]
    values = list(importance.values())[::-1]

    fig, ax = plt.subplots(figsize=(10, 7))
    ax.barh(names, values, color="#7c3aed")
    ax.set_title("Feature importance - best model")
    ax.grid(axis="x", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)


def main() -> None:
    if not PROCESSED_DATA_FILE.exists():
        raise FileNotFoundError(
            f"Obrađeni dataset ne postoji: {PROCESSED_DATA_FILE}. Pokrenite preprocess_data.py"
        )

    df = validate_dataset(pd.read_csv(PROCESSED_DATA_FILE))
    x, y = split_features_target(df)

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )

    results = [
        evaluate_algorithm(name, x_train, x_test, y_train, y_test)
        for name in ALGORITHMS
    ]

    best = max(results, key=lambda item: item["test_metrics"]["f1"])

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    comparison_path = REPORTS_DIR / "algorithm_comparison.png"
    importance_path = REPORTS_DIR / "feature_importance.png"
    comparison_json_path = REPORTS_DIR / "algorithm_comparison.json"

    plot_algorithm_comparison(results, comparison_path)
    plot_feature_importance(best["feature_importance"], importance_path)

    comparison_payload = [
        {
            "algorithm": item["algorithm"],
            "test_metrics": item["test_metrics"],
            "cv_metrics": item["cv_metrics"],
        }
        for item in results
    ]
    comparison_json_path.write_text(
        json.dumps(comparison_payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    metadata = {
        "modelVersion": MODEL_VERSION,
        "algorithm": best["algorithm"],
        "algorithmKey": best["algorithm_key"],
        "trainingDate": datetime.now(timezone.utc).isoformat(),
        "datasetSize": len(df),
        "trainSize": len(x_train),
        "testSize": len(x_test),
        "metrics": best["test_metrics"],
        "cvMetrics": best["cv_metrics"],
        "featureImportance": best["feature_importance"],
        "notes": "Sintetički dataset — samo za prototip. Ne predstavlja stvarne podatke.",
        "dataSource": str(PROCESSED_DATA_FILE),
    }

    save_model(best["pipeline"], metadata)

    print("=== TRAINING COMPLETE ===")
    print(f"Best model: {best['algorithm']}")
    print(f"Test F1: {best['test_metrics']['f1']:.4f}")
    print(f"Test ROC AUC: {best['test_metrics']['roc_auc']:.4f}")
    print("Model saved: models/best_model.joblib")
    print(f"Reports: {REPORTS_DIR}")


if __name__ == "__main__":
    main()
