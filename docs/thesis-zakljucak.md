# Zaključak

*(Nacrt teksta. Treće lice, prošlo/sadašnje vreme prema pravilu za zaključak. Bez novih
izvora ili podataka koji nisu obrađeni u prethodnim poglavljima — svaka tvrdnja ovde
treba da se može pratiti do odgovarajućeg poglavlja iznad.)*

---

Ovaj rad je pošao od istraživačkog pitanja kako se realni, javno dostupni i ručno
prikupljeni podaci o muzičkim izvođačima i događajima mogu iskoristiti za izgradnju
transparentnog, na sadržaju zasnovanog sistema preporuke izvođača, koji objektivizuje i
ubrzava proces selekcije u odnosu na ručno pretraživanje.

Odgovor na ovo pitanje realizovan je kroz veb informacioni sistem koji povezuje
organizatore muzičkih događaja i izvođače, sa kompletnim tokom prijave, ugovaranja,
zakazivanja i ocenjivanja nastupa, i u koji je integrisan modul preporuke izvođača.
Pokazano je da se, u odsustvu javno dostupnih podataka o stvarnim booking odlukama, može
izgraditi smislen i transparentan mehanizam preporuke kombinovanjem dva posredna, ali
realna izvora podataka: klasifikacionog modela treniranog na audio karakteristikama
pesama iz javno dostupnog Spotify Tracks Dataset-a, čije se predikcije agregiraju po
žanru u signal globalne popularnosti, i manjeg, ručno prikupljenog dataset-a realnih
lokalnih izvođača, iz kog je izveden signal lokalne pogodnosti žanra za konkretan tip
događaja. Oba signala, zajedno sa operativnim karakteristikama para događaj–izvođač,
ulaze u transparentnu ponderisanu formulu rangiranja, čime je potvrđena polazna
hipoteza — da ovakva kombinacija daje smislenije i objektivnije rangiranje izvođača od
ručnog, subjektivnog pretraživanja, uz jasno objašnjenje razloga svake preporuke.

Rad je doprineo i time što je jasno pokazao granice dostupnih podataka u ovoj oblasti, i
umesto da ih zaobiđe veštački generisanim podacima, prilagodio je istraživačko pitanje
onome što se od realnih podataka zaista može naučiti — pristup koji je i eksplicitno
zahtevan i potvrđen tokom izrade rada, nakon konsultacija sa mentorom o prihvatljivosti
sintetičkih podataka za ovaj tip rada.

Poređenje sa postojećim platformama u ovoj oblasti pokazalo je da se ona dele na otvorena
tržišta sa pretragom zasnovanom na filterima i kurirane regionalne agencije bez
integrisanog toka prijava i zakazivanja, te da nijedna od analiziranih platformi ne
oglašava stvaran mehanizam preporuke zasnovan na modelu mašinskog učenja treniranom na
realnim podacima — što razvijeni sistem izdvaja od postojeće prakse.

Dodatni doprinos rada jeste prilagođavanje aplikacije standardima pristupačnosti WCAG
2.2 nivoa AA, potvrđeno kako tehničkim merenjem (npr. tačnim izračunavanjem kontrasta
boja po formuli relativne luminance) tako i manuelnim testiranjem čitačem ekrana kroz
devet scenarija koji su svi uspešno prošli — čime je aplikacija učinjena upotrebljivom i
za korisnike sa oštećenjem vida, ne samo teorijski usklađenom sa smernicama.

## Ograničenja

Ključno ograničenje rada proizlazi iz same prirode dostupnih podataka: nijedan od
korišćenih dataset-a ne sadrži podatke o stvarnim, ostvarenim booking odlukama, zbog
čega model ne predviđa uspešnost angažovanja direktno, već posredno, kroz dva signala
izvedena iz srodnih, ali strukturno drugačijih problema. Lokalni dataset, iako u
potpunosti realan i transparentno dokumentovan, ostaje skroman po obimu (61 izvođač), pa
je njegov uticaj u formuli rangiranja namerno ograničen, a signal za pojedine tipove
događaja (npr. klupski nastupi) nije pouzdano potvrđen. Sistem takođe ne obuhvata
mehanizam učenja u realnom vremenu, ugovore, plaćanja niti pravne aspekte angažovanja
izvođača, koji ostaju van domena ovog rada.

## Predlozi za budući rad

Kao neposredan nastavak ovog rada, nameće se proširenje lokalnog dataset-a dodatnim
realnim izvorima, čime bi signal lokalne pogodnosti žanra za tip događaja dobio
pouzdaniju pokrivenost, posebno za tipove događaja koji trenutno nisu dovoljno
zastupljeni. Kada platforma prikupi dovoljnu istoriju stvarnih interakcija između
organizatora i izvođača, otvara se mogućnost da se deo preporuke dopuni i
kolaborativnim filtriranjem, čime bi se prevazišlo ograničenje pristupa zasnovanog
isključivo na sadržaju. U pogledu same aplikacije, kao pravci daljeg razvoja izdvajaju se
uvođenje end-to-end testova korisničkog interfejsa, podrška za više jezika, i
funkcionalnosti van trenutnog obima rada — sistem plaćanja, ugovora i naprednije,
objašnjivije (npr. SHAP) analize doprinosa pojedinačnih karakteristika svakoj preporuci.
