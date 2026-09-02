"""Evaluate saved model and generate confusion matrix report."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import PROCESSED_DATA_FILE, RANDOM_SEED, REPORTS_DIR  # noqa: E402
from app.ml.pipeline import load_metadata, load_model  # noqa: E402
from app.ml.preprocess import split_features_target, validate_dataset  # noqa: E402


def main() -> None:
    if not PROCESSED_DATA_FILE.exists():
        raise FileNotFoundError("Obrađeni dataset ne postoji. Pokrenite preprocess_data.py")

    metadata = load_metadata()
    model = load_model()
    df = validate_dataset(pd.read_csv(PROCESSED_DATA_FILE))
    x, y = split_features_target(df)

    _, x_test, _, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )

    y_pred = model.predict(x_test)
    y_prob = model.predict_proba(x_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
    }

    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    cm_path = REPORTS_DIR / "confusion_matrix.png"
    metrics_path = REPORTS_DIR / "evaluation_metrics.json"

    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap="Purples")
    plt.title("Confusion matrix - best model (test set)")
    plt.tight_layout()
    plt.savefig(cm_path, dpi=150)
    plt.close()

    payload = {
        "modelVersion": metadata.get("modelVersion"),
        "algorithm": metadata.get("algorithm"),
        "metrics": metrics,
        "classificationReport": report,
        "notes": "Evaluacija na realnom test skupu (Spotify Tracks Dataset).",
    }
    metrics_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print("=== MODEL EVALUATION ===")
    print(json.dumps(metrics, indent=2))
    print(f"Confusion matrix: {cm_path}")
    print(f"Metrics file: {metrics_path}")


if __name__ == "__main__":
    main()
