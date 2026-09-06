# Istraživanje: lokalni podaci o izvođačima (Faza 1)

Ovaj direktorijum je **potpuno odvojen od `ml-service/app`** i ne utiče na živu aplikaciju.
Sadržaj je istraživački prototip napravljen po instrukciji profesora: prvo prikupiti i
strukturirati realne lokalne podatke, zatim napraviti prototip modela, i tek nakon
potvrde da rezultati imaju smisla — razmišljati o integraciji u sistem.

## Izvor podataka

`local_artists_raw.csv` — **40 realnih, imenovanih** izvođača/bendova sa tri javno
dostupna sajta booking agencija/izdavačkih kuća iz Srbije, prikupljeno ručno (WebFetch)
3.9.2026:

| Izvor | Broj izvođača | Tip nastupa | URL |
|---|---|---|---|
| Glitch Records | 24 | klub/koncert (samostalni umetnici) | https://glitch.rs/ |
| BitefArtCafe | 7 | klub/koncert (cover i autorski bendovi) | https://bitefartcafe.rs/booking-izvodaca/ |
| Bendovi Srbije | 9 | svadba/proslava | https://bendovisrbije.com/ |

Svaki red u CSV-u ima `source_agency` i `source_url` kolonu radi proverljivosti.

### Kolone

- `name` — ime izvođača/benda (realno, javno)
- `city` — grad (kada je naveden na sajtu; više od pola redova ovo ne navodi javno)
- `genre_raw` — žanr/stil kako je opisan na izvornom sajtu
- `genre_bucket` — žanr mapiran na 12 kategorija koje već koristi aplikacija (isti princip kao `GENRE_BUCKET_MAP` u Spotify pipeline-u); `OTHER` kad izvor nije naveo žanr
- `event_type` — `klub/koncert` ili `svadba/proslava`, izveden iz **tipa izvora** (Glitch/BitefArtCafe rade isključivo klupske/koncertne booking-e; Bendovi Srbije je eksplicitno svadbeni/proslavni imenik)
- `member_info` — solo/bend/DJ/orkestar, kada je poznato
- `source_agency`, `source_url` — poreklo reda

### Namerno izostavljeno (i zašto)

- **Honorar (cena nastupa)** — nijedan od javnih izvora ne objavljuje konkretne cene; to je
  privatan, operativni podatak agencija (potvrđuje profesorovu primedbu). Nije izmišljeno.
- **Konkretna dostupnost po datumu** — isto, privatan operativni podatak, ne postoji javno.

Ova dva ograničenja su identična onima navedenim u predlogu poslatom profesoru — realni
javni izvori mogu dati identitet/žanr/grad izvođača, ali ne i cenu/dostupnost, koji već
ispravno postoje kao polja koja sami izvođači unose unutar aplikacije.

### Ograničenja uzorka

- Mali uzorak (40 redova) — realno za ručno prikupljen dataset u okviru master rada, ali
  nedovoljno za pouzdanu generalizaciju; profesor je izričito rekao da manji ali realan
  dataset nije problem za prototip.
- Neuravnoteženost klasa: 31 klub/koncert vs 9 svadba/proslava.
- 11/40 redova nema poznat žanr (`OTHER`) jer izvor nije naveo stil.
- MM Estrada, Alfa Sound, DJ Express i Halo Oglasi su probani kao izvori ali su tehnički
  nedostupni trenutnim alatima (JS-renderovane liste, pogrešan/nedostupan domen, ili
  blokiranje botova) — nisu uključeni u ovaj uzorak.

## Faza 2 — prototip modela

`prototype_event_type_model.py` — samostalan skript (ne dira `ml-service/app` niti
trenutni Spotify-based model) koji uči da predvidi `event_type` (klub/koncert vs
svadba/proslava) iz `genre_bucket` + `member_info` + da li je grad poznat, uz 5-fold
stratifikovanu unakrsnu validaciju na svih 40 redova.

### Rezultati

| Model | Accuracy | F1 (klasa svadba/proslava) | Baseline (većinska klasa) |
|---|---|---|---|
| Logistic Regression | 0.950 | 0.875 | 0.775 |
| Random Forest (50 stabala) | 0.925 | 0.824 | 0.775 |

Oba modela prevazilaze naivni baseline (uvek predvideti "klub/koncert").

### Važna metodološka napomena (iskreno ograničenje)

