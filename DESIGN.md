---
name: WFM Extended
description: Tichete și News pentru WFM Extended, organizate pe zonele aplicației.
colors:
  ground: "#F2F4F7"
  surface: "#FFFFFF"
  surface-raised: "#EBEEF3"
  surface-sunken: "#E1E6ED"
  line: "#D8DEE6"
  line-strong: "#AEB8C5"
  night-ink: "#0F1A2B"
  ink-secondary: "#364559"
  ink-muted: "#56657A"
  selection: "#E3ECF8"
  selection-line: "#9DB8DE"
  primary: "#123A6B"
  primary-hover: "#0D2E57"
  focus: "#1F6FD1"
  danger: "#B42318"
  danger-soft: "#FCE9E7"
  ok: "#16683F"
  zone-import: "#1F7FC8"
  zone-interfata: "#6F4FC2"
  zone-date: "#188A50"
  zone-raportare: "#E3A008"
  zone-general: "#A3ADB9"
  zone-altul: "#56657A"
  dark-ground: "#111315"
  dark-surface: "#17191C"
  dark-ink: "#ECEEF1"
  dark-primary: "#2F6FBF"
typography:
  wordmark:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  page-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  panel-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  control: "3px"
  tile: "0px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 12px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.control}"
    height: "36px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.control}"
    height: "36px"
    padding: "0 12px"
  zone-tile:
    size: "24px"
    rounded: "{rounded.tile}"
  ticket-row:
    backgroundColor: "{colors.surface}"
    height: "52px"
    padding: "8px 24px"
  ticket-row-current:
    backgroundColor: "{colors.selection}"
---

# Design System: WFM Extended

## Overview

**Creative North Star: "Harta de zone"**

WFM Extended e tratat ca un sistem de informare, nu ca un dashboard decorat. Modelul e programul de identitate al lui Otl Aicher pentru München 1972: fiecare zonă a aplicației (Import, Interfață, Date, Raportare, General, Altul) are o culoare plată și o pictogramă geometrică, folosite identic peste tot. Restul interfeței rămâne neutru și dens, ca un tool de birou, ca zonele să fie singurul lucru colorat pe care ochiul îl caută.

Ecranul principal e o unealtă de lucru: bara de zone arată încărcarea, lista densă arată starea, panoul din dreapta arată detaliul. Nimic nu se mișcă fără motiv, nimic nu consumă procesor în repaus.

**Key Characteristics:**
- Culoare doar pentru zone; status și prioritate se citesc din formă și text.
- Un singur font grotesc (Archivo), cifre tabulare peste tot.
- Colțuri drepte la pictograme, 3px la controale, linii de 1px, fără umbre decorative.
- Temă light implicit, dark după preferința sistemului, aceleași roluri de token.

## Colors

### Primary
- **Night Ink** (`#0F1A2B`): text principal, segmentul activ din controalele segmentate, sublinierea tab-ului curent.
- **Primary** (`#123A6B`, dark `#2F6FBF`): un singur buton primar pe ecran (Tichet nou, Trimite, Publică).

### Zone
- **Import** `#1F7FC8`, **Interfață** `#6F4FC2`, **Date** `#188A50`, **Raportare** `#E3A008`, **General** `#A3ADB9`, **Altul** `#56657A`. Fiecare are o culoare de glif (`--z-*-on`) cu contrast minim 4.2:1 în light și 4.9:1 în dark.

### Neutral
- **Ground** `#F2F4F7` (dark `#111315`, grafit), **Surface** `#FFFFFF` (dark `#17191C`), linii `#D8DEE6` / `#AEB8C5`.
- Text secundar `#364559`, text atenuat `#56657A` (5.9:1 pe alb).

### Semantic
- **Danger** `#B42318`: doar prioritatea Critică, erorile și acțiunile distructive.
- **Ok** `#16683F`: confirmarea „Tichet trimis” și tipul Fix din News.

### Named Rules
**The Zone Owns Color Rule.** Culorile saturate aparțin exclusiv celor șase zone. Status, prioritate, selecție și navigație folosesc cerneală, linii și formă.

**The Red Means Now Rule.** Roșul apare doar pentru Critică, erori și ștergere. Nicio zonă și niciun element decorativ nu folosește roșu.

## Typography

