---
name: WFM Extended
description: Tichete și News pentru WFM Extended, afișate ca un panou de plecări split-flap calm, cu accent mov.
colors:
  signal-violet: "#8A7BFF"
  signal-violet-hover: "#A093FF"
  on-signal: "#0B0C0E"
  accent-hall: "#6A55E0"
  accent-hall-hover: "#5843CF"
  on-accent-hall: "#FFFFFF"
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
  status-working: "#8A7BFF"
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
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
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
  ticket-code:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    letterSpacing: "0.03em"
    fontVariation: "'wdth' 75"
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
    backgroundColor: "{colors.accent-hall}"
    textColor: "{colors.on-accent-hall}"
    rounded: "{rounded.control}"
    height: "38px"
    padding: "0 16px"
  button-sign:
    backgroundColor: "{colors.signal-violet}"
    textColor: "{colors.on-signal}"
    rounded: "{rounded.control}"
    height: "38px"
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
    backgroundColor: "transparent"
    textColor: "{colors.board-ink}"
    rounded: "{rounded.control}"
    height: "34px"
    padding: "0 10px"
  ticket-row:
    backgroundColor: "{colors.board-case}"
    textColor: "{colors.board-ink}"
    height: "56px"
    padding: "6px 24px"
  ticket-row-selected:
    backgroundColor: "{colors.board-selected}"
  top-bar:
    backgroundColor: "{colors.board-case}"
    textColor: "{colors.board-ink}"
    height: "60px"
---


# Design System: WFM Extended

## Overview

**Creative North Star: "Panoul de plecări, calm"**

Lista de tichete este un panou split-flap de aeroport: un obiect negru mat pe care fiecare tichet e o „cursă” cu COD, PROBLEMĂ, PRIO și STATUS. Plăcuțele split-flap nu sunt decor, ci eveniment: apar doar unde o valoare se schimbă (statusul, codul la trimitere, data din News, marca) și se rotesc literă cu literă când se schimbă. Bara de sus e din același material ca panoul, deci panoul pare să continue sub navigație. În dreapta, holul (light sau noapte, după sistem) apare doar când ai deschis un tichet sau formularul.

Sistemul refuză tabelul gri de birou, cardurile glass și instrucțiunile care stau pe ecran degeaba. Expresivitatea vine din obiectul-panou și din mișcarea lui: un singur font, două materiale (panou și hol), un accent mov și patru culori de observație. Nimic nu se mișcă fără motiv.

**Key Characteristics:**
- Panou și bară mereu dark; holul light/dark după sistem.
- Plăcuțe split-flap doar pentru valori scurte care se schimbă: status, cod în momentul de trimitere și în detaliu, dată, marcă.
- Accent mov: `#8A7BFF` pe suprafețe închise, `#6A55E0` în holul light.
- Un singur font variabil, Archivo, folosit pe axa de lățime.
- Mișcare cu sens: rotire la schimbare, View Transitions la rearanjare și la deschiderea panoului; fără animații continue.

## Colors

Două materiale și un accent. Panoul (board-*) e identic în ambele teme; holul (hall-* în light, night-* în dark) urmează `prefers-color-scheme`.

### Primary
- **Mov de semnal** (signal-violet `#8A7BFF`, hover `#A093FF`, text pe el on-signal negru, 5.9:1): pe bară și panou. Butonul „Tichet nou”, sublinierea tab-ului curent, statusul segmentat activ, sublinierea zonei active, marker-ul rândului, focus, caret, plăcuța de pictogramă din toast.
- **Mov de hol** (accent-hall `#6A55E0`, hover `#5843CF`, text alb, 5.3:1): în holul light. Butonul primar, selecțiile din formular (zonă, prioritate, status admin), focus-ul câmpurilor, eticheta ADMIN. În tema dark holul folosește tot `#8A7BFF` cu text negru (`--acc` se schimbă pe temă).
- Implementare: `--sig*` pentru suprafețele închise, `--acc*` pentru hol; `.bar,.board,.p-strip,.done-board,.jt,.lightbox` redefinesc `--acc` ca `--sig`, deci componentele folosesc doar `--acc`.

### Secondary
- **Observații de status** (status-open, status-working, status-resolved, status-critical): doar pe panou sau pe plăcuțe. Deschis = alb, În lucru = mov, Rezolvat = verde, prioritate Critică = roșu.

