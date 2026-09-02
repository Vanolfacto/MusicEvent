# Opis dataseta — Music Event AI

## Tip podataka

**Realan, javno dostupan dataset**: [Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset) (autor: maharshipandya), preuzet programski preko javnog Hugging Face ogledala (`https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset`), bez potrebe za prijavom ili API ključem.

> Ne postoji javno dostupan dataset tipa "koji je izvođač uspešno rezervisan za koji konkretan muzički događaj" — to su privatni poslovni podaci booking agencija. ML zadatak je zato definisan nad podacima koji **jesu** javno dostupni i stvarni: predikcija popularnosti pesme na osnovu njenih audio karakteristika i žanra. Detalji o tome kako se to povezuje sa preporukama izvođača za događaje nalaze se u `machine-learning-methodology.md`.

## Svrha

Dataset sadrži **114.000 stvarnih pesama** sa Spotify-ja, sa ciljnom promenljivom `popular`:
- `1` — pesma je popularnija od medijana (`popularity >= 35`, na skali 0–100 koju izračunava sam Spotify na osnovu broja i skorašnjosti reprodukcija)
- `0` — pesma je manje popularna

Prag je postavljen na medijan radi balansiranih klasa (dobijeno: 50.01% / 49.99%).

## Veličina

- 114.000 redova preuzeto, 113.550 nakon čišćenja (drop duplikata/nedostajućih vrednosti)
- Podela: 80% trening, 20% test (stratifikovano)
- Cross-validation: 5-fold stratified

## Kolone koje model koristi

| Kolona | Tip | Opis |
|--------|-----|------|
| danceability | numerička | Koliko je pesma pogodna za ples (0–1) |
| energy | numerička | Intenzitet i aktivnost (0–1) |
| key | numerička | Muzički ključ (0–11) |
| loudness | numerička | Glasnoća u dB |
| mode | numerička | Dur (1) / mol (0) |
| speechiness | numerička | Prisustvo govora u pesmi (0–1) |
| acousticness | numerička | Da li je pesma akustična (0–1) |
| instrumentalness | numerička | Odsustvo vokala (0–1) |
| liveness | numerička | Prisustvo publike/uživo snimka (0–1) |
| valence | numerička | Muzička "pozitivnost" (0–1) |
| tempo | numerička | BPM |
| time_signature | numerička | Takt |
| duration_ms | numerička | Trajanje pesme |
| explicit | numerička | Eksplicitan sadržaj (0/1) |
| track_genre | kategorička | Jedan od 125 Spotify mikro-žanrova |

## Generisanje

```bash
python scripts/prepare_real_dataset.py   # preuzima realan CSV sa Hugging Face-a
python scripts/preprocess_data.py
```

## Napomena o povezivanju sa aplikacijom

Istrenirani model se koristi da izvede **realan signal popularnosti po žanru** (`scripts/build_genre_popularity.py` mapira 125 Spotify mikro-žanrova u 12 žanrova aplikacije i agregira predikcije modela po grupi). Taj signal se zatim kombinuje sa stvarnim operativnim podacima platforme (podudaranje žanra, budžeta, grada, ocena, dostupnost) u finalnom rangiranju izvođača za događaj — v. `machine-learning-methodology.md`.

## Ograničenja

- `popularity` je Spotify-jeva interna metrika (algoritamski izračunata) — ne meri direktno "kvalitet" muzike, već poznatost/broj reprodukcija
- Dataset ne sadrži podatke o konkretnim booking odlukama, honorarima ili dostupnosti izvođača — ti podaci dolaze iz same platforme, ne iz ovog dataseta
- Mapiranje 125 mikro-žanrova u 12 žanrova aplikacije je ručno urađeno (`GENRE_BUCKET_MAP` u `app/ml/constants.py`) i predstavlja pojednostavljenje

## Migracija/ponovno treniranje

```bash
cd ml-service
python scripts/prepare_real_dataset.py
python scripts/preprocess_data.py
python scripts/train_model.py
python scripts/build_genre_popularity.py
python scripts/evaluate_model.py
```

Dataset se preuzima programski pri svakom pokretanju `prepare_real_dataset.py`, pa nije potrebno ručno preuzimanje niti Kaggle nalog.
