"""Model retraining endpoint."""

from __future__ import annotations

import asyncio
import subprocess
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.ml.predictor import model_service
from app.schemas.ml import TrainResponse

router = APIRouter(tags=["training"])

BASE_DIR = Path(__file__).resolve().parents[2]


@router.post("/train", response_model=TrainResponse)
async def train_model():
    scripts = [
        BASE_DIR / "scripts" / "generate_synthetic_data.py",
        BASE_DIR / "scripts" / "preprocess_data.py",
        BASE_DIR / "scripts" / "train_model.py",
    ]

    for script in scripts:
        result = await asyncio.to_thread(
            subprocess.run,
            [sys.executable, str(script)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Greska u {script.name}: {result.stderr or result.stdout}",
            )

    try:
        model_service.reload()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Trening zavrsen ali model nije pronadjen") from exc

    metadata = model_service.metadata
    return TrainResponse(
        success=True,
        message="Model je uspesno ponovo obucen na sintetickom datasetu (prototip).",
        modelVersion=metadata.get("modelVersion"),
        algorithm=metadata.get("algorithm"),
        metrics=metadata.get("metrics"),
    )
