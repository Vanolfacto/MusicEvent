"""Model loading and prediction service."""

from __future__ import annotations

from typing import Any

import pandas as pd
from sklearn.pipeline import Pipeline

from app.ml.constants import FEATURE_COLUMNS
from app.ml.explain import build_explanation, summarize_explanation
from app.ml.features import build_feature_row
from app.ml.pipeline import load_metadata, load_model


class ModelService:
    def __init__(self) -> None:
        self._model: Pipeline | None = None
        self._metadata: dict[str, Any] = {}

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def metadata(self) -> dict[str, Any]:
        return self._metadata

    def load(self) -> None:
        self._model = load_model()
        self._metadata = load_metadata()

    def reload(self) -> None:
        self.load()

    def _ensure_loaded(self) -> Pipeline:
        if self._model is None:
            self.load()
        if self._model is None:
            raise RuntimeError("ML model nije učitan")
        return self._model

    @staticmethod
    def _build_result(
        artist: dict[str, Any], features: dict[str, Any], probability: float
    ) -> dict[str, Any]:
        explanation = build_explanation(features, probability)
        return {
            "artistId": artist.get("artistId"),
            "score": round(probability, 4),
            "prediction": int(probability >= 0.5),
            "explanation": explanation,
            "summary": summarize_explanation(explanation),
            "features": features,
        }

    def predict_pair(self, event: dict[str, Any], artist: dict[str, Any]) -> dict[str, Any]:
        model = self._ensure_loaded()
        features = build_feature_row(event, artist)
        frame = pd.DataFrame([{key: features[key] for key in FEATURE_COLUMNS}])
        probability = float(model.predict_proba(frame)[0][1])
        return self._build_result(artist, features, probability)

    def recommend(
        self,
        event: dict[str, Any],
        artists: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        if not artists:
            return []

        model = self._ensure_loaded()
        features_list = [build_feature_row(event, artist) for artist in artists]
        frame = pd.DataFrame(
            [{key: features[key] for key in FEATURE_COLUMNS} for features in features_list]
        )
        probabilities = model.predict_proba(frame)[:, 1]

        results = [
            self._build_result(artist, features, float(probability))
            for artist, features, probability in zip(artists, features_list, probabilities, strict=True)
        ]
        results.sort(key=lambda item: item["score"], reverse=True)
        return results


model_service = ModelService()
