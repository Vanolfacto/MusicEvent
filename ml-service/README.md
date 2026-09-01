# Music Event AI — ML Service

Python FastAPI servis za treniranje i serviranje ML modela za preporuke izvođača.

## Zahtevi

- Python 3.11+
- pip

## Pokretanje API-ja

```bash
cp .env.example .env
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

## API Endpoints (Faza 5)

| Metoda | Ruta | Opis |
|--------|------|------|
| GET | `/health` | Health check + modelLoaded |
| GET | `/model/info` | Verzija i metrike modela |
| POST | `/predict` | Predikcija za jedan par |
| POST | `/recommend` | Rangiranje liste izvođača |
| POST | `/train` | Ponovno treniranje |

## ML pipeline (Faza 4)

> **Napomena:** Sintetički dataset je namenjen isključivo za prototip.

```bash
# 1. Generiši sintetičke podatke (2500+ redova)
python scripts/generate_synthetic_data.py

# 2. Preprocesiraj dataset
python scripts/preprocess_data.py

# 3. Treniraj i uporedi algoritme (LR, RF, Gradient Boosting)
python scripts/train_model.py

# 4. Evaluacija i confusion matrix
python scripts/evaluate_model.py

# 5. Jedna predikcija (CLI)
python scripts/predict.py --input "{\"genre_match\":0.9,\"budget_match\":1.0,...}"
```

## Struktura

```
app/
  ml/              — pipeline, preprocess, explain
  main.py          — FastAPI (Faza 5)
scripts/
  generate_synthetic_data.py
  preprocess_data.py
  train_model.py
  evaluate_model.py
  predict.py
data/raw/          — sirovi CSV
data/processed/    — obrađeni CSV
models/            — best_model.joblib + metadata
reports/           — grafikoni i JSON metrike
tests/
```

## Testovi

```bash
pytest
```

## Artefakti nakon treninga

| Fajl | Opis |
|------|------|
| `models/best_model.joblib` | Najbolji model |
| `models/model_metadata.json` | Verzija, algoritam, metrike |
| `reports/algorithm_comparison.png` | Poređenje algoritama |
| `reports/confusion_matrix.png` | Confusion matrix |
| `reports/feature_importance.png` | Važnost karakteristika |
| `reports/evaluation_metrics.json` | Detaljne metrike |

## Napomena o podacima

Sintetički dataset **ne predstavlja stvarne podatke**. Pogledajte `docs/dataset-description.md`.
