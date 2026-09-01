# Pregled projekta

## Naziv

**Inteligentni informacioni sistem za organizaciju muzičkih nastupa i događaja primenom mašinskog učenja**

## Cilj

Razvoj prototipa full-stack veb aplikacije koja povezuje organizatore muzičkih događaja sa odgovarajućim izvođačima, uz podršku modela mašinskog učenja za rangiranje i preporuku kandidata.

## Kontekst

Organizatori događaja često ručno pretražuju izvođače, bez sistematskog upoređivanja žanrova, budžeta, dostupnosti i iskustva. Aplikacija centralizuje podatke o događajima, izvođačima, prijavama i nastupima, a ML komponenta automatski predlaže najpogodnije kandidate.

## Uloge korisnika

| Uloga | Opis |
|-------|------|
| **Administrator** | Upravljanje korisnicima, pregled događaja, nadzor ML modela |
| **Organizator** | Kreiranje događaja, pregled prijava, generisanje ML preporuka, raspored |
| **Izvođač** | Prijava na događaje, odgovor na pozive, pregled događaja na kojima nastupa |

## Ključne funkcionalnosti

- Registracija, autentifikacija (JWT + refresh token) i promena lozinke
- CRUD nad događajima, profilima i prijavama
- Upravljanje nastupima (zakazivanje, status, izmena termina) i provera konflikta termina
- ML preporuke izvođača po događaju
- Ocenjivanje izvođača posle završenog nastupa, sa automatskim preračunavanjem prosečne ocene
- Dashboard-i sa statistikom (Recharts, FullCalendar)
- Notifikacije pri ključnim akcijama, sa prikazom u navigaciji (zvonce, broj nepročitanih)

## Tehnološki stek

| Sloj | Tehnologije |
|------|-------------|
| Frontend | React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS |
| Backend | Node.js, Express, Prisma, PostgreSQL, Zod |
| ML | Python, FastAPI, scikit-learn, pandas |
| Infrastruktura | Docker Compose |

## Struktura monorepo-a

```
/client          — React frontend
/server          — Node.js REST API
/ml-service      — Python ML servis
/docs            — Dokumentacija za master rad
docker-compose.yml
```

## Status prototipa

Sve planirane faze (1–7) su implementirane:

1. Monorepo skeleton
2. Baza + autentifikacija
3. CRUD + prijave + nastupi
4. ML pipeline (treniranje i evaluacija)
5. FastAPI + Node integracija
6. React frontend
7. Testovi i dokumentacija
