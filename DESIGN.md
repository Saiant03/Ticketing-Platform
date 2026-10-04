---
name: WFM Extended
description: Tichete și News pentru WFM Extended, afișate ca un panou de plecări split-flap într-un hol de terminal.
colors:
  signal-yellow: "#FFC400"
  on-signal: "#0B0C0E"
  board-case: "#0B0C0E"
  board-plate: "#1A1C20"
  board-plate-top: "#202328"
  board-split: "#050506"
  board-ink: "#F4F4F0"
  board-ink-muted: "#A4A8AF"
  board-placeholder: "#8F949C"
  board-line: "#23262B"
  board-field: "#15171A"
  board-field-line: "#5E636B"
  board-selected: "#24272C"
  status-open: "#F4F4F0"
  status-working: "#FFC400"
  status-resolved: "#3DDC84"
  status-critical: "#FF4D3D"
  hall-ground: "#F3F4F6"
  hall-surface: "#FFFFFF"
  hall-surface-2: "#E9EBEE"
  hall-line: "#D9DCE1"
  hall-line-strong: "#82888F"
  hall-ink: "#0B0C0E"
  hall-ink-2: "#393D44"
  hall-ink-3: "#5B6068"
  hall-danger: "#B42318"
  hall-danger-soft: "#FCE9E7"
  hall-ok: "#12703F"
  night-ground: "#0E0F11"
  night-surface: "#16181B"
  night-surface-2: "#1E2024"
  night-line: "#2A2D32"
  night-line-strong: "#666B73"
  night-ink: "#F2F2EE"
  night-ink-2: "#C6C8CC"
  night-ink-3: "#9A9EA5"
  night-danger: "#FF6B5E"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 7.5vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  sign:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 125"
  plate:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "'wdth' 75"
  ticket-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.3
    fontVariation: "'wdth' 85"
  panel-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 85"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
  column-head:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  control: "2px"
  plate-lg: "3px"
  plate-xl: "4px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.control}"
    height: "38px"
    padding: "0 16px"
  button-sign:
    backgroundColor: "{colors.on-signal}"
    textColor: "{colors.signal-yellow}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.hall-ink}"
    rounded: "{rounded.control}"
    height: "38px"
    padding: "0 16px"
  button-board:
    backgroundColor: "transparent"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.control}"
    height: "38px"
  input-hall:
    backgroundColor: "{colors.hall-surface}"
    textColor: "{colors.hall-ink}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 12px"
  input-board:
    backgroundColor: "{colors.board-field}"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 38px"
  flap-plate:
    backgroundColor: "{colors.board-plate}"
    textColor: "{colors.board-ink}"
    typography: "{typography.plate}"
    width: "14px"
    height: "22px"
  zone-chip-active:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 12px"
  ticket-row:
    backgroundColor: "{colors.board-case}"
    textColor: "{colors.board-ink}"
    height: "56px"
    padding: "6px 24px"
  ticket-row-selected:
    backgroundColor: "{colors.board-selected}"
  top-bar:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.on-signal}"
    height: "60px"
---

# Design System: WFM Extended

## Overview

**Creative North Star: "Panoul de plecări"**

Lista de tichete este un panou split-flap de aeroport: un obiect negru mat, cu plăcuțe grafit și caractere albe, pe care fiecare tichet e o „cursă” cu ORA, COD, ZONĂ, PROBLEMĂ, PRIO și STATUS. Când ceva se schimbă, plăcuțele se rotesc literă cu literă. În jurul panoului e holul terminalului: un fond deschis sau de noapte, după tema sistemului, cu semnalistică galben-negru (bara de sus, butoane, indicatoare cu săgeți pline). Panoul nu urmează tema: e mereu întunecat.

Sistemul refuză tabelul gri de birou și cardurile glass. Expresivitatea vine din obiectul-panou și din mișcarea lui, nu din decor: un singur font, două materiale (panou și hol), un galben de semnal și patru culori de observație. Totul decorativ se oprește când utilizatorul nu face nimic.

