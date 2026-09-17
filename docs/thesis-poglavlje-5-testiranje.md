# Peto poglavlje — Testiranje

*(Nacrt teksta poglavlja. Treće lice; opis sprovedenog testiranja i dobijenih rezultata u
prošlom vremenu. Numeracija tabela nastavlja se na prethodna poglavlja.)*

---

Testiranje sistema sprovedeno je u dve komplementarne celine: tehničko testiranje
softvera, koje proverava ispravnost funkcionisanja koda, i testiranje prilagođenosti za
ciljnu grupu korisnika sa oštećenjem vida, koje proverava da li je aplikacija stvarno
upotrebljiva uz pomoć čitača ekrana.

## 5.1 Tehničko testiranje softvera

Tehničko testiranje obuhvata jedinične i integracione testove nad sva tri sloja sistema
— server, ML servis i klijentsku aplikaciju — ukupno 72 automatizovana testa (Tabela
10).

*Tabela 10. Pregled automatizovanih testova po sloju sistema (izvor: sopstvena izrada)*

| Sloj | Alat | Broj testova |
|---|---|---|
| Server | Vitest + Supertest | 30 (5 zahteva pokrenutu bazu podataka) |
| ML servis | pytest | 30 |
| Klijent | Vitest + Testing Library | 12 |
| **Ukupno** | | **72** |

Na strani servera testirani su, između ostalog, mehanizam otkrivanja ponovne upotrebe
refresh tokena (uz kratak prozor tolerancije za normalnu upotrebu sa više uređaja),
poslovna pravila životnog ciklusa događaja i nastupa (npr. da se termin i honorar
nastupa ne mogu menjati nakon što se događaj završi, ali da se nastup i dalje može
označiti kao završen, kao i kaskadno otkazivanje prijava i nastupa pri otkazivanju
događaja, uz proveru da se svaki pogođeni izvođač obaveštava tačno jednom) i logika
detekcije konflikta termina.

Na strani ML servisa posebna pažnja posvećena je samoj formuli rangiranja preporuka i
oba signala izvedena iz realnih podataka (v. poglavlje 3.4–3.5) — provereno je ponašanje
u graničnim slučajevima (nepoznat žanr, nedovoljan uzorak lokalnih podataka), ispravnost
ponderisane sume prema definisanim težinama, i da težine zbirno daju vrednost jedan.

Testovi klijentske aplikacije obuhvataju, između ostalog, regresioni test koji potvrđuje
da se greška validacije prikazuje za svako obavezno polje forme za registraciju (ranije
opisan nedostatak, v. poglavlje 4.3), i funkcionalnu ispravnost mobilnog navigacionog
menija.

Svi testovi automatski se izvršavaju pri svakoj izmeni koda kroz kontinuiranu integraciju
(GitHub Actions), pri čemu se za testove servera koji zahtevaju bazu podataka pokreće
stvaran PostgreSQL servisni kontejner, čime se u okruženju kontinuirane integracije
izvršavaju i testovi koji se pri lokalnom pokretanju bez baze automatski preskaču.

## 5.2 Testiranje prilagođenosti za ciljnu grupu

Prilagođenost aplikacije korisnicima sa oštećenjem vida proverena je manuelno, uz pomoć
besplatnog čitača ekrana NVDA (NonVisual Desktop Access) na operativnom sistemu Windows,
kroz devet scenarija osmišljenih da pokriju sve celine opisane u poglavlju 4.3 —
preskakanje navigacije, popunjavanje i validaciju formi, interaktivne elemente
(notifikacije, mobilni meni), navigaciju kroz administratorske tabele, tekstualnu
alternativu grafikona i, dodatno, ponašanje aplikacije pri uvećanju prikaza od 200%.
Tabela 11 prikazuje rezultate.

*Tabela 11. Rezultati manuelnog testiranja čitačem ekrana NVDA (izvor: sopstveno
istraživanje)*

| # | Scenario | Rezultat |
|---|---|---|
| 1 | Preskakanje navigacije (skip link) | Prošlo |
| 2 | Prijava — automatsko najavljivanje greške | Prošlo |
| 3 | Registracija — uslovna polja po ulozi | Prošlo |
| 4 | Kreiranje događaja — sva polja i dugmad za žanr | Prošlo |
| 5 | Notifikacije — stanje i zatvaranje | Prošlo |
| 6 | Mobilni navigacioni meni | Prošlo |
| 7 | Administratorska tabela korisnika | Prošlo |
| 8 | Tekstualna alternativa grafikona metrika modela | Prošlo |
| 9 | Uvećanje prikaza na 200% (WCAG 1.4.10) | Prošlo |

Svih devet scenarija uspešno je prošlo, čime je potvrđeno da su izmene opisane u
poglavlju 4.3 ostvarile svoj cilj — da aplikacija bude u potpunosti upotrebljiva bez
oslanjanja na miša i uz pomoć čitača ekrana, ne samo teorijski usklađena sa WCAG
smernicama.
