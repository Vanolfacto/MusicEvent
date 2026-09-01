"""Music Event AI — FastAPI ML Service."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ml.predictor import model_service
from app.routers import model, prediction, training

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        model_service.load()
    except Exception:
        logger.exception("Ucitavanje modela nije uspelo, servis pokrece bez modela")
    yield


app = FastAPI(
    title="Music Event AI — ML Service",
    description="Servis za masinsko ucenje — preporuke izvodjaca za muzicke dogadjaje",
    version=settings.ml_model_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(model.router)
app.include_router(prediction.router)
app.include_router(training.router)


@app.get("/")
async def root():
    return {
        "service": "music-event-ml-service",
        "version": settings.ml_model_version,
        "modelLoaded": model_service.is_loaded,
        "docs": "/docs",
    }