### Neutral
- **Carcasa panoului** (board-case), **plăcuța** (board-plate, cu jumătatea de sus board-plate-top) și **linia de despicare** (board-split): materialul panoului și al barei.
- **Cerneala panoului** (board-ink) și **cerneala secundară** (board-ink-muted); board-field-line conturează controalele de pe panou la 3:1.
- **Holul light** (hall-ground, hall-surface, hall-ink*) și **holul de noapte** (night-*): fond, suprafețe, cerneală. hall-line-strong / night-line-strong conturează câmpurile la minim 3:1.

### Named Rules
**The Two Materials Rule.** Orice element stă fie pe panou, fie în hol. Bara, plăcuțele, rândurile, jurnalul, banda de cod din detaliu și toast-ul sunt material de panou; restul e hol.
**The One Accent Rule.** Un singur accent, mov. Nu există al doilea semnal (galbenul a fost scos). Movul marchează acțiunea primară, selecția și starea „În lucru”, nimic decorativ.
**The Observation Rule.** Culorile de status apar doar pe fond de panou. În hol, statusul se scrie în text sau stă pe o bandă de panou (ex. tipul anunțului din News).
**The No Zone Color Rule.** Zonele nu au culori. Se recunosc după pictogramă și nume.

## Typography

**Font:** Archivo variabil (`wdth` 62–125, `wght` 400–800), încărcat din Google Fonts. Fără al doilea font și fără monospace.

**Caracter:** aceeași familie face trei voci prin axa de lățime: îngust pe plăcuțe și coduri, normal în text, lat și gros pe titluri.

### Hierarchy
- **Display** (800, `wdth` 125, clamp 2.25–3rem, line-height 0.88): titlurile de pagină News și Jurnal. În browserele cu scroll timeline, titlul se lățește de la 106% la 125% în primii 220px de scroll.
- **Sign** (800, `wdth` 125, 30px): titlul formularului „Tichet nou”, marca „Extended”.
- **Panel title** (600, `wdth` 85, 28px): titlul tichetului în panoul de detaliu, `text-wrap: balance`.
- **Ticket title** (500, `wdth` 85, 15px): titlul din rând, o linie cu ellipsis (două linii pe mobil).
- **Ticket code** (700, `wdth` 75, 14px, tracking .03em): codul TIS din rând, text normal, nu plăcuțe.
- **Plate** (700, `wdth` 75, majuscule, cifre tabulare): plăcuțele, în trei mărimi: sm 11.5px, md 14px, xl 72px.
- **Body** (400, 14px, line-height 1.45); descrierile și News la 15–16px, măsură de maxim 65ch.
- **Column head** (700, 11px, majuscule, tracking 0.1em): antetul de coloane.

### Named Rules
**The Plate Rule.** Plăcuțele sunt rezervate valorilor care se schimbă și merită urmărite: status, codul în detaliu și la trimitere, data din News, marca. Codul din listă, titlurile și numele se citesc ca text normal.
**The Uppercase Rule.** Majuscule doar pe plăcuțe, în antetul de coloane și pe eticheta de tip din News. Zona, prioritatea și titlurile de secțiune sunt scrise normal.
**The Tabular Rule.** `font-variant-numeric: tabular-nums` pe tot documentul.

## Layout

