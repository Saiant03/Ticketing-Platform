---
name: WFM Extended
description: Tichete și News pentru WFM Extended, afișate ca o hartă stelară („Orbită”) cu planete pe inele de zonă, pe un singur fundal de spațiu, doar dark, cu accent mov.
colors:
  space: "#06050C"
  nebula: "#2A1B5E"
  glass: "rgba(255,255,255,.06)"
  glass-2: "rgba(255,255,255,.10)"
  glass-line: "rgba(255,255,255,.12)"
  glass-dark: "rgba(10,8,22,.92)"
  ring: "rgba(255,255,255,.10)"
  ink: "#F4F4F0"
  ink-2: "rgba(244,244,240,.78)"
  ink-3: "rgba(244,244,240,.64)"
  violet: "#8A7BFF"
  violet-hover: "#A093FF"
  on-violet: "#0B0C0E"
  status-open: "#F4F4F0"
  status-working: "#8A7BFF"
  status-resolved: "rgba(244,244,240,.45)"
  status-critical: "#FF4D3D"
  ok: "#3DDC84"
  danger: "#FF6B5E"
  danger-soft: "rgba(255,107,94,.12)"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  card-title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.01em"
  news-title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  news-date:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1
  row-title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  reading:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0.04em"
  map-label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.2em"
  meta:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.1em"
rounded:
  card: "20px"
  row: "14px"
  field: "10px"
  pill: "999px"
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
    backgroundColor: "{colors.violet}"
    textColor: "{colors.on-violet}"
    rounded: "{rounded.pill}"
    height: "38px"
    padding: "0 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "38px"
    padding: "0 18px"
  button-circle:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    width: "40px"
    height: "40px"
  segmented:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    height: "32px"
  input:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "42px"
    padding: "0 14px"
  glass-card:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "400px"
  ticket-row:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    height: "64px"
    padding: "10px 20px"
  news-card:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  dropdown:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "38px"
  dropdown-list:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.ink-2}"
    rounded: "14px"
    padding: "6px"
  popover:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "290px"
---

# Design System: WFM Extended

## Overview

**Creative North Star: "Orbită"**

Tichetele sunt o hartă stelară. În centru stă nucleul „WFM”, în jurul lui cinci inele concentrice, câte unul pe zonă (din interior: Import, Interfață, Date, Raportare, Altele). Fiecare tichet e o planetă pe inelul zonei lui: mărimea spune prioritatea, culoarea spune statusul. Toată aplicația (Tichete, News, Jurnal) stă în același spațiu: un fundal negru-violet cu stele pe trei straturi de adâncime și o strălucire de nebuloasă care urmărește nucleul. Navigarea între pagini mută camera lateral prin acest spațiu.

Sistemul refuză tabelul gri de birou și ecranele de instrucțiuni. Expresivitatea vine din hartă, din adâncimea fundalului și din tranziții care au o direcție în spațiu (în nucleu, din nucleu, lateral). Mișcarea de fundal e lentă și se oprește singură.

**Key Characteristics:**
- Doar dark. Un singur fundal, `space` cu nebuloasa, pentru toate paginile.
- Accent unic mov `#8A7BFF`: acțiunea primară, selecția, statusul „În lucru”, focusul.
- Două fonturi: Space Grotesk pentru UI și titluri, JetBrains Mono pentru coduri, etichete de hartă și meta.
- Suprafețele sunt sticlă (`glass` cu blur 18px), nu cutii opace.
- Mișcare cu sens spațial; fundalul se oprește în tab ascuns, după 60 s fără activitate și la reduced-motion.

## Colors

Un spațiu, o sticlă, un accent, patru culori de observație.

### Primary
- **Mov** (violet `#8A7BFF`, hover `#A093FF`, text pe el `on-violet` aproape negru): butonul „Tichet nou”, pill-ul activ (mov 28%), punctul tab-ului curent, planeta „În lucru” (plină, cu strălucire), inelele de selecție ale planetei, linia de legătură a etichetei selectate, focusul (contur 2px), punctul de tip Update din News.

### Secondary
- **Observații de status**: Deschis = alb plin (`status-open`), În lucru = mov plin cu strălucire, Rezolvat = planetă goală cu contur `status-resolved`, prioritatea Critică = halou roșu `status-critical` care respiră încet. Verde `ok` doar pentru tipul Fix din News.

