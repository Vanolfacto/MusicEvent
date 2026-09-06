# Pristupačnost (WCAG)

Ovaj dokument opisuje šta je urađeno na prilagođavanju aplikacije za slepe i slabovide
korisnike, u skladu sa WCAG 2.2 smernicama (nivo AA gde je primenjivo), kao osnovu za
poglavlje "Prilagođavanje pristupačnosti" u tekstu master rada.

## 1. Struktura i navigacija (WCAG 2.4.1, 1.3.1, 4.1.2)

- Dodat "Preskoči na sadržaj" (skip) link kao prvi fokusabilan element na svakoj stranici
  (`Layout.tsx`) — omogućava korisnicima tastature/čitača ekrana da preskoče navigaciju.
- Glavni navigacioni meni ima `aria-label="Glavna navigacija"` (landmark).
- `<main>` element je fokusabilan (`tabIndex={-1}`) kao odredište skip linka.
- Sve tabele (`AdminUsersPage`, `AdminModelPage`) imaju `<th scope="col">`/`scope="row"`
  za ispravnu asocijaciju zaglavlja i ćelija.

## 2. Forme (WCAG 3.3.1, 3.3.2, 4.1.2)

Svih 6 formi u aplikaciji (prijava, registracija, kreiranje/izmena događaja, profil
izvođača, profil organizatora, promena lozinke) je prošlo kroz:

- Svaki `<label>` je programski povezan sa svojim poljem preko `htmlFor`/`id`.
- Greške validacije su povezane preko `aria-describedby` i označene `role="alert"`, tako
  da se automatski najavljuju čitačem ekrana kad se pojave.
- Dodat `aria-invalid` na poljima sa greškom.
- Dodat `autoComplete` na standardna polja (email, lozinka, ime, grad, telefon).
- Dugmad za izbor žanra (toggle) imaju `aria-pressed` da prenesu stanje izabrano/nije.
- Forma za kreiranje događaja (`EventFormPage`) je ranije koristila isključivo placeholder
  tekst bez ijednog `<label>` elementa — potpuno prepravljena sa vidljivim labelama.
- Usput je otkriven i ispravljen funkcionalni bag: `RegisterPage` je validirao 7 polja
  čije poruke o greškama se nikad nisu prikazivale korisniku.

## 3. Interaktivni widget-i (WCAG 4.1.2, 2.1.2)

- Padajući meni notifikacija (`NotificationBell`) ima `aria-haspopup`, `aria-expanded`,
  `aria-controls`, zatvara se na Escape uz vraćanje fokusa na dugme, i broj nepročitanih
  notifikacija je uključen u accessible name dugmeta.
- Dugmad za brisanje u administratorskom pregledu imaju kontekstualni `aria-label`
  (npr. `Obriši događaj "Naziv"`) umesto generičkog "Obriši" koje bi bilo nerazlučivo u
  listi sa više stavki.
- Isti problem (generičko dugme/link ponovljeno u svakom redu liste — "Prihvati",
  "Odbij", "Uredi", "Detalji", "Vidi profil", "Prijavi se", "Pošalji poziv", "Povuci
  prijavu") sistematski je pregledan i ispravljen kroz 7 stranica (prijave organizatora
  i izvođača, detalji događaja, liste događaja, preporuke, administratorski korisnici) —
  svako sada ima `aria-label` sa imenom izvođača/nazivom događaja, tako da čitač ekrana
  u režimu liste linkova/dugmadi (npr. NVDA `Insert+F7`) razlikuje stavke, ne samo čita
  isti tekst više puta.

## 4. Ne-tekstualni sadržaj (WCAG 1.1.1)

- Dekorativni emotikoni (⭐✅❌🎵🔔⚠️) označeni su sa `aria-hidden="true"` kad je značenje
  već preneto tekstom pored njih (npr. "Dostupan"/"Nedostupan"), ili je dodat vidljivo-skriven
  (`sr-only`) tekst kad emotikon nosi jedino značenje (npr. "Prosečna ocena:" pre broja).
  Odluka je pravljena po elementu, ne mehanički — cilj je da čitač ekrana ne najavljuje
  suvišan ili nejasan sadržaj.
