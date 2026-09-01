# Opis dataseta — Music Event AI (prototip)

## Tip podataka

**Sintetički dataset** generisan skriptom `scripts/generate_synthetic_data.py`.

> ⚠️ **Važno:** Podaci su veštački kreirani isključivo za razvoj i testiranje prototipa.
> Ne predstavljaju stvarne podatke sa terena i ne smeju se prikazivati kao empirijski
> prikupljeni podaci u naučnom radu bez jasne napomene.

## Svrha

Dataset modeluje parove **događaj–izvođač** i ciljnu promenljivu `suitable`:
- `1` — izvođač je pogodan / uspešno angažovan
- `0` — izvođač nije pogodan / nije prihvaćen / loše ocenjen

## Veličina

- Minimum: 2.500 redova (konfigurisano u generatoru)
- Podela: 80% trening, 20% test (stratifikovano)
- Cross-validation: 5-fold stratified

## Kolone koje model koristi

| Kolona | Tip | Opis |
|--------|-----|------|
| genre_match | numerička | Podudaranje žanrova (0–1) |
| budget_match | numerička | Da li honorar odgovara budžetu (0–1) |
| same_city | numerička | Isti grad (0/1) |
| artist_type_match | numerička | Podudaranje tipa izvođača (0/1) |
| average_rating | numerička | Prosečna ocena izvođača |
| total_performances | numerička | Broj prethodnih nastupa |
| years_of_experience | numerička | Godine iskustva |
| expected_audience | numerička | Očekivani broj posetilaca |
| artist_fee_midpoint | numerička | Srednja vrednost honorara |
| artist_available | numerička | Dostupnost (0/1) |
| past_success_similar_events | numerička | Uspeh na sličnim događajima (0–1) |
| budget_min / budget_max | numerička | Budžet događaja |
| event_type | kategorička | Tip događaja |
| preferred_artist_type | kategorička | Željeni tip izvođača |
| artist_type | kategorička | Tip izvođača |

## Generisanje

```bash
python scripts/generate_synthetic_data.py
python scripts/preprocess_data.py
```

## Ograničenja

- Nema stvarnih interakcija korisnika
- Ciljna promenljiva je modelovana prema latentnom skoru + šum
- Ne uključuje sezonske trendove, marketing, ugovore, vremenske uslove

## Migracija na stvarne podatke

Za produkcioni sistem dovoljno je pripremiti CSV sa istim kolonama i pokrenuti
`preprocess_data.py` nad novim fajlom (ili zameniti putanju u konstantama).
