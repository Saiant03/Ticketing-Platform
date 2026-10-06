# memory.md — starea proiectului

Citește fișierul ăsta la începutul fiecărei sesiuni noi. Actualizează-l la final.

## Ce e proiectul

Platformă de tichete pentru WFM Extended (un tool intern), rulată ca web app Google Apps Script (HtmlService). Datele stau în Google Sheet (foile Tichete, News, Jurnal), iar capturile într-un folder Drive.
- Utilizatori: specialiști pe desktop (raportează și urmăresc tichete) și 3 admini (triază, publică News).
- Repo: `Saiant03/Ticketing-Platform`, **public**. Se lucrează doar pe `main` (regulă confirmată de utilizator; vechiul branch `claude/sleepy-heisenberg-8bihmr` nu se mai folosește).
- Utilizatorul scrie în română; vrea răspunsuri scurte și directe, fără emoji.

## Unde e fiecare lucru

| Ce | Unde |
|---|---|
| Cod Apps Script | `src/` (`Code.gs`, `Index`, `Tokens`, `Styles`, `Icons`, `App`) |
| Adevărul despre produs | `PRODUCT.md` |
| Design system-ul curent („Orbită”, accent mov) | `DESIGN.md`, `.impeccable/design.json` |
| Contractul de direcție („Panou split-flap”, înainte de „Panou calm”) | `.impeccable/surfaces/src-index-html.md` |
| Planul implementat | `docs/plan-orbita.md` (înainte `docs/plan-split-flap.md`) |
| Auditul UI-ului original (9/20) | `docs/audit/AUDIT.md`, `docs/audit/current/` |
| Screenshot-uri ale versiunii curente („Orbită”) | `.impeccable/review/` |
| Workflow și deploy | `docs/workflow.md`, ghid click cu click `docs/deploy.md` |
| Skill-uri vendorizate | `.claude/skills/` (`SOURCES.md`) |
| Agenți pentru delegare | `.claude/agents/` (`runner` Haiku, `executor` Sonnet) |
| Reguli pentru Claude | `CLAUDE.md` |

## Istoric

1. Am adăugat skill-uri (frontend-design, impeccable, ui-ux-pro-max, redesign-existing-projects, google-apps-script, webapp-testing) și structura de workflow.
2. Am importat codul original. Codurile de admin au fost scoase din cod: acum se citesc din Script Properties `ADMINS` (JSON `{"cod":"Nume"}`). Am făcut auditul UI-ului original.
3. Redesign „Sistem de zone” (commit `5ed13d2`), cu culoare și pictogramă pe zonă, listă + panou, light/dark. Utilizatorul l-a pus pe Apps Script (cele 6 fișiere + `ADMINS` setat) și l-a văzut: „bază bună, dar prea sumbru, prea corporate, prea tabel de birou”.
4. A cerut o **lume vizuală nouă**, cu animații, tranziții și nivel Awwwards. A ales direcția **„Panou split-flap”** și toate tipurile de animație (tranziții, micro-interacțiuni, momente wow, fundal/cursor ambient).
5. **„Panou split-flap” implementat** după `docs/plan-split-flap.md` (doar `Tokens`, `Styles`, `Index`, `App`, `Icons`; `Code.gs` neschimbat, toate apelurile `google.script.run` păstrate):
   - motorul de plăcuțe (`flap()` / `animateFlaps()` în `App.html`), un singur timer care se oprește la final; rotire la intrare (o dată pe sesiune, `tis_intro`), la schimbări din auto-refresh/admin și la trimitere;
   - `vt()` cu View Transitions pentru filtre/sortare (rânduri), panoul de detaliu și schimbarea paginii; numele de tranziție se pun doar pe durata tranziției;
   - ambient (lumini în hol + reflex pe panou) oprit după 6s, în tab ascuns și la reduced-motion; măsurat 0.2 ms/s în repaus (`dev/perf.py`);
   - verificări: `flow.py` 21/21, `a11y.py` fără probleme (contrast AA pe panou și hol, contur câmpuri 3:1, fără scroll orizontal la 1440/1280/900/390), detectorul impeccable doar cu avertismente advisory;
   - review final făcut inline (fără sub-agenți): verdict **ship**; DESIGN.md și `design.json` rescrise din build.
   Utilizatorul l-a pus pe Apps Script și l-a testat pe `/dev`: îi place aspectul și interactivitatea, dar i s-a părut „super bloated”.
