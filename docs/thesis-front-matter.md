*(Napomena za tebe, ovo se NE unosi u sam rad kao naslov — profesor je izričito rekao da
je zaseban naslov "Sažetak (SR/EN) i Izjava o akademskoj čestitosti" suvišan. Sažetak,
Abstract i Izjava idu kao TRI ODVOJENA, ravnopravna naslova, bez ikakvog zajedničkog
naslova iznad njih.)*

**Gde ide šta — tačan redosled strana, odmah posle naslovne strane a PRE Sadržaja:**

1. Naslovna strana (već imaš)
2. *(opciono: zahvalnica/posveta — nemamo ništa pripremljeno, preskoči ako ne želiš)*
3. **Sažetak** (naslov "Sažetak", pa tekst + ključne reči) — nova strana
4. **Abstract** (naslov "Abstract", pa tekst + Keywords) — nova strana
5. **Izjava o akademskoj čestitosti** (naslov "Izjava o akademskoj čestitosti") — nova strana
6. Sadržaj (već imaš)
7. Uvod... (već imaš, nastavlja se kao do sada)

**Važno — Sažetak/Abstract/Izjava se NE unose u Sadržaj** (profesorova eksplicitna
primedba). Ako koristiš Word-ovo automatsko generisanje sadržaja (References → Table of
Contents, kako Uputstvo preporučuje), ono automatski povlači sve pasuse sa built-in
"Heading" stilom. Zato naslove "Sažetak", "Abstract" i "Izjava o akademskoj čestitosti"
NE formatiraj kao Heading 1/2 stil — ukucaj ih kao običan pasus i ručno primeni samo
izgled (Verdana, Bold, 12pt, velika slova, prema Uputstvu za poднaslove), bez stila koji
Word prepoznaje za sadržaj. Ostali naslovi u radu (Uvod, poglavlja, Zaključak,
Literatura, Prilozi, Radna biografija) ostaju na Heading stilu kao i do sada, jer njih
Sadržaj treba da obuhvati.

---

## Sažetak

Ovaj rad predstavlja veb aplikaciju za preporuku izvođača za muzičke događaje primenom
mašinskog učenja. Predmet rada je projektovanje, razvoj i evaluacija informacionog
sistema koji povezuje organizatore muzičkih događaja i izvođače, sa modulom preporuke
zasnovanim na modelu mašinskog učenja treniranom na realnim podacima, i prilagođenog
standardima pristupačnosti (WCAG) za korisnike sa oštećenjem vida.

Budući da ne postoji javno dostupan skup podataka o stvarnim booking odlukama, ML
zadatak je definisan nad dva realna, javno dostupna i ručno prikupljena izvora: Spotify
Tracks Dataset-om (114.000 pesama, stratifikovan uzorak od 28.694 reda zbog memorijskih
ograničenja hostinga), nad kojim je obučen i evaluiran klasifikacioni model
(logistička regresija, F1=0,7714, ROC AUC=0,8454) za predikciju popularnosti pesme iz
audio karakteristika, i ručno prikupljenim datasetom od 61 realnog lokalnog izvođača, iz
kog je izveden signal pogodnosti žanra za konkretan tip događaja (Random Forest, macro
F1=0,594 naspram baseline-a 0,410). Oba signala kombinovana su sa operativnim
karakteristikama para događaj–izvođač u transparentnu, na sadržaju zasnovanu
(content-based) formulu rangiranja.

Sistem je realizovan kao tri nezavisna servisa (React klijent, Node.js/Express server,
Python/FastAPI ML servis) sa PostgreSQL bazom podataka. Aplikacija je dodatno
prilagođena WCAG 2.2 smernicama nivoa AA, potvrđeno merenjem kontrasta boja i manuelnim
testiranjem čitačem ekrana NVDA kroz devet scenarija, od kojih su svi uspešno prošli.
Tehnička ispravnost sistema proverena je sa 72 automatizovana testa kroz sva tri sloja
sistema.

Poređenje sa postojećim platformama u ovoj oblasti pokazalo je da nijedna od njih ne
kombinuje kompletan tok angažovanja izvođača sa transparentnim mehanizmom preporuke
zasnovanim na modelu mašinskog učenja treniranom na realnim podacima, što razvijeni
sistem izdvaja od postojeće prakse.

**Ključne reči:** mašinsko učenje, sistem preporuke, veb aplikacija, pristupačnost,
muzički događaji

---

## Abstract

This paper presents a web application for recommending performers for music events
using machine learning. The subject of the paper is the design, development, and
evaluation of an information system that connects music event organizers with
performers, featuring a recommendation module based on a machine learning model trained
on real data, and adapted to accessibility standards (WCAG) for users with visual
impairments.

Since no publicly available dataset of actual booking decisions exists, the ML task was
defined over two real, publicly available and manually collected data sources: the
Spotify Tracks Dataset (114,000 tracks, downsampled to a stratified 28,694-row subset
due to hosting memory constraints), over which a classification model (logistic
regression, F1=0.7714, ROC AUC=0.8454) was trained and evaluated to predict track
popularity from audio features, and a manually collected dataset of 61 real local
performers, from which a signal of genre suitability for a specific event type was
derived (Random Forest, macro F1=0.594 versus a baseline of 0.410). Both signals are
combined with operational characteristics of the event–performer pair into a
transparent, content-based ranking formula.

The system is implemented as three independent services (a React client, a
Node.js/Express server, and a Python/FastAPI ML service) with a PostgreSQL database. The
application was further adapted to WCAG 2.2 level AA guidelines, confirmed through
precise color-contrast measurement and manual testing with the NVDA screen reader across
nine scenarios, all of which passed successfully. The technical correctness of the
system was verified with 72 automated tests across all three layers.