**Key Characteristics:**
- Panou mereu dark, hol light/dark după sistem.
- Plăcuțe split-flap doar pentru valori scurte și schimbătoare: cod, status, contoare, ceas, dată.
- Galben de semnal pentru bara de sus, acțiunea primară și filtrul activ.
- Un singur font variabil, Archivo, folosit pe axa de lățime.
- Mișcare cu sens: rotire la schimbare, View Transitions la rearanjare, ambient oprit la inactivitate.

## Colors

Două materiale și un semnal. Panoul (board-*) e identic în ambele teme; holul (hall-* în light, night-* în dark) urmează `prefers-color-scheme`.

### Primary
- **Galben de semnal** (signal-yellow): bara de sus, butonul primar din hol, filtrul activ pe panou, ceasul, marker-ul rândului, toast-urile, inelul de focus din hol. Textul pe galben e mereu cerneala de semnal (on-signal).

### Secondary
- **Observații de status** (status-open, status-working, status-resolved, status-critical): doar pe panou sau pe plăcuțe. Deschis = alb, În lucru = galben cu punct care pulsează, Rezolvat = verde, prioritate Critică = roșu.

### Neutral
- **Carcasa panoului** (board-case), **plăcuța** (board-plate, cu jumătatea de sus board-plate-top) și **linia de despicare** (board-split): materialul panoului.
- **Cerneala panoului** (board-ink) și **cerneala secundară** (board-ink-muted) pentru text pe panou; board-field-line conturează controalele de pe panou la 3:1.
- **Holul light** (hall-ground, hall-surface, hall-ink*) și **holul de noapte** (night-*): fond, suprafețe, cerneală. hall-line-strong / night-line-strong conturează câmpurile la minim 3:1.

### Named Rules
**The Two Materials Rule.** Orice element stă fie pe panou, fie în hol. Elementele de panou (plăcuțe, rânduri, jurnal, banda de cod din detaliu) folosesc doar board-*; elementele de hol folosesc doar hall-* / night-*.
**The Observation Rule.** Culorile de status apar doar pe fond de panou. În hol, statusul se scrie în text sau stă pe o bandă de panou.
**The No Zone Color Rule.** Zonele nu au culori. Se recunosc după pictogramă (albă pe panou, neagră în hol) și nume; galbenul marchează doar filtrul activ.

## Typography

**Font:** Archivo variabil (`wdth` 62–125, `wght` 400–800), încărcat din Google Fonts. Fără al doilea font și fără monospace.

**Caracter:** aceeași familie face trei voci prin axa de lățime: îngust și majuscul pe plăcuțe, normal în text, foarte lat și gros pe semnalistică.

### Hierarchy
- **Display** (800, `wdth` 125, clamp 3.25–6rem, line-height 0.88): titlurile de pagină News și Jurnal. În browserele cu scroll timeline, titlul se lățește de la 106% la 125% în primii 220px de scroll.
- **Sign** (800, `wdth` 125, 30px): titlul formularului „Tichet nou”, marca „Extended”.
- **Panel title** (600, `wdth` 85, 28px): titlul tichetului în panoul de detaliu, `text-wrap: balance`.
- **Ticket title** (500, `wdth` 85, 15px): titlul din rând, o linie cu ellipsis (două linii pe mobil).
- **Plate** (700, `wdth` 75, majuscule, cifre tabulare): plăcuțele, în patru mărimi: sm 11.5px, md 14px, lg 26px, xl 72px.
- **Body** (400, 14px, line-height 1.45); descrierile și News la 15–16px, măsură de maxim 65ch.
- **Column head** (700, 11px, majuscule, tracking 0.1em): antetul de coloane și etichetele contoarelor.

### Named Rules
**The Plate Rule.** Pe plăcuțe merg doar valori scurte care se schimbă: cod, status, contoare, ceas, dată, tipul anunțului. Titlurile și numele se citesc ca text normal.
**The Tabular Rule.** `font-variant-numeric: tabular-nums` pe tot documentul; orele și codurile se aliniază pe coloane.

## Layout

