# Metodologija mašinskog učenja

## Problem

Procena pogodnosti para **događaj–izvođač** za preporuku i rangiranje kandidata.

## Ciljna promenljiva

- `suitable = 1` — izvođač je pogodan ili uspešno angažovan
- `suitable = 0` — izvođač nije pogodan

## Karakteristike (features)

| Grupa | Karakteristike |
|-------|----------------|
| Podudaranje | genre_match, budget_match, same_city, artist_type_match |
| Izvođač | average_rating, total_performances, years_of_experience, artist_fee_midpoint, artist_available |
| Događaj | expected_audience, budget_min, budget_max, event_type, preferred_artist_type |
| Istorija | past_success_similar_events |
| Tip | artist_type |

## Algoritmi

1. **Logistic Regression** — bazni linearni model sa standardizacijom
2. **Random Forest** — nelinearni model sa feature importance
3. **Gradient Boosting** — boosting ensemble (izabran za prototip)

## Pipeline (scikit-learn)

```
ColumnTransformer
  ├── numeričke: SimpleImputer(median) + StandardScaler
  └── kategoričke: SimpleImputer(mode) + OneHotEncoder
        ↓
Classifier (izabrani algoritam)
```

## Sprečavanje curenja podataka

- Preprocessor se uči **samo na trening skupu** unutar `Pipeline`
- Test skup se koristi isključivo za finalnu evaluaciju
- Stratified train/test split (80/20)
- 5-fold stratified cross-validation na trening skupu

## Metrike

- Accuracy, Precision, Recall, F1, ROC AUC
- Confusion matrix
- Feature importance (Random Forest / Gradient Boosting)

## Izbor finalnog modela

Najbolji model bira se po **F1 score** na test skupu.

### Rezultati prototipa (sintetički podaci, seed=42)

| Algoritam | F1 (test) | ROC AUC (test) |
|-----------|-----------|----------------|
| Logistic Regression | 0.714 | 0.734 |
| Random Forest | 0.777 | 0.715 |
| **Gradient Boosting** | **0.784** | **0.714** |

**Izabrani model:** Gradient Boosting v1.0.0

## Objašnjavanje preporuka

Rule-based objašnjenja na osnovu ključnih karakteristika (žanr, budžet, grad, ocena).
Feature importance iz modela koristi se za analizu u izveštajima.

## Post-processing skora (server)

Analiza `model_metadata.json` je pokazala da `genre_match` ima relativno nizak stvarni značaj u istreniranom modelu (~9%, iza `budget_match` i `average_rating` sa po ~15.5%), pa žanrovski nepodudarni kandidati mogu dobiti visok skor zahvaljujući drugim karakteristikama. Server (`recommendation.service.ts`) zato pre čuvanja preporuka primenjuje deterministički post-processing korak: `finalScore = mlScore × (0.5 + 0.5 × genreMatch)`. Ovo ne menja sam model, već obezbeđuje da žanr ima garantovan uticaj na konačno rangiranje. Kad nijedan kandidat nema podudaranje žanra, korisniku se prikazuje upozorenje da je rangiranje zasnovano isključivo na ostalim kriterijumima.

## Ograničenja

- Sintetički dataset (v. `dataset-description.md`)
- Nema online learning — ponovno treniranje zahteva novi CSV export iz baze
