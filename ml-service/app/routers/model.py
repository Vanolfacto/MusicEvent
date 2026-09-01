"""Model info and health endpoints."""

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.ml.predictor import model_service
from app.schemas.ml import ModelInfoResponse

router = APIRouter(tags=["model"])


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "music-event-ml-service",
        "modelVersion": settings.ml_model_version,
        "modelLoaded": model_service.is_loaded,
    }


@router.get("/model/info", response_model=ModelInfoResponse)
async def model_info():
    if not model_service.is_loaded:
        try:
            model_service.load()
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=503,
                detail="Model nije dostupan. Pokrenite train_model.py.",
            ) from exc

    metadata = model_service.metadata
    return ModelInfoResponse(
        modelVersion=metadata.get("modelVersion", settings.ml_model_version),
        algorithm=metadata.get("algorithm"),
        modelLoaded=model_service.is_loaded,
        datasetSize=metadata.get("datasetSize"),
        metrics=metadata.get("metrics"),
        notes=metadata.get("notes"),
    )