### Neutral
- **Spațiu** (`space` `#06050C`) cu **nebuloasa** (`nebula` `#2A1B5E`, gradient radial 700×600 la 40% → 26% → transparent, centrat pe nucleu sau sus pe paginile de lectură).
- **Sticlă**: `glass` (6% alb) pentru carduri, rânduri, câmpuri; `glass-2` (10%) pentru hover și elementul curent; `glass-line` (12%) contur; `glass-dark` pentru popover, toast, lightbox și cardul pe mobil.
- **Cerneală**: `ink` pentru text principal, `ink-2` (78%) secundar, `ink-3` (64%) meta și etichete de hartă. Toate trec 4.5:1 pe spațiu, sticlă și nebuloasă (minim măsurat 5.59).

### Named Rules
**The One Accent Rule.** Un singur accent, mov. Fără al doilea semnal colorat; roșul și verdele sunt observații, nu accente.
**The No Zone Color Rule.** Zonele nu au culori. Se recunosc după inel (poziție) și nume.
**The Glass Rule.** Sticla e pentru ce plutește peste spațiu (card, rânduri, câmpuri, News). Fără umbre colorate și fără glass decorativ fără conținut.

## Typography

**Fonturi:** Space Grotesk (400–700) și JetBrains Mono (400–500), din Google Fonts.

**Caracter:** Space Grotesk dă tonul tehnic și cald; mono-ul marchează tot ce e cod, coordonată sau meta (TIS-14, numele inelelor, legenda, data).

### Hierarchy
- **Display** (600, 44px, line-height 1.05, -0.02em): titlurile de pagină News și Jurnal (34px pe mobil).
- **Card title** (500, 26px, `text-wrap: balance`): titlul tichetului în card.
- **News title** (600, 22px; 26px pe anunțul cel mai nou).
- **News date** (600, 28px, ziua pe 2 cifre) cu luna în mono 11px majuscule dedesubt.
- **Row title** (500, 15px): titlul din rândul de listă.
- **Body** (400, 14px/1.45); **Reading** (15px/1.65, max 66ch) pentru descrieri și News; primul paragraf din News la 17px în `ink`.
- **Code** (mono 500, 13px în listă, 11–12px pe hartă și în card).
- **Map label** (mono 11px, majuscule, 0.2em): numele inelelor, pe arc (`textPath`); pe hartă mică 10px, 0.12em.
- **Meta** (mono 11px, 0.1em, majuscule): titlurile de secțiune din card, legenda, luna din News.

### Named Rules
**The Mono Rule.** Mono doar pentru coduri, etichete de hartă, meta și date. Textul de citit e Space Grotesk.

## Layout

- Bara de sus transparentă, 64px: marca `wfm/extended`, tab-urile (punct mov înaintea celui curent), căutarea ca pill, „Tichet nou”, lacătul de admin (cerc de sticlă 40px, popover sub el).
- Sub bară, banda de filtre: status segmentat cu numere (Toate e primul și implicit, apoi Active, Deschise, În lucru, Rezolvate, Arhivă pentru admin), prioritate, zonă și ordine (doar în Listă), comutatorul Hartă | Listă, export (admin), numărul de rezultate.
- Harta ocupă restul ecranului. Etichetele stau mereu lângă planetă: cu ≤ 10 tichete vizibile pe desktop, cod + titlu pe 2 rânduri; altfel doar codul, titlul apare la hover/focus/selecție.
- Etichetele nu se suprapun: plasare greedy pe 8 poziții candidate în jurul planetei, care evită etichetele deja puse, corpurile planetelor, nucleul, numele inelelor și marginile scenei; recalculată o dată pe secundă cât harta se rotește, cu histerezis și glisare lină (.5s) la schimbarea poziției.
- Pe hartă mică numele inelelor se împrăștie pe arc (interiorul sus, celelalte stânga/dreapta), ca să nu se stiveze.
- Cardul de detaliu: sticlă fixă în dreapta (400px, sus 88px, jos 24px, scroll intern); harta își mută centrul spre stânga cât e deschis (doar translație, raza rămâne aceeași). Pe mobil (≤900px) cardul devine ecran întreg cu buton înapoi.
- Lista: rânduri de sticlă de 64px pe grila `84px | 1fr | auto | auto` (cod, titlu + meta, prioritate în puncte, status); pe mobil pe două linii.
- News: coloană de 820px; fiecare anunț pe grila `76px | 28px | 1fr` (data, orbita cu punctul, cardul). Pe mobil o coloană, data trece în linia de autor.
- Jurnal: tabel într-un card de sticlă, coloană de 1100px.
- Fără scroll orizontal la 1440, 1280, 900 și 390px.
- Ritm de spațiere pe 4px (4, 8, 12, 16, 24, 32, 48).

