# Ograničenja i budući rad

## Trenutna ograničenja prototipa

### Podaci i ML

- **Sintetički dataset** — ML model treniran na veštačkim podacima (`generate_synthetic_data.py`)
- Rezultati evaluacije ne predstavljaju performanse na stvarnim podacima
- Nema online learning — ponovno treniranje zahteva ručni CSV export
- Objašnjenja preporuka su rule-based, ne SHAP/LIME
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

1. **Stvarni podaci** — prikupljanje interakcija korisnika za retreniranje
2. **E2E testovi** — Playwright za kritične tokove (login, kreiranje događaja, preporuke)
3. **CI/CD** — GitHub Actions sa PostgreSQL servisom
4. **Code splitting** — lazy loading stranica po ulozi

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
- Metodologiju evaluacije na sintetičkim podacima sa jasnom putanjom ka stvarnim podacima
- Arhitekturu koja razdvaja poslovnu logiku, perzistenciju i ML inferencu

## Etička napomena

Demonstracioni nalozi i lozinke (`DemoAdmin123!`, itd.) služe isključivo za testiranje. U produkciji obavezno koristiti jake tajne, HTTPS i princip najmanjih privilegija.
