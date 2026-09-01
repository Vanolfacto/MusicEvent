"""Tests for FastAPI ML endpoints."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SAMPLE_EVENT = {
    "eventType": "CONCERT",
    "city": "Beograd",
    "expectedAudience": 500,
    "minimumBudget": 800,
    "maximumBudget": 2500,
    "preferredArtistType": "BAND",
    "genreIds": [1, 2],
}

SAMPLE_ARTIST = {
    "artistId": 12,
    "artistType": "BAND",
    "city": "Beograd",
    "minimumFee": 900,
    "maximumFee": 2000,
    "averageRating": 4.7,
    "totalPerformances": 25,
    "yearsOfExperience": 8,
    "isAvailable": True,
    "genreIds": [1, 3],
    "pastSuccessSimilarEvents": 0.75,
}


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "modelLoaded" in body


def test_model_info_endpoint():
    response = client.get("/model/info")
    assert response.status_code in (200, 503)


def test_predict_endpoint():
    response = client.post(
        "/predict",
        json={"event": SAMPLE_EVENT, "artist": SAMPLE_ARTIST},
    )
    if response.status_code == 503:
        return
    assert response.status_code == 200
    body = response.json()
    assert "score" in body
    assert "explanation" in body
    assert body["artistId"] == 12


def test_recommend_endpoint():
    artists = [
        SAMPLE_ARTIST,
        {**SAMPLE_ARTIST, "artistId": 5, "averageRating": 3.2, "genreIds": [4]},
    ]
    response = client.post(
        "/recommend",
        json={"event": SAMPLE_EVENT, "artists": artists},
    )
    if response.status_code == 503:
        return
    assert response.status_code == 200
    body = response.json()
    assert len(body["recommendations"]) == 2
    assert body["recommendations"][0]["score"] >= body["recommendations"][1]["score"]


def test_predict_invalid_payload():
    response = client.post(
        "/predict",
        json={"event": SAMPLE_EVENT, "artist": {"artistId": 1}},
    )
    assert response.status_code == 422
