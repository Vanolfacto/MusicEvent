# Drugo poglavlje — Definisanje zahteva

*(Nacrt teksta poglavlja. Treće lice, sadašnje vreme. Mermaid dijagrami iz `use-cases.md`
treba pre unošenja u Word izvesti kao slike — npr. preko Mermaid Live Editor-a
(mermaid.live) — i ubaciti kao "Slika X. Naziv (izvor: sopstvena izrada)", jer se
mermaid kod ne renderuje u Word-u.)*

---

Pre same izrade aplikacije definisani su funkcionalni i nefunkcionalni zahtevi sistema,
zasnovani na analizi problema opisanog u uvodu i na tri identifikovane korisničke uloge:
administrator, organizator i izvođač. U ovom poglavlju prvo se navode funkcionalni
zahtevi, grupisani po funkcionalnim celinama, zatim nefunkcionalni zahtevi sa naznakom
kako je svaki od njih ispunjen u implementaciji, i na kraju akteri sistema sa
odgovarajućim use-case scenarijima.

## 2.1 Funkcionalni zahtevi

Funkcionalni zahtevi sistema podeljeni su u šest celina.

**Autentifikacija i autorizacija.** Sistem omogućava registraciju korisnika sa izborom
uloge (organizator ili izvođač), prijavu zasnovanu na JWT access tokenu i HTTP-only
refresh kolačiću, zaštitu ruta prema ulozi korisnika (administrator, organizator,
izvođač) i mogućnost da administrator blokira korisnički nalog.

**Upravljanje događajima.** Organizator kreira, menja i briše događaje, objavljuje ih
(prelazak iz statusa nacrt u status objavljen), dok se objavljeni događaji mogu javno
pregledati i filtrirati po gradu, tipu i žanru.

**Prijave i pozivi.** Izvođač se može prijaviti na objavljeni događaj, dok organizator
može uputiti poziv konkretnom izvođaču. Obe strane mogu prihvatiti ili odbiti odgovarajući
zahtev, pri čemu sistem automatski generiše notifikaciju drugoj strani.

**Nastupi i raspored.** Nakon prihvaćene prijave ili poziva, organizator zakazuje nastup,
pri čemu sistem proverava eventualni konflikt termina — i za izvođača (preklapanje sa
drugim nastupima) i za sam događaj. Status nastupa (zakazan, potvrđen, završen, otkazan)
se ažurira tokom vremena, uz ograničenje da se termin i honorar ne mogu menjati niti se
otkazan nastup može reaktivirati nakon što se događaj završi ili otkaže.

**Ocene.** Nakon završenog nastupa organizator ocenjuje izvođača (ocena 1–5, uz opcioni
komentar), pri čemu sistem sprečava dvostruko ocenjivanje istog para događaj–izvođač i
automatski preračunava prosečnu ocenu izvođača.

**Preporuke izvođača.** Organizator generiše preporuke izvođača za konkretan događaj;
sistem vraća rangiranu listu kandidata sa skorom pogodnosti i tekstualnim objašnjenjem
razloga rangiranja, koje se čuva u istoriji preporuka.

**Administracija.** Administrator pregleda sve korisnike i događaje, upravlja statusom
korisničkih naloga i ima uvid u metrike i istoriju treniranja modela mašinskog učenja.

## 2.2 Nefunkcionalni zahtevi

Tabela 3 prikazuje nefunkcionalne zahteve sistema i način na koji je svaki od njih
ispunjen u implementaciji.

*Tabela 3. Nefunkcionalni zahtevi sistema (izvor: sopstvena izrada)*

| Zahtev | Implementacija |
|---|---|
| Performanse | Keširanje upita na klijentu (TanStack Query), indeksi u bazi podataka |
| Bezbednost | Heš-ovanje lozinki (bcrypt), HTTP zaglavlja (Helmet), CORS politika, ograničavanje broja zahteva, validacija ulaza (Zod) |
| Skalabilnost | Odvojen ML servis od glavnog API-ja, stateless arhitektura API-ja |
| Održivost | TypeScript, slojevita arhitektura, automatizovani testovi |
| Pristupačnost | Usklađenost sa WCAG 2.2 AA smernicama — labelovane forme, automatsko najavljivanje grešaka čitaču ekrana, potpuna tastaturska navigacija, izmeren kontrast boja, pristupačan mobilni meni |
| Responzivnost | Prilagodljiv korisnički interfejs za različite veličine ekrana |
| Reproduktivnost | Docker Compose okruženje, unapred definisani (seed) podaci, fiksirano seme slučajnosti pri treniranju modela |

## 2.3 Akteri i use-case scenariji

Sistem ima tri korisničke uloge — administrator, organizator i izvođač — koje
komuniciraju sa sistemom, dok sistem interno komunicira sa odvojenim ML servisom radi
generisanja preporuka (Slika 1). Tabela 4 prikazuje matricu dostupnosti pojedinih
funkcionalnosti po ulogama.

*Slika 1. Dijagram aktera sistema (izvor: sopstvena izrada) — [umetnuti izvezenu sliku iz
`use-cases.md`, sekcija "Pregled aktera"]*

*Tabela 4. Matrica dostupnosti funkcionalnosti po korisničkim ulogama (izvor: sopstvena
izrada)*

| Funkcionalnost | Administrator | Organizator | Izvođač |
|---|:---:|:---:|:---:|
| Registracija/prijava | ✓ | ✓ | ✓ |
| CRUD nad događajima | — | ✓ | — |
| Prijave/pozivi | — | ✓ | ✓ |
| Generisanje ML preporuka | — | ✓ | — |
| Kalendar i upravljanje nastupima | — | ✓ | — |
| Ocenjivanje izvođača | — | ✓ | — |
| Notifikacije | ✓ | ✓ | ✓ |
| Promena lozinke | ✓ | ✓ | ✓ |
| Upravljanje korisnicima | ✓ | — | — |
| Nadzor ML modela | ✓ | — | — |

Od svih scenarija, generisanje preporuka izvođača (Slika 2) najbolje ilustruje
komunikaciju između komponenti sistema: organizator sa klijentske aplikacije pokreće
zahtev, server učitava podatke o događaju i kandidatima za izvođače iz baze podataka,
prosleđuje ih ML servisu koji vraća rangiranu listu sa skorovima, server rezultat
snima u bazu radi istorije preporuka, i konačno klijentska aplikacija prikazuje
organizatoru kartice preporučenih izvođača sa objašnjenjima.

*Slika 2. Sekvencijalni dijagram — generisanje ML preporuka (izvor: sopstvena izrada) —
[umetnuti izvezenu sliku iz `use-cases.md`, sekcija "UC-04"]*

Preostali use-case scenariji (registracija i prijava, prijava izvođača na događaj,
upravljanje nastupima, ocenjivanje izvođača, notifikacije, promena lozinke,
administracija korisnika) detaljno su opisani u prilogu rada, sa odgovarajućim
preduslovima, tokom radnji i postuslovima za svaki scenario.
