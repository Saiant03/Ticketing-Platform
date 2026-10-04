# Plan: redesign „Panou split-flap”

Status: planificat, neînceput. Contractul de direcție e în `.impeccable/surfaces/src-index-html.md`.
Înlocuiește complet lumea vizuală „Sistem de zone” (UI-ul curent din `src/`). Logica, apelurile `google.script.run` și backend-ul rămân.

## De ce

Utilizatorul a văzut varianta „Sistem de zone” pe Apps Script: bază bună, dar „prea tabel de birou”. Vrea o lume vizuală nouă, expresivă, cu animații și tranziții la nivel Awwwards. A ales direcția „Panou split-flap” și a cerut toate tipurile de animație: tranziții între ecrane, micro-interacțiuni, momente „wow”, fundal/cursor ambient.

## Lumea vizuală

**Metafora:** lista de tichete e un panou de plecări de aeroport sau gară. Fiecare tichet e o „cursă” cu ORA, COD, ZONĂ, PROBLEMĂ și STATUS. Holul terminalului din jur folosește semnalistică galben-negru, în stilul Schiphol.

**Panoul** e mereu întunecat, în ambele teme:
- carcasă `#0B0C0E`, plăcuță `#1A1C20` (jumătatea de sus `#202328`), linie de despicare neagră, caractere `#F4F4F0`;
- statusurile sunt colorate ca observațiile din aeroport: Deschis = alb, În lucru = galben semnal `#FFC400` cu punct care pulsează, Rezolvat = verde `#3DDC84`, prioritate Critică = roșu `#FF4D3D`.

**Holul** (fundalul paginii și panoul de detaliu) urmează tema sistemului:
- light: fond `#F3F4F6`, suprafețe albe, cerneală `#0B0C0E`;
- dark: fond `#0E0F11`, suprafețe `#16181B`, cerneală `#F2F2EE`.

**Semnalistica:**
- bara de sus e galbenă `#FFC400`, full-bleed, 60px, cu text negru;
- butonul primar e negru cu text galben pe bara galbenă și galben cu text negru în hol;
- săgețile de orientare se folosesc în stările goale.

**Zonele** nu mai au culori proprii, ca să nu se bată cu culorile de status. Fiecare zonă păstrează pictograma (`src/Icons.html`), afișată alb pe panou și negru în hol. Filtrul activ e galben.

**Font:** un singur font, Archivo variabil, `family=Archivo:wdth,wght@62..125,400..800`:
- plăcuțe: majuscule, `wdth` 75, 700, cifre tabulare;
- titluri de tichet: sentence case, `wdth` 85, 500;
- semnalistică și titluri de pagină: `wdth` 112–125, 700–800, cu display de cel mult 6rem;
- fără font monospace.

**Interdicții** (craft floor impeccable):
- fără gradient text, glass decorativ sau bordură colorată laterală pe rânduri;
- fără kicker sau eyebrow deasupra titlurilor;
- fără cursor care îl înlocuiește pe cel nativ (lumina urmărește mouse-ul, dar cursorul rămâne cel normal);
- fără emoji sau glife ca iconuri.

## Structura ecranului Tichete

```
[bară galbenă: marcă | Tichete News Jurnal | Tichet nou | Admin]
[PANOU NEGRU (stânga, flexibil)                ][HOL (dreapta, 460px)          ]
[ antet: DESCHISE 04  ÎN LUCRU 02  CRITICE 01  ][ detaliu tichet / formular nou  ]
[        ceas HH:MM (plăcuțe)                  ][ / indicatoare când e gol       ]
[ filtre: căutare | zone (pictograme) | status ][                                ]
[ ORA | COD | ZONĂ | PROBLEMĂ+raportor | PRIO | STATUS ]                         ]
```

- **Rândurile** au 56px, pe grila `56px | 96px | 132px | 1fr | 96px | 128px`. Coloana de contoare (comentarii/capturi) se ascunde sub 1280px.
- **ORA** e ora creării (HH:MM), sau data dacă tichetul nu e din ziua curentă.
- **Plăcuțe** au doar COD, STATUS, contoarele și ceasul. Titlul se citește ca text normal (lizibilitate), cu un reveal la intrare.
- **Sub 900px:** o singură coloană, panoul de detaliu devine foaie pe tot ecranul, iar rândul trece pe 2 linii (COD + STATUS sus, titlu jos) și ascunde ORA și ZONĂ ca text (pictograma rămâne).
- **Filtre:** zonele devin chip-uri cu pictogramă; statusul e un control segmentat (Active / Deschise / În lucru / Rezolvate / Toate / Arhivă pentru admin). Prioritatea și ordinea rămân `select`. Toate controalele sunt standard, doar stilizate pentru panoul negru.

