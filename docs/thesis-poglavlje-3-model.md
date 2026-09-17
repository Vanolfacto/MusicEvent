# Treće poglavlje — Razvoj i evaluacija modela mašinskog učenja

*(Nacrt teksta poglavlja. Treće lice; opisni delovi u sadašnjem vremenu, a delovi koji
opisuju sprovedeno istraživanje i dobijene rezultate u prošlom vremenu, prema pravilu
Uputstva da se prošlo vreme koristi u delovima "Metode istraživanja, Rezultati i
Zaključci". Brojevi u tabelama su stvarni, dobijeni pokretanjem pipeline-a opisanog u
`docs/machine-learning-methodology.md`, `docs/model-evaluation.md` i
`ml-service/research/README.md` — nisu ilustrativni.)*

---

Centralni deo sistema preporuke izvođača jeste model mašinskog učenja. U ovom poglavlju
opisuju se izvori i postupak prikupljanja podataka, priprema podataka, obučavanje i
poređenje algoritama, kao i konačna evaluacija — kako na nivou samog klasifikacionog
modela, tako i na nivou celokupnog mehanizma preporuke koji taj model koristi.

## 3.1 Izvori i prikupljanje podataka

Prvi korak u definisanju ML zadatka bila je provera da li postoji javno dostupan skup
podataka o stvarnim booking odlukama — koji je konkretan izvođač angažovan za koji
konkretan događaj. Takav skup podataka ne postoji ni na jednoj javno dostupnoj platformi,
budući da su ovi podaci privatna poslovna imovina booking agencija. Zbog toga je ML
zadatak definisan nad dva odvojena, ali komplementarna izvora realnih podataka.

### 3.1.1 Spotify Tracks Dataset

Prvi izvor je **Spotify Tracks Dataset** [13], javno dostupan skup od 114.000 pesama sa
Spotify platforme, preuzet programski sa stabilnog javnog ogledala (Hugging Face
Datasets), bez potrebe za registracijom ili API ključem, čime je obezbeđena potpuna
reproduktivnost pipeline-a. Nad ovim skupom definisan je stvaran, dobro određen ML
zadatak: predikcija da li je pesma **popularna** (`popularity` iznad medijana na skali
0–100 koju izračunava sam Spotify na osnovu broja i skorašnjosti reprodukcija) na osnovu
njenih audio karakteristika (ples-ljivost, energija, glasnoća, akustičnost,
instrumentalnost, valenca, tempo i drugo) i žanra. Nakon čišćenja podataka (uklanjanje
duplikata i nedostajućih vrednosti) skup je sveden na 113.550 redova, sa balansiranim
klasama (50,01% naspram 49,99%) zahvaljujući podeli po medijani.

### 3.1.2 Lokalni dataset realnih izvođača

Mentor je tokom izrade rada primetio da globalna popularnost strimovanja sa Spotify-ja
ne odražava nužno lokalnu potražnju za nastupima uživo — žanr koji je globalno popularan
ne mora biti onaj koji se realno angažuje za svadbe, klupske nastupe ili festivale u
lokalnoj sceni. Kao odgovor na ovu primedbu, ručno je prikupljen drugi, nezavisan skup
podataka: **61 realan, imenovan lokalni izvođač/bend** iz devet nezavisnih srpskih
izvora — šest booking agencija (Republika Bend, Vivo Bendovi, PBS Novi Sad, Event Centar,
Glitch Records, BitefArtCafe), jednog otvorenog imenika (Bendovi Srbije) i dva realna
festivalska programa (Guča Sabor Trubača, Nišville Jazz Festival). Za svaki red
zabeleženi su ime izvođača, grad, žanr preslikan na 12 kategorija koje aplikacija
koristi, tip sastava, i tip događaja za koji se izvođač realno angažuje, uz kolonu koja
naznačava da li je tip događaja nezavisno potvrđen po izvođaču ili izveden iz opšte
kategorije izvora — radi potpune transparentnosti metodologije.

