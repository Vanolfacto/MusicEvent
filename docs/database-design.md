# Dizajn baze podataka

## ER dijagram

```mermaid
erDiagram
    User ||--o| OrganizerProfile : has
    User ||--o| ArtistProfile : has
    User ||--o{ Notification : receives
    User ||--o{ RefreshToken : has

    OrganizerProfile ||--o{ Event : creates
    Event ||--o{ Application : has
    Event ||--o{ Performance : has
    Event ||--o{ Recommendation : has
    Event }o--o{ Genre : "EventGenre"

    ArtistProfile ||--o{ Application : submits
    ArtistProfile ||--o{ Performance : performs
    ArtistProfile ||--o{ Recommendation : "recommended in"
    ArtistProfile }o--o{ Genre : "ArtistGenre"

    Event ||--o{ Review : has
    ArtistProfile ||--o{ Review : receives
    OrganizerProfile ||--o{ Review : writes

    User {
        int id PK
        string email UK
        enum role
        enum status
    }

    Event {
        int id PK
        string title
        enum eventType
        enum status
        datetime startDateTime
        datetime endDateTime
    }

    ArtistProfile {
        int id PK
        string stageName
        enum artistType
        decimal averageRating
    }

    Recommendation {
        int id PK
        float score
        string modelVersion
        string explanation
    }
```

## Glavni entiteti

### User

Centralni entitet za autentifikaciju. Svaki korisnik ima tačno jednu ulogu: `ADMIN`, `ORGANIZER` ili `ARTIST`.

### OrganizerProfile / ArtistProfile

Proširenja profila po ulozi. Organizator ima `organizationName`, izvođač `stageName`, `biography`, `minimumFee`, `maximumFee`, itd.

### Event

Događaj sa tipom (`CONCERT`, `FESTIVAL`, ...), statusom (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`), vremenskim intervalom i budžetom.

### Application

Veza izvođač–događaj. Tip: `APPLY` (prijava) ili `INVITE` (poziv). Status: `PENDING`, `ACCEPTED`, `REJECTED`, ...

### Performance

Potvrđen nastup sa `startDateTime`, `endDateTime`, `agreedFee` i statusom.

### Recommendation

ML preporuka sa `score`, `modelVersion` i `explanation` (JSON tekst).

### Review

Ocena izvođača (1–5) koju organizator ostavlja za konkretan događaj, uz opcioni komentar. Dozvoljena samo ako izvođač ima nastup sa statusom `COMPLETED` na tom događaju; jedna ocena po paru (event, izvođač) — `@@unique([eventId, artistId])`. Svako kreiranje ponovo preračunava `averageRating` na `ArtistProfile` kao prosek svih ocena tog izvođača.

### Notification

Poruka korisniku (naslov, tekst, `isRead`) generisana pri ključnim akcijama (nova prijava, promena statusa, zakazan nastup). Prikazuje se kroz zvonce u navigaciji.

## Indeksi

| Tabela | Indeks | Svrha |
|--------|--------|-------|
| User | role, status | Filtriranje korisnika |
| Event | organizerId, status, startDateTime | Lista događaja |
| Application | eventId, artistId, status | Prijave po događaju |
| Performance | artistId, startDateTime | Konflikt termina |
| Recommendation | eventId, score | Rangiranje preporuka |

## Enumeracije

```
UserRole:        ADMIN | ORGANIZER | ARTIST
EventStatus:     DRAFT | PUBLISHED | CANCELLED | COMPLETED
ApplicationType: APPLY | INVITE
ApplicationStatus: PENDING | ACCEPTED | REJECTED | WITHDRAWN | CANCELLED
PerformanceStatus: SCHEDULED | CONFIRMED | COMPLETED | CANCELLED
```

## Seed podaci

Skripta `server/prisma/seed.ts` kreira:

| Entitet | Broj |
|---------|------|
| Admin | 1 |
| Organizatori | 6 |
| Izvođači | 55 |
| Događaji | 35 |
| Prijave, nastupi, ocene, preporuke | — |

## Migracije

```
server/prisma/migrations/20260713180000_init/
server/prisma/migrations/20260901120000_refresh_token_used_at/   # usedAt na RefreshToken — detekcija ponovne upotrebe pri refresh-u
```

Pokretanje:

```bash
cd server
npx prisma migrate deploy
npm run db:seed
```