## Motorul split-flap (semnătura)

- `flap(text, key)` întoarce `<span class="flap" data-key aria-label="TEXT">` cu un `<span class="ch" aria-hidden>` pentru fiecare caracter.
- Un `Map` reține ultima valoare pe fiecare `key`, de forma `cod:TIS-14` sau `status:TIS-14`. După render, `animateFlaps(root)` rotește doar cheile schimbate. Fiecare caracter trece prin 2–6 caractere aleatoare (din `A–Z0-9 -`) la ~45ms, cu keyframe CSS `rotateX` pe jumătatea de sus. Întârzierea crește cu indexul caracterului și al rândului.
- **Intrarea în aplicație** rotește primele 20 de rânduri și contoarele, o singură dată pe sesiune (`sessionStorage`), în maxim ~1.2s.
- **Schimbările din auto-refresh** (la 20s) rotesc doar ce s-a schimbat, ca pe un panou real.
- **La `prefers-reduced-motion`** textul se setează direct, fără rotire.
- **Costul** e limitat: se animă doar rândurile vizibile, iar timerele se opresc la final. În repaus nu există niciun `requestAnimationFrame`.

## Tranziții (View Transitions API)

- Un wrapper `vt(fn)` folosește `document.startViewTransition` dacă există și nu e activ reduced-motion; altfel apelează direct `fn()`.
- **Rândurile** au `view-transition-name: r-<COD>`, unic pe rând, deci filtrarea, sortarea și schimbarea de zonă rearanjează lista animat.
- **Panoul de detaliu** are `view-transition-name: panel` și alunecă din dreapta cu fade (durată 280ms, `cubic-bezier(.16,1,.3,1)`).
- **Schimbarea paginii** (Tichete/News/Jurnal) face un slide orizontal scurt pe `main`.
- **Unde NU se folosește `vt`:** la tastarea în căutare și la auto-refresh (acolo lucrează plăcuțele).
- **Fallback:** în browserele fără View Transitions, render simplu.

## Micro-interacțiuni

- Butoanele au o săgeată care alunecă la hover și un press de 0.97 la apăsare.
- La hover pe rând apare un marker galben de 4px în stânga, ca „poarta” activă (o bară scurtă, nu bordura laterală interzisă). Rândul selectat are fundal `#24272C` și marker galben.
- Pictograma din chip-ul de zonă se rotește la hover (flip pe axa Y).
- Butonul de copiere afișează pe plăcuțe „COPIAT”.
- Când un admin schimbă statusul, plăcuțele de status din rând și din panou se rotesc spre noua valoare.
- Contoarele din antet se rotesc la fiecare schimbare.
- Toast-urile au forma unei benzi de plăcuțe galbene care intră de jos.

## Momente „wow”

- **Intrarea:** panoul se așază rotind plăcuțele (vezi motorul), iar ceasul pornește.
- **Trimiterea unui tichet:**
  - panoul de detaliu arată un afișaj mare, de ~96px, care rotește `TIS-15` caracter cu caracter, cu observația „ÎNREGISTRAT” în verde;
  - rândul nou intră pe panou sus, prin view transition, și rotește plăcuțele;
  - butoanele „Copiază” și „Deschide tichetul” rămân.
- **News** e pagină editorială în hol:
  - titlu foarte lat (`wdth` 125, 800), care se lățește la scroll (`animation-timeline: view()`, progresiv);
  - fiecare anunț are data pe plăcuțe (03 OCT) și tipul ca observație (UPDATE galben, FIX verde, ANUNȚ alb);
  - capturile apar cu reveal la scroll.
- **Jurnalul** e un panou de „sosiri”: tabel negru cu plăcuțe pentru ORA și COD.

## Ambient (oprit la inactivitate)