A comparison with existing platforms in this domain showed that none of them combine the
complete performer-engagement lifecycle with a transparent recommendation mechanism
based on a machine learning model trained on real data, which distinguishes the
developed system from existing practice.

**Keywords:** machine learning, recommender system, web application, accessibility,
music events

---

## Izjava o akademskoj čestitosti

*(Tačan tekst propisan Prilogom 2 Uputstva, popunjen tvojim podacima, sa izabranim
muškim rodom — Uputstvo daje oblik "student/kinja" jer je univerzalan za oba pola, ti
zadržavaš samo muški oblik. Latinica, dosledno ostatku rada. Format naslova i redosled
polja prate Prilog 2 doslovno — profesor je tražio da izgleda baš kao u Uputstvu.)*

IZJAVA O AKADEMSKOJ ČESTITOSTI

Student: Vanja Stojilković

Broj indeksa: 17/24

Student master strukovnih studija: Vanja Stojilković

Autor završnog rada na master strukovnim studijama pod nazivom: **Veb aplikacija za
preporuku izvođača za muzičke događaje primenom mašinskog učenja**

Potpisivanjem izjavljujem:

- da je rad isključivo rezultat mog sopstvenog istraživačkog rada;
- da sam rad i mišljenja drugih autora koje sam koristio u ovom radu naznačio ili
  citirao u skladu sa Uputstvom za citiranje i izradu popisa literature;
- da su svi radovi i mišljenja drugih autora navedeni u spisku literature/referenci koji
  su sastavni deo ovog rada i pisani u skladu sa Uputstvom za citiranje i izradu popisa
  literature;
- da sam dobio sve dozvole za korišćenje autorskog dela koji se u potpunosti/celosti
  unose u predati rad i da sam to jasno naveo;
- da sam svestan da je plagijat korišćenje tuđih radova u bilo kom obliku (kao citata,
  parafraza, slika, tabela, dijagrama, dizajna, planova, fotografija, filma, muzike,
  formula, veb sajtova, kompjuterskih programa i sl.) bez navođenja autora ili
  predstavljanje tuđih autorskih dela kao mojih, kažnjivo po zakonu (Zakon o autorskom i
  srodnim pravima, Službeni glasnik Republike Srbije, br. 104/2009, 99/2011, 119/2012,
  29/2016 - odluka US i 66/2019), kao i drugih zakona i odgovarajućih akata Visoke škole
  strukovnih studija za informacione tehnologije u Beogradu;
- da sam svestan da plagijat uključuje i predstavljanje, upotrebu i distribuiranje rada
  predavača ili drugih studenata kao sopstvenih;
- da sam svestan posledica koje kod dokazanog plagijata mogu prouzrokovati na predati
  završni rad na master strukovnim studijama i moj status;
- da je elektronska verzija završnog rada na master strukovnim studijama identična
  štampanom primerku i pristajem na njegovo objavljivanje pod uslovima propisanim
  aktima Visoke škole strukovnih studija za informacione tehnologije.

Beograd, [POPUNI datum potpisivanja]

Potpis studenta: _______________________

*(Ostavi ovu liniju praznu — NE lepi skeniran/fotografisan potpis u dokument. Štampanu
verziju koju predaješ studentskoj službi ćeš fizički potpisati rukom, kako je profesor
i naglasio.)*

---

## Radna biografija (latinica — za sam kraj rada, posle Priloga)

*(Ceo tekst rada je na latinici, pa je biografija ovde prekucana na latinici umesto
ćirilice koja je ranije data za Prijavu teme — koja je bila zaseban dokument.)*

Vanja Stojilković rođen je 20.10.2002. u Beogradu.

Srednju školu (ITHS) završio je u Beogradu 2021. godine. Osnovne strukovne studije
završio je na Visokoj školi strukovnih studija za informacione tehnologije (ITS) u
Beogradu, u periodu 2021–2024. godine. Master strukovne studije na istoj ustanovi
pohađa od 2024. godine.

Od stranih jezika služi se engleskim jezikom na nivou C1.

Radno iskustvo sticao je kroz više praksi u oblasti veb razvoja. Trenutno radi kao Web
Developer Intern u kompaniji Bosch, gde izrađuje i održava email šablone pomoću HTML,
CSS i JavaScript tehnologija. Prethodno je šest meseci radio kao Web Developer Intern u
kompaniji Digital Nexus AI (rad na daljinu), gde je izrađivao veb stranice i komponente
koristeći HTML, CSS, JavaScript, React, Node.js, MongoDB i Next.js, uz usvajanje
Python-a, Express.js-a, Tailwind CSS-a i Docker-a tokom prakse. Tri meseca radio je kao
Front-End Developer Intern u kompaniji 4Bees u Beogradu, razvijajući responzivne veb
stranice pomoću HTML, CSS, JavaScript i React tehnologija. Tri meseca radio je i kao HR
Administrator u kompaniji Clarivate u Beogradu, pružajući podršku HR operacijama kroz
dokumentaciju i rad sa podacima, kao i mesec dana kao Python Developer Intern u ITS-u u
Beogradu.

Samostalno je realizovao nekoliko softverskih projekata, među kojima: veb aplikaciju za
onlajn prodavnicu rasvetnih tela (Light Bulb Store, PHP/MySQL/JavaScript) sa alatima za
administraciju inventara i porudžbina, responzivnu puzzle igru (Iqos Puzzle, React.js),
sajt stomatološke ordinacije sa sistemom za zakazivanje termina (HTML/CSS/JavaScript/PHP)
i browser-based RPG igru (Desperate RPG, HTML/CSS/JavaScript).

Poseduje sertifikate *JavaScript Algorithms and Data Structures* i *Front End
Development Libraries* (freeCodeCamp), kao i sertifikat o praksi u kompaniji Digital
Nexus AI.
