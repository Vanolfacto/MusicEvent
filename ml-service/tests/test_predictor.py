"""Tests for the genre-popularity lookup and the recommendation scoring formula.

These two pieces (compute_genre_popularity, ModelService._score_pair/recommend)
directly determine what users see as recommendations and had no test coverage
before this file — build_feature_row alone was tested, not what happens with
its output.
"""

import pytest

from app.ml.features import compute_genre_popularity
from app.ml.predictor import SCORE_WEIGHTS, ModelService


class TestComputeGenrePopularity:
    def test_empty_genre_list_returns_default(self):
        popularity = {"_default": 0.42, "ROCK": 0.9}
        assert compute_genre_popularity([], popularity) == 0.42

    def test_missing_default_key_falls_back_to_hardcoded_half(self):
        assert compute_genre_popularity([], {}) == 0.5

    def test_known_genre_uses_its_own_score(self):
        popularity = {"_default": 0.5, "ROCK": 0.8}
        assert compute_genre_popularity(["Rock"], popularity) == 0.8

    def test_unknown_genre_falls_back_to_default(self):
        popularity = {"_default": 0.3, "ROCK": 0.8}
        assert compute_genre_popularity(["Klezmer"], popularity) == 0.3

    def test_case_and_whitespace_insensitive_lookup(self):
        popularity = {"_default": 0.5, "HIP HOP": 0.7}
        assert compute_genre_popularity(["  hip hop  "], popularity) == 0.7

    def test_multiple_genres_are_averaged(self):
        popularity = {"_default": 0.5, "ROCK": 1.0, "JAZZ": 0.0}
        assert compute_genre_popularity(["Rock", "Jazz"], popularity) == 0.5


class TestScorePair:
    def _service(self, genre_popularity=None):
        service = ModelService()
        service._model = object()  # bypass _ensure_loaded's file-load path
        service._genre_popularity = genre_popularity or {"_default": 0.5}
        return service

    def test_perfect_match_scores_at_or_near_the_top(self):
        service = self._service({"_default": 0.5, "ROCK": 1.0})
        event = {
            "eventType": "CONCERT",
            "city": "Beograd",
            "expectedAudience": 500,
            "minimumBudget": 1000,
            "maximumBudget": 3000,
            "preferredArtistType": "BAND",
            "genreIds": [1],
        }
        artist = {
            "artistId": 1,
            "artistType": "BAND",
            "city": "Beograd",
            "minimumFee": 1500,
            "maximumFee": 2000,
            "averageRating": 5.0,
            "isAvailable": True,
            "pastSuccessSimilarEvents": 1.0,
            "genreIds": [1],
            "genreNames": ["Rock"],
        }

        features, score = service._score_pair(event, artist)

        assert features["genre_match"] == 1.0
        assert features["budget_match"] == 1.0
        assert score == pytest.approx(1.0, abs=1e-6)

    def test_worst_case_scores_at_the_bottom(self):
        service = self._service({"_default": 0.0})
        event = {
            "eventType": "CONCERT",
            "city": "Beograd",
            "expectedAudience": 500,
            "minimumBudget": 1000,
            "maximumBudget": 1500,
            "preferredArtistType": "BAND",
            "genreIds": [1],
        }
        artist = {
            "artistId": 2,
            "artistType": "SOLO",
            "city": "Novi Sad",
            "minimumFee": 5000,
            "maximumFee": 6000,
            "averageRating": 0,
            "isAvailable": False,
            "pastSuccessSimilarEvents": 0.0,
            "genreIds": [99],
            "genreNames": [],
        }

        _, score = service._score_pair(event, artist)

        assert score == pytest.approx(0.0, abs=1e-6)

    def test_score_is_a_weighted_sum_matching_score_weights(self):
        service = self._service({"_default": 0.5, "ROCK": 0.8})
        event = {
            "eventType": "CONCERT",
            "city": "Beograd",
            "expectedAudience": 500,
            "minimumBudget": 1000,
            "maximumBudget": 3000,
            "preferredArtistType": "BAND",
            "genreIds": [1],
        }
        artist = {
            "artistId": 3,
            "artistType": "SOLO",  # deliberately mismatched
            "city": "Novi Sad",  # deliberately mismatched
            "minimumFee": 1500,
            "maximumFee": 2000,
            "averageRating": 4.0,
            "isAvailable": True,
            "pastSuccessSimilarEvents": 0.6,
            "genreIds": [1],
            "genreNames": ["Rock"],
        }

        features, score = service._score_pair(event, artist)
        expected = (
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
        assert score == pytest.approx(expected, abs=1e-6)

    def test_score_weights_sum_to_one(self):
        assert sum(SCORE_WEIGHTS.values()) == pytest.approx(1.0, abs=1e-9)


class TestRecommend:
    def _service(self):
        service = ModelService()
        service._model = object()
        service._genre_popularity = {"_default": 0.5}
        return service

    def test_empty_artist_list_returns_empty(self):
        service = self._service()
        assert service.recommend({"genreIds": []}, []) == []

    def test_results_are_sorted_by_score_descending(self):
        service = self._service()
        event = {
            "eventType": "CONCERT",
            "city": "Beograd",
            "expectedAudience": 100,
            "minimumBudget": 1000,
            "maximumBudget": 2000,
            "preferredArtistType": "BAND",
            "genreIds": [1],
        }
        weak_artist = {
            "artistId": 1,
            "artistType": "SOLO",
            "city": "Nis",
            "minimumFee": 9000,
            "maximumFee": 9500,
            "averageRating": 1.0,
            "isAvailable": False,
            "genreIds": [],
            "genreNames": [],
        }
        strong_artist = {
            "artistId": 2,
            "artistType": "BAND",
            "city": "Beograd",
            "minimumFee": 1200,
            "maximumFee": 1800,
            "averageRating": 5.0,
            "isAvailable": True,
            "genreIds": [1],
            "genreNames": [],
        }

        results = service.recommend(event, [weak_artist, strong_artist])

        assert [r["artistId"] for r in results] == [2, 1]
        assert results[0]["score"] >= results[1]["score"]
