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

> Kako model mašinskog učenja može da proceni pogodnost para događaj–izvođač i da poboljša proces selekcije u odnosu na ručno pretraživanje?

## Hipoteza

Klasifikacioni model nad strukturiranim karakteristikama (žanr, budžet, grad, ocena, iskustvo) može sa prihvatljivom tačnošću predvideti pogodnost izvođača za dati događaj, čime se ubrzava i objektivizuje proces preporuke.

## Ograničenje doma

Prototip ne pokriva ugovore, plaćanja, marketing kampanje niti pravne aspekte angažovanja — fokus je na informacionom sistemu i ML preporukama.