- **Lumina din hol:** un strat fix cu 2 gradienți radiali mari, slab colorați (galben și alb), care se deplasează lent (animație CSS `transform`, 40s, doar compositor).
- **Reflexul de pe panou:** un `radial-gradient` controlat de `--mx`/`--my`, actualizat pe `pointermove` printr-un singur `requestAnimationFrame` care rulează doar cât se mișcă mouse-ul.
- **Inactivitate:** după 6s fără mișcare, `body.idle` pune `animation-play-state: paused`. Efectul se oprește complet la tab ascuns (`visibilitychange`) și la `prefers-reduced-motion`.
- **Țintă:** sub 5 ms de task-uri pe secundă în repaus, măsurat cu CDP `Performance.getMetrics`. UI-ul vechi era la ~100 ms/s.

## Fișiere

| Fișier | Schimbare |
|---|---|
| `src/Tokens.html` | rescris: tokeni panou (mereu dark), tokeni hol light/dark, galben semnal, culori de status, scară de tip cu `wdth`, easing-uri |
| `src/Styles.html` | rescris: bară galbenă, panou, plăcuțe + keyframes, rânduri, filtre pe dark, panou de detaliu, formular, News editorial, jurnal, toast, ambient, VT (`::view-transition-*`), responsive, reduced-motion |
| `src/Index.html` | structură nouă: bară galbenă, panou (antet contoare + ceas, filtre, listă), hol, straturi ambient; link font cu `wdth 62..125` |
| `src/App.html` | păstrează starea, filtrarea, apelurile server, admin, lightbox, upload; adaugă `flap()`/`animateFlaps()`, `vt()`, ceas, ambient + idle; rescrie markup-ul din `rowHtml`, antet, panou, News, jurnal |
| `src/Icons.html` | păstrat; adaugă o pictogramă săgeată pentru indicatoare |
| `src/Code.gs` | neschimbat |
| `dev/mock-gas.js` | neschimbat (poate primi mai multe tichete pentru testul de densitate) |

## Pași de lucru

1. Tokens + Index + Styles de bază (bară, panou, rânduri statice). Rulează `python3 dev/preview.py` + `python3 dev/shoot.py`.
2. Motorul split-flap + antet cu contoare + ceas.
3. View Transitions (rânduri, panou, pagini) + micro-interacțiuni.
4. Momentul de trimitere, News editorial, Jurnal.
5. Ambient + idle, apoi măsurarea CPU în repaus.
6. Responsive (390, 900, 1280, 1440) + reduced-motion.
7. Verificare:
   - `python3 dev/flow.py`, cele 21 de pași funcționali, trebuie să treacă toți;
   - `python3 dev/a11y.py` (contrast AA, etichete, ținte tactile, fără scroll orizontal);
   - `impeccable detect --json` pe `src/*.html`;
   - maxim 2 runde de screenshot-uri.
8. Finalul impeccable:
   - review final (disposition: ship/fix);
   - DESIGN.md + `.impeccable/design.json` rescrise din build;
   - update `docs/workflow.md` și `memory.md`.
9. Commit + push pe `claude/sleepy-heisenberg-8bihmr`; utilizatorul copiază fișierele în Apps Script (pașii sunt în `memory.md`).

## Criterii de acceptare

- Toate fluxurile existente funcționează: creare, comentariu, admin (status/prioritate/zonă/editare/arhivare/restaurare/ștergere), News, Jurnal, export CSV, capturi și lightbox.
- La intrare plăcuțele se rotesc, iar la schimbare se rotesc doar cele afectate.
- Lista se rearanjează animat la filtrare; panoul alunecă.
- Contrast WCAG AA pe panou și în hol, în ambele teme; focus vizibil pe dark și pe light.
- Sub 5 ms/s task-uri în repaus după 6s de inactivitate.
- Fără scroll orizontal la 390px.
- Funcționează fără View Transitions și cu reduced-motion: tot conținutul e vizibil, fără animații blocante.

## Riscuri

- View Transitions nu e suportat peste tot. Fallback-ul e render simplu, deci funcționalitatea nu e afectată.
- Rotirea a multe caractere poate sacada pe laptopuri slabe. De aceea se animă doar primele 20 de rânduri, iar o schimbare de filtru nu declanșează rotire, doar VT.
- Panoul întunecat în tema light poate părea „sumbru”. Holul luminos și bara galbenă trebuie să dea energia; dacă utilizatorul o vede tot sumbră, se poate testa un panou grafit mai deschis.
- Apps Script pune pagina într-un iframe Google. View Transitions, `animation-timeline` și fonturile Google funcționează acolo în Chrome, dar trebuie testat pe `/dev`.