- Bară neagră de 60px, full-bleed, cu linie board-line dedesubt.
- Pagina Tichete: când nu e nimic deschis, panoul ocupă toată lățimea. Când deschizi un tichet sau „Tichet nou”, holul cu panoul de detaliu (460px) apare în dreapta (`:has(.panel.open)`; fără `:has`, layout-ul rămâne pe două coloane). Fiecare derulează independent.
- Antetul panoului are două rânduri: (1) căutare, status segmentat cu numere, ordine; (2) zonele ca text cu pictogramă și număr, „Resetează filtrele” când e cazul, prioritate (opțiunile arată câte tichete active are fiecare), export pentru admin. Apoi antetul de coloane.
- Rândul are 56px, pe grila `84px | 1fr | 72px | 128px` (COD, PROBLEMĂ, PRIO, STATUS). Sub titlu: zonă cu pictogramă · raportor · timp · comentarii/capturi.
- Lista se termină cu un rând discret: „Nu găsești problema? Raportează-o” și scurtăturile N, J/K, / (scurtăturile ascunse sub 900px).
- ≤1280px: panoul de detaliu are 420px. ≤1080px: 380px, grila devine `76px | 1fr | 72px | 128px`.
- ≤900px: o singură coloană; panoul de detaliu devine foaie pe tot ecranul cu buton Înapoi; antetul are trei rânduri (căutare; status + ordine; zone + prioritate, cu scroll orizontal pe status și zone); rândul trece pe două linii (cod, bare de prioritate, status sus; titlul jos).
- ≤560px: butoanele din bară rămân doar cu pictogramă; ≤420px cu admin, marca se ascunde ca să încapă trei tab-uri.
- News și Jurnal sunt pagini de hol, cu coloană de lectură de 980px (Jurnal 1180px).
- Ritm de spațiere pe 4px (4, 8, 12, 16, 24, 32, 48).

## Elevation & Depth

Plat. Adâncimea vine din material (panou negru lângă hol) și din plăcuțe (jumătatea de sus mai deschisă, linia de despicare). O singură umbră, pentru ce plutește: popover-ul de admin și toast-urile.

### Shadow Vocabulary
- **pop** (`0 14px 32px rgba(11,12,14,.18), 0 2px 6px rgba(11,12,14,.10)`; în dark `0 16px 36px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.35)`).

### Named Rules
**The Still Room Rule.** Nu există lumini ambientale, reflexe sau animații în buclă. Totul se mișcă doar ca răspuns la o acțiune sau la o schimbare de date (repaus măsurat: 0.1 ms/s).

## Shapes

- Controale: colțuri de 2px. Plăcuțele xl au 4px.
- Sublinierile de selecție (tab curent, zonă activă) sunt bare de 2–3px, nu cutii.

## Components

### Buttons
- **Primary** (în hol): `--acc` cu `--on-acc`, 38px, 700, `wdth` 108, umbră interioară jos de 2px. Hover: `--acc-h`. Press: scale 0.97. Butoanele care duc undeva au o săgeată care alunecă 3px la hover.
- **Sign** (pe bară, „Tichet nou”): mov de semnal cu text negru, 38px.
- **Board** (pe bară și panou, inclusiv Admin): transparent, contur board-field-line, text board-ink.
- **Quiet**: transparent, contur hall-line-strong; hover întărește conturul.
- **Danger quiet / Danger**: text roșu pentru intenție, roșu plin doar în confirmarea inline.
- Lucru: spinner în buton, text ascuns, buton dezactivat.

### Filtre pe panou
- **Status segmentat**: segmente cu numărul în ele; activ = mov cu text negru.
- **Zone**: text cu pictogramă și număr, fără contur; hover = fond board-hover; activ = text board-ink cu subliniere movă de 2px. La hover, pictograma face flip pe axa Y.
- **Prioritate / Ordine**: selecturi de 150px pe panou.

### Inputs / Fields
40px. În hol: alb, contur hall-line-strong, focus cu contur `--acc` și inel de 1px. Pe panou: board-field cu contur board-field-line, focus și caret mov. Eroare: contur roșu și mesaj sub câmp care spune ce lipsește și de ce.

### Navigation
Tab-uri de 60px pe bara neagră, `wdth` 115, 700, text board-ink-muted. Tab-ul curent e board-ink cu o bară movă de 3px jos; celelalte primesc o subliniere care crește din stânga la hover. Jurnal apare doar pentru admini.

### Panoul split-flap (signature)
- Fiecare plăcuță e un `span` cu jumătatea de sus mai deschisă și linie de despicare. Valoarea finală e mereu în DOM; textul accesibil e un `span.sr` cu forma normală.
- La schimbare, fiecare caracter trece prin 2–6 caractere aleatoare la ~45ms; jumătatea de sus a caracterului vechi cade cu `rotateX(-90deg)` în 80ms. Întârzierea crește cu indexul caracterului (28ms) și, la intrare, cu al rândului (35ms).
- Se rotesc: la prima intrare din sesiune, statusurile primelor 20 de rânduri și marca; la auto-refresh și la acțiunile de admin, doar statusurile schimbate; la trimitere, afișajul mare cu codul. O schimbare de filtru nu rotește nimic.
- Statusul se scrie fără plăcuțe goale de umplutură.
- Un singur timer pentru toate plăcuțele, oprit când coada e goală. La reduced-motion valoarea apare direct.