- Grafikon metrika modela (`AdminModelPage`, Recharts bar chart, SVG bez teksta za čitače
  ekrana) je označen `aria-hidden="true"`, uz paralelnu `sr-only` HTML tabelu koja nosi
  iste podatke (naziv metrike i vrednost) kao tekstualna alternativa.

## 5. Kontrast boja (WCAG 1.4.3 — merljivo, izračunato)

Kontrast je izračunat po tačnoj WCAG formuli relativne luminance (ne procenjen vizuelno).
Pronađen je sistemski problem: `text-slate-500` (#64748b) je davao nedovoljan kontrast na
svim pozadinama gde se koristio:

| Kombinacija | Kontrast | Rezultat (AA za normalan tekst = 4.5:1) |
|---|---|---|
| slate-500 na slate-950 (#020617) | 4.24:1 | ne prolazi |
| slate-500 na slate-900 (#0f172a, `.card` pozadina) | 3.75:1 | ne prolazi |
| slate-500 na slate-800 (#1e293b) | 3.07:1 | ne prolazi |
| **slate-400 (#94a3b8) na slate-950** (zamena) | **7.87:1** | prolazi |
| bela na primary-600 dugme (podrazumevano) | 5.70:1 | prolazi |
| bela na primary-500 (staro hover stanje) | 4.23:1 | ne prolazi (granично) |
| **bela na primary-700 (novo hover stanje)** | **7.10:1** | prolazi |
| bela na accent-500 (badge nepročitanih notifikacija, staro) | 3.53:1 | ne prolazi |
| **bela na accent-600 (novo)** | **4.60:1** | prolazi |
| bela na accent-500 (staro hover na "Moj dashboard" dugmetu) | 3.53:1 | ne prolazi |
| **bela na accent-700 (novo, dodat u Tailwind paletu)** | **6.04:1** | prolazi |

Ispravke: svih 21 pojavljivanja `text-slate-500` u kodu client aplikacije zamenjeno je sa
`text-slate-400` (11 fajlova), hover stanje `.btn-primary` dugmeta promenjeno je sa
`primary-500` na `primary-700`, badge nepročitanih notifikacija sa `accent-500` na
`accent-600`, a hover stanje "Moj dashboard" dugmeta na `accent-700` (nova nijansa dodata
u `tailwind.config.js` jer paleta nije imala dovoljno tamnu accent nijansu za hover).

## 6. Mobilna navigacija (WCAG 2.1.1, 1.3.1)

Autentifikovani korisnici na malim ekranima ranije nisu imali nijedan način da dođu do
Dashboard-a ili ostalih linkova specifičnih za ulogu (glavni `<nav>` je bio potpuno
sakriven ispod `md` breakpoint-a, bez alternative) — ovo nije bio samo pristupačnosni, već
i opšti funkcionalni nedostatak. Dodato je hamburger dugme (`aria-expanded`,
`aria-controls`, `aria-label` koji se menja u zavisnosti od stanja) koje otvara potpuno
tastaturom i čitačem ekrana dostupan mobilni meni (`role` je prirodno `nav`, zatvara se na
Escape i na klik na link).

## 7. Šta NIJE urađeno u ovoj fazi (otvoreno, za sledeći korak)

- Nije rađeno manuelno testiranje pravim čitačem ekrana (NVDA/VoiceOver) — ovo je sledeći,
  odvojeni korak koji profesor eksplicitno traži kao deo poglavlja o testiranju
  ("сценарије провере прилагођености за циљну групу").
- Kontrast je proveren za dominantne, ponovljive kombinacije boja (`slate-*` tekst,
  `primary-*` dugmad) — nije rađena iscrpna provera svake pojedinačne kombinacije u
  aplikaciji (npr. `amber`/`red`/`accent` варijante u specifičnim baner porukama, koje su
  pojedinačno proverene i prolaze, ali nisu sve teoretski moguće kombinacije pokrivene).
- Fokus-redosled (tab order) nije eksplicitno testiran na svakoj stranici pojedinačno.
