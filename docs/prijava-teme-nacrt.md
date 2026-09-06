# Nacrt: Prijava teme master strukovnog rada

> Ovo je RADNI NACRT za slanje profesoru na uvid (pre zvanične predaje studentskoj službi).
> Prekucati u Word, tačno prema izgledu Priloga 1 iz „Uputstva o izradi završnog rada na
> master strukovnim studijama" (ITS, oktobar 2024). Delovi označeni sa `[POPUNI]` moraju
> biti popunjeni od strane studenta — ne mogu se pretpostaviti umesto tebe.

---

## NASTAVNO-STRUČNOM VEĆU ZA MASTER STRUKOVNE STUDIJE
## VISOKE ŠKOLE STRUKOVNIH STUDIJA ZA INFORMACIONE TEHNOLOGIJE, BEOGRAD

### PRIJAVA TEME ZA IZRADU ZAVRŠNOG RADA NA MASTER STRUKOVNIM STUDIJAMA

Obraćam se Nastavno-stručnom veću za master strukovne studije Visoke škole strukovnih
studija za informacione tehnologije u Beogradu sa molbom da mi se, kao studentu master
strukovnih studija, odobri izrada završnog rada na master strukovnim studijama.

**Naslov:**
Sistem za preporuku izvođača za muzičke događaje primenom mašinskog učenja

