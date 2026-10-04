# Audit UI curent (WFM Extended / Tichete TIS)

Data: 2026-10-04. Sursa: `src/Index.html`, `src/Code.gs` așa cum au fost primite.
Metodă: rulare locală prin `dev/preview.py` (mock `google.script.run`), screenshot-uri în `docs/audit/current/`, detectorul `impeccable detect`, verificări Playwright (etichete, ținte tactile, overflow, CPU), contrast calculat pe suprafața glass (~`#121420`).
Site-ul live (`script.google.com`) nu a fost accesibil din mediul de lucru; tot ce e mai jos e verificat pe cod + randare locală.

## Ce face aplicația (inventar funcțional)

Public (oricine are linkul):
- Creare tichet: nume, titlu, descriere, max 5 capturi (drag/drop, Ctrl+V, compresie JPEG 1600px), prioritate (4), categorie (6, opțional). Primește cod `TIS-NN` în modal.
- Listă tichete: căutare, filtre status (Toate/Deschis/În lucru/Rezolvat), dropdown prioritate + categorie, „încarcă mai multe” la 30.
- Comentarii pe tichet (cu nume liber).
- Pagina News: anunțuri (update / fix / anunț) cu carusel de capturi și lightbox cu zoom/pan/pinch.
- Auto-refresh la 20s.

Admin (cod PIN):
- Schimbare status / prioritate, editare titlu/descriere/prioritate/categorie, arhivare, restaurare, ștergere definitivă, export CSV.
- Comentarii marcate „admin”.
- Publicare / editare / ștergere anunțuri.
- Funcții server neexpuse în UI: `getJournal` (jurnal acțiuni), `replyTicket` (UI-ul de răspuns există în cod dar nu mai e randat; înlocuit de comentarii).

## Scor

| # | Dimensiune | Scor | Problema principală |
|---|---|---|---|
| 1 | Accesibilitate | 2 | Input-urile principale n-au etichete asociate; cursorul nativ e ascuns; butonul admin are contrast 2.9:1 |
| 2 | Performanță | 2 | Canvas animat pe tot ecranul + bucla cursorului rulează continuu (~100 ms task/s în repaus, 1920x1080 headless) |
| 3 | Responsive | 2 | Bara de navigare fixă și butonul admin acoperă conținut; butonul reload acoperă titlul pe mobil; 50+ ținte sub 44px |
| 4 | Theming | 2 | Există tokens în `:root`, dar culorile de status/prioritate/news sunt hardcodate în JS și CSS (zeci de valori rgba) |
| 5 | Integritate implementare | 1 | Look generic „AI glass” (gradient text, glassmorphism, glow, aurora), cod mort, ierarhie inversată pentru utilizatorul principal |
| **Total** | | **9/20** | **Poor: redesign justificat** |

## Verdict integritate implementare

Fail. Interfața nu exprimă un produs de lucru (tool intern de tichete), ci un template decorativ: titlu gigant cu gradient (detector: `gradient-text` x2), panouri glass cu bordură hairline + umbră largă (detector: `gpt-thin-border-wide-shadow`), fundal animat, cursor custom, linie de progres a scroll-ului. Toate consumă atenție și CPU fără să ajute la triere sau raportare. Funcționalitatea de dedesubt e solidă și merită păstrată integral.

## Probleme, după severitate

### P0 (blocante / securitate)

**[P0] Codurile de admin sunt în codul sursă**
- Locație: `Code.gs`, `var ADMINS = {...}` (versiunea primită)
- Impact: repo-ul GitHub e public; orice commit cu codurile le-ar fi expus. Două dintre ele sunt numerice scurte (6 cifre, 4 cifre).
- Stare: rezolvat în repo. `adminName_` citește acum codurile din Script Properties (`ADMINS`, JSON). Codurile vechi trebuie schimbate oricum, pentru că au circulat în clar.