**Font:** Archivo (Google Fonts, axe wdth 100–125, wght 400–700), fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`.

### Hierarchy
- **Page title** 24px / 700, lățime 108%: titlurile paginilor News și Jurnal.
- **Panel title** 20px / 700: titlul tichetului în panou, titlul anunțului.
- **Wordmark** 16px / 700, lățime 112%.
- **Body** 14px / 400 / 1.45: tot textul de lucru.
- **Label** 13px / 600: etichete de câmp, segmentele de status.
- **Meta** 12px / 400: autor și timp în rânduri, contoare.

### Named Rules
**The Tabular Rule.** `font-variant-numeric: tabular-nums` pe body; codurile TIS, contoarele și orele se aliniază pe coloane.

**The One Family Rule.** Fără font monospace sau serif. Codurile TIS sunt Archivo 700 cu tracking +0.02em.

## Layout

- Bară de sus 56px; bara de zone sub ea, pe toată lățimea; apoi două coloane: listă flexibilă și panou de 440px (400px sub 1080px).
- Lista și panoul derulează independent, ca adminul să trieze fără să piardă poziția.
- Rând de tichet: 52px, grilă `24px | 64px | titlu | 112px status | 104px prioritate | 64px contoare`; contoarele dispar sub 1280px.
- Sub 900px: o coloană, panoul devine foaie pe tot ecranul cu buton „Înapoi”; rândul trece pe două linii.
- Sub 560px: bara de zone devine rând derulabil orizontal, segmentul de status ocupă tot rândul.
- Ritm de spațiere pe 4px (4, 8, 12, 16, 24, 32).

## Elevation & Depth

Plat. Adâncimea vine din fundal (ground → surface → surface-raised) și din linii de 1px. O singură umbră, `0 10px 28px rgba(15,26,43,.16), 0 2px 6px rgba(15,26,43,.08)`, doar pentru elementele care plutesc: popover-ul de admin și toast-urile.

## Shapes

- Pictogramele de zonă: pătrate perfecte, colțuri 0, glif plin și geometric.
- Controale: 3px. Chip-uri și tastele `kbd`: 2–3px.
- Avatarele din comentarii: pătrate, inițiale.

## Components

### Buttons
- **Primary**: fundal primary, text alb, 36px, 600. Unul pe zonă de ecran.
- **Quiet**: fundal surface, linie `line`, text secundar; hover întărește linia.
- **Danger quiet / Danger**: text roșu pe surface pentru intenția de ștergere, roșu plin doar în confirmare.
- Starea de lucru: spinner în buton, textul ascuns, butonul dezactivat.

### Segmented control
Grup de butoane lipite, linie exterioară `line-strong`; segmentul activ e cerneală plină cu text pe surface. Folosit pentru status (filtru și setare), prioritate și tipul anunțului.

### Inputs / Fields
36px, linie `line-strong`, focus cu linie `focus` și inel de 3px la 25%. Eroare: linie roșie și mesaj sub câmp care spune ce lipsește și de ce.

### Navigation
Tab-uri text în bara de sus; tab-ul curent are subliniere de 3px în cerneală. Jurnal apare doar pentru admini.

### Zone bar (signature)
Bandă de 8px împărțită proporțional cu tichetele active pe zone, deasupra unui rând de butoane-filtru (pictogramă, nume, număr). La filtrare, segmentele celorlalte zone scad la 25% opacitate. Totalul și numărul de critice stau la dreapta.

### Ticket row
Pictograma zonei, cod, titlu + autor/timp, status prin formă (cerc gol / pe jumătate / plin cu bifă), prioritate prin bare de semnal (1–4; Critică în roșu). Rândul curent: fundal `selection` și contur interior de 1px.

### Detail panel
Banda de sus de 4px în culoarea zonei tichetului, pictograma mare de 32px, cod cu buton de copiere, fapte în listă de definiții, apoi descriere, capturi, comentarii. Pentru admini, o cutie de triere cu status segmentat, prioritate, zonă, editare și arhivare cu confirmare inline.

## Do's and Don'ts

### Do:
- **Do** folosește aceeași pictogramă și culoare de zonă în bară, rând, panou și formular.
- **Do** codifică status și prioritate prin formă și text.
- **Do** păstrează un singur buton primar vizibil pe fiecare zonă de ecran.
- **Do** confirmă inline acțiunile distructive, cu numele tichetului în text.
- **Do** verifică fiecare culoare nouă de text la minim 4.5:1, iar glifurile de zonă la minim 3:1.

### Don't:
- **Don't** folosi culori de zonă pentru status, selecție sau decor.
- **Don't** adăuga gradient, glass, glow, fundaluri animate sau cursor personalizat.
- **Don't** folosi bordură colorată laterală pe rânduri sau carduri; zona se arată prin pictogramă și prin banda de sus a panoului.
- **Don't** deschide modale pentru sarcini care încap în panou.
- **Don't** introduce un al doilea font.
