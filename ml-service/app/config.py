"""Music Event AI — ML Service configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ml_service_port: int = 8000
    ml_model_version: str = "2.0.0"
    ml_model_path: str = "./models/best_model.joblib"
    random_seed: int = 42


settings = Settings()
