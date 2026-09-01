# Evaluacija modela — prototip (sintetički podaci)

> Rezultati u ovom dokumentu generisani su na **sintetičkom datasetu** i služe
> isključivo za validaciju ML pipeline-a u prototipu.

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

## Izbor modela

Najbolji model bira se na osnovu **F1 score** na test skupu.
Ako je potrebno, ROC AUC se koristi kao sekundarni kriterijum.

## Artefakti

Nakon pokretanja `train_model.py` i `evaluate_model.py`:

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
```

## Reproduktivnost

Svi skripti koriste `RANDOM_SEED=42` za ponovljive rezultate.

## Pokretanje

```bash
python scripts/generate_synthetic_data.py
python scripts/preprocess_data.py
python scripts/train_model.py
python scripts/evaluate_model.py
```