## Elevation & Depth

Adâncimea vine din spațiu, nu din umbre: trei straturi de stele (95 / 45 / 22 de stele, factor de adâncime 0.25 / 0.55 / 1), fiecare o imagine desenată o singură dată, nebuloasa (un element fix mutat cu transform) și sticla cu blur. O singură umbră, `0 30px 80px rgba(0,0,0,.35)`, pentru ce plutește: cardul, popover-ul, toast-ul.

### Named Rules
**The Depth Rule.** Ce e mai aproape se mișcă mai mult: deriva, paralaxa după mouse (max 12px) și camera dintre pagini se înmulțesc cu factorul stratului.

## Shapes

- Pill (999px) pentru butoane, filtre, căutare, chip-uri.
- Card și News 20px, rânduri 14px, câmpuri 10px.
- Planetele sunt cercuri: rază 6 / 9 / 13 / 18 după prioritate (Scăzută → Critică).

## Components

### Buttons
- **Primary**: mov plin cu text `on-violet`, 38px, pill. Hover `violet-hover`, press scale 0.97; săgeata alunecă 3px la hover.
- **Ghost**: contur `ink-3`, text `ink`; hover `glass-2`.
- **Danger ghost / Danger**: text roșu pentru intenție, roșu plin doar în confirmarea inline.
- **Circle**: sticlă 40px (34px mic), doar pictogramă, cu `aria-label`.
- Lucru: spinner în buton, text ascuns, buton dezactivat.

### Filtre
- **Segmentat**: pill de sticlă cu butoane de 32px; activ = mov 28% cu text `ink`; numărul în mono 11px.
- **Meniu derulant** (în locul oricărui `<select>`; prioritate, zonă, ordine pe bandă și prioritate, zonă în cutia de admin): butonul e pill de sticlă 38px cu săgeată, conturat mov cât e deschis. Lista e un singur `#ddList` comun, sticlă închisă (`glass-dark`, blur, umbra de plutire), rază 14px, padding 6px, fixată sub buton (deasupra dacă jos sunt sub 200px), cel mult 320px lățime și înălțime, mereu la 16px de marginile ecranului. Opțiuni de 36px: curenta mov 28% cu text `ink`, activa (tastatură sau hover, un singur highlight) `glass-2`, numerele în mono 11px `ink-3`. Model WAI-ARIA buton + listbox: focusul trece pe listă cu `aria-activedescendant`; săgeți, Home/End, Enter/Space, Escape și click în afară (focusul revine pe buton), prima literă (fără diacritice). Alegerea emite `change` pe buton, deci logica de filtrare și `setField` rămân aceleași. Deschidere 160ms opacity + translateY(-6px) scale(.98), fade la reduced-motion; închidere instantanee.
- Numerele din meniul de prioritate urmează filtrul de status (`scope()`), ca cele din banda de status.

### Inputs / Fields
42px, sticlă, contur `ink-3` (3:1), rază 10px; focus contur mov + inel 1px; eroare contur roșu și mesaj sub câmp.

### Harta (signature)
- Nucleu „WFM” cu halou mov, care pulsează încet. Inelele sunt cercuri de 1px `ring`; al treilea e punctat.
- Numele inelului e clicabil: filtrează zona (a doua apăsare scoate filtrul); inelul ales se aprinde mov 40%, celelalte se estompează.
- Planetele se rotesc lent (inelul interior o tură în ~6 min), pe compozitor: fiecare inel e un strat rotit, planetele se contra-rotesc ca să rămână drepte. Rotația se oprește lin (rampă de 300ms) cât mouse-ul e pe hartă sau pe card, cât e deschis un card și cât căutarea are text.
- Hover/focus: planeta crește 1.25×, apare titlul, linia se aprinde. Selecția: două inele mov care pulsează.
- Filtrele estompează planetele la 12% (nu dispar). Tichetul nou zboară din nucleu pe o curbă (~900ms), apoi un val.
- Căutarea pe hartă: cu 1–4 rezultate, camera face zoom lin (max 1.8×, 700ms) pe ele; Enter deschide primul rezultat; Escape revine.
- Legenda jos-stânga, ticker-ul cu ultimul anunț jos-centru.