*(Napomena: naslov je namerno opšt i ne pominje konkretan izvor podataka — dozvoljava da
se u toku izrade dataset dalje širi/prilagođava bez potrebe za izmenom naslova. Ako želiš
precizniji naslov, alternativa: "Inteligentni informacioni sistem za organizaciju muzičkih
nastupa sa modulom preporuke zasnovanim na mašinskom učenju".)*

**Cilj rada:**
1. Projektovati i implementirati veb informacioni sistem koji povezuje organizatore
   muzičkih događaja i izvođače, sa kompletnim tokom prijave, ugovaranja, zakazivanja i
   ocenjivanja nastupa.
2. Razviti, obučiti i evaluirati model mašinskog učenja za preporuku izvođača pogodnih za
   konkretan događaj, zasnovan na realnim (javno dostupnim i ručno prikupljenim) podacima,
   i integrisati ga u aplikaciju.
3. Prilagoditi korisnički interfejs aplikacije standardima pristupačnosti (WCAG) kako bi
   bio upotrebljiv za slepe i slabovide korisnike uz pomoć čitača ekrana.

**Predmet rada:**
Predmet rada je projektovanje, razvoj i evaluacija veb aplikacije za organizaciju muzičkih
nastupa i događaja, sa posebnim fokusom na: (a) modul preporuke izvođača zasnovan na
modelu mašinskog učenja obučenom na realnim podacima o lokalnoj muzičkoj sceni, i (b)
prilagođavanje interfejsa aplikacije potrebama korisnika sa oštećenjem vida u skladu sa
WCAG smernicama pristupačnosti.

**Metode rada:**
- Analiza literature i uporedna analiza postojećih sličnih aplikacija/servisa za booking
  muzičkih izvođača.
- Metode softverskog inženjerstva: definisanje funkcionalnih i nefunkcionalnih zahteva,
  use-case analiza, iterativni razvoj, projektovanje arhitekture klijent–server sistema sa
  relacionom bazom podataka i REST API-jem.
- Metode prikupljanja podataka: strukturirano prikupljanje sa javno dostupnih izvora
  (booking agencije, festivalski repertoari) i organizacija u dataset.
- Kvantitativne metode mašinskog učenja: podela na trening/test skup, unakrsna validacija,
  algoritmi klasifikacije (logistička regresija, random forest), evaluacija metrikama
  tačnost, preciznost, opoziv i F1-skor.
- Tehničko testiranje softvera (jedinično i integraciono testiranje).
- Provera pristupačnosti prema WCAG kriterijumima, uključujući manuelno testiranje čitačem
  ekrana.

**Struktura po poglavljima:**

- **Uvod** – Motivacija, problem, ciljevi, predmet i struktura rada.
- **Pregled srodnih radova** – Analiza postojećih platformi za booking muzičkih izvođača i
  poređenje njihovih funkcionalnosti sa predloženim rešenjem.
- **Definisanje zahteva** – Funkcionalni i nefunkcionalni zahtevi sistema i use-case
  dijagrami, definisani pre izrade aplikacije.
- **Izvori i prikupljanje podataka** – Opis izvora, postupka prikupljanja i strukturiranja
  dataset-a korišćenog za obučavanje modela.
- **Arhitektura sistema** – Tehnologije i komunikacija između klijenta, servera, ML servisa
  i baze podataka.
- **Obučavanje i evaluacija modela** – Priprema podataka, obučavanje modela mašinskog
  učenja i evaluacija relevantnim metrikama.
- **Implementacija veb aplikacije** – Razvoj aplikacije i integracija obučenog modela u
  sistem preporuke.
- **Prilagođavanje pristupačnosti** – Implementacija WCAG smernica radi kompatibilnosti sa
  čitačima ekrana.
- **Testiranje** – Tehničko testiranje softvera i scenariji provere prilagođenosti za
  korisnike sa oštećenjem vida.
- **Zaključak** – Rezultati, doprinosi, ograničenja i predlozi za budući rad.

**Literatura** *(proveriti tačnost svake stavke — godine/strane — pre slanja; Wikipedia se
ne sme navoditi)*:

1. Ricci, F., Rokach, L., & Shapira, B. (Eds.). (2022). *Recommender Systems Handbook*
   (3rd ed.). Springer.
2. Schedl, M., Zamani, H., Chen, C. W., Deldjoo, Y., & Elahi, M. (2018). Current
   challenges and visions in music recommender systems research. *International Journal
   of Multimedia Information Retrieval*, 7(2), 95–116.
3. Sarwar, B., Karypis, G., Konstan, J., & Riedl, J. (2001). Item-based collaborative
   filtering recommendation algorithms. *Proceedings of the 10th International Conference
   on World Wide Web (WWW '01)*, 285–295.
4. Pedregosa, F., Varoquaux, G., Gramfort, A., et al. (2011). Scikit-learn: Machine
   Learning in Python. *Journal of Machine Learning Research*, 12, 2825–2830.
5. Breiman, L. (2001). Random Forests. *Machine Learning*, 45(1), 5–32.
6. James, G., Witten, D., Hastie, T., & Tibshirani, R. (2021). *An Introduction to
   Statistical Learning with Applications in R* (2nd ed.). Springer.
7. Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software
   Architectures* [Doktorska disertacija, University of California, Irvine].
8. W3C. (2023). Web Content Accessibility Guidelines (WCAG) 2.2.
   https://www.w3.org/TR/WCAG22/, посећено: [POPUNI datum]
9. W3C. (2023). Web Accessibility Initiative — Accessible Rich Internet Applications
   (WAI-ARIA) 1.2. https://www.w3.org/TR/wai-aria-1.2/, посећено: [POPUNI datum]
10. maharshipandya. (2022). Spotify Tracks Dataset. Hugging Face Datasets.
    https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset, посећено:
    [POPUNI datum]
11. Fowler, M. (2018). *Refactoring: Improving the Design of Existing Code* (2nd ed.).
    Addison-Wesley.
12. Anthropic. (2025). Claude (Claude Sonnet 5) [Veliki jezički model].
    https://claude.ai, посећено: [POPUNI datum] — *citirati samo ako se AI alat pominje
    kao korišćen u pisanju teksta rada, po APA formatu koji Uputstvo eksplicitno traži za
    AI alate (isti princip kao dat primer za ChatGPT).*

**Radna biografija studenta:**
`[POPUNI — datum i mesto rođenja, školovanje, strani jezici, radno iskustvo, nagrade i
druge relevantne stručne aktivnosti; ne unositi porodični status ni lične podatke]`

**Mentor:** `[POPUNI — ime mentora]`
**Kandidat:** `[POPUNI — ime, prezime, broj indeksa]`

---

## Napomene pre slanja

1. **Naslov, cilj i predmet** su usklađeni sa temom koju je profesor već odobrio (realni
   lokalni podaci + WCAG pristupačnost). Prilagodi formulacije ako želiš drugačiji ton.
2. **Literatura** — sve stavke su realne, proverljive publikacije, ali PROVERI svaku (broj
   strana, tačnu godinu) pre slanja — Uputstvo eksplicitno zahteva potpunu tačnost.
   Preporuka: Google Scholar za svaku stavku.
3. **AI alat (Claude/Claude Code)** — pošto je korišćen tokom razvoja aplikacije i istraživanja,
   razmisli kako ćeš to opisati u samom tekstu rada (npr. u metodologiji: "za deo tehničke
   realizacije korišćen je AI asistent..."). Uputstvo eksplicitno traži da se AI alati
   citiraju ako su korišćeni pri pisanju delova rada — ovo je odvojeno pitanje od toga da
   je projekat "samostalan stručni rad"; vredi ovo razjasniti sa mentorom direktno.
4. Ovo još nije zvanična predaja — šalje se mentoru na uvid/predlog, prema njegovom
   poslednjem uputstvu.
