# Ograničenja i budući rad

## Trenutna ograničenja prototipa

### Podaci i ML

- **Realan dataset** (Spotify Tracks Dataset, 114k pesama) koristi se za treniranje modela koji predviđa popularnost pesme — ne postoji javno dostupan dataset o stvarnim booking odlukama (događaj–izvođač), pa se model umesto toga koristi za izvođenje realnog signala popularnosti po žanru koji ulazi u preporuke (v. `machine-learning-methodology.md`)
- Paralelno je pokrenuto istraživanje sa manjim, ručno prikupljenim datasetom realnih
  lokalnih izvođača (61 red, 7 nezavisnih izvora — v. `../ml-service/research/`), sa
  prototipom koji predviđa stvarnu pogodnost tipa događaja iz žanra/sastava (Random
  Forest, macro F1 0.594 naspram 0.410 baseline-a). Ovo je namerno ostalo van
  produkcionog sistema dok se rezultat ne prijavi mentoru i ne dobije potvrda za
  integraciju — trenutno je u fazi validacije, ne u fazi implementacije.
- Nema online learning — ponovno treniranje se pokreće ručno (`POST /train` ili skripte u `scripts/`)
- Objašnjenja preporuka su rule-based, ne SHAP/LIME
- Mapiranje 125 Spotify mikro-žanrova u 12 žanrova aplikacije je ručno urađeno pojednostavljenje
- Pre generisanja preporuka, kandidati se filtriraju po `preferredArtistType` događaja (samo SOLO / BAND / DJ koji odgovara)

### Funkcionalnost

- Nema email verifikacije naloga
- Nema resetovanja zaboravljene lozinke preko emaila (postoji samo promena lozinke dok je korisnik prijavljen, na stranici „Podešavanja")
- Notifikacije su samo in-app (bez push/email)
- Nema upload-a slika i medija
- Nema sistema plaćanja i ugovora
- Nema višejezičnosti (samo srpski UI)

### Tehnička

- Nema E2E testova (Playwright/Cypress)
- Auth integracioni testovi zahtevaju pokrenut PostgreSQL
- Frontend bundle > 500 kB (nema code splitting)
- Nema CI/CD pipeline-a u repou

## Poznati problemi

| Problem | Rešenje |
|---------|---------|
| Docker Desktop nije pokrenut | Pokrenuti Docker pre `docker compose up` |
| DB auth failed | Proveriti kredencijale u `.env` |
| Port 8000 zauzet | Zaustaviti staru ML instancu |
| ML model nije učitan | Pokrenuti train skripte |

## Predlozi za budući rad

### Kratkoročno

1. **Integracija lokalnog dataset-a** (u toku) — proširiti istraživački dataset u
   `ml-service/research/` dodatnim izvorima, i nakon potvrde mentora integrisati
   validirani signal u produkcioni `/recommend` tok
2. **Manuelno NVDA testiranje** (u toku) — izvesti scenarije iz
   `accessibility-testing-scenarios.md` i uneti rezultate u rad
3. **E2E testovi** — Playwright za kritične tokove (login, kreiranje događaja, preporuke)
4. **CI/CD** — GitHub Actions sa PostgreSQL servisom
5. **Code splitting** — lazy loading stranica po ulozi

### Srednjoročno

1. **Naprednije objašnjenje** — SHAP vrednosti za svaku preporuku
2. **Email notifikacije** — SendGrid/Resend integracija
3. **Pretraga i filteri** — Elasticsearch ili full-text pretraga
4. **Export izveštaja** — PDF/CSV za organizatore

### Dugoročno

1. **Collaborative filtering** — preporuke na osnovu ponašanja sličnih organizatora
2. **Real-time chat** — komunikacija organizator–izvođač
3. **Mobilna aplikacija** — React Native klijent
4. **Multi-tenant** — podrška za više organizacija sa izolacijom podataka

## Naučni doprinos (za rad)

Prototip demonstrira:

- Dizajn informacionog sistema za specifičnu domenu (muzički eventi)
- Integraciju klasifikacionog ML modela u web aplikaciju
- Metodologiju treniranja i evaluacije na realnom, javno dostupnom datasetu, sa iskrenim priznanjem granica dostupnih podataka (nema javnih booking podataka) i transparentnim rešenjem (realan signal popularnosti kombinovan sa operativnim podacima platforme)
- Arhitekturu koja razdvaja poslovnu logiku, perzistenciju i ML inferencu

## Etička napomena

Demonstracioni nalozi i lozinke (`DemoAdmin123!`, itd.) služe isključivo za testiranje. U produkciji obavezno koristiti jake tajne, HTTPS i princip najmanjih privilegija.
