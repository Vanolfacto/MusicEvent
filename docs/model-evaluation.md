# Evaluacija modela — Music Event AI

> Rezultati u ovom dokumentu generisani su na **realnom, javno dostupnom** Spotify Tracks Dataset-u (114.000 pesama).

## Testirani algoritmi

1. Logistic Regression
2. Random Forest
3. Gradient Boosting

## Metrike

- Accuracy
- Precision
- Recall
- F1 score
- ROC AUC
- Confusion matrix
- 5-fold cross-validation

## Rezultati poslednjeg treniranja

| Metrika | Vrednost (test skup) |
|---------|------------------------|
| Accuracy | 0.7757 |
| Precision | 0.7901 |
| Recall | 0.7951 |
| F1 | 0.7926 |
| ROC AUC | 0.8574 |

Izabrani model: **Logistic Regression** (v2.0.0), izabran po najvišoj F1 meri na test skupu.

## Izbor modela

Najbolji model bira se na osnovu **F1 score** na test skupu. ROC AUC se koristi kao sekundarni kriterijum.

## Artefakti

Nakon pokretanja `train_model.py`, `build_genre_popularity.py` i `evaluate_model.py`:

```
ml-service/reports/
  algorithm_comparison.png
  algorithm_comparison.json
  feature_importance.png
  confusion_matrix.png
  evaluation_metrics.json

ml-service/models/
  best_model.joblib
  model_metadata.json
  genre_popularity.json    # realan signal popularnosti po žanru (v. machine-learning-methodology.md)
```

## Reproduktivnost

Svi skripti koriste `RANDOM_SEED=42` za ponovljive rezultate. Sam dataset se preuzima programski sa stabilnog javnog URL-a (Hugging Face), pa je ceo pipeline reproduktibilan bez ručnog preuzimanja podataka.

## Pokretanje

```bash
python scripts/prepare_real_dataset.py
python scripts/preprocess_data.py
python scripts/train_model.py
python scripts/build_genre_popularity.py
python scripts/evaluate_model.py
```
