# Uvod

*(Nacrt teksta za poglavlje "Uvod" master rada — prvo lice jednine, prema izuzetku iz
Uputstva. Ciljna dužina: oko 5% rada, cca 3-4 strane u finalnom formatu. Prekucati u
Word dokument rada, prilagoditi stil ako zvuči neprirodno kad se čita naglas.)*

---

Organizovanje muzičkog događaja — bilo da je reč o koncertu, festivalu, venčanju ili
korporativnoj proslavi — u velikoj meri zavisi od jednog koraka koji je i dalje pretežno
ručan: pronalaženja odgovarajućeg izvođača. Organizator mora da uskladi žanr, budžet,
dostupnost, lokaciju i očekivani kvalitet nastupa, pri čemu se najčešće oslanja na lične
kontakte, preporuke poznanika ili pretragu društvenih mreža. Ovakav proces je
fragmentisan, spor i podložan subjektivnoj proceni — dva organizatora sa istim
zahtevima mogu doći do potpuno različitih izbora, jednostavno zato što ne raspolažu
istim krugom kontakata ili istim iskustvom.

Sa druge strane, izvođači — solo umetnici, bendovi i DJ-jevi — nemaju centralizovan
način da budu pronađeni od strane organizatora čiji se događaji poklapaju sa njihovim
žanrom, gradom i profilom. Rezultat je tržište na kome se ponuda i potražnja često ne
susreću efikasno, iako obe strane imaju jasno definisane, merljive kriterijume po kojima
bi mogle da se uparuju.

Ovaj rad polazi od pretpostavke da se veći deo ovog procesa može objektivizovati i
ubrzati primenom informacionog sistema koji centralizuje podatke o događajima i
izvođačima, i koji, umesto ručnog pretraživanja, organizatoru nudi rangiranu listu
najpogodnijih kandidata uz jasno objašnjenje zašto je svaki od njih predložen.

## Motivacija i problem

Prilikom istraživanja postojećih rešenja (detaljno u poglavlju "Pregled povezanih radova")
pokazuje se da platforme u ovoj oblasti pripadaju uglavnom jednoj od dve kategorije: (a)
otvorena tržišta sa pretragom po filterima, bez ikakvog modela koji bi rangirao kandidate
po pogodnosti za konkretan događaj, ili (b) kurirane regionalne agencije i imenici, koji
uopšte nemaju integrisan tok prijava, zakazivanja i ocenjivanja nastupa. Nijedna od
analiziranih platformi ne kombinuje kompletan životni ciklus angažovanja izvođača sa
transparentnim, na realnim podacima zasnovanim mehanizmom preporuke.

Poseban problem predstavlja i sama priroda podataka dostupnih za ovakav zadatak. Ne
postoji javno dostupan skup podataka o stvarnim, ostvarenim booking odlukama — koji je
izvođač angažovan za koji konkretan događaj — jer su takvi podaci privatna poslovna
imovina booking agencija. Ovo ograničenje je ključno oblikovalo metodološki pristup
opisan u ovom radu: umesto da se model mašinskog učenja trenira na veštački
konstruisanim (sintetičkim) podacima koji bi simulirali booking odluke, pristup se zasniva
na kombinovanju **stvarnih, javno dostupnih i ručno prikupljenih podataka** koji jesu
merljivi i dostupni, uz iskreno priznavanje granica onoga što se iz njih može zaključiti.

## Ciljevi rada

Ciljevi ovog rada su:

1. Projektovati i implementirati veb informacioni sistem koji povezuje organizatore
   muzičkih događaja i izvođače, sa kompletnim tokom prijave, ugovaranja, zakazivanja i
   ocenjivanja nastupa.
2. Razviti, obučiti i evaluirati model mašinskog učenja za preporuku izvođača pogodnih
   za konkretan događaj, zasnovan na realnim (javno dostupnim i ručno prikupljenim)
   podacima, i integrisati ga u aplikaciju.
