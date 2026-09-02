"""Shared constants for ML pipeline."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

RAW_DATA_FILE = DATA_RAW_DIR / "spotify_tracks.csv"
PROCESSED_DATA_FILE = DATA_PROCESSED_DIR / "training_data.csv"
BEST_MODEL_FILE = MODELS_DIR / "best_model.joblib"
MODEL_METADATA_FILE = MODELS_DIR / "model_metadata.json"
GENRE_POPULARITY_FILE = MODELS_DIR / "genre_popularity.json"
MODEL_VERSION = "2.0.0"
RANDOM_SEED = 42

# Real dataset: https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset
# (public mirror of the Kaggle "Spotify Tracks Dataset" by maharshipandya)
SPOTIFY_DATASET_URL = (
    "https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset"
    "/resolve/main/dataset.csv"
)

TARGET_COLUMN = "popular"

NUMERIC_FEATURES = [
    "danceability",
    "energy",
    "key",
    "loudness",
    "mode",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "time_signature",
    "duration_ms",
    "explicit",
]

CATEGORICAL_FEATURES = [
    "track_genre",
]

FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES

ALGORITHMS = {
    "logistic_regression": "Logistic Regression",
    "random_forest": "Random Forest",
    "gradient_boosting": "Gradient Boosting",
}

# App's own genre taxonomy (matches server/prisma/schema.prisma seed genres).
APP_GENRES = [
    "ROCK",
    "POP",
    "JAZZ",
    "ELECTRONIC",
    "FOLK",
    "METAL",
    "HIP HOP",
    "CLASSICAL",
    "BLUES",
    "COUNTRY",
    "REGGAE",
    "R&B",
]

# Maps Spotify's 125 micro-genres (track_genre column) to the app's 12 genres.
# Micro-genres with no clear match (e.g. language/mood/holiday buckets like
# "german", "sleep", "disney") are intentionally left unmapped.
GENRE_BUCKET_MAP: dict[str, str] = {
    # Rock
    "rock": "ROCK", "alt-rock": "ROCK", "hard-rock": "ROCK", "punk-rock": "ROCK",
    "psych-rock": "ROCK", "rock-n-roll": "ROCK", "grunge": "ROCK", "j-rock": "ROCK",
    "rockabilly": "ROCK", "alternative": "ROCK", "indie": "ROCK", "punk": "ROCK",
    "garage": "ROCK", "power-pop": "ROCK",
    # Pop
    "pop": "POP", "indie-pop": "POP", "synth-pop": "POP", "k-pop": "POP",
    "j-pop": "POP", "pop-film": "POP", "mandopop": "POP", "cantopop": "POP",
    "j-idol": "POP", "j-dance": "POP",
    # Jazz
    "jazz": "JAZZ",
    # Electronic
    "electronic": "ELECTRONIC", "edm": "ELECTRONIC", "house": "ELECTRONIC",
    "techno": "ELECTRONIC", "trance": "ELECTRONIC", "dubstep": "ELECTRONIC",
    "drum-and-bass": "ELECTRONIC", "dance": "ELECTRONIC", "club": "ELECTRONIC",
    "idm": "ELECTRONIC", "ambient": "ELECTRONIC", "chicago-house": "ELECTRONIC",
    "deep-house": "ELECTRONIC", "detroit-techno": "ELECTRONIC",
    "minimal-techno": "ELECTRONIC", "breakbeat": "ELECTRONIC", "electro": "ELECTRONIC",
    "hardstyle": "ELECTRONIC", "progressive-house": "ELECTRONIC", "trip-hop": "ELECTRONIC",
    "industrial": "ELECTRONIC",
    # Folk
    "folk": "FOLK", "singer-songwriter": "FOLK", "songwriter": "FOLK",
    "bluegrass": "FOLK", "acoustic": "FOLK", "guitar": "FOLK",
    # Metal
    "metal": "METAL", "heavy-metal": "METAL", "death-metal": "METAL",
    "black-metal": "METAL", "grindcore": "METAL", "metalcore": "METAL",
    "hardcore": "METAL", "emo": "METAL", "goth": "METAL",
    # Hip Hop
    "hip-hop": "HIP HOP",
    # Classical
    "classical": "CLASSICAL", "opera": "CLASSICAL", "piano": "CLASSICAL",
    "new-age": "CLASSICAL",
    # Blues
    "blues": "BLUES",
    # Country
    "country": "COUNTRY", "honky-tonk": "COUNTRY",
    # Reggae
    "reggae": "REGGAE", "dancehall": "REGGAE", "reggaeton": "REGGAE", "ska": "REGGAE",
    "dub": "REGGAE",
    # R&B
    "r-n-b": "R&B", "soul": "R&B", "funk": "R&B", "disco": "R&B", "groove": "R&B",
    "gospel": "R&B",
}
