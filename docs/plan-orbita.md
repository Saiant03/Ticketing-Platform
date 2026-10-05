# Plan: redesign „Orbită”

Direcție aleasă de utilizator: conceptul B din `docs/concepts/b-orbita.html` / `.png`, interactiv, cu animații în fundal. Înlocuiește „Panou calm”. Doar temă dark.

Reguli care rămân: `Code.gs` neschimbat; toate apelurile `google.script.run` și semnăturile rămân; fără build step; CSS/JS în `Tokens`, `Styles`, `App`, `Icons`, incluse din `Index`; interfața în română cu diacritice.

## 1. Tokeni (`src/Tokens.html`, rescris)

- Fonturi: `Space Grotesk` (400, 500, 600, 700) pentru UI și titluri, `JetBrains Mono` (400, 500) pentru coduri, etichete, meta. Link Google Fonts în `Index.html` (înlocuiește Archivo).
- Spațiu: `--space-0 #06050C` (fond), `--nebula #2A1B5E` (strălucirea centrală), `--glass rgba(255,255,255,.06)`, `--glass-2 rgba(255,255,255,.10)`, `--glass-line rgba(255,255,255,.12)`, `--ring rgba(255,255,255,.10)`, `--blur 18px`.
- Cerneală: `--ink #F4F4F0`, `--ink-2 rgba(244,244,240,.72)`, `--ink-3 rgba(244,244,240,.50)` (doar text ≥ 13px și verificat la contrast pe `--space-0`; dacă nu trece 4.5:1, ridică opacitatea).
- Accent: `--acc #8A7BFF`, `--acc-h #A093FF`, `--on-acc #0B0C0E`.
- Status: `--st-open #F4F4F0`, `--st-work #8A7BFF`, `--st-done rgba(244,244,240,.45)` (planetă goală, doar contur), `--st-crit #FF4D3D`, `--ok #3DDC84`, `--danger #FF6B5E`.
- Rază: `--r-card 20px`, `--r-pill 999px`, `--r-sm 10px`. Spațiere `--sp-1..7` ca acum.
- Mișcare: `--ease cubic-bezier(.16,1,.3,1)`, `--t-fast 160ms`, `--t-card 420ms`.
- Păstrează numele de tokeni pe care `dev/a11y.py` îi verifică sau actualizează lista din `a11y.py` la noile nume (contrast text ≥ 4.5:1, elemente non-text ≥ 3:1).

## 2. Structura ecranului Tichete (desktop ≥ 901px)

- Fond: `<canvas id="stars">` fix, pe tot ecranul, sub tot (z-index 0), plus strălucirea nebuloasei (radial-gradient pe `body`, centrată pe nucleul hărții).
- Bara de sus (transparentă, fără fundal plin, 64px): stânga `wfm/extended` (Space Grotesk 20px, „/” în `--acc`), apoi tab-urile `Tichete` (activ: punct mov înainte) / `News` / `Jurnal` (doar admin). Dreapta: căutarea ca pill de sticlă („Caută pe hartă…”, scurtătura `/`), butonul `+ Tichet nou` (pill plin `--acc`, text negru), apoi **butonul admin ca iconiță lacăt singură** (cerc de sticlă 40px, `aria-label="Admin"`, fără text). La click se deschide sub el un popover de sticlă cu „Cod de admin”, câmp parolă, „Intră”. Logat: lacătul devine deschis (iconiță nouă `i-unlock`), cu un punct mov; click → popover cu numele adminului și „Ieși”.
- Sub bară, stânga: o bandă de filtre ca pill-uri de sticlă: status (`Active n`, `Deschise n`, `În lucru n`, `Rezolvate n`, `Toate n`, `Arhivă` doar admin), selectul de prioritate, comutatorul de vedere `Hartă | Listă` (`#viewMap`, `#viewList`), export CSV (admin). Zonele nu mai sunt chip-uri separate: se filtrează dând click pe numele inelului de pe hartă (și în vederea Listă printr-un select de zonă).
- Harta (`#map`, SVG inline, ocupă spațiul rămas): nucleu „WFM” în centru; inele concentrice per zonă, din interior spre exterior: Import, Interfață, Date, Raportare, Altele (General + Altul + fără zonă). Numele zonei scris pe inel cu `textPath` (mono 11px, majuscule, spațiere .2em, `--ink-3`), clicabil: filtrează pe zona aceea (a doua apăsare scoate filtrul); inelul filtrat se aprinde (contur `--acc` la 40%), celelalte se estompează.
- Planete (`<g class="planet" data-id="TIS-14" tabindex="0" role="button" aria-label="TIS-14, Critică, Deschis: titlu">`): pe inelul zonei, distribuite egal pe unghi (cu fază diferită pe fiecare inel ca să nu se alinieze), ordinea după data creării. Rază după prioritate: Scăzută 6, Medie 9, Ridicată 13, Critică 18. Culoare după status: Deschis plin alb; În lucru plin mov cu strălucire (filtru SVG blur); Rezolvat doar contur. Critică: halou roșu `--st-crit` la r+10, opacitate .35, care „respiră” (animație lentă de opacitate).
- Etichete: cod mono 11px lângă planetă, mereu vizibil. Titlul (Space Grotesk 13px, max 220px, pe 2 rânduri) apare: mereu dacă sunt ≤ 10 tichete vizibile; altfel doar la hover/focus și pentru cel selectat. Eticheta stă radial spre exterior, legată de planetă cu o linie de 1px la 30% alb; `text-anchor` după partea în care e (stânga/dreapta) ca să nu intre peste hartă.
- Tichetul selectat: două inele concentrice mov (r+16, r+26) care pulsează lent, linia de legătură în `--acc`.
- Card de detaliu (`#panel`): sticlă (`--glass`, `backdrop-filter: blur(var(--blur))`, contur `--glass-line`, `--r-card`), fix în dreapta (lățime 400px, sus 88px, jos 24px, scroll intern). Intră glisând din dreapta + fade (`--t-card`). Cât e deschis, centrul hărții se mută spre stânga (tranziție lină). Conținut = ce e acum în panou (cod, titlu, chip-uri prioritate/status/zonă, raportor, timp, descriere, capturi, comentarii, zona de admin, editare, arhivare), restilizat cu pill-uri și sticlă. Închidere cu X sau Escape.
- Formularul „Tichet nou” se deschide în același card. Zona și prioritatea se aleg cu pill-uri.
- Jos-stânga: legenda (mono 11px): „mărime = prioritate · alb = deschis · mov = în lucru · contur = rezolvat”. Jos-centru: ultimul anunț din News ca ticker mono („news ▸ titlu · ieri”), click duce la News. Încarcă News-ul la pornire ca să existe ticker-ul.
- Vederea Listă (`#list`, păstrează `.row[data-id]`, `aria-current` pe selecție, `.r-zone[data-z]`): rânduri de sticlă (cod mono, titlu, zonă·raportor·timp, puncte de prioritate, chip de status), peste același fundal cu stele. Sortarea (`#sortSel`) apare doar în vederea Listă. Alegerea vederii se ține în `localStorage` (`tis_view`, în try/catch).

