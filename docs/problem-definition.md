# Definicija problema

## Opis problema

Organizatori muzičkih događaja (koncerti, festivali, venčanja, korporativni eventi) suočavaju se sa izazovom pronalaženja odgovarajućih izvođača. Proces je često:

- **Fragmentisan** — kontakti se vode preko društvenih mreža, emaila i preporuka
- **Subjektivan** — odluke zavise od ličnog iskustva, bez objektivnog rangiranja
- **Spor** — ručno upoređivanje desetina kandidata po žanru, budžetu i dostupnosti
- **Sklon greškama** — konflikti u rasporedu i neusklađenost očekivanja

## Ciljna grupa

- Organizatori događaja (agencije, klubovi, planeri venčanja)
- Muzički izvođači (solo umetnici, bendovi, DJ-jevi)
- Administratori platforme

## Cilj rešenja

Razviti informacioni sistem koji:

1. Centralizuje podatke o događajima i izvođačima
2. Omogućava prijave, pozive i upravljanje nastupima
3. **Automatski preporučuje i rangira izvođače** na osnovu karakteristika događaja
4. Pruža transparentna objašnjenja preporuka

## Istraživačko pitanje

> Kako se realni, javno dostupni i ručno prikupljeni podaci o muzičkim izvođačima i događajima mogu iskoristiti za izgradnju transparentnog, na sadržaju zasnovanog (content-based) sistema preporuke izvođača, koji objektivizuje i ubrzava proces selekcije u odnosu na ručno pretraživanje?

*(Napomena: pitanje je preformulisano nakon mentorove primedbe da formulacija ne sme
ostavljati utisak da model direktno klasifikuje par događaj–izvođač — takav label ne
postoji ni u jednom javno dostupnom datasetu. V. `machine-learning-methodology.md`,
sekcija "Tip preporučivačkog sistema".)*

## Hipoteza

Kombinovanje operativnih karakteristika para događaj–izvođač (žanr, budžet, grad, tip,
ocena, dostupnost, istorija) sa signalima izvedenim iz nadgledanog učenja nad realnim
podacima (globalna popularnost žanra iz klasifikacionog modela treniranog na Spotify
audio karakteristikama; lokalna pogodnost žanra za tip događaja iz ručno prikupljenog
lokalnog dataset-a) u transparentnu ponderisanu formulu daje smislenije i objektivnije
rangiranje izvođača od ručnog, subjektivnog pretraživanja.

## Ograničenje doma

Prototip ne pokriva ugovore, plaćanja, marketing kampanje niti pravne aspekte angažovanja — fokus je na informacionom sistemu i ML preporukama.