3. Prilagoditi korisnički interfejs aplikacije standardima pristupačnosti (WCAG) kako bi
   bio upotrebljiv za slepe i slabovide korisnike uz pomoć čitača ekrana.

## Istraživačko pitanje i hipoteza

Istraživačko pitanje koje ovaj rad postavlja glasi: **kako se realni, javno dostupni i ručno
prikupljeni podaci o muzičkim izvođačima i događajima mogu iskoristiti za izgradnju
transparentnog, na sadržaju zasnovanog (content-based) sistema preporuke izvođača, koji
objektivizuje i ubrzava proces selekcije u odnosu na ručno pretraživanje?**

Polazna hipoteza je da kombinovanje operativnih karakteristika para događaj–izvođač
(žanr, budžet, grad, tip izvođača, prosečna ocena, dostupnost, istorija uspešnosti) sa
signalima izvedenim iz nadgledanog učenja nad realnim podacima — globalnom
popularnošću žanra, dobijenom iz klasifikacionog modela treniranog na audio
karakteristikama pesama, i lokalnom pogodnošću žanra za konkretan tip događaja,
izvedenom iz ručno prikupljenog lokalnog dataset-a — u transparentnu ponderisanu
formulu daje smislenije i objektivnije rangiranje izvođača od ručnog, subjektivnog
pretraživanja.

## Predmet rada

Predmet rada je projektovanje, razvoj i evaluacija veb aplikacije za organizaciju
muzičkih nastupa i događaja, sa posebnim fokusom na dve celine: (a) modul preporuke
izvođača zasnovan na modelu mašinskog učenja obučenom na realnim podacima o
lokalnoj muzičkoj sceni, i (b) prilagođavanje interfejsa aplikacije potrebama korisnika sa
oštećenjem vida u skladu sa WCAG smernicama pristupačnosti.

## Metode rada

Rad kombinuje nekoliko grupa metoda. Kroz analizu literature i uporednu analizu
postojećih sličnih servisa ispituju se postojeća rešenja i njihova ograničenja. Metode
softverskog inženjerstva — definisanje funkcionalnih i nefunkcionalnih zahteva, use-case
analiza, iterativni razvoj, projektovanje arhitekture klijent–server sistema sa relacionom
bazom podataka i REST API-jem [1] — koriste se za projektovanje i izradu same aplikacije.
Podaci se prikupljaju strukturirano sa javno dostupnih izvora i organizuju u dataset-e
koji dalje ulaze u proces obučavanja modela. Kvantitativne metode mašinskog učenja
(podela na trening/test skup, unakrsna validacija, poređenje algoritama klasifikacije,
evaluacija metrikama tačnost, preciznost, opoziv i F1-skor) primenjuju se na obučavanje i
evaluaciju modela. Ispravnost implementacije proverava se tehničkim testiranjem
softvera (jediničnim i integracionim), dok se prilagođenost aplikacije ciljnoj grupi
korisnika sa oštećenjem vida proverava manuelnim testiranjem čitačem ekrana prema
WCAG kriterijumima.

## Struktura rada

Nakon ovog uvoda, u prvom poglavlju daje se pregled povezanih radova — analiza postojećih
platformi za booking muzičkih izvođača i poređenje njihovih funkcionalnosti sa
predloženim rešenjem. Drugo poglavlje definiše funkcionalne i nefunkcionalne zahteve
sistema, formulisane pre same izrade aplikacije. Treće poglavlje opisuje razvoj i
evaluaciju modela mašinskog učenja — izvore i postupak prikupljanja podataka, pripremu
podataka, obučavanje modela i evaluaciju relevantnim metrikama. Četvrto poglavlje
opisuje razvoj i implementaciju samog informacionog sistema, kroz arhitekturu sistema,
implementaciju veb aplikacije i integraciju obučenog modela, te prilagođavanje
pristupačnosti. Peto poglavlje opisuje testiranje aplikacije, tehničko i sa aspekta
pristupačnosti za ciljnu grupu korisnika. Rad se zaključuje poglavljem koje sumira
rezultate, doprinose, ograničenja i predloge za budući rad.