## 3. Animații și interacțiuni

- Stele (canvas): ~160 de stele în 3 straturi de adâncime, derivă lentă, sclipire subtilă, paralaxă ușoară după mouse (max 12px pe stratul apropiat). Rar (la ~8–15 s), o stea căzătoare.
- Orbite: planetele se rotesc lent pe inele (inelul interior o rotație în ~6 min, cele exterioare mai încet). Rotirea se oprește cât timp mouse-ul e pe hartă sau pe card și cât e deschis un card, ca să poți ținti; reia lin (easing pe viteză, nu salt).
- Nucleul pulsează lent; linia întreruptă a unui inel curge (`stroke-dashoffset`).
- Hover/focus pe planetă: crește 1.25× (transition), apare titlul, linia se aprinde; cursor pointer.
- Click planetă: harta face un „zoom” scurt spre planetă (scale 1.06 centrat pe ea) apoi se așază, cardul intră.
- Filtre și căutare: planetele care nu se potrivesc se estompează la 12% și se micșorează (nu dispar brusc), cele potrivite rămân. Numărul de rezultate în bandă.
- Tichet nou trimis: planeta nouă pornește din nucleu și „zboară” pe o curbă până la locul ei pe inel (~900 ms), apoi un val (inel care se extinde și dispare).
- Schimbare de status/prioritate (admin sau auto-refresh): planeta își schimbă culoarea/mărimea cu tranziție și emite un val.
- Tastatură: `/` caută, `N` tichet nou, `J`/`K` trec la planeta următoare/anterioară (ordinea din listă), `Enter` deschide, `Escape` închide cardul. Focus vizibil (inel `--acc`).
- Toată mișcarea de fundal (stele, orbite, puls, ticker) rulează într-un singur `requestAnimationFrame` și se oprește: în tab ascuns (`visibilitychange`), după 60 s fără activitate (mouse/tastatură; reia la prima mișcare), și complet la `prefers-reduced-motion: reduce` (atunci planetele stau fixe, fără zoom și fără zbor; tranzițiile devin fade scurte).
- Țintă: `dev/perf.py` sub 5 ms/s în repaus după încărcare, sub 15 ms/s cu animația pornită.

## 4. Celelalte ecrane

- News: aceeași bară și același fundal cu stele. Coloană centrală de 720px: titlu „News” mare (Space Grotesk 44px), apoi anunțurile ca o cronologie: o linie verticală subțire cu un punct luminos per anunț (mov = update, verde = fix, alb = anunț) și carduri de sticlă (tip ca chip mono, titlu, autor, dată, corp, capturi). Formularul de anunț (admin) în card de sticlă. Păstrează `#newsNewBtn`, `#nw-title`, `#nw-body`, `[data-ntype]`, `#nw-submit`, `.news-item`.
- Jurnal (admin): tabel într-un card de sticlă, mono pentru dată și cod. Păstrează `#journal`, `#journalRefresh`.
- Lightbox, toast-uri: sticlă închisă, aceleași funcții.
- Mobil (≤ 900px): vederea implicită e Lista; comutatorul permite harta, care se scalează să încapă pe lățime și arată doar codurile (titlul la atingere). Cardul de detaliu devine ecran întreg cu buton înapoi (ca acum). Fără scroll orizontal la 390px.

## 5. Ce se șterge

Motorul split-flap (`flap`, `animateFlaps`, `spin`, `flapTick`, `#brandFlaps`, clasele de plăcuțe), stilurile „Panou calm” care nu mai sunt folosite, iconițele de zonă dacă nu mai apar nicăieri. View Transitions pot rămâne doar dacă sunt folosite; altfel se scot.

## 6. Verificare

- `dev/flow.py` actualizat: aceiași 21 de pași (comută întâi pe Listă cu `#viewList`), plus: pe Hartă sunt 6 `.planet`; click pe un nume de inel filtrează; click pe `.planet[data-id='TIS-13']` deschide cardul cu TIS-13; adminul se deschide din iconița lacăt.
- `dev/a11y.py`: contrast pe noii tokeni, etichete, ținte ≥ 32px, fără scroll orizontal la 1440/1280/900/390.
- `dev/perf.py` în limitele de mai sus. `dev/shoot.py` cu selectorii noi.
- Capturi în `.impeccable/review/`.
