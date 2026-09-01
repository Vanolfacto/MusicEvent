# Music Event AI — Backend

Node.js + Express + TypeScript REST API sa Prisma ORM.

## Zahtevi

- Node.js 20+
- PostgreSQL 16+ (lokalno ili Docker)

## Pokretanje

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy   # ili: npm run db:migrate
npm run db:seed
npm run dev
```

API je dostupan na `http://localhost:3001`.

## Baza podataka

### Docker PostgreSQL (preporučeno)

```bash
# Iz root direktorijuma projekta
docker compose up postgres -d
cd server
npx prisma migrate deploy
npm run db:seed
```

### Lokalni PostgreSQL

Prilagodite `DATABASE_URL` u `.env` fajlu prema vašoj instalaciji.

## API rute

### Autentifikacija (`/api/auth`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| POST | `/register` | Registracija | Ne |
| POST | `/login` | Prijava | Ne |
| POST | `/refresh` | Osvežavanje tokena | Cookie |
| POST | `/logout` | Odjava | Ne |
| GET | `/me` | Trenutni korisnik + profil | Da |

### Korisnici (`/api/users`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/` | Lista korisnika | Admin |
| PATCH | `/:id/status` | Blokiranje/aktivacija | Admin |

### Organizatori (`/api/organizers`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/` | Lista organizatora | Ne |
| GET | `/:id` | Profil organizatora | Ne |
| GET | `/me` | Moj profil | Organizator |
| PUT | `/me` | Ažuriranje profila | Organizator |

### Izvođači (`/api/artists`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/` | Lista izvođača (filteri) | Ne |
| GET | `/genres/list` | Lista žanrova | Ne |
| GET | `/:id` | Profil izvođača | Ne |
| GET | `/me` | Moj profil | Izvođač |
| PUT | `/me` | Ažuriranje profila | Izvođač |

Filteri: `city`, `genreId`, `artistType`, `minRating`, `maxFee`, `isAvailable`, `search`

### Događaji (`/api/events`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/public` | Javni objavljeni događaji | Ne |
| GET | `/:id` | Detalji događaja | Opciono |
| GET | `/mine` | Moji događaji | Organizator |
| GET | `/` | Svi događaji | Admin |
| POST | `/` | Kreiranje događaja | Organizator |
| PUT | `/:id` | Ažuriranje | Organizator/Admin |
| DELETE | `/:id` | Brisanje | Organizator/Admin |

### Prijave i pozivi (`/api/applications`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/organizer` | Prijave za moje događaje | Organizator |
| GET | `/artist` | Moje prijave | Izvođač |
| GET | `/invites` | Pozivi za mene | Izvođač |
| GET | `/:id` | Detalji prijave | Učesnik |
| POST | `/apply` | Prijava na događaj | Izvođač |
| POST | `/invite` | Poziv izvođaču | Organizator |
| PATCH | `/:id/respond` | Prihvati/odbij | Uloga-zavisno |
| PATCH | `/:id/withdraw` | Povuci prijavu | Izvođač |

### Nastupi (`/api/performances`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/event/:eventId` | Raspored događaja | Organizator |
| GET | `/mine` | Moj kalendar | Izvođač |
| POST | `/` | Dodaj u raspored | Organizator |
| PUT | `/:id` | Ažuriraj nastup | Organizator |
| DELETE | `/:id` | Ukloni nastup | Organizator |

Pre dodavanja nastupa proverava se:
- dostupnost izvođača
- preklapanje sa drugim nastupima izvođača
- vreme unutar trajanja događaja
- preklapanje nastupa na istom događaju

### Preporuke (`/api/recommendations`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| POST | `/events/:eventId/generate` | Generiši ML preporuke i sačuvaj u bazu | Organizator |
| GET | `/events/:eventId` | Lista sačuvanih preporuka | Organizator |

### ML model (`/api/model`)

| Metoda | Ruta | Opis | Auth |
|--------|------|------|------|
| GET | `/health` | Status ML servisa | Admin |
| GET | `/info` | Verzija i metrike modela | Auth |
| GET | `/training-runs` | Istorija treniranja iz baze | Admin |

## Demonstracioni nalozi

> **Napomena:** Ovo su demonstracione lozinke — ne koristiti u produkciji.

| Uloga | Email | Lozinka |
|-------|-------|---------|
| Administrator | `admin@demo.local` | `DemoAdmin123!` |
| Organizator | `organizer1@demo.local` | `DemoOrg123!` |
| Izvođač | `artist1@demo.local` | `DemoArtist123!` |

Seed kreira: 1 admin, 6 organizatora, 55 izvođača, 35 događaja.

## Skripte

| Komanda | Opis |
|---------|------|
| `npm run dev` | Dev server |
| `npm run build` | TypeScript kompilacija |
| `npm run lint` | ESLint |
| `npm test` | Vitest testovi |
| `npm run db:migrate` | Prisma migracije (dev) |
| `npm run db:seed` | Seed baze |
| `npm run db:studio` | Prisma Studio |

## Arhitektura

```
src/
  app.ts           — Express aplikacija
  index.ts         — Server entry point
  config/          — Env konfiguracija
  controllers/     — HTTP kontroleri
  services/        — Poslovna logika
  repositories/    — Pristup bazi
  routes/          — API rute
  middleware/      — Auth, validacija, greške
  schemas/         — Zod šeme
  utils/           — JWT, password, mapper
```
