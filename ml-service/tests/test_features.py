"""Tests for feature engineering."""

from app.ml.features import build_feature_row


def test_build_feature_row_high_match():
    event = {
        "eventType": "CONCERT",
        "city": "Beograd",
        "expectedAudience": 500,
        "minimumBudget": 1000,
        "maximumBudget": 3000,
        "preferredArtistType": "BAND",
        "genreIds": [1, 2],
    }
    artist = {
        "artistId": 1,
        "artistType": "BAND",
        "city": "Beograd",
        "minimumFee": 1200,
        "maximumFee": 2500,
        "averageRating": 4.5,
        "totalPerformances": 20,
        "yearsOfExperience": 5,
        "isAvailable": True,
        "genreIds": [1, 3],
        "pastSuccessSimilarEvents": 0.8,
    }

    features = build_feature_row(event, artist)
    assert features["genre_match"] > 0
    assert features["budget_match"] == 1.0
    assert features["same_city"] == 1.0
    assert features["artist_type_match"] == 1.0
