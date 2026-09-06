# Pregled srodnih radova (Related Work)

Osnova za poglavlje "Pregled srodnih radova" u tekstu master rada — poređenje aplikacije
sa realnim, postojećim servisima za booking muzičkih izvođača. Sve platforme dole su
proverene (WebSearch/WebFetch), sa jasno označenim ograničenjima gde podatak nije mogao
biti nezavisno potvrđen — u skladu sa zahtevom Uputstva da "referenca treba da bude ažurna
i potpuno tačna".

## Ključan nalaz

**Nijedna proverena postojeća platforma u ovoj oblasti ne oglašava stvaran ML/AI model za
preporuku/uparivanje izvođača.** Pretraga i sortiranje na tim platformama su zasnovani na
filterima (grad, žanr, datum, cena) ili neobjavljenom "best match" sortiranju (The Bash),
ne na treniranom modelu. Jedina platforma pronađena u širem istraživanju koja je otvoreno
tvrdila da koristi "proprietary algorithm" za uparivanje (Giggem, mreža za povezivanje
muzičara radi saradnje, ne booking izvođača za događaje) **više ne postoji** (ugašena).
Ovo direktno podržava tvrdnju da je ML modul zasnovan na realnim podacima (žanr/budžet/
grad/ocena/dostupnost/istorija + naučeni signal popularnosti žanra) stvarna razlika u
odnosu na postojeća rešenja, ne kozmetička.

## Međunarodne platforme

| Platforma | Šta radi | Za koga | Ključne funkcije | AI/ML uparivanje? |
|---|---|---|---|---|
| **GigSalad** (gigsalad.com) | Otvoreno tržište koje povezuje organizatore sa izvođačima/dobavljačima | Obe strane | Pretraga/filteri, zahtevi za ponudu, poruke unutar platforme, plaćanje unapred, recenzije | Ne — standardna pretraga i ponude, bez ML tvrdnje |
| **The Bash** (thebash.com, deo The Knot Worldwide, ranije GigMasters) | Otvoreno tržište za booking izvođača/dobavljača za venčanja, proslave, korporativne događaje | Obe strane | Pretraga sa neobjavljenim "best match" sortiranjem, tok upit→ponuda, recenzije | Ne (mehanizam sortiranja nije obelodanjen/potvrđen kao ML) |
| **Encore Musicians** (encoremusicians.com) | Booking platforma za žive muzičare | Obe strane | Pretraga/booking, profili izvođača | Nejasno — samo marketinška fraza "cutting edge tech", bez tehničkih detalja; **nije potvrđeno** kao stvaran ML mehanizam |
| **Airgigs** (airgigs.com) | Tržište za **udaljene** sesione muzičare/inženjere (snimanje, ne uživo nastupi) | Obe strane | Oglasi za projekte, ponude, fajlovi, recenzije | Ne — različit segment tržišta (udaljeno snimanje, ne booking za događaje uživo) |
| **Sonicbids** | Elektronski press-kit i prijava na festivale/prilike | Pretežno izvođači | Hosting EPK-a, prijave na prilike | Ne — nije tržište za booking, drugačija kategorija |
| **Giggem** (istorijski primer) | Mreža za povezivanje muzičara/industrije radi saradnje | Muzičari/industrija (ne organizatori) | Tvrdio "proprietary algorithm" za uparivanje profila | Da (tvrđeno) — ali platforma je **ugašena**; koristan kontraprimer |

*Napomena: Bandsintown (otkrivanje koncerata za fanove) i HeadlinerPlanet (nije pronađen
nijedan trag postojanja u više pokušaja pretrage) namerno su izostavljeni iz glavnog
poređenja — prvi je pogrešna kategorija tržišta (fanovi, ne organizatori), drugi nije
mogao biti nezavisno potvrđen kao aktivna platforma.*

## Regionalne (srbijanske) platforme

| Platforma | Model | Šta radi | Booking/plaćanje | Algoritam? |
|---|---|---|---|---|
| **MM Estrada** (mmestrada.com) | Kurirana agencija (ne otvoreno tržište) | Regionalna agencija sa slojevitim rosterom bendova za svadbe/događaje ("Dijamantska liga", "VIP bendovi") | Samo telefon/email upit, bez integrisanog plaćanja | Alatka "Bend za tren" filtrira po datumu/lokaciji/kategoriji/veličini/ceni — **klasičan filter, ne naučeni model**, uprkos imenu koje zvuči algoritamski |
| **Bendovi Srbije** (bendovisrbije.com) | Otvoreni imenik — bendovi se sami prijavljuju | Imenik 100+ nezavisnih srpskih bendova, filtriranje po gradu/sastavu/žanru/tipu događaja | Samo kontakt podaci, bez transakcija u platformi | Nema; postoji uredničko preporučivanje ("Naša preporuka"), ne automatizovano |
| **Vencanja.com** (muzička sekcija) | Imenik u okviru šireg portala za venčanja | Lista muzičkih izvođača kao deo opšteg imenika dobavljača za venčanja | Samo kontakt | Nema |
| **Vivo Bendovi** (vivobendovi.com) | Kurirana agencija — sopstveni brend bendova | Rezerviše isključivo svoje sopstvene sastave (+ par partnerskih dodataka) | Samo kontakt | Nema |

## Poređenje sa predloženom aplikacijom

| Funkcija | GigSalad / The Bash | MM Estrada / agencije | Bendovi Srbije | **Ova aplikacija** |
|---|---|---|---|---|
| Dvostrano tržište (organizator ↔ izvođač) | Da | Ne (samo organizator kontaktira agenciju) | Delimično (kontakt, ne aplikacija) | **Da** |
| Prijave I pozivi kroz platformu | Delimično (upit/ponuda) | Ne | Ne | **Da** (dva odvojena toka: APPLY i INVITE) |
| Zakazivanje i praćenje statusa nastupa | Ne (van platforme) | Ne | Ne | **Da** |
| Recenzije nakon nastupa | Da | Ne | Ne | **Da** |
| Preporuka izvođača zasnovana na modelu mašinskog učenja treniranom na realnim podacima | **Ne** (filter/nepoznato sortiranje) | **Ne** (filter) | **Ne** | **Da** |
| Objašnjenje preporuke korisniku (zašto je izvođač predložen) | Ne | Ne | Ne | **Da** |

## Zaključak za poglavlje

Postojeća rešenja se dele na (a) otvorena tržišta sa ručnom pretragom/filterima
(GigSalad, The Bash) i (b) kurirane regionalne agencije ili imenike bez integrisanog toka
prijava/zakazivanja/recenzija (MM Estrada, Bendovi Srbije, Vivo Bendovi). Nijedno od njih
ne kombinuje ceo životni ciklus (prijava → prihvatanje → zakazivanje → recenzija) sa
transparentnim, na realnim podacima treniranim mehanizmom preporuke — što je tačno mesto
gde se ova aplikacija razlikuje.

## Izvori (za popis literature)

- GigSalad. https://www.gigsalad.com/, посећено: [POPUNI datum]
- The Bash. https://www.thebash.com/, посећено: [POPUNI datum]
- Encore Musicians. https://encoremusicians.com/, посећено: [POPUNI datum]
- Airgigs. https://airgigs.com/, посећено: [POPUNI datum]
- MM Estrada. https://mmestrada.com/, посећено: [POPUNI datum]
- Bendovi Srbije. https://bendovisrbije.com/, посећено: [POPUNI datum]
