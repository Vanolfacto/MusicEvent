# Music Event AI — Pokretanje aplikacije

Kompletno uputstvo za pokretanje celog projekta lokalno.

---

## Preduslovi

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Python 3.11+** — [python.org](https://python.org)
- **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) (za bazu podataka)

Proveri verzije:

```powershell
node -v
python --version
docker -v
```

---

## Korak 1 — Pokreni Docker Desktop

Otvori **Docker Desktop** aplikaciju i sačekaj da se potpuno učita (ikonica u taskbaru postane zelena).

---

## Korak 2 — Pokreni bazu podataka (PostgreSQL)

Otvori terminal u korenom folderu projekta (`muzika projekat`):

```powershell
docker compose up postgres -d
```

> Baza sluša na portu **5433** (da ne bi kolidirala sa eventualnom lokalnom PostgreSQL instalacijom).

---

## Korak 3 — Migracije i seed podaci (samo prvi put)

```powershell
cd server
npx prisma migrate deploy
npm run db:seed
cd ..
```

Ovo kreira tabele i puni bazu sa demo podacima:
- 1 admin, 6 organizatora, 55 izvođača, 35 događaja

---

## Korak 4 — Pokreni backend server

U novom terminalu:

```powershell
cd server
npm run dev
```

Backend radi na: **http://localhost:3001**

---

## Korak 5 — Pokreni ML servis

U novom terminalu:

```powershell
cd ml-service
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

ML servis radi na: **http://localhost:8000**

> Ako `.venv` ne postoji, pokreni jednom:
> ```powershell
> python -m venv .venv
> .venv\Scripts\pip install -r requirements.txt
> ```

---

## Korak 6 — Pokreni frontend

U novom terminalu:

```powershell
cd client
npm run dev
```

Frontend radi na: **http://localhost:5173** (ili 5174 ako je 5173 zauzet)

---

## Demo nalozi za prijavu

Otvori **http://localhost:5173** u browseru i prijavi se:

| Uloga | Email | Lozinka |
|-------|-------|---------|
| Admin | `admin@demo.local` | `DemoAdmin123!` |
| Organizator | `organizer1@demo.local` | `DemoOrg123!` |
| Izvođač | `artist1@demo.local` | `DemoArtist123!` |

---

## Brza provera — sve radi?

```powershell
# Backend health
curl http://localhost:3001/api/health

# ML servis health
curl http://localhost:8000/health
```

Oba treba da vrate `{"status":"ok",...}`.

---

## Česti problemi

| Problem | Rešenje |
|---------|---------|
| `docker compose` greška | Proveri da li je Docker Desktop pokrenut |
| Port 5432 zauzet | Baza je namerno na portu 5433, to je OK |
| Port 3001 zauzet | `npx kill-port 3001` pa ponovo `npm run dev` |
| Port 8000 zauzet | `npx kill-port 8000` pa ponovo pokreni uvicorn |
| Network error u browseru | Proveri da li backend i ML servis rade |
| ML model nije učitan | Pokreni `python scripts/train_model.py` iz `ml-service` foldera |

---

## Stranice po ulozi

| Uloga | Dostupne stranice |
|-------|-----------------|
| **Javno** | Početna, Događaji, Izvođači |
| **Admin** | Dashboard, Korisnici, Svi događaji, ML model metrike |
| **Organizator** | Dashboard, Moji događaji (CRUD), ML preporuke, Raspored, Profil |
| **Izvođač** | Dashboard, Moji nastupi, Ponuda događaja, Prijave/pozivi, Profil |