- Bară galbenă de 60px, full-bleed. Dedesubt, pe pagina Tichete: panoul (flexibil, stânga) și holul cu panoul de detaliu (460px, dreapta). Fiecare derulează independent.
- Antetul panoului: contoarele DESCHISE / ÎN LUCRU / CRITICE și ceasul HH:MM pe plăcuțe mari; apoi căutare + status segmentat, chip-urile de zonă, linia cu numărul de tichete, prioritate și ordine; apoi antetul de coloane.
- Rândul are 56px, pe grila `56px | 92px | 124px | 1fr | 56px | 92px | 142px` (ORA, COD, ZONĂ, PROBLEMĂ, contoare, PRIO, STATUS).
- ≤1280px: panoul de detaliu are 420px și coloana de contoare dispare. ≤1080px: 380px, rămân COD, pictograma zonei, PROBLEMĂ și STATUS.
- ≤900px: o singură coloană; panoul de detaliu devine foaie pe tot ecranul cu buton Înapoi; rândul trece pe două linii (pictogramă, cod, bare de prioritate, status sus; titlul jos). Chip-urile de zonă și statusul derulează orizontal.
- ≤560px: butoanele din bară rămân doar cu pictogramă, ceasul se ascunde; ≤420px cu admin, marca se ascunde ca să încapă trei tab-uri.
- News și Jurnal sunt pagini de hol, cu coloană de lectură de 980px (Jurnal 1180px).
- Ritm de spațiere pe 4px (4, 8, 12, 16, 24, 32, 48).

## Elevation & Depth

Plat. Adâncimea vine din material (panou negru lângă hol deschis) și din plăcuțe (jumătatea de sus mai deschisă, linia de despicare neagră). O singură umbră, pentru ce plutește: popover-ul de admin și toast-urile.

### Shadow Vocabulary
- **pop** (`0 14px 32px rgba(11,12,14,.18), 0 2px 6px rgba(11,12,14,.10)`; în dark `0 16px 36px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.35)`).

### Named Rules
**The Lit Object Rule.** Singura lumină de pe pagină e ambientală: două pete radiale foarte slabe (galben și alb) care se mișcă lent în hol și un reflex care urmărește mouse-ul pe panou. Ambele se opresc după 6s fără activitate, în tab ascuns și la reduced-motion.

## Shapes

- Controale și chip-uri: colțuri de 2px. Plăcuțele mari au 3px, afișajul de cod 4px.
- Săgețile de semnalistică sunt pline, în pătrate galbene de 52px.
- Punctul de status e singurul cerc (7px).

## Components

### Buttons
- **Primary** (în hol): galben cu text negru, 38px, 700, `wdth` 108, umbră interioară jos de 2px ca să se desprindă de fondul deschis. Hover: galben mai deschis. Press: scale 0.97. Butoanele care duc undeva au o săgeată care alunecă 3px la hover.
- **Sign** (pe bara galbenă): negru cu text galben, 40px.
- **Bar** (pe bara galbenă): contur negru de 1.5px.
- **Quiet**: transparent, contur hall-line-strong; hover întărește conturul.
- **Board**: transparent, contur board-field-line, text board-ink.
- **Danger quiet / Danger**: text roșu pentru intenție, roșu plin doar în confirmarea inline.
- Lucru: spinner în buton, text ascuns, buton dezactivat.

### Chips
- **Chip de zonă** (pe panou): pictogramă + nume + număr; activ = galben cu text negru. La hover, pictograma face flip pe axa Y.
- **Chip de filtru activ**: în linia de meta, cu X, șterge filtrul.

### Inputs / Fields
40px. În hol: alb, contur hall-line-strong, focus cu contur de cerneală și inel galben de 3px. Pe panou: board-field cu contur board-field-line, focus galben, caret galben. Eroare: contur roșu și mesaj sub câmp care spune ce lipsește și de ce.

### Navigation
Tab-uri de 60px pe bara galbenă, `wdth` 115, 700. Tab-ul curent e un bloc negru cu text galben; celelalte primesc o subliniere care crește din stânga la hover. Jurnal apare doar pentru admini.