6. **„Panou calm” + accent mov** (prima sesiune cu delegare la agenți: executor a implementat, runner a verificat):
   - accent mov în loc de galben: `#8A7BFF` pe suprafețe închise (`--sig`), `#6A55E0` în holul light (`--acc`); „În lucru” e mov;
   - bara de sus neagră (material de panou), tab-ul curent cu bară movă; toast negru cu plăcuță movă;
   - antetul panoului pe 2 rânduri (fără contoare și ceas); zonele ca text cu subliniere; prioritatea cu numere în opțiuni;
   - rândul pe 4 coloane (COD text, PROBLEMĂ cu zonă/raportor/timp dedesubt, PRIO bare, STATUS pe plăcuțe fără umplutură);
   - holul gol (indicatoarele și lista de scurtături) eliminat: panoul ocupă toată lățimea până deschizi ceva; la final de listă „Nu găsești problema? Raportează-o” + scurtăturile; fără rezultate, „Raportează-o” preia textul căutat;
   - ambientul (lumini, reflex) șters; repaus 0.1 ms/s; News cu titlu mai mic și tipul ca etichetă lângă autor;
   - verificări: `flow.py` 21/21, `a11y.py` fără probleme la 4 lățimi, `impeccable detect` doar advisory.

7. **„Orbită”** (octombrie 2026): utilizatorului „Panou calm” i s-a părut prea simplu și corporate. Am făcut 3 concepte (`docs/concepts/`: A Afiș, B Orbită, C Pietre); a ales B, interactiv, cu animații în fundal. Admin doar ca iconiță lacăt cu popover pentru parolă. Implementat după `docs/plan-orbita.md`: hartă SVG cu inele pe zone și planete pe tichete, card de sticlă, vedere Listă, News cronologie, stele pe canvas, rotație lentă, zbor la tichet nou. Verificări: `flow.py` 28/28, `a11y.py` curat, `perf.py` 9.8 ms/s animat și 0 în repaus. Abateri: stelele sunt un canvas desenat o dată și mișcat cu transform (redesenarea costa prea mult), ticker static.

8. **„Orbită” runda 2** (commit `b25412d`, publicată pe `/exec`), cerută după testul pe `/dev`:
   - filtrul implicit e „Toate” (primul în bandă), ca harta să aibă planete și cu datele reale (0 active, 14 rezolvate);
   - pe hartă mică (pași între inele < 40px) numele inelelor se împrăștie pe arc la unghiuri fixe `[0, -0.9, 0.8, -0.3, 0.45]` rad, font 10px;
   - etichetele se plasează greedy fără coliziuni (`placeLabels`): 8 poziții candidate în jurul planetei (modul near) sau deplasări verticale în afara inelului (modul far, ≤ 10 tichete), evitând etichetele puse, corpurile celorlalte planete, numele inelelor și marginile; cu histerezis;
   - stele pe 3 straturi de adâncime: fundul e canvas (95, f 0.25), mijlocul și fața sunt puncte DOM (45 și 22) mișcate prin variabile CSS; 3 canvasuri pe tot ecranul costau 20 ms/s;
   - Hartă → Listă: zoom în nucleul WFM, lista iese din el (clip-path cerc); invers lista se strânge în nucleu și harta se deschide din el; `.stage` are `overflow:hidden`;
   - între pagini camera se mută lateral (pagina veche iese, cea nouă intră din partea opusă, stelele alunecă după adâncime, nebuloasa se mută lin prin `@property --gx/--gy`);
   - News: coloană de dată, linie-orbită cu puncte colorate după tip, cel mai nou anunț evidențiat, primul paragraf mai mare;
   - verificări: `flow.py` 34/34 (inclusiv coliziuni de etichete la 1440 și 390, nume de inele la 390, tranziții), `a11y.py` curat (contrast minim 5.59), `perf.py` 14.2 ms/s animat și 0 în repaus, `impeccable detect` doar advisory;
   - `DESIGN.md` și `.impeccable/design.json` rescrise din build.

