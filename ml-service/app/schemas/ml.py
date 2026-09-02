"""Pydantic schemas for ML API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class EventInput(BaseModel):
    eventType: Literal[
        "CONCERT", "FESTIVAL", "PRIVATE_PARTY", "WEDDING",
        "CORPORATE", "CLUB_NIGHT", "OTHER",
    ]
    city: str = Field(min_length=2, max_length=100)
    expectedAudience: int = Field(ge=1, le=100000)
    minimumBudget: float = Field(ge=0)
    maximumBudget: float = Field(ge=0)
    preferredArtistType: Literal["SOLO", "BAND", "DJ"]
    genreIds: list[int] = Field(min_length=1)

    @field_validator("maximumBudget")
    @classmethod
    def validate_budget(cls, value: float, info) -> float:
        minimum = info.data.get("minimumBudget")
        if minimum is not None and value < minimum:
            raise ValueError("maximumBudget mora biti >= minimumBudget")
        return value


class ArtistInput(BaseModel):
    artistId: int = Field(ge=1)
    artistType: Literal["SOLO", "BAND", "DJ"]
    city: str = Field(min_length=2, max_length=100)
    minimumFee: float = Field(ge=0)
    maximumFee: float = Field(ge=0)
    averageRating: float = Field(ge=0, le=5, default=0)
    totalPerformances: int = Field(ge=0, default=0)
    yearsOfExperience: int = Field(ge=0, le=80, default=0)
    isAvailable: bool = True
    genreIds: list[int] = Field(default_factory=list)
    genreNames: list[str] = Field(default_factory=list)
    pastSuccessSimilarEvents: float = Field(ge=0, le=1, default=0.5)

    @field_validator("maximumFee")
    @classmethod
    def validate_fee(cls, value: float, info) -> float:
        minimum = info.data.get("minimumFee")
        if minimum is not None and value < minimum:
            raise ValueError("maximumFee mora biti >= minimumFee")
        return value


class PredictRequest(BaseModel):
    event: EventInput
    artist: ArtistInput


class RecommendRequest(BaseModel):
    event: EventInput
    artists: list[ArtistInput] = Field(min_length=1, max_length=200)


class PredictionResponse(BaseModel):
    modelVersion: str
    artistId: int | None = None
    score: float
    prediction: int
    explanation: list[str]
    summary: str


class RecommendationItem(BaseModel):
    artistId: int | None = None
    score: float
    explanation: list[str]


class RecommendResponse(BaseModel):
    modelVersion: str
    recommendations: list[RecommendationItem]


class ModelInfoResponse(BaseModel):
    modelVersion: str
    algorithm: str | None = None
    modelLoaded: bool
    datasetSize: int | None = None
    metrics: dict[str, float] | None = None
    notes: str | None = None


class TrainResponse(BaseModel):
    success: bool
    message: str
    modelVersion: str | None = None
    algorithm: str | None = None
    metrics: dict[str, float] | None = None