### Card de detaliu
Cod mono mov, Copiază, titlu, chip-uri (prioritate, status, zonă), raportor cu avatar, cutia de triere pentru admini (status segmentat, prioritate, zonă, editare, arhivare cu confirmare inline), descriere, capturi, comentarii.

### News
Cronologie ca o orbită: o linie verticală în gradient (mov → `glass-line`), pe ea câte un punct-planetă colorat după tip (mov = Update, verde = Fix, alb = Anunț). Data mare în stânga. Cel mai nou anunț are un inel static în jurul punctului, card `glass-2` cu strălucire de nebuloasă în colț și titlu mai mare. Primul paragraf e rezumatul, mai mare și în `ink`.

### Toast
Pill de sticlă închisă care intră de sus (de jos pe mobil), cu pictogramă pe cerc mov (roșu la eroare).

### Mișcare
- **Hartă → Listă**: camera intră în nucleu (harta scale 1 → 5, ease-in, 320ms), apoi lista iese din nucleu (scale 0.2 → 1 cu origine în nucleu, 420ms), cu toate rândurile intrând în cascadă (pas ≤ 24ms, total ≤ 300ms).
- **Listă → Hartă**: lista se strânge în nucleu (260ms), apoi harta se deschide din el (scale 0.3 → 1, 480ms).
- **Între pagini**: camera se mută lateral în ordinea tab-urilor: pagina veche iese 90px în lateral (280ms), cea nouă intră din partea opusă (380ms); stelele alunecă 70px pe stratul apropiat (mai puțin pe cele îndepărtate), nebuloasa se mută lin (700ms). Pe News, anunțurile intră în cascadă (50ms).
- Easing de bază `cubic-bezier(.16,1,.3,1)`; card 420ms, micro 160ms.
- Tot ce e continuu (deriva și sclipirea stelelor, rotația inelelor, pulsul nucleului, halourile) e animație pe compozitor (`transform`/`opacity`), fără scrieri din JS la fiecare cadru. Paralaxa după mouse e o tranziție CSS pe straturi, scrisă cel mult o dată la 100ms. Toate animațiile infinite se opresc în tab ascuns și după 60 s fără activitate. Cost măsurat: ~4.5 ms/s cu animația pornită, 0.2 ms/s în repaus; cu CPU încetinit 4×, rotația ocupă ~1% din firul principal.
- Reduced-motion: fără rotație, zbor, zoom animat, paralaxă; tranzițiile devin fade de 160ms.

## Do's and Don'ts

### Do:
- **Do** ține toate paginile în același spațiu (fundal, stele, nebuloasă) și dă tranzițiilor o direcție spațială.
- **Do** folosește mov doar pentru acțiune, selecție, „În lucru” și focus.
- **Do** verifică textul nou la 4.5:1 și conturul controalelor la 3:1 pe spațiu, sticlă și nebuloasă.
- **Do** oprește orice mișcare continuă prin bucla unică; animațiile one-shot doar ca răspuns la o acțiune.
- **Do** confirmă inline acțiunile distructive, cu codul tichetului în text.

### Don't:
- **Don't** introduce un al doilea accent sau culori de zonă.
- **Don't** scrie din JS la fiecare cadru și nu anima proprietăți care se repictează (`clip-path`, gradiente, atribute SVG, variabile CSS moștenite); mișcarea continuă e doar WAAPI/tranziții pe `transform`/`opacity`.
- **Don't** suprapune etichete pe hartă; orice etichetă nouă intră în plasarea fără coliziuni.
- **Don't** pune panouri de instrucțiuni pe ecran; indicațiile stau unde se folosesc (`/` pe căutare, `title` cu N, finalul listei).
- **Don't** folosi `<select>` nativ; meniurile trec prin componenta de meniu derulant.
- **Don't** folosi bordură colorată laterală, gradient text sau emoji ca iconuri; pictogramele vin din `Icons.html`.
- **Don't** deschide modale pentru sarcini care încap în card.