9. **„Orbită” runda 3** (commit `e50b061`, publicată pe `/exec`), după testul utilizatorului pe `/exec` („se mișcă greu”, „rotirea sacadată”, „primele 2 tichete fără animație”, „zoom la căutare”):
   - cauze măsurate cu CPU 4x (`dev/trace.py`, CDP tracing): stelele DOM primeau variabile CSS la fiecare cadru, `@property --gx/--gy` recalcula stilul întregului document, `clip-path` necompozitat, harta SVG actualizată la 2Hz; rândurile animate erau doar primele 12 (real: 14 tichete);
   - acum toată mișcarea continuă e pe compozitor: inelele sunt straturi `.orb` rotite cu WAAPI (`id:'orb'`), planetele (`div.planet` > `.up` contra-rotit, `id:'up'`) stau drepte; stelele sunt 3 imagini (canvas din afara paginii → `background-image`) cu derivă/sclipire WAAPI; paralaxa și camera dintre pagini sunt tranziții CSS pe `.sl`; nebuloasa e `#nebula` mutat cu transform; fără buclă rAF;
   - etichetele stau mereu lângă planetă (modul „far” cu linii de legătură a fost scos, cu acordul utilizatorului), plasare la 1 s cât harta se rotește;
   - tranziții mai scurte (hartă→listă 320+420ms, listă→hartă 260+480ms, pagini 280/380ms), toate rândurile animate;
   - căutarea face zoom (max 1.8×) pe 1–4 rezultate, Enter deschide primul (doar cu text);
   - cache `localStorage` `tis_cache_t`/`tis_cache_n` pentru randare instant; fontul Google nu mai blochează afișarea;
   - verificări: `flow.py` 42 OK, `a11y.py` curat, `perf.py` 4.5 ms/s animat / 0.2 repaus; trace CPU 4x: rotație 1% din fir (era 9%), tranziții 16–35% (erau 61–90%).
   - Notă: o rulare automată a rămas fără runner GitHub (anulată după 15 min, `runner_id: 0`); re-rularea a trecut.

10. **„Orbită” runda 4** (commit `ca6a7b1`, publicată pe `/exec`: rularea automată pe `/dev` și „Deploy Apps Script” cu `deploy: true` verzi): meniurile derulante custom și fixul la numerele de prioritate.
   - cele 5 `<select>` (`#prioFilter`, `#zoneSel`, `#sortSel`, `#ad-prio`, `#ad-zone`) sunt butoane `.select.dd` (pill de sticlă) cu un singur listbox comun `#ddList` în `body` (position:fixed, ca să nu fie tăiat de card); funcțiile `ddSet`/`ddOpen`/`ddActive`/`ddClose`/`ddPick` în `App.html`, opțiunile în `DD.opts[id]`;
   - alegerea pune `button.value` și emite `change` pe buton, deci handler-ul `change` existent (filtre, sortare, `setField`) a rămas neschimbat; focusul revine pe buton și după ce cardul de admin se redesenează;
   - WAI-ARIA buton + listbox cu `aria-activedescendant`; săgeți, Home/End, Enter/Space, Escape, Tab, click în afară, prima literă fără diacritice; deschidere 160ms, fade la reduced-motion;
   - numerele din meniul de prioritate vin din `scope()`;
   - verificări: `flow.py` toate OK (teste noi: tastatură, numere, încadrare la 390), `a11y.py` curat, `perf.py` 4.0 ms/s animat / 0.2 repaus, `trace.py` rotație 1%, tranziții 10–21%; capturi `*meniu*` în `.impeccable/review/`;
   - `a11y.py` raportează uneori `overflow: ['shoot']` la 390: e steaua căzătoare (element temporar), apare și înainte de runda 4.

