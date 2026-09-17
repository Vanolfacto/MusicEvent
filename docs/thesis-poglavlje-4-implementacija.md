# Četvrto poglavlje — Razvoj i implementacija informacionog sistema

*(Nacrt teksta poglavlja. Treće lice, sadašnje vreme za opis sistema kakav jeste. Mermaid
dijagrami iz `architecture.md` i `database-design.md` treba izvesti kao slike pre unošenja
u Word. Numeracija tabela/slika nastavlja se na prethodna poglavlja.)*

---

Ovo poglavlje opisuje razvoj i implementaciju samog informacionog sistema — arhitekturu,
tehničku realizaciju veb aplikacije i integraciju obučenog modela, te prilagođavanje
aplikacije standardima pristupačnosti.

## 4.1 Arhitektura sistema

Sistem je realizovan kao skup od tri nezavisna servisa koji komuniciraju preko REST
API-ja (Slika 3): klijentska aplikacija (React), glavni server (Node.js/Express) i
odvojen ML servis (Python/FastAPI), uz relacionu bazu podataka (PostgreSQL) kojoj
pristupa isključivo glavni server preko Prisma ORM-a.

*Slika 3. Visokonivojska arhitektura sistema (izvor: sopstvena izrada) — [umetnuti
izvezenu sliku iz `architecture.md`, sekcija "Visokonivojski pregled"]*

Odvajanje ML servisa od glavnog API-ja omogućava nezavisno skaliranje i zamenu modela bez
uticaja na ostatak sistema. Tabela 8 prikazuje komunikaciju između komponenti.

*Tabela 8. Komunikacija između komponenti sistema (izvor: sopstvena izrada)*

| Od | Do | Protokol | Svrha |
|---|---|---|---|
| Klijent | Server | HTTP REST | CRUD operacije, autentifikacija |
| Server | ML servis | HTTP REST | Predikcija, preporuka, ponovno treniranje |
| Server | PostgreSQL | Prisma ORM | Perzistencija podataka |

Backend je organizovan u slojevitu arhitekturu (rute → kontroleri → servisi →
repozitorijumi za autentifikaciju → baza), prema opštim principima organizacije koda radi
lakšeg razumevanja i održavanja [18], čime je poslovna logika odvojena od HTTP sloja
i pristupa podacima, što olakšava testiranje i održavanje. Autentifikacija je zasnovana
na JWT access tokenu kratkog roka trajanja i HTTP-only refresh kolačiću dužeg roka
trajanja, sa detekcijom ponovne upotrebe refresh tokena (mehanizam koji prepoznaje
krađu tokena i, van kratkog prozora tolerancije za normalnu upotrebu sa više uređaja,
poništava sve aktivne sesije korisnika). Bezbednosni sloj dodatno obuhvata HTTP
bezbednosna zaglavlja, ograničen CORS pristup, ograničavanje broja zahteva na
autentifikacionim rutama, heš-ovanje lozinki i validaciju ulaznih podataka na svakoj
ruti.

Za lokalno pokretanje i razvoj sistem koristi Docker Compose okruženje u kome su sve
komponente (klijent, server, ML servis, baza) definisane kao odvojeni kontejneri sa
zajedničkom konfiguracijom okruženja, čime je obezbeđena reproduktivnost postavljanja
sistema nezavisno od operativnog sistema razvojne mašine.

**Napomena o razvojnom procesu.** Deo tehničke realizacije sistema (pisanje i
refaktorisanje koda, otklanjanje grešaka, priprema dokumentacije) rađen je uz podršku AI
asistenta za programiranje [19], pod kontinuiranim nadzorom, preispitivanjem i konačnom
verifikacijom autora rada, koji je odgovoran za sve arhitekturne i metodološke odluke
opisane u ovom radu.

## 4.2 Implementacija veb aplikacije

### 4.2.1 Model podataka

Baza podataka organizovana je oko centralnog entiteta korisnika (`User`), koji ima
tačno jednu od tri uloge — administrator, organizator ili izvođač — i odgovarajući
proširen profil (`OrganizerProfile` ili `ArtistProfile`). Tabela 9 sažima glavne
entitete i njihovu namenu; Slika 4 prikazuje potpun ER dijagram.

*Slika 4. Dijagram entiteta i veza (izvor: sopstvena izrada) — [umetnuti izvezenu sliku
iz `database-design.md`]*

*Tabela 9. Glavni entiteti modela podataka (izvor: sopstvena izrada)*