### Panoul split-flap (signature)
- Fiecare plăcuță e un `span` cu jumătatea de sus mai deschisă și linie de despicare. Valoarea finală e mereu în DOM; textul accesibil e un `span.sr` cu forma normală.
- La schimbare, fiecare caracter trece prin 2–6 caractere aleatoare la ~45ms; jumătatea de sus a caracterului vechi cade cu `rotateX(-90deg)` în 80ms. Întârzierea crește cu indexul caracterului (28ms) și, la intrare, cu al rândului (35ms).
- Se rotesc: la prima intrare din sesiune, primele 20 de rânduri, contoarele, ceasul și marca; la auto-refresh și la acțiunile de admin, doar plăcuțele schimbate; la trimitere, rândul nou și afișajul mare. O schimbare de filtru nu rotește nimic.
- Un singur timer pentru toate plăcuțele, oprit când coada e goală. La reduced-motion valoarea apare direct.

### Rândul de tichet
Fond board-case, linie de 1px între rânduri. La hover și pe rândul selectat apare un marker galben scurt (4×26px) în stânga, ca poarta activă; rândul selectat are fond board-selected. Rândul nou intră cu un flash galben închis de 1.6s.

### Panoul de detaliu
O bandă de panou sus (cod pe plăcuțe, buton de copiere care afișează „COPIAT” pe plăcuțe, status pe plăcuțe), apoi titlul, faptele (zonă, prioritate, raportat, modificat), cutia de triere pentru admini, descrierea, capturile și comentariile, cu secțiuni separate de o linie de cerneală de 2px și titluri majuscule late.

### Indicatoare
Când nu e nimic selectat, holul arată trei indicatoare: săgeată spre panou („Caută pe panou”), săgeată în sus spre „Tichet nou” și o plăcuță TIS („Urmărește codul”), plus scurtăturile de tastatură.

### Momentul de trimitere
Afișaj de panou cu codul TIS pe plăcuțe de 96px și observația „ÎNREGISTRAT” în verde; rândul nou intră sus pe panou printr-o View Transition.

### News și Jurnal
News: titlu display, fiecare anunț are o plăcuță de panou cu data (03 OCT), anul și tipul ca observație (UPDATE galben, FIX verde, ANUNȚ alb); primul paragraf e mai mare; capturile se dezvăluie la scroll unde browserul suportă `animation-timeline: view()`. Jurnal: tabel de panou cu ORA și COD pe plăcuțe; codurile de tichet existente deschid tichetul.

### Toast
Bandă de plăcuțe galbene care intră de jos: o plăcuță cu pictogramă și linie de despicare, apoi mesajul. Eroare: aceeași formă pe roșu, cu text negru.

### Mișcare
- View Transitions: rândurile vizibile primesc nume doar pe durata tranziției, deci filtrarea, sortarea și schimbarea de zonă le rearanjează animat; panoul de detaliu intră din dreapta (280ms, `cubic-bezier(.16,1,.3,1)`); schimbarea paginii face slide orizontal. Căutarea și auto-refresh-ul nu folosesc tranziții.
- Fără View Transitions sau cu reduced-motion, randarea e directă și tot conținutul e vizibil.

## Do's and Don'ts

### Do:
- **Do** pune pe plăcuțe doar coduri, statusuri, contoare, ore și date.
- **Do** rotește numai ce s-a schimbat; o schimbare de filtru se rezolvă prin View Transition, nu prin rotire.
- **Do** păstrează panoul întunecat în ambele teme și lasă holul să urmeze sistemul.
- **Do** oprește orice animație continuă la 6s de inactivitate, în tab ascuns și la reduced-motion (ținta: sub 5 ms/s de task-uri în repaus).
- **Do** verifică textul nou la 4.5:1 și conturul controalelor la 3:1, pe panou și în hol, în ambele teme.
- **Do** confirmă inline acțiunile distructive, cu codul tichetului în text.

### Don't:
- **Don't** folosi culorile de status în hol pe fond deschis; pune-le pe o bandă de panou.
- **Don't** da culori zonelor.
- **Don't** folosi gradient text, glass decorativ sau bordură colorată laterală pe rânduri; marker-ul de rând e o bară scurtă, nu o bordură.
- **Don't** pune kicker sau eyebrow deasupra titlurilor.
- **Don't** înlocui cursorul nativ; lumina urmărește mouse-ul, cursorul rămâne cel normal.
- **Don't** folosi emoji sau glife ca iconuri; pictogramele vin din `Icons.html`.
- **Don't** introduce al doilea font sau monospace.
- **Don't** deschide modale pentru sarcini care încap în panoul de detaliu.
