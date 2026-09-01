# API dokumentacija

Bazni URL: `http://localhost:3001/api`

Svi odgovori imaju format:

```json
{
  "success": true,
  "data": { ... },
  "message": "opcionalna poruka"
}
```

Greške:

```json
{
  "success": false,
  "message": "Opis greške"
}
```

## Autentifikacija

| Metoda | Ruta | Auth | Opis |
|--------|------|------|------|
| POST | `/auth/register` | — | Registracija |
| POST | `/auth/login` | — | Prijava (vraća accessToken) |
| POST | `/auth/refresh` | Cookie | Obnova access tokena |
| POST | `/auth/logout` | — | Odjava |
| GET | `/auth/me` | Bearer | Trenutni korisnik |
| PATCH | `/auth/change-password` | Bearer | Promena lozinke (proverava trenutnu, odjavljuje ostale sesije) |

### POST /auth/login

```json
// Request
{ "email": "organizer1@demo.local", "password": "DemoOrg123!" }

// Response
{
  "success": true,
  "data": {
    "user": { "id": 2, "role": "ORGANIZER", ... },
    "accessToken": "eyJ..."
  }
}
```

## Korisnici

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/users/me` | Auth | Moj profil |
| GET | `/users` | ADMIN | Lista korisnika |
| PATCH | `/users/:id/status` | ADMIN | Promena statusa |

## Organizatori

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/organizers/me` | ORGANIZER | Moj profil |
| PUT | `/organizers/me` | ORGANIZER | Ažuriranje profila |
| GET | `/organizers` | — | Javna lista (paginacija) |
| GET | `/organizers/:id` | Optional (ADMIN vidi i blokirane) | Detalj organizatora |

## Izvođači

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/artists/me` | ARTIST | Moj profil |
| PUT | `/artists/me` | ARTIST | Ažuriranje profila |
| GET | `/artists` | Auth | Lista (paginacija, filteri) |
| GET | `/artists/:id` | Optional (ADMIN vidi i blokirane) | Detalj |
| GET | `/artists/genres/list` | Auth | Lista žanrova |

## Događaji

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/events/public` | — | Javni događaji |
| GET | `/events/mine` | ORGANIZER | Moji događaji |
| GET | `/events` | ADMIN | Svi događaji |
| GET | `/events/:id` | Optional | Detalj |
| POST | `/events` | ORGANIZER | Kreiranje |
| PUT | `/events/:id` | ORGANIZER, ADMIN | Izmena |
| DELETE | `/events/:id` | ORGANIZER, ADMIN | Brisanje |

## Prijave

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/applications/organizer?eventId=` | ORGANIZER | Prijave po događaju |
| GET | `/applications/artist` | ARTIST | Moje prijave |
| GET | `/applications/invites` | ARTIST | Pozivi |
| POST | `/applications/apply` | ARTIST | Prijava na događaj |
| POST | `/applications/invite` | ORGANIZER | Slanje poziva |
| PATCH | `/applications/:id/respond` | Auth | Prihvati/odbij |
| PATCH | `/applications/:id/withdraw` | ARTIST | Povlačenje prijave |

## Nastupi

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/performances/event/:eventId` | ORGANIZER | Nastupi po događaju |
| GET | `/performances/mine` | ARTIST | Moji nastupi |
| POST | `/performances` | ORGANIZER | Kreiranje |
| PUT | `/performances/:id` | ORGANIZER | Izmena |
| DELETE | `/performances/:id` | ORGANIZER | Brisanje |

## Ocene

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| POST | `/reviews` | ORGANIZER | Ocena izvođača (samo za COMPLETED nastup, jednom po paru event/izvođač) — automatski preračunava `averageRating` |
| GET | `/reviews/event/:eventId` | ORGANIZER | Ocene za dati događaj |

## Notifikacije

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/notifications` | Auth | Lista notifikacija + broj nepročitanih |
| PATCH | `/notifications/:id/read` | Auth | Označi jednu kao pročitanu |
| PATCH | `/notifications/read-all` | Auth | Označi sve kao pročitane |

## Preporuke (ML)

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| POST | `/recommendations/events/:eventId/generate` | ORGANIZER | Generisanje preporuka |
| GET | `/recommendations/events/:eventId` | ORGANIZER | Lista preporuka |

## ML model (proxy)

| Metoda | Ruta | Uloga | Opis |
|--------|------|-------|------|
| GET | `/model/info` | Auth | Verzija i metrike |
| GET | `/model/health` | ADMIN | Health ML servisa |
| GET | `/model/training-runs` | ADMIN | Istorija treniranja |

## ML servis (FastAPI)

Bazni URL: `http://localhost:8000`

| Metoda | Ruta | Opis |
|--------|------|------|
| GET | `/health` | Status servisa i modela |
| GET | `/model/info` | Metapodaci modela |
| POST | `/predict` | Predikcija za jedan par |
| POST | `/recommend` | Rangiranje liste kandidata |
| POST | `/train` | Ponovno treniranje |

### POST /recommend

```json
// Request
{
  "event": { "eventType": "CONCERT", "city": "Beograd", ... },
  "artists": [ { "stageName": "...", "genres": ["Rock"], ... } ]
}

// Response
{
  "recommendations": [
    { "artistId": 5, "score": 0.87, "explanation": ["Podudaranje žanra", ...] }
  ]
}
```

## Health

| Metoda | Ruta | Opis |
|--------|------|------|
| GET | `/health` | Status servera |