11. **Întărirea serverului** (runda 5, commit `4efc234`, publicată pe `/exec` după verificarea utilizatorului pe `/dev`; plan în `docs/plan-hardening.md`):
   - `admin_(pin)` aplică blocarea (5 greșeli → 60 s) la toate funcțiile de admin, nu doar la `verifyPin`; contorul `PINLOCK` se scrie sub `LockService`; codul gol nu contează; codurile ≥ 12 caractere ocolesc blocarea;
   - `txt_` pune prefixul `'` pe textul utilizatorilor (Sheets îl păstrează ca text: fără formule `=…`, fără date `1/2`; verificat de utilizator în Sheet-ul real); `str_` la citire, ca o dată rămasă într-o coloană text să nu strice răspunsul `google.script.run`; CSV-ul prefixează `= + - @`;
   - status și prioritate validate pe server; `addTicket` cere titlu;
   - `dev/gs-test.js` (`node dev/gs-test.js`) rulează `Code.gs` real cu servicii Apps Script simulate; `mock-gas.js` oglindește blocarea și validarea; `flow.py` le testează.
   - Upload-ul și capturile orfane s-au rezolvat în runda 6, comentariile în runda 7.
   - `flow.py`: testul de coliziuni de etichete la 1440 pică rar, intermitent (o rulare din 4), și pe codul vechi; depinde de momentul rotației.

12. **Limită pe upload și curățarea capturilor orfane** (runda 6, commit `eeb1648`, publicată pe `/exec` după verificarea utilizatorului pe `/dev`; plan în `docs/plan-uploads.md`):
   - `uploadAttachment`: cel mult 60 de capturi pe oră și 300 pe zi pentru toată aplicația (contoare în `CacheService`, sub lock); doar JPEG real (`FF D8 FF`), clientul trimite oricum JPEG;
   - `cleanupOrphans_` rulează cel mult o dată la 24 h din `uploadAttachment` (marcaj `CLEANUP_AT`): capturile nefolosite de tichete (inclusiv arhivate) sau News, mai vechi de 24 h, merg la coșul Drive; 20 s pe rulare; nu face nimic dacă nu găsește nicio referință; intrare „curățare capturi” în Jurnal;
   - fără trigger cu timp: `ScriptApp` ar cere un scope nou și reautorizare; `src/appsscript.json` nu e în repo (deploy-ul ia manifestul live), deci orice serviciu cu scope nou trebuie evitat sau anunțat utilizatorului;
   - limită cunoscută: cu mii de capturi în folder, cele 20 s pot să nu ajungă la toate (iterația începe mereu de la capăt).

13. **Comentariile în foaia proprie** (runda 7, commit `8e89531`, publicată pe `/exec` după verificarea utilizatorului pe `/dev`; plan în `docs/plan-comentarii.md`):
   - comentariile noi stau în foaia `Comentarii` (`Cod | Autor | Admin | Text | Data`), câte un rând; înainte erau JSON într-o singură celulă (max 50.000 caractere, ~12 comentarii lungi);
   - citirea combină JSON-ul vechi din coloana 16 (și răspunsul vechi din coloana 9) cu rândurile noi, ordonate după dată; fără migrare, datele vechi rămân unde sunt;
   - citirea nu creează foaia (doar `addComment`, sub lock); `purgeTicket` șterge și rândurile de comentarii.

## Decizii confirmate de utilizator

- Execuția se deleagă mereu la agenți pe model mai slab: `runner` (Haiku) pentru verificări și căutări, `executor` (Sonnet) pentru cod după specificație. Designul, review-ul, commit-ul și push-ul rămân la agentul principal (vezi `CLAUDE.md`).
- Skill-ul `ponytail` e folosit pentru orice cod (copiat în `.claude/skills/`, fără hook-urile plugin-ului).

- Utilizator principal: specialiști, pe desktop.
- Doar temă dark (confirmat; tema light scoasă din `Tokens.html`). `dev/shoot.py` și `dev/a11y.py` verifică doar dark.
- Accentul e mov `#8A7BFF`.
- Direcția vizuală e „Orbită” (harta cu planete). Animațiile de fundal sunt cerute explicit, dar se opresc în tab ascuns, după 60 s de inactivitate și la reduced-motion.
- Scope backend: UI + fixuri mici. Deja făcute:
  - codurile de minim 12 caractere ocolesc blocarea globală;
  - `getAttachmentThumb`;
  - `include()` + template în `doGet`;
  - helper `ownFile_`.