**[P0] Blocarea la încercări greșite e globală**
- Locație: `Code.gs`, `verifyPin` (`PINLOCK` în Script Properties, comun pentru toți)
- Impact: oricine poate trimite 5 coduri greșite pe minut și blochează login-ul pentru toți adminii. Pe de altă parte, 5 încercări/minut permit totuși ghicirea unui cod de 4 cifre în ~33 de ore.
- Recomandare: coduri lungi (minim 10 caractere) + blocare progresivă; opțional identificare prin contul Google (`Session.getActiveUser()`) dacă web app-ul rulează în domeniul organizației.

### P1 (majore)

**[P1] Câmpurile formularului n-au etichete asociate**
- Locație: `#reporter`, `#title`, `#desc`, `#search`, `#newsTitle`, `#newsBody` (`<label class="fld">` fără `for`)
- Impact: cititoarele de ecran anunță câmpuri fără nume; click pe etichetă nu focalizează câmpul. WCAG 1.3.1, 4.1.2.

**[P1] Cursorul nativ este ascuns pe desktop**
- Locație: CSS `body{cursor:none}` + `.cursor-inner/.cursor-outer`
- Impact: cursorul real e înlocuit cu un cerc care întârzie față de mouse (interpolare 0.2/frame); pierde forma de text/link, iar mix-blend-mode îl face invizibil pe unele zone. Afectează precizia la fiecare click.

**[P1] Butonul de admin e aproape invizibil**
- Locație: `.fab` (opacitate .65, culoare cu alpha .55) — contrast ~2.9:1. WCAG 1.4.11 (min 3:1 pentru componente).
- Impact: adminii trebuie să „știe” unde e; utilizatorii noi nu-l văd deloc (ceea ce poate fi intenționat, dar atunci trebuie un mecanism explicit).

**[P1] Navigația fixă de jos acoperă conținutul**
- Locație: `body.nav-bottom .nav`, `.fab-wrap`, `.navscrim` (screenshot `desktop-public.png`, `desktop-admin.png`)
- Impact: la 1280x860, bara de jos stă peste toolbar-ul de căutare/filtre și peste ultimul card; pe mobil butonul admin stă peste chip-urile de prioritate (`mobil-public.png`). Scrim-ul de 150px întunecă permanent partea de jos a ecranului.

**[P1] Ierarhie greșită pentru utilizatorul public**
- Locație: `.stack` / `order` (formular primul, listă a doua)
- Impact: la 1280x860 lista de tichete nu apare deloc în primul ecran; un specialist care vrea să vadă dacă problema e deja raportată trebuie să deruleze peste tot formularul. Pe mobil formularul ocupă ~2 ecrane.

**[P1] Fundal animat + cursor rulează permanent**
- Locație: IIFE „fundal: grilă de puncte animată” (dublu `for` peste tot ecranul la fiecare frame) și bucla `requestAnimationFrame` a cursorului
- Impact măsurat: ~100 ms de task-uri pe secundă cu pagina în repaus (Chromium headless, 1920x1080). Pe laptopuri de birou înseamnă ventilator/baterie pentru un tab ținut deschis toată ziua.

**[P1] „Toate” nu arată toate tichetele**
- Locație: `visibleTickets()` — `filter==='toate'` exclude `rezolvat`
- Impact: eticheta minte; tichetele rezolvate apar doar pe filtrul „Rezolvat”. Un specialist care își caută tichetul rezolvat crede că a dispărut.

### P2 (minore)

**[P2] Ținte tactile sub 44px** — 51 de elemente pe mobil (`.mini` 38px, `.dd-btn` 38px, chip-uri prioritate/categorie ~32px, `.thumb .rm` 22px).

**[P2] Butonul reload acoperă titlul pe mobil** — `.reload-fab` absolut peste `h1` (`mobil-public.png`: „EXTENDE[⟳]”).

**[P2] Toolbar-ul se rupe pe 2–4 rânduri** — search + 4–5 filtre + export + 2 dropdown-uri într-un singur flex-wrap (`desktop-admin.png`: „Categorie” singur pe al doilea rând; `mobil-admin.png`: 4 rânduri de filtre înainte de primul tichet).

