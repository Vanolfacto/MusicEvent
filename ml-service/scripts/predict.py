"""CLI utility for single prediction using saved model."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ml.constants import FEATURE_COLUMNS  # noqa: E402
from app.ml.explain import build_explanation, summarize_explanation  # noqa: E402
from app.ml.pipeline import load_metadata, load_model  # noqa: E402


def predict_one(payload: dict) -> dict:
    model = load_model()
    metadata = load_metadata()

    row = {feature: payload[feature] for feature in FEATURE_COLUMNS}
    frame = pd.DataFrame([row])
    probability = float(model.predict_proba(frame)[0][1])

    explanation = build_explanation(row, probability)
    return {
        "modelVersion": metadata.get("modelVersion", "unknown"),
        "score": round(probability, 4),
        "prediction": int(probability >= 0.5),
        "explanation": explanation,
        "summary": summarize_explanation(explanation),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict artist-event suitability")
    parser.add_argument(
        "--input",
        required=True,
        help="JSON string or path to JSON file with feature values",
    )
    args = parser.parse_args()

    input_value = args.input
    input_path = Path(input_value)
    if input_path.exists():
        payload = json.loads(input_path.read_text(encoding="utf-8"))
    else:
        payload = json.loads(input_value)

    result = predict_one(payload)
    print(json.dumps(result, indent=2, ensure_ascii=True))


if __name__ == "__main__":
    main()
