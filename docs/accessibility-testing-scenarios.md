# Scenariji testiranja pristupačnosti (za poglavlje "Testiranje")

Ovo je praktičan, izvodljiv test-skript za proveru prilagođenosti aplikacije slepim i
slabovidim korisnicima — dopuna tehničkom testiranju (`docs/testing.md`), namenjena
direktno za poglavlje rada koje profesor traži ("сценарије провере прилагођености за
циљну групу"). Za razliku od automatizovanih testova, ovo mora ručno izvesti osoba
(ti), uz čitač ekrana — rezultat je stvarna, empirijska evidencija, ne procena.

## Alat

**NVDA** (NonVisual Desktop Access) — besplatan, open-source čitač ekrana za Windows,
industrijski standard za ovakvo testiranje. Preuzimanje: https://www.nvaccess.org/download/

Osnovne komande koje će trebati:
- `Insert + Down Arrow` — čitaj sve od trenutne pozicije
- `Tab` / `Shift+Tab` — kretanje kroz fokusabilne elemente
- `H` — skoči na sledeći heading (kad NVDA čita, van edit polja)
- `Ctrl+Alt+Arrow` — kretanje kroz ćelije tabele (kad je fokus unutar `<table>`)
- `Insert + F7` — lista svih elemenata (linkovi, heading-zi, landmark-i) na strani
- `Escape` — zatvaranje NVDA-a ako zatreba

Pokreni aplikaciju lokalno (`docker compose up` ili `npm run dev` u sva tri servisa),
upali NVDA, pa otvori Chrome/Edge na `http://localhost:5173`. Za svaki scenario upiši
rezultat (✅ prošlo / ❌ nije prošlo / napomena) — ta tabela ide direktno u rad.

---

## Scenario 1 — Preskakanje navigacije (gost, bez miša)

1. Otvori početnu stranu, pritisni `Tab` jednom.
2. **Očekivano**: NVDA najavljuje "Preskoči na sadržaj, link" kao prvi fokusabilan
   element (pre logotipa i menija).
3. Pritisni `Enter` — fokus i čitanje treba da skoče direktno na glavni sadržaj strane,
   preskačući navigaciju.

## Scenario 2 — Prijava (login) sa greškom

1. Idi na `/login` (Tab ili direktno).
2. Tab-uj do polja za email — NVDA treba da najavi "Email, uređivanje texta" (ime polja
   se čita jer je `<label>` povezan preko `for`/`id`).
3. Ostavi polja prazna, pošalji formu (`Enter` na dugmetu "Prijavi se").
4. **Očekivano**: NVDA odmah, bez dodatne navigacije, najavljuje poruku o grešci (npr.
   "Unesite ispravan email") — jer je greška označena `role="alert"`.

## Scenario 3 — Registracija sa uslovnim poljima

1. Idi na `/register`. Tab-uj kroz Ime, Prezime, Email, Lozinku (proveri da NVDA čita i
   napomenu o zahtevima lozinke), Ulogu.
2. Promeni Ulogu na "Izvođač" (strelice unutar select-a) i nastavi Tab — treba da se
   pojave nova polja "Umetničko ime" i "Tip izvođača", oba sa ispravno najavljenim
   imenom.
3. Pošalji praznu formu — svih 7 polja treba da prijavi grešku (pre popravke, samo
   lozinka je to radila).

## Scenario 4 — Kreiranje događaja (organizator)

1. Uloguj se kao organizator, idi na "Novi događaj".
2. Tab-uj kroz SVA polja (Naslov, Opis, Tip događaja, Tip izvođača, Grad, Lokacija,
   Početak, Kraj, Očekivana publika, Min/Max budžet, Status) — svako treba da ima
   najavljeno ime, ne samo generičko "uređivanje texta".
3. Dođi do sekcije "Žanrovi" (dugmad). Pritisni `Enter`/`Space` na jedan žanr.
   **Očekivano**: NVDA najavljuje promenu stanja (npr. "pritisnuto" / "nije pritisnuto").
4. Pokušaj da sačuvaš bez izabranog žanra — greška "Izaberite bar jedan žanr" treba da
   se automatski najavi.

## Scenario 5 — Notifikacije

1. Tab-uj do ikonice zvona. **Očekivano**: NVDA najavljuje "Notifikacije, N nepročitanih,
   dugme, sažeto" (broj se čita, ne samo "Notifikacije").
2. Pritisni `Enter` — panel se otvara, fokus ostaje na dugmetu ali `Insert+F7` ili Tab
   treba da otkrije novi region "Notifikacije".
3. Pritisni `Escape`. **Očekivano**: panel se zatvara i fokus se vraća na dugme zvona
   (proveri da sledeći Tab ide na sledeći element posle zvona, ne "nigde").

## Scenario 6 — Mobilni meni

1. Smanji prozor pregledača na širinu ispod ~768px (ili otvori DevTools responsive mod).
2. Tab-uj do hamburger dugmeta. **Očekivano**: najavljeno "Otvori meni, dugme, sažeto".
3. Pritisni `Enter`. Dugme treba sada da najavi "Zatvori meni... rašireno".
4. Tab-uj kroz linkove menija, pritisni `Enter` na jedan link. **Očekivano**: meni se
   zatvara i stranica navigira.
5. Ponovi otvaranje i zatvori sa `Escape` umesto klikom na link.

## Scenario 7 — Administratorska tabela korisnika

1. Uloguj se kao admin, idi na "Korisnici".
2. Uđi u tabelu i koristi `Ctrl+Alt+Right/Down Arrow` za kretanje po ćelijama.
   **Očekivano**: pri svakoj ćeliji NVDA najavljuje i naziv kolone (Ime/Email/Uloga/
   Status), ne samo sadržaj ćelije.
3. Tab-uj do select-a za status jednog korisnika. **Očekivano**: najavljeno "Status
   korisnika [Ime Prezime]", ne generičko "combo box".

## Scenario 8 — Grafikon metrika modela (admin)

1. Idi na "ML model". Koristi `Insert+Down Arrow` (čitaj sve) ili `H` za heading
   navigaciju do "Metrike modela".
2. **Očekivano**: iako je sam grafikon (SVG) sakriven od čitača ekrana, NVDA treba da
   pročita paralelnu tabelu sa nazivima metrika i vrednostima (accuracy, precision, itd.)
   — provera da vizuelni grafikon ima potpunu tekstualnu alternativu.

## Scenario 9 — Zumiranje (slabovidost, ne slepilo — WCAG 1.4.10 Reflow)

1. Zumiraj pregledač na 200% (`Ctrl` + `+` četiri puta u Chrome-u).
2. Prođi kroz početnu stranu, listu događaja i formu za kreiranje događaja.
3. **Proveri**: da li se pojavljuje horizontalno skrolovanje na širini ekrana, i da li
   je tekst/dugmad i dalje čitljivo i klikabilno bez preklapanja.
4. *Napomena: ovaj scenario nije prethodno automatski proveravan u kodu — ovo je čisto
   ručna provera koju treba izvesti i zabeležiti rezultat.*

---

## Tabela rezultata

*Izvedeno 8.9.2026, NVDA na Windows-u, Chrome/Edge.*

| # | Scenario | Rezultat | Napomena |
|---|---|---|---|
| 1 | Skip link | ✅ Prošlo | Skip link se najavljuje kao prvi fokusabilan element i ispravno prebacuje fokus na glavni sadržaj |
| 2 | Login greška | ✅ Prošlo | Greška validacije se automatski najavljuje bez dodatne navigacije |
| 3 | Registracija, uslovna polja | ✅ Prošlo | Sva polja ispravno najavljena, uslovna polja (umetničko ime/tip izvođača) rade pri promeni uloge |
| 4 | Kreiranje događaja | ✅ Prošlo | Sva polja imaju ispravno najavljeno ime; dugmad za žanr najavljuje pritisnuto/nije pritisnuto stanje |
| 5 | Notifikacije | ✅ Prošlo | Broj nepročitanih se najavljuje uz ime dugmeta; Escape zatvara i vraća fokus |
| 6 | Mobilni meni | ✅ Prošlo | Otvara/zatvara se ispravno, i klikom na link i sa Escape |
| 7 | Admin tabela | ✅ Prošlo | Nazivi kolona se najavljuju uz svaku ćeliju; status-select najavljuje ime korisnika |
| 8 | Grafikon metrika | ✅ Prošlo | Skrivena tabela sa podacima se čita umesto SVG grafikona. |
| 9 | Zumiranje 200% | ✅ Prošlo | Nema horizontalnog skrolovanja, tekst i dugmad ostaju čitljivi i klikabilni |
