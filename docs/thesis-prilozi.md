# Prilozi — Popis slika i Popis tabela

*(Broj strane se popunjava automatski ako se u Word-u koristi References → Captions za
svaku sliku/tabelu, i References → Insert Table of Figures/Tables za sam popis — tada se
ažurira sam kad se rad završi. Ako se unosi ručno, broj strane treba dodati naknadno,
kada je konačan prelom teksta poznat.)*

---

## Popis slika i grafika

| Br. | Naziv | Poglavlje | Strana |
|---|---|---|---|
| Slika 1 | Dijagram aktera sistema | Drugo poglavlje | |
| Slika 2 | Sekvencijalni dijagram — generisanje ML preporuka | Drugo poglavlje | |
| Slika 3 | Visokonivojska arhitektura sistema | Četvrto poglavlje | |
| Slika 4 | Dijagram entiteta i veza | Četvrto poglavlje | |
| Slika 5 | Stranica sa preporukama — kartice izvođača sa skorom i objašnjenjem | Četvrto poglavlje | |
| Slika 6 | Profil izvođača sa listom zakazanih nastupa | Četvrto poglavlje | |
| Slika 7 | Forma prilagođena WCAG standardima (fokusni okvir / greška validacije) | Četvrto poglavlje | |

*Napomena: Slike 1–4 trenutno postoje kao mermaid dijagrami u izvornoj dokumentaciji
(`use-cases.md`, `architecture.md`, `database-design.md`) i moraju se pre unošenja u
Word izvesti kao prave slike (npr. preko mermaid.live — nalepiti kod, izvesti kao
PNG/SVG u preporučenoj rezoluciji 300 dpi). Slike 5–7 su snimci ekrana stvarne
pokrenute aplikacije — v. napomenu u `thesis-poglavlje-4-implementacija.md`, odeljak
4.2.3, za tačan opis šta svaki snimak treba da prikaže. V. i napomene u
`thesis-poglavlje-2-definisanje-zahteva.md` za mesto umetanja Slika 1–2.*

## Popis tabela

| Br. | Naziv | Poglavlje | Strana |
|---|---|---|---|
| Tabela 1 | Pregled analiziranih međunarodnih platformi | Prvo poglavlje | |
| Tabela 2 | Poređenje funkcionalnosti analiziranih platformi sa predloženim rešenjem | Prvo poglavlje | |
| Tabela 3 | Nefunkcionalni zahtevi sistema | Drugo poglavlje | |
| Tabela 4 | Matrica dostupnosti funkcionalnosti po korisničkim ulogama | Drugo poglavlje | |
| Tabela 5 | Rezultati poređenja algoritama na Spotify Tracks Dataset-u, test skup | Treće poglavlje | |
| Tabela 6 | Težine faktora u formuli rangiranja preporuka | Treće poglavlje | |
| Tabela 7 | Rezultati predikcije tipa događaja na lokalnom dataset-u | Treće poglavlje | |
| Tabela 8 | Komunikacija između komponenti sistema | Četvrto poglavlje | |
| Tabela 9 | Glavni entiteti modela podataka | Četvrto poglavlje | |
| Tabela 10 | Pregled automatizovanih testova po sloju sistema | Peto poglavlje | |
| Tabela 11 | Rezultati manuelnog testiranja čitačem ekrana NVDA | Peto poglavlje | |

---

## Popis skraćenica

Uputstvo (Prilog "Prilozi") pored slika i tabela traži i **popis korišćenih skraćenica sa
značenjem** (u Word-u se može automatizovati preko References → Index, ali ta funkcija
pravi indeks pojmova iz označenog teksta, ne pravi rečnik — jednostavnije je ručno
održavati ovu tabelu). Lista ispod je provereno usklađena sa skraćenicama koje se **stvarno
pojavljuju** u finalnom tekstu rada (Uvod–Zaključak), abecednim redom, ne uopštena lista
svih mogućih IT skraćenica.

| Skraćenica | Značenje |
|---|---|
| AI | Artificial Intelligence (veštačka inteligencija) |
| API | Application Programming Interface |
| AUC | Area Under the Curve (deo metrike ROC AUC) |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| DJ | Disc Jockey |
| EPK | Electronic Press Kit |
| ER (dijagram) | Entity-Relationship (dijagram entiteta i veza) |
| F1 (skor/mera) | Harmonijska sredina preciznosti (precision) i opoziva (recall) |
| HTTP(S) | HyperText Transfer Protocol (Secure) |
| JWT | JSON Web Token |
| ML | Machine Learning (mašinsko učenje) |
| NVDA | NonVisual Desktop Access |
| ORM | Object-Relational Mapping |
| REST | Representational State Transfer |
| ROC | Receiver Operating Characteristic |
| SHAP | SHapley Additive exPlanations |
| SVG | Scalable Vector Graphics |
| UI | User Interface |
| WAI-ARIA | Web Accessibility Initiative — Accessible Rich Internet Applications |
| WCAG | Web Content Accessibility Guidelines |

*Napomena: CB (content-based) i CF (collaborative filtering) se u samom tekstu rada
uvek pišu razloženo ("na sadržaju zasnovan"/"kolaborativno filtriranje"), nikad kao
skraćenice — zato namerno nisu na ovoj listi. Ako u finalnoj redakciji teksta ipak
negde upotrebiš CB/CF kao skraćenicu, dodaj ih ovde pre predaje.*