**[P2] Acțiunile cardului sunt aliniate inconsecvent** — butonul „Comentarii” plutește la mijloc între „Raportat de” și acțiunile admin (`justify-content:space-between` pe 3 copii).

**[P2] Culori hardcodate** — `PRIORITIES`, `STATUSES`, `NEWS_TYPES` în JS + ~40 de valori `rgba(...)` repetate în CSS. Nu există un singur loc de unde schimbi paleta.

**[P2] Hint-uri sub contrast** — `label.fld .hint` `#6F7686` = 4.0:1 (sub 4.5:1).

**[P2] Bara de scroll nativă e ascunsă** — înlocuită cu o linie de 3px sus; utilizatorii pierd indicatorul de poziție și ținta de drag pe desktop.

**[P2] Atașamentele trec prin base64 + `google.script.run`** — fiecare captură e citită integral din Drive și trimisă ca string; cache doar în memorie. Pe liste cu multe capturi, încărcarea e lentă. (Limitare de backend, de discutat dacă intră în scope.)

**[P2] Fără landmark `main`, un singur `h2` pe listă** — tichetele folosesc `h3` fără un `h2` părinte pe secțiunea listei.

### P3 (polish)

- Cod mort: `.aurora/.blob`, `#bgwave`, `.tabs`, `.nav-pos`, `.nav-left`, `replyEditor()`/`data-reply`, `adminOp()`, `.admin-chip` duplicat.
- Trei familii de fonturi (Schibsted Grotesk, JetBrains Mono, Italiana) pentru un tool de 2 ecrane.
- Linkul „Sari la formular” duce la `#createSection`, care e ascuns pe pagina News.
- `startEditNews` aplică `esc()` pe un text care e escapat din nou în `showBanner` (apare `&amp;` dacă ID-ul ar conține `&`).
- `<title>` „Tichete · Ciornă WFM Extended” e suprascris de `setTitle('WFM Extended')` în `doGet`.

## Probleme sistemice

- Decorul a crescut peste structură: 6 straturi fixe (canvas, cursor x2, scrim, progres, nav, fab) concurează cu conținutul.
- Un singur fișier de ~1200 de linii cu CSS, HTML și JS amestecate; regula din `CLAUDE.md` cere separare în fișiere incluse.
- Starea UI (meniu deschis, editare, confirmare) e ținută în `state` global și fiecare acțiune re-randează toată lista prin `innerHTML` (pierde focus-ul și poziția cursorului în textarea).

## Ce funcționează bine (de păstrat)

- Backend corect: `LockService` pe toate scrierile, arhivare recuperabilă, jurnal de acțiuni, validare MIME și dimensiune la upload, `getAttachment` restricționat la folderul propriu.
- Update-uri optimiste cu rollback la eroare.
- Confirmări inline pentru acțiuni distructive (nu `confirm()`).
- Lipire capturi cu Ctrl+V, compresie client-side.
- Escapare HTML consecventă (`esc()`) la randare.
- `prefers-reduced-motion` e respectat (deși prin kill global).
- Focus vizibil definit pentru majoritatea controalelor; skip link.

## Pași recomandați

1. **[P0]** Setează `ADMINS` în Script Properties cu coduri noi, lungi; apoi deploy cu `Code.gs` din repo.
2. **[P0/P1] `/impeccable shape`** pe fluxurile principale (specialist: verifică/raportează; admin: triază) înainte de orice cod vizual.
3. **[P1] redesign complet** (direcție vizuală nouă, `docs/design/DESIGN.md`): elimină canvas, cursor, gradient text, glass; listă densă + detaliu tichet; formular secundar.
4. **[P1] `/impeccable harden`**: etichete, contrast, ținte tactile, „Toate” corect.
5. **[P2] `/impeccable optimize`**: thumbnail-uri / cache pentru capturi.
6. **`/impeccable polish`** la final.