| Entitet | Namena |
|---|---|
| `User` | Autentifikacija i uloga korisnika |
| `OrganizerProfile` / `ArtistProfile` | Proširenje profila po ulozi |
| `Event` | Muzički događaj — tip, status, termin, budžet |
| `Application` | Veza izvođač–događaj: prijava ili poziv, sa statusom |
| `Performance` | Potvrđen nastup sa terminom, honorarom i statusom |
| `Recommendation` | Snimljena ML preporuka — skor, verzija modela, objašnjenje |
| `Review` | Ocena izvođača (1–5) nakon završenog nastupa |
| `Notification` | Poruka korisniku pri ključnim akcijama |

Nad ključnim kolonama (npr. status, spoljni ključevi, vremenski intervali) definisani su
indeksi baze podataka radi ubrzanja najčešćih upita — pregleda događaja, prijava po
događaju i provere konflikta termina.

### 4.2.2 Integracija modela u sistem preporuke

Kada organizator zatraži preporuke za događaj, server učitava događaj i sve kandidate za
izvođače čiji tip odgovara zahtevanom tipu događaja, mapira ih (uključujući imena
njihovih žanrova) u strukturu koju očekuje ML servis, i šalje zahtev ML servisu preko
HTTP REST poziva sa mehanizmom ponovnog pokušaja i vremenskim ograničenjem. ML servis
vraća već konačan, transparentno izračunat skor i listu razloga za svakog kandidata (v.
poglavlje 3.4); server rezultat čuva u bazi radi istorije preporuka i vraća ga klijentu
bez dodatne izmene skora. Da bi ova integracija bila konkretnija, u nastavku se opisuje
nekoliko realnih scenarija koji pokazuju kako sistem reaguje na promene podataka.

**Scenario 1 — novoregistrovani izvođač.** Kada se izvođač registruje i popuni profil,
u bazi se kreira nov zapis sa `totalPerformances = 0` i `averageRating = 0` (podrazumevane
vrednosti). Prvi put kada se taj izvođač pojavi kao kandidat u generisanju preporuka,
server ga šalje ML servisu sa tim vrednostima kao i svakog drugog kandidata — nema
posebne grane koda za "nove" izvođače na strani servera. Sâm ML servis je taj koji
prepoznaje da je `totalPerformances = 0` i primenjuje neutralan tretman opisan u
poglavlju 3.4 (faktor ocene dobija vrednost 0,6 umesto stvarne, prazne ocene 0/5), tako
da se novi izvođač realno pojavljuje u preporukama od prvog dana, umesto da bude
sistemski potisnut zbog nedostatka istorije.

**Scenario 2 — promena dostupnosti.** Izvođač na svom profilu može isključiti prekidač
"Dostupan za nove nastupe" (`isAvailable`). Kada organizator zatraži preporuke,
podrazumevano se u ML servis šalju samo izvođači kod kojih je `isAvailable = true`
(server filtrira listu kandidata pre poziva ML servisa); administrator odnosno
napredna pretraga može tražiti i nedostupne izvođače, u kom slučaju faktor
`artist_available` u formuli rangiranja spušta njihov skor. Ovo je namerno odvojeno od
stvarne zauzetosti po datumu (v. dalje) — `isAvailable` je opšti prekidač "primam nove
upite", ne kalendar.

**Scenario 3 — zakazivanje nastupa i stvarna zauzetost.** Kada organizator i izvođač
prihvate prijavu ili poziv i zakažu nastup, kreira se `Performance` zapis sa tačnim
datumom i vremenom. Provera konflikta termina (v. poglavlje 2.1) sprečava da se isti
izvođač zakaže dva puta u preklapajućim terminima. Ovi zakazani nastupi vidljivi su na
javnom profilu izvođača kao lista budućih datuma zauzetosti (umesto samo statičkog
"Dostupan/Nedostupan" natpisa), tako da organizator koji razmatra angažovanje odmah vidi
kada je izvođač stvarno zauzet, a ne samo da li je uopšte "otvoren za upite". Nakon što
se nastup označi kao završen i organizator ga oceni, taj zapis ulazi u izračunavanje
faktora istorijske uspešnosti na sličnim događajima (v. poglavlje 3.4) za sve buduće
preporuke tog izvođača za isti tip događaja.

