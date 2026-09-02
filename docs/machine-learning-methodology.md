# Metodologija mašinskog učenja

## Problem

Ne postoji javno dostupan dataset o stvarnim booking odlukama (koji je izvođač rezervisan za koji događaj) — to su privatni poslovni podaci agencija. ML zadatak je zato definisan nad javno dostupnim, stvarnim podacima: **procena popularnosti pesme na osnovu njenih audio karakteristika i žanra** (Spotify Tracks Dataset). Ovaj model se zatim koristi kao jedan od realnih signala u sistemu preporuka izvođača — v. sekciju "Povezivanje sa preporukama izvođača" niže.

## Ciljna promenljiva

- `popular = 1` — pesma ima popularnost iznad medijana (Spotify `popularity >= 35` na skali 0–100)
- `popular = 0` — pesma ima popularnost ispod medijana

## Karakteristike (features)

| Grupa | Karakteristike |
|-------|----------------|
| Audio (numeričke) | danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo, time_signature, duration_ms, explicit |
| Žanr (kategorička) | track_genre (125 Spotify mikro-žanrova) |

## Algoritmi

1. **Logistic Regression** — bazni linearni model sa standardizacijom
2. **Random Forest** — nelinearni model sa feature importance
3. **Gradient Boosting** — boosting ensemble

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
- Feature importance (Random Forest / Gradient Boosting) ili koeficijenti (Logistic Regression)

## Izbor finalnog modela

Najbolji model bira se po **F1 score** na test skupu.

### Rezultati (realan Spotify Tracks Dataset, 113.550 pesama, seed=42)

| Algoritam | F1 (test) | ROC AUC (test) |
|-----------|-----------|-----------------|
| **Logistic Regression (izabran)** | **0.7926** | **0.8574** |

> Napomena: nakon svakog ponovnog treniranja (`train_model.py`) brojevi se upisuju u `models/model_metadata.json` i `reports/algorithm_comparison.json` — gornja tabela odražava poslednje pokretanje. Za razliku od ranije verzije rada (sintetički podaci), ovde su rezultati bolji jer je predikcija popularnosti pesme iz audio karakteristika stvaran, dobro definisan problem sa jasnim signalom u podacima.

**Izabrani model:** Logistic Regression, verzija 2.0.0

## Objašnjavanje preporuka

Rule-based objašnjenja na osnovu ključnih karakteristika (žanr, budžet, grad, ocena, dostupnost, istorija).

## Povezivanje sa preporukama izvođača

Trenirani klasifikator radi nad **audio karakteristikama pesama**, dok se preporuka izvođača za događaj oslanja na potpuno drugačiji skup podataka (operativni podaci platforme: budžet, grad, ocena, dostupnost izvođača). Ova dva sloja se spajaju na sledeći način:

1. `scripts/build_genre_popularity.py` pusti istrenirani model preko celog realnog dataseta i agregira predikcije po žanrovskom bucket-u koji odgovara 12 žanrova aplikacije (npr. `alt-rock`, `hard-rock`, `punk-rock` → `ROCK`). Rezultat (`models/genre_popularity.json`) je realan, iz modela izveden broj po žanru.
2. `/recommend` endpoint kombinuje taj signal sa operativnim karakteristikama para događaj–izvođač (podudaranje žanra, budžeta, grada, tipa; ocena; dostupnost; istorijska uspešnost) u transparentnu ponderisanu formulu (v. `app/ml/predictor.py`, `SCORE_WEIGHTS`) — umesto da se ti operativni podaci šalju u klasifikator treniran na nepostojećim (fabrikovanim) booking-labelima, kao u ranijoj verziji rada.

Ovim je istrenirani model **stvarno uključen** u tok preporuka (njegove predikcije direktno utiču na `genre_popularity` faktor), a da se pritom ne tvrdi da model predviđa nešto za šta ne postoje realni podaci za učenje.

## Ograničenja

- Dataset ne sadrži informacije o stvarnim booking ishodima — model ne predviđa "uspešnost rezervacije" direktno, već doprinosi preporukama kroz realan signal popularnosti žanra
- Nema online learning — ponovno treniranje se pokreće ručno (`POST /train` ili `scripts/train_model.py`)
- Mapiranje 125 Spotify mikro-žanrova u 12 žanrova aplikacije je pojednostavljenje