`event_type` label nije nezavisno prikupljen po izvođaču — **izveden je iz toga koji je
izvor** korišćen (Bendovi Srbije = svadba/proslava po definiciji sajta; Glitch Records i
BitefArtCafe = klub/koncert po definiciji sajta). To znači da model delimično uči "koji je
žanr tipičan za taj sajt", a ne nezavisno verifikovanu vezu žanr → tip nastupa za
proizvoljnog izvođača. Deo signala je realan i očekivan (svadbeni bendovi realno sviraju
pop/zabavnu i tradicionalnu muziku, klupski/koncertni izvođači realno pokrivaju
rock/electronic/hip-hop/jazz — ovo je poznata karakteristika lokalne muzičke scene), ali
visoka tačnost (92.5–95%) je verovatno delom i artefakt malog uzorka i savršene
korelacije izvor↔label, ne dokaz da bi model ovako dobro radio na novim, nepoznatim
izvođačima.

**Zaključak nakon v1**: postoji smislen, očekivan signal (žanr predviđa tip nastupa), ali
uzorak od 40 redova je premali i prestrogo strukturiran (label = izvor) da bi se rezultat
mogao smatrati pouzdanim dokazom praktične vrednosti.

## Faza 2 (v2) — prošireni dataset, finalni nalaz

Profesor je odobrio nastavak. Dataset je proširen na **61 red** (`local_artists_v2.csv`)
dodavanjem izvora gde je tip nastupa **nezavisno naveden po izvođaču** (ne samo po
sajtu): Republika Bend, Vivo Bendovi, PBS Novi Sad, Event Centar, Vencanja.com (svi imaju
eksplicitne, po-bendu navedene tipove — npr. Republika bend: "specijalizovan za svadbe,
korporativne proslave i klupske nastupe"), plus dva realna festivalska lineup-a (Guča
Sabor Trubača, Nišville Jazz Festival) koji uvode nezavisnu `FESTIVAL` kategoriju i
razbijaju savršenu korelaciju izvor↔oznaka iz v1. Svaki red ima `label_source` kolonu
(`per_artist` — direktno potvrđeno po izvođaču, ili `site_category` — izvedeno iz tipa
sajta) radi transparentnosti.

Cilj (`primary_event_type`): CONCERT (24), WEDDING (25), CLUB_NIGHT (7), FESTIVAL (5).

| Model | Macro F1 (ceo dataset, 5-fold CV) | Baseline (većinska klasa) |
|---|---|---|
| Logistic Regression | 0.452 | 0.410 (ne prevazilazi baseline) |
| Random Forest (50 stabala) | **0.594** | 0.410 (prevazilazi baseline) |

Random Forest po klasama: WEDDING (F1=0.86) i CONCERT (F1=0.68) se pouzdano
razlikuju na osnovu žanra i tipa sastava; FESTIVAL (F1=0.67) takođe ima signal (folk
truba/jazz kombinacije); **CLUB_NIGHT (F1=0.17) se ne razlikuje pouzdano** — premalo
primera (7) i preklapanje žanra sa CONCERT i WEDDING kategorijama.

**Najstroži test**: na podskupu od 20 redova gde je oznaka nezavisno potvrđena po
izvođaču (`label_source=per_artist`), signal nije potvrđen (macro F1 0.429 < baseline
0.750) — ali ovaj podskup slučajno sadrži samo WEDDING i FESTIVAL primere (nema
CONCERT/CLUB_NIGHT sa `per_artist` oznakom), pa ovaj test ne pokriva baš onu razliku
(WEDDING vs CONCERT) gde je signal u celom datasetu bio najjači. To je otvoreno
ograničenje, ne opovrgnut nalaz.

### Iskren zaključak

Postoji merljiv, domenski smislen signal: žanr i tip sastava predviđaju WEDDING/
CONCERT/FESTIVAL bolje od slučajnog pogađanja (Random Forest, macro F1 0.594 vs 0.410
baseline), na 61 realnom, imenovanom lokalnom izvođaču iz sedam nezavisnih izvora.
Signal je slab/nepotvrđen za CLUB_NIGHT i nije nezavisno potvrđen za CONCERT vs WEDDING
razliku van site-category oznaka. Dataset ostaje mali za produkcioni model, ali dovoljan
za orijentacioni prototip koji se iskreno može prijaviti profesoru kao osnova za
dalji rad.
