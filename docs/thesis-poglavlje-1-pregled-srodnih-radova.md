# Prvo poglavlje — Pregled povezanih radova

*(Nacrt teksta poglavlja. Napisano u trećem licu, sadašnje vreme — prema opštem pravilu
Uputstva za srednji deo rada. Brojevi u uglastim zagradama su finalne IEEE reference —
v. `thesis-literatura.md` za pun spisak literature celog rada.)*

---

Pre definisanja sopstvenog rešenja, potrebno je razumeti kako se problem povezivanja
organizatora muzičkih događaja i izvođača rešava u postojećoj praksi, i teorijskoj i
industrijskoj. Prema opštoj literaturi o sistemima preporuke, razlikuju se pristupi
zasnovani na sadržaju, kolaborativnom filtriranju i hibridni pristupi koji ih kombinuju
[2]; istraživanja specifično usmerena na sisteme preporuke u muzičkoj industriji
ukazuju na izazove poput hladnog starta i velike heterogenosti korisničkih preferencija
[3]. U ovom poglavlju analiziraju se postojeće platforme i servisi iz ove oblasti,
podeljeni u dve grupe — međunarodne i srpske — nakon čega se njihove
funkcionalnosti porede sa rešenjem predloženim u ovom radu. Posebna pažnja posvećena je
pitanju da li i na koji način analizirane platforme koriste mašinsko učenje ili neki
drugi algoritamski mehanizam za preporuku odnosno uparivanje izvođača sa događajima,
pošto je to tačka u kojoj se predloženo rešenje najviše razlikuje od postojeće prakse.

## 1.1 Međunarodne platforme

Tabela 1 prikazuje pregled analiziranih međunarodnih platformi za booking muzičkih
izvođača, uz naznaku ciljnih korisnika, ključnih funkcija i toga da li platforma oglašava
neki oblik algoritamskog uparivanja.

**GigSalad** [4] je otvoreno tržište koje povezuje organizatore događaja sa izvođačima i
dobavljačima. Osnovana 2007. godine, prema sopstvenim navodima broji preko 110.000
izvođača u više od 500 kategorija. Nudi pretragu i filtriranje, slanje zahteva za ponudu,
komunikaciju unutar platforme, plaćanje unapred i sistem recenzija. Rangiranje rezultata
pretrage zasniva se na filterima koje organizator postavlja, bez javno obelodanjenog
mehanizma mašinskog učenja.

**The Bash** [5] (deo kompanije The Knot Worldwide, ranije poslovao pod imenom
GigMasters) funkcioniše po sličnom principu — otvoreno tržište za venčanja, proslave i
korporativne događaje, sa preko 500.000 realizovanih rezervacija prema sopstvenim
podacima. Pretraga koristi neobjavljeni mehanizam sortiranja rezultata ("best match"),
čija priroda nije javno dokumentovana niti potvrđena kao model mašinskog učenja.

**Encore Musicians** [6] je platforma za rezervisanje muzičara uživo, osnovana 2014.
godine u Ujedinjenom Kraljevstvu. Iako u svom marketinškom materijalu koristi izraz koji
sugeriše naprednu tehnologiju, ne postoje javno dostupni tehnički detalji koji bi
potvrdili postojanje stvarnog mehanizma mašinskog učenja za uparivanje, pa se ova tvrdnja
u ovom radu tretira kao nepotvrđena.

**Airgigs** [7] predstavlja tržište za angažovanje **udaljenih** sesionih muzičara i
audio inženjera radi snimanja, što ga svrstava u drugačiji segment tržišta od booking-a
izvođača za nastupe uživo — ipak je uključen u pregled kao relevantan primer platforme iz
šire oblasti muzičkog posredovanja.

**Sonicbids** [8] funkcioniše kao platforma za hosting elektronskih press-kitova (EPK) i
prijavu izvođača na festivale i druge muzičke prilike; za razliku od prethodnih primera,
ne predstavlja tržište za booking u užem smislu, pa je uključen radi potpunosti pregleda
šire oblasti.

*Tabela 1. Pregled analiziranih međunarodnih platformi (izvor: sopstveno istraživanje,
2026)*

| Platforma | Šta radi | Za koga | AI/ML uparivanje |
|---|---|---|---|
| GigSalad | Otvoreno tržište, pretraga/filteri, ponude, plaćanje, recenzije | Organizatori i izvođači | Ne |
| The Bash | Otvoreno tržište, "best match" sortiranje (nepotvrđeno kao ML) | Organizatori i izvođači | Ne (nepotvrđeno) |
| Encore Musicians | Pretraga/booking muzičara uživo | Organizatori i izvođači | Nepotvrđeno |
| Airgigs | Tržište za udaljene sesione muzičare | Organizatori i izvođači | Ne |
| Sonicbids | EPK i prijave na prilike | Pretežno izvođači | Ne |