### Rândul de tichet
Fond board-case, linie de 1px între rânduri. Cod ca text îngust, titlu, linia de meta sub titlu, bare de prioritate (cu text doar la Critică, în roșu), status pe plăcuțe. La hover și pe rândul selectat apare un marker mov scurt (4×26px) în stânga; rândul selectat are fond board-selected. Rândul nou intră cu un flash mov închis de 1.6s.

### Panoul de detaliu
O bandă de panou sus (cod pe plăcuțe, buton de copiere care afișează „COPIAT” pe plăcuțe, status pe plăcuțe), apoi titlul, faptele (zonă, prioritate, raportat, modificat), cutia de triere pentru admini, descrierea, capturile și comentariile. Secțiunile sunt separate de o linie subțire și au titluri normale (Descriere, Comentarii 2).

### Fără ecran gol de ajutor
Când nu e nimic deschis nu există panou de indicații. Indicațiile stau unde se folosesc: căutarea are tasta `/`, butonul „Tichet nou” are `title` cu N, lista se termină cu „Nu găsești problema? Raportează-o”, iar starea fără rezultate oferă „Raportează-o” cu titlul completat din căutare.

### Momentul de trimitere
Afișaj de panou cu codul TIS pe plăcuțe de 96px și observația „ÎNREGISTRAT” în verde; rândul nou intră sus pe panou printr-o View Transition.

### News și Jurnal
News: titlu display, fiecare anunț are o plăcuță de panou cu data (03 OCT); tipul (UPDATE mov, FIX verde, ANUNȚ alb) e o etichetă de panou în linia de autor; primul paragraf e mai mare; capturile se dezvăluie la scroll unde browserul suportă `animation-timeline: view()`. Jurnal: tabel de panou cu ORA și COD pe plăcuțe; codurile de tichet existente deschid tichetul.

### Toast
Bandă neagră de panou care intră de jos: o plăcuță movă cu pictogramă și linie de despicare, apoi mesajul în board-ink. Eroare: plăcuța e roșie.

### Mișcare
- View Transitions: rândurile vizibile primesc nume doar pe durata tranziției, deci filtrarea, sortarea și schimbarea de zonă le rearanjează animat; panoul de detaliu intră din dreapta (280ms, `cubic-bezier(.16,1,.3,1)`); schimbarea paginii face slide orizontal. Căutarea și auto-refresh-ul nu folosesc tranziții.
- Fără View Transitions sau cu reduced-motion, randarea e directă și tot conținutul e vizibil.

## Do's and Don'ts

### Do:
- **Do** pune pe plăcuțe doar statusuri, date și coduri în momentele în care contează.
- **Do** rotește numai ce s-a schimbat; o schimbare de filtru se rezolvă prin View Transition, nu prin rotire.
- **Do** păstrează panoul și bara întunecate în ambele teme și lasă holul să urmeze sistemul.
- **Do** folosește `--acc` în componente și lasă suprafața să decidă nuanța de mov.
- **Do** verifică textul nou la 4.5:1 și conturul controalelor la 3:1, pe panou și în hol, în ambele teme.
- **Do** confirmă inline acțiunile distructive, cu codul tichetului în text.

### Don't:
- **Don't** reintroduce galbenul sau un al doilea accent.
- **Don't** folosi culorile de status în hol pe fond deschis; pune-le pe o bandă de panou.
- **Don't** da culori zonelor.
- **Don't** pune contoare, ceas, lumini ambientale sau animații în buclă pe ecran; nu adaugă panouri de instrucțiuni.
- **Don't** folosi gradient text, glass decorativ sau bordură colorată laterală pe rânduri; marker-ul de rând e o bară scurtă.
- **Don't** pune kicker sau eyebrow deasupra titlurilor.
- **Don't** folosi emoji sau glife ca iconuri; pictogramele vin din `Icons.html`.
- **Don't** introduce al doilea font sau monospace.
- **Don't** deschide modale pentru sarcini care încap în panoul de detaliu.