- Numele „WFM Extended” și pagina News rămân.
- Expresiv, nu corporate, dar fără încărcare: mișcarea doar ca răspuns la acțiuni sau schimbări de date.

## Constrângeri tehnice

- Fără build step. CSS și JS stau în fișiere HTML incluse cu `<?!= include('X') ?>`; doar `Index.html` e evaluat ca template.
- Toate apelurile `google.script.run` și semnăturile funcțiilor server rămân. Orice funcție server nouă se adaugă și în `dev/mock-gas.js`.
- Niciun secret în repo (repo public).
- Interfața e în română, cu diacritice.

## Unelte locale

```bash
pip install playwright                 # o dată pe sesiune (Chromium e deja în /opt/pw-browsers/chromium)
python3 dev/preview.py &               # http://localhost:8080/, google.script.run simulat, cod admin de test 1234
python3 dev/shoot.py <folder>          # screenshot-uri desktop 1440 + mobil 390, doar dark
python3 dev/flow.py                    # pașii funcționali („Orbită”): coliziuni de etichete, tranziții, meniuri derulante
python3 dev/a11y.py                    # contrast tokeni panou + hol, etichete, ținte, scroll orizontal la 4 lățimi
python3 dev/perf.py                    # ms/s de task-uri: < 15 cu animația pornită, < 5 în repaus (~100 s)
node dev/gs-test.js                    # Code.gs real cu servicii Apps Script simulate (blocare, text, validare)
python3 dev/trace.py                   # % ocupare a firului principal cu CPU 4x (rotație, tranziții, mouse)
.claude/skills/impeccable/scripts/impeccable detect --json src/*.html
```

## Limitările mediului cloud

- `script.google.com` și `impeccable.style` sunt blocate de politica de rețea. Site-ul live nu poate fi deschis, iar rolul de direcții impeccable rulează degradat, fără challengeri.
- Google Fonts se încarcă uneori prin proxy cu `ERR_TOO_MANY_RETRIES`; atunci screenshot-urile apar cu fontul de rezervă. Nu e bug de cod.
- În Chromium headless (randare software) o View Transition are ~150ms până la randare; de aceea `flow.py` așteaptă 500ms după filtre și deschideri. Pe GPU real e 1–2 cadre.
- Agenții definiți în `.claude/agents/` se încarcă doar la pornirea sesiunii; după ce se schimbă, delegarea merge din sesiunea următoare.

## Cum pune utilizatorul codul în Apps Script

După ce sunt setate secretele GitHub (vezi „Următorul pas”), push-ul pe `main` face pasul 1 automat. Până atunci, manual:

1. Pentru fiecare fișier: deschide linkul raw `https://raw.githubusercontent.com/Saiant03/Ticketing-Platform/main/src/<Fișier>`, apasă Ctrl+A, Ctrl+C, apoi lipește în fișierul cu același nume din editor (fișierele HTML se scriu fără `.html`) și salvează.
2. Testează pe Deploy → Test deployments → URL-ul `/dev`.
3. Publică din Deploy → Manage deployments → creion → New version → Deploy. Revenirea se face alegând versiunea anterioară.

Pașii trebuie explicați foarte simplu, click cu click: utilizatorul nu e familiarizat cu editorul.

## Următorul pas

Rundele 4 (meniuri), 5 (întărirea serverului), 6 (upload, capturi orfane) și 7 (comentarii în foaia proprie) sunt pe `/exec`. Lista de robustețe discutată e închisă. Nu e nimic în lucru; așteaptă următoarea cerere.

Note:
- Profilarea: `python3 dev/trace.py` (CDP tracing cu CPU încetinit 4x, % ocupare a firului principal pe scenarii). Orice efect continuu nou trebuie să fie WAAPI/tranziție pe `transform`/`opacity`.
- `TaskDuration` din `Performance.getMetrics` e în secunde.
- Meniurile noi se fac doar cu componenta `.dd` (fără `<select>` nativ).