## 1.2 Regionalne (srpske) platforme

Na tržištu Srbije identifikovane su dve osnovne kategorije aktera: kurirane
booking agencije sa sopstvenim ili partnerskim rosterom izvođača, i otvoreni imenici u
koje se izvođači sami prijavljuju.

**MM Estrada** [9] je regionalna booking agencija koja upravlja slojevitim rosterom
bendova za svadbe i druge događaje, organizovanim u kategorije poput "Dijamantska liga" i
"VIP bendovi". Angažovanje se odvija isključivo putem telefonskog ili email upita, bez
integrisanog sistema plaćanja u okviru same platforme. Sajt nudi alatku pod nazivom
"Bend za tren" koja filtrira ponudu po datumu, lokaciji, kategoriji, veličini sastava i
ceni — reč je o klasičnom filterskom mehanizmu, ne o naučenom modelu, uprkos nazivu koji
može delovati algoritamski.

**Bendovi Srbije** [10] predstavlja otvoreni imenik u koji se bendovi sami prijavljuju,
sa preko 100 registrovanih nezavisnih srpskih bendova koji se mogu filtrirati po gradu,
sastavu, žanru i tipu događaja. Platforma ne podržava transakcije niti prijave unutar
sebe — nudi isključivo kontakt podatke izvođača. Postoji uredničko isticanje odabranih
bendova ("Naša preporuka"), ali ono nije automatizovano niti zasnovano na modelu.

**Vencanja.com** [11] uključuje muzičku sekciju u okviru šireg portala posvećenog
venčanjima, funkcionišući kao imenik dobavljača bez sopstvenog mehanizma preporuke.
**Vivo Bendovi** [12] je, slično MM Estradi, kurirana agencija, ali sa značajnom razlikom
— rezerviše gotovo isključivo sopstveni, brendirani roster bendova, uz tek poneki
partnerski dodatak, i takođe ne nudi transakcije unutar platforme.

Zajednička karakteristika svih analiziranih regionalnih platformi jeste odsustvo bilo kog
oblika algoritamskog rangiranja ili preporuke — angažovanje se u potpunosti oslanja na
ručnu komunikaciju između organizatora i agencije ili izvođača.

## 1.3 Poređenje sa predloženim rešenjem

Tabela 2 sumira funkcionalno poređenje analiziranih platformi sa aplikacijom razvijenom
u okviru ovog rada.

*Tabela 2. Poređenje funkcionalnosti analiziranih platformi sa predloženim rešenjem
(izvor: sopstveno istraživanje, 2026)*

| Funkcija | GigSalad / The Bash | MM Estrada / agencije | Bendovi Srbije | Predloženo rešenje |
|---|---|---|---|---|
| Dvostrano tržište (organizator–izvođač) | Da | Ne | Delimično | Da |
| Prijave i pozivi kroz platformu | Delimično | Ne | Ne | Da |
| Zakazivanje i praćenje statusa nastupa | Ne | Ne | Ne | Da |
| Recenzije nakon nastupa | Da | Ne | Ne | Da |
| Preporuka izvođača na modelu treniranom na realnim podacima | Ne | Ne | Ne | Da |
| Objašnjenje preporuke korisniku | Ne | Ne | Ne | Da |

Iz poređenja proizlazi da se postojeća rešenja mogu podeliti u dve kategorije: otvorena
tržišta sa pretragom zasnovanom na filterima ili neobjavljenim mehanizmima sortiranja
(GigSalad, The Bash), i kurirane regionalne agencije ili imenici bez integrisanog toka
prijava, zakazivanja i ocenjivanja nastupa (MM Estrada, Bendovi Srbije, Vivo Bendovi).
Nijedna od analiziranih platformi ne kombinuje ceo životni ciklus angažovanja izvođača —
prijavu, prihvatanje, zakazivanje i recenziju — sa transparentnim mehanizmom preporuke
zasnovanim na modelu mašinskog učenja treniranom na realnim podacima. Upravo je to
tačka u kojoj se predloženo rešenje razlikuje od postojeće prakse, kako u pogledu
funkcionalne celovitosti, tako i u pogledu prisustva objašnjivog, na podacima
zasnovanog mehanizma rangiranja.
