"""Prediction and recommendation endpoints."""

from fastapi import APIRouter, HTTPException

from app.ml.predictor import model_service
from app.schemas.ml import (
    PredictRequest,
    PredictionResponse,
    RecommendRequest,
    RecommendationItem,
    RecommendResponse,
)

router = APIRouter(tags=["prediction"])


def _model_version() -> str:
    return model_service.metadata.get("modelVersion", "unknown")


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictRequest):
    try:
        result = model_service.predict_pair(
            request.event.model_dump(),
            request.artist.model_dump(),
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Model nije učitan") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return PredictionResponse(
        modelVersion=_model_version(),
        artistId=result.get("artistId"),
        score=result["score"],
        prediction=result["prediction"],
        explanation=result["explanation"],
        summary=result["summary"],
    )


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    try:
        results = model_service.recommend(
            request.event.model_dump(),
            [artist.model_dump() for artist in request.artists],
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail="Model nije učitan") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return RecommendResponse(
        modelVersion=_model_version(),
        recommendations=[
            RecommendationItem(
                artistId=item.get("artistId"),
                score=item["score"],
                explanation=item["explanation"],
            )
            for item in results
        ],
    )