Honorar i konkretna dostupnost po datumu namerno nisu uključeni u ovaj dataset: nijedan
javni izvor ih ne objavljuje, jer predstavljaju privatan, operativni podatak agencija —
ova granica javno dostupnih podataka potvrđuje mentorovu prvobitnu primedbu i istovremeno
objašnjava zašto ta dva polja u aplikaciji postoje isključivo kao vrednosti koje sami
izvođači unose.

## 3.2 Priprema podataka i sprečavanje curenja podataka

Nad Spotify dataset-om primenjen je `scikit-learn` [14] `Pipeline` u kome se predprocesiranje
(imputacija nedostajućih vrednosti, standardizacija numeričkih karakteristika i
kodiranje kategoričke karakteristike žanra) uči isključivo nad trening skupom, dok se
test skup koristi isključivo za finalnu evaluaciju — čime se sprečava curenje podataka
(*data leakage*) iz test skupa u proces treniranja. Podela na trening i test skup
izvedena je u odnosu 80/20, uz stratifikaciju prema ciljnoj promenljivoj, a dodatno je
primenjena petostruka stratifikovana unakrsna validacija (5-fold cross-validation) nad
trening skupom radi pouzdanije procene performansi.

## 3.3 Obučavanje i poređenje algoritama

Upoređena su tri algoritma klasifikacije [15]: logistička regresija (bazni linearni
model), Random Forest [16] (nelinearni ansambl sa procenom značaja karakteristika) i
Gradient Boosting (ansambl zasnovan na buskovanju). Sva tri su trenirana i evaluirana
pod identičnim uslovima — ista podela trening/test skupa, ista petostruka unakrsna
validacija, isti skup karakteristika. Tabela 5 prikazuje rezultate sva tri algoritma na
test skupu poslednjeg treniranja.

*Tabela 5. Rezultati poređenja algoritama na Spotify Tracks Dataset-u, test skup (izvor:
sopstveno istraživanje)*

| Metrika | Logistička regresija | Random Forest | Gradient Boosting |
|---|---|---|---|
| Accuracy | **0,7757** | 0,7295 | 0,7454 |
| Precision | **0,7901** | 0,7072 | 0,7097 |
| Recall | 0,7951 | 0,8505 | **0,8928** |
| F1-skor | **0,7926** | 0,7722 | 0,7908 |
| ROC AUC | **0,8574** | 0,8095 | 0,8279 |

Finalni model biran je prema najvišoj F1 meri na test skupu, uz ROC AUC kao sekundarni
kriterijum. Logistička regresija postiže najviši F1 (0,7926) i najviši ROC AUC (0,8574)
od sva tri algoritma, iako Gradient Boosting ima nešto viši recall (0,8928 naspram
0,7951) — što znači da Gradient Boosting ređe promaši stvarno popularnu pesmu, ali na
račun preciznosti (0,7097 naspram 0,7901): češće pogrešno označava nepopularnu pesmu
kao popularnu. Pošto F1-skor (harmonijska sredina preciznosti i opoziva) predstavlja
ravnotežu između te dve greške i pritom favorizuje logističku regresiju, a razlika u
ROC AUC-u dodatno ide u njenu korist, izabrana je **logistička regresija** kao konačan
model (verzija 2.0.0). Dodatna prednost logističke regresije je i jednostavnost — kao
linearni model, njeni koeficijenti su direktno tumačivi, što je u skladu sa opštim
ciljem rada da preporučivački mehanizam ostane transparentan i objašnjiv, a ne samo
tačan.

## 3.4 Definisanje preporučivačkog sistema

Trenirani klasifikator radi nad audio karakteristikama pojedinačnih pesama, dok se
preporuka izvođača za događaj oslanja na potpuno drugačiji skup podataka — operativne
karakteristike para događaj–izvođač (podudaranje žanra, budžeta, grada i tipa, prosečna
ocena, dostupnost, istorijska uspešnost). Ova dva sloja povezana su na sledeći način:

1. Istrenirani model pušten je preko celog Spotify dataset-a, a njegove predikcije
   agregirane su po žanrovskom bucket-u koji odgovara 12 žanrova aplikacije (mapiranje
   125 Spotify mikro-žanrova, npr. `alt-rock`, `hard-rock`, `punk-rock` → `ROCK`). Rezultat
   je realan, iz modela izveden broj popularnosti po žanru — sa napomenom da on odražava
   **globalnu popularnost strimovanja**, ne lokalnu potražnju za bukingom.
2. Nad lokalnim dataset-om (v. 3.1.2 i 3.5) izračunat je drugi signal — koliko se
   određeni žanr stvarno bira za konkretan tip događaja u lokalnoj sceni — koji direktno
   odgovara na ograničenje prvog signala.
3. Oba signala kombinovana su sa operativnim karakteristikama para događaj–izvođač u
   transparentnu, ponderisanu formulu rangiranja.

Ovako definisan sistem eksplicitno se karakteriše kao **na sadržaju zasnovan
(content-based) preporučivač**, ne kao direktan klasifikator para događaj–izvođač (takav
label ne postoji ni u jednom javno dostupnom skupu podataka), niti kao sistem
kolaborativnog filtriranja [17] — za pouzdano kolaborativno filtriranje neophodna je
istorija interakcija velikog broja korisnika, koja na novoj platformi ne postoji (poznat
*cold-start* problem). Tabela 6 prikazuje ponderisanu formulu rangiranja.

*Tabela 6. Težine faktora u formuli rangiranja preporuka (izvor: `app/ml/predictor.py`,
`SCORE_WEIGHTS`)*

| Faktor | Težina | Poreklo |
|---|---|---|
| Podudaranje žanra | 0,26 | Operativni podatak platforme |
| Podudaranje budžeta | 0,19 | Operativni podatak platforme |
| Isti grad | 0,09 | Operativni podatak platforme |
| Podudaranje tipa izvođača | 0,07 | Operativni podatak platforme |
| Prosečna ocena | 0,13 | Operativni podatak platforme |
| Dostupnost izvođača | 0,05 | Operativni podatak platforme |
| Istorijska uspešnost na sličnim događajima | 0,08 | Operativni podatak platforme |
| Popularnost žanra | 0,04 | Klasifikacioni model nad Spotify dataset-om |
| Pogodnost žanra za tip događaja | 0,09 | Lokalni ručno prikupljeni dataset |

