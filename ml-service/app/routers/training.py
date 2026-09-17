"""Model retraining — kicked off in the background, polled via /train/status.

Render (and most PaaS reverse proxies) kill an HTTP connection that stays
open too long, well before the training pipeline (download + preprocess
114k rows, 5-fold CV for three algorithms) can finish. Running it as a
background task and letting the client poll avoids ever holding one request
open for the full duration.
"""

from __future__ import annotations

import asyncio
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks

from app.ml.predictor import model_service
from app.schemas.ml import TrainStatusResponse

router = APIRouter(tags=["training"])

BASE_DIR = Path(__file__).resolve().parents[2]

SCRIPTS = [
    BASE_DIR / "scripts" / "prepare_real_dataset.py",
    BASE_DIR / "scripts" / "preprocess_data.py",
    BASE_DIR / "scripts" / "train_model.py",
    BASE_DIR / "scripts" / "build_genre_popularity.py",
    BASE_DIR / "scripts" / "build_event_type_fit.py",
]

# Single-process, single-worker service (WEB_CONCURRENCY=1) — one retrain
# at a time, so a module-level dict is a fine place to keep the state. It
# does not need to survive a restart: a restart mid-training means that run
# was lost anyway, and the next status poll correctly reports "idle" again.
_state: dict[str, Any] = {"status": "idle"}


def _run_training_sync() -> dict[str, Any]:
    for script in SCRIPTS:
        result = subprocess.run(
            [sys.executable, str(script)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode != 0:
            raise RuntimeError(f"Greska u {script.name}: {result.stderr or result.stdout}")

    model_service.reload()
    metadata = model_service.metadata
    return {
        "modelVersion": metadata.get("modelVersion"),
        "algorithm": metadata.get("algorithm"),
        "metrics": metadata.get("metrics"),
    }


async def _run_training_background() -> None:
    try:
        result = await asyncio.to_thread(_run_training_sync)
        _state.clear()
        _state.update(
            status="done",
            message="Model je uspesno ponovo obucen na realnom Spotify datasetu.",
            finishedAt=datetime.now(timezone.utc).isoformat(),
            **result,
        )
    except Exception as exc:  # noqa: BLE001 - surface any pipeline failure to the client
        _state.clear()
        _state.update(
            status="error",
            error=str(exc),
            finishedAt=datetime.now(timezone.utc).isoformat(),
        )


@router.post("/train", response_model=TrainStatusResponse)
async def train_model(background_tasks: BackgroundTasks):
    if _state.get("status") == "training":
        return TrainStatusResponse(status="training", message="Treniranje je vec u toku.")

    _state.clear()
    _state["status"] = "training"
    _state["startedAt"] = datetime.now(timezone.utc).isoformat()
    background_tasks.add_task(_run_training_background)

    return TrainStatusResponse(status="training", message="Treniranje je pokrenuto.")


@router.get("/train/status", response_model=TrainStatusResponse)
async def train_status():
    return TrainStatusResponse(**_state)
