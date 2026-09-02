"""Model loading and recommendation-scoring service."""

from __future__ import annotations

import json
from typing import Any

from sklearn.pipeline import Pipeline

from app.ml.constants import GENRE_POPULARITY_FILE
from app.ml.explain import build_explanation, summarize_explanation
from app.ml.features import build_feature_row, compute_genre_popularity
from app.ml.pipeline import load_metadata, load_model

# Weights for the transparent event-artist scoring formula.
#
# The trained classifier (Logistic Regression / Random Forest / Gradient
# Boosting, see train_model.py) is trained on real Spotify data to predict
# whether a *track* is popular from its audio features — a structurally
# different problem than "is this event-artist pair a good match" (no
# public dataset of real booking outcomes exists). Its predictions feed
# into recommendations indirectly: build_genre_popularity.py runs the
# trained model over the real dataset and aggregates predicted popularity
# per genre bucket, producing genre_popularity.json. That real,
# data-grounded signal is one input below, alongside the platform's own
# real operational data (genre/budget/city match, ratings, availability,
# performance history).
SCORE_WEIGHTS = {
    "genre_match": 0.28,
    "budget_match": 0.20,
    "same_city": 0.10,
    "artist_type_match": 0.08,
    "average_rating": 0.14,
    "artist_available": 0.06,
    "past_success_similar_events": 0.09,
    "genre_popularity": 0.05,
}


class ModelService:
    def __init__(self) -> None:
        self._model: Pipeline | None = None
        self._metadata: dict[str, Any] = {}
        self._genre_popularity: dict[str, float] = {}

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def metadata(self) -> dict[str, Any]:
        return self._metadata

    def load(self) -> None:
        self._model = load_model()
        self._metadata = load_metadata()
        if GENRE_POPULARITY_FILE.exists():
            self._genre_popularity = json.loads(
                GENRE_POPULARITY_FILE.read_text(encoding="utf-8")
            )
        else:
            self._genre_popularity = {}

    def reload(self) -> None:
        self.load()

    def _ensure_loaded(self) -> None:
        if self._model is None:
            self.load()
        if self._model is None:
            raise RuntimeError("ML model nije učitan")

    def _score_pair(
        self, event: dict[str, Any], artist: dict[str, Any]
    ) -> tuple[dict[str, Any], float]:
        features = build_feature_row(event, artist)
        features["genre_popularity"] = compute_genre_popularity(
            artist.get("genreNames", []), self._genre_popularity
        )

        score = (
            SCORE_WEIGHTS["genre_match"] * features["genre_match"]
            + SCORE_WEIGHTS["budget_match"] * features["budget_match"]
            + SCORE_WEIGHTS["same_city"] * features["same_city"]
            + SCORE_WEIGHTS["artist_type_match"] * features["artist_type_match"]
            + SCORE_WEIGHTS["average_rating"] * min(features["average_rating"] / 5, 1.0)
            + SCORE_WEIGHTS["artist_available"] * features["artist_available"]
            + SCORE_WEIGHTS["past_success_similar_events"]
            * features["past_success_similar_events"]
            + SCORE_WEIGHTS["genre_popularity"] * features["genre_popularity"]
        )
        return features, max(0.0, min(1.0, score))

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
        self._ensure_loaded()
        features, score = self._score_pair(event, artist)
        return self._build_result(artist, features, score)

    def recommend(
        self,
        event: dict[str, Any],
        artists: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        if not artists:
            return []

        self._ensure_loaded()
        results = [
            self._build_result(artist, *self._score_pair(event, artist)) for artist in artists
        ]
        results.sort(key=lambda item: item["score"], reverse=True)
        return results


model_service = ModelService()