Objašnjenja preporuka generišu se kao lista razloga po pravilima (npr. "žanr se
podudara", "izvođač se nalazi u istom gradu", "žanr izvođača se često bira za ovaj tip
događaja"), izvedenih iz istih karakteristika koje ulaze u formulu, čime je korisniku
transparentno predstavljeno zašto je svaki izvođač predložen.

**Tretman novoregistrovanog izvođača (cold-start problem).** Prosečna ocena izvođača
(`averageRating`) u bazi podataka ima podrazumevanu vrednost 0 sve dok organizator ne
oceni bar jedan nastup. Bukvalno korišćenje te vrednosti u formuli rangiranja
sistemski bi kažnjavalo svakog novog izvođača — ne zato što ima loše ocene, već zato
što ih još nema. Zbog toga faktor prosečne ocene ne koristi `averageRating` direktno:
ukoliko izvođač nema nijedan evidentiran nastup (`totalPerformances = 0`), taj faktor
dobija neutralnu vrednost (0,6, približno tri od pet zvezdica) umesto stvarne, prazne
ocene, čime novi izvođač ostaje konkurentan u preporukama dok se ne prikupe prve
recenzije. Tek nakon prvog evidentiranog nastupa faktor prelazi na stvarnu prosečnu
ocenu. Isti princip primenjen je i na faktor istorijske uspešnosti na sličnim
događajima (v. Tabelu 6): izvođač bez ijednog završenog nastupa istog tipa događaja
dobija neutralnu vrednost 0,5, dok izvođač koji jeste nastupao na događaju istog tipa
ali još nije ocenjen dobija blago pozitivnu vrednost 0,55 — razlikovanje "nema
iskustva" od "ima iskustvo, čeka se ocena".

**Ponovno obučavanje modela.** Model se ne obučava u realnom vremenu — ponovno
treniranje (svih pet koraka pipeline-a: priprema podataka, predobrada, treniranje i
poređenje sva tri algoritma, i ponovno izračunavanje oba signala izvedena iz podataka)
pokreće se ručno, putem `/train` rute ML servisa koju poziva administrator iz
administratorskog panela aplikacije (v. poglavlje 4). Svako pokretanje ažurira i
prikazuje datum poslednjeg treniranja i postignute metrike, tako da je uvek jasno koliko
je model "svež" u odnosu na trenutno stanje podataka.

## 3.5 Evaluacija lokalnog signala pogodnosti žanra za tip događaja

Nad lokalnim dataset-om od 61 izvođača testirano je da li žanr i tip sastava predviđaju
stvarni tip događaja (koncert, svadba, klupski nastup, festival) bolje od slučajnog
pogađanja. Tabela 7 prikazuje rezultate.

*Tabela 7. Rezultati predikcije tipa događaja na lokalnom dataset-u, 5-fold unakrsna
validacija (izvor: sopstveno istraživanje)*

| Model | Macro F1-skor | Baseline (većinska klasa) |
|---|---|---|
| Logistička regresija | 0,452 | 0,410 |
| Random Forest (50 stabala) | **0,594** | 0,410 |

Random Forest algoritam pouzdano razlikuje kategorije svadba (F1=0,86) i koncert
(F1=0,68), sa slabijim ali prisutnim signalom za festival (F1=0,67); kategorija klupski
nastup (F1=0,17) nije pouzdano razlučena, usled malog broja primera (7) i preklapanja
žanra sa ostalim kategorijama. Na najstrožem podskupu, u kome je tip događaja nezavisno
potvrđen po izvođaču (a ne izveden iz opšte kategorije izvora), signal nije statistički
potvrđen — ali ovaj podskup slučajno ne sadrži primere kategorija koncert i klupski
nastup, pa ne testira baš onu razliku gde je signal na celom dataset-u bio najizraženiji.
Ovo se u radu tretira kao otvoreno ograničenje metodologije, ne kao opovrgnut nalaz.

Zaključak je da postoji merljiv, domenski smislen signal — dovoljan da opravda njegovu
nisku ponderisanu ulogu u formuli rangiranja (0,09 od ukupno 1,0) — ali da dataset od 61
reda ostaje mali za produkcioni model visoke pouzdanosti, zbog čega signal namerno pada
na neutralnu vrednost (0,5) kad god lokalni uzorak za dati žanr ili tip događaja nije
dovoljno velik da bi bio pouzdan.

## 3.6 Ograničenja

Nijedan od dva korišćena dataset-a ne sadrži podatke o stvarnim, ostvarenim booking
odlukama, zbog čega model ne predviđa "uspešnost rezervacije" direktno, već doprinosi
preporukama kroz dva posredna, ali realna signala. Ne postoji mehanizam učenja u realnom
vremenu (*online learning*) — ponovno treniranje se pokreće ručno. Mapiranje Spotify
mikro-žanrova, kao i preslikavanje lokalnih podataka na 12 žanrova aplikacije,
predstavlja pojednostavljenje stvarne raznovrsnosti muzičkih stilova. Konačno, lokalni
dataset je po obimu skroman za jedan istraživački rad realizovan u okviru master
strukovnih studija, što je razlog zbog kog se njegov signal u formuli namerno tretira
kao dopunski, a ne dominantan faktor.