**Scenario 4 — ponovno obučavanje modela.** Administrator sa admin panela može ručno
pokrenuti ponovno obučavanje modela (dugme "Ponovo treniraj model" na stranici uvida u
model). Zahtev pokreće ceo pipeline (v. poglavlje 3.4) i po završetku ažurira prikazanu
verziju modela, datum poslednjeg treniranja i postignute metrike, bez potrebe za
ručnim pristupom serveru.

### 4.2.3 Implementacija klijentske aplikacije i korisnički interfejs

Klijentska aplikacija razvijena je kao jednostranična aplikacija (React, TypeScript,
Vite), organizovana po stranicama specifičnim za svaku korisničku ulogu, sa deljenim,
ponovo upotrebljivim komponentama (navigacija, kartice događaja i izvođača, zaštićene
rute) i centralizovanim stanjem prijavljenog korisnika. Komunikacija sa serverom
realizovana je preko HTTP klijenta sa presretačima (interceptors) koji automatski
obnavljaju istekao pristupni token.

*[OVDE UBACITI 2-3 snimka ekrana stvarne aplikacije: (1) stranica sa preporukama —
kartice izvođača sa skorom i generisanim tekstualnim objašnjenjem; (2) profil izvođača
sa listom zakazanih nastupa (v. Scenario 3 iznad); (3) forma prilagođena WCAG
standardima, npr. vidljiv fokusni okvir ili greška validacije koju najavljuje čitač
ekrana — v. poglavlje 4.3. Slike numerisati nastavkom postojećeg redosleda (Slika 5,
Slika 6, ...) i dodati u Popis slika u Prilozima.]*

## 4.3 Prilagođavanje pristupačnosti

Aplikacija je naknadno prilagođena WCAG 2.2 smernicama nivoa AA [20], sa ciljem da bude u
potpunosti upotrebljiva uz pomoć čitača ekrana i tastature, bez oslanjanja na miša.
Sprovedene izmene mogu se svrstati u pet celina.

**Struktura i navigacija.** Dodat je "preskoči na sadržaj" link kao prvi fokusabilan
element svake stranice, koji tastaturnom korisniku omogućava da zaobiđe navigaciju;
glavni navigacioni meni ima imenovan landmark, a tabele u administratorskim pregledima
imaju eksplicitno definisana zaglavlja kolona.

**Forme.** Svih šest formi u aplikaciji izmenjeno je tako da svaka labela bude
programski povezana sa svojim poljem, da se greške validacije automatski najavljuju
čitaču ekrana čim se pojave, i da dugmad za višestruki izbor (npr. žanrova) prenose
svoje stanje (izabrano/nije izabrano). Tokom ovog rada otkriven je i ispravljen i
funkcionalni nedostatak: forma za registraciju validirala je sedam polja čije poruke o
grešci se korisniku nikada nisu prikazivale.

**Interaktivni elementi.** Padajući meni notifikacija i mobilni navigacioni meni
implementirani su korišćenjem WAI-ARIA atributa [21] (npr. `aria-expanded`,
`aria-haspopup`) tako da najavljuju svoje stanje (otvoreno/zatvoreno, broj nepročitanih
notifikacija), da se zatvaraju na taster Escape uz vraćanje fokusa, i da ne zavise od
veličine ekrana za osnovnu upotrebljivost — pre ove izmene, prijavljeni korisnici na
malim ekranima nisu imali nijedan način da dođu do stranica specifičnih za svoju ulogu.

**Kontrast boja.** Kontrast teksta izmeren je po tačnoj formuli relativne luminance iz
WCAG specifikacije, ne procenjen vizuelno. Otkriveno je da je dominantna boja
sekundarnog teksta u aplikaciji davala kontrast od 3,07 do 4,24:1 u zavisnosti od
pozadine (ispod praga od 4,5:1 potrebnog za normalan tekst), zbog čega je zamenjena
nijansom koja daje kontrast od 7,87:1; analogna ispravka sprovedena je i nad bojama
dugmadi.

**Ne-tekstualni sadržaj.** Dekorativni simboli označeni su tako da ih čitač ekrana
preskače kada tekst pored njih već nosi isto značenje, dok je za grafikon metrika modela
(koji kao SVG element nema tekstualni ekvivalent) dodata paralelna, vizuelno skrivena
tabela sa istim podacima, kao tekstualna alternativa.

Prilagođenost je potom provereno ispitana i manuelno, čitačem ekrana NVDA, kroz devet
scenarija koji obuhvataju sve navedene celine (v. poglavlje 5.2) — svih devet scenarija
uspešno je prošlo.
