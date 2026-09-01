# Sistemski zahtevi

## Funkcionalni zahtevi

### Autentifikacija i autorizacija

- Registracija korisnika sa ulogom (Organizator / Izvođač)
- Prijava sa JWT access tokenom i HTTP-only refresh cookie-jem
- Zaštita ruta po ulozi (ADMIN, ORGANIZER, ARTIST)
- Blokiranje korisnika od strane administratora

### Upravljanje događajima

- Kreiranje, izmena i brisanje događaja (organizator)
- Objavljivanje događaja (status DRAFT → PUBLISHED)
- Javni pregled objavljenih događaja
- Filtriranje po gradu, tipu, žanru

### Prijave i pozivi

- Izvođač se prijavljuje na događaj
- Organizator šalje poziv izvođaču
- Prihvatanje / odbijanje prijava i poziva
- Automatske notifikacije

### Nastupi i raspored

- Kreiranje nastupa nakon prihvaćene prijave
- Provera konflikta termina (izvođač i događaj)
- Promena statusa nastupa (SCHEDULED/CONFIRMED/COMPLETED/CANCELLED) i izmena termina/honorara
- Kalendar nastupa (organizator); izvođač — pregled „Moji nastupi“

### Ocene

- Organizator ocenjuje izvođača (1–5) nakon završenog nastupa
- Sistem sprečava duplu ocenu za isti par događaj–izvođač
- Automatsko preračunavanje prosečne ocene izvođača

### ML preporuke

- Generisanje preporuka za događaj (organizator)
- Rangiranje izvođača po skoru modela
- Objašnjenje preporuka (rule-based + feature importance)
- Čuvanje istorije preporuka u bazi

### Administracija

- Pregled svih korisnika i događaja
- Pregled ML metrika i istorije treniranja
- Upravljanje statusom korisnika (ACTIVE / BLOCKED / INACTIVE), uvid u profil izvođača/organizatora

## Nefunkcionalni zahtevi

| Zahtev | Implementacija |
|--------|----------------|
| Performanse | TanStack Query keširanje, indeksi u bazi |
| Bezbednost | bcrypt, Helmet, CORS, rate limiting, Zod validacija |
| Skalabilnost | Odvojeni ML servis, stateless API |
| Održivost | TypeScript, slojevita arhitektura, testovi |
| Dostupnost | Responsive UI (Tailwind) |
| Reproduktivnost | Docker Compose, seed podaci, RANDOM_SEED=42 |

## Tehnički zahtevi

- Node.js 20+, Python 3.11+, PostgreSQL 16
- Podrška za lokalno pokretanje i Docker
- REST API sa JSON odgovorima
- ML servis dostupan preko HTTP (FastAPI)

## Ograničenja prototipa

- Sintetički ML dataset (v. `dataset-description.md`)
- Nema produkcijskog HTTPS-a ni email verifikacije
- Notifikacije su in-app (bez push/email servisa)
