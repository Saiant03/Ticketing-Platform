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
| Design system-ul curent („Panou calm”, accent mov) | `DESIGN.md`, `.impeccable/design.json` |
| Contractul de direcție („Panou split-flap”, înainte de „Panou calm”) | `.impeccable/surfaces/src-index-html.md` |
| Planul implementat | `docs/plan-split-flap.md` |
| Auditul UI-ului original (9/20) | `docs/audit/AUDIT.md`, `docs/audit/current/` |
| Screenshot-uri ale versiunii curente („Panou calm”) | `.impeccable/review/` |
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

## Decizii confirmate de utilizator

- Execuția se deleagă mereu la agenți pe model mai slab: `runner` (Haiku) pentru verificări și căutări, `executor` (Sonnet) pentru cod după specificație. Designul, review-ul, commit-ul și push-ul rămân la agentul principal (vezi `CLAUDE.md`).
- Skill-ul `ponytail` e folosit pentru orice cod (copiat în `.claude/skills/`, fără hook-urile plugin-ului).

- Utilizator principal: specialiști, pe desktop.
- Temă light + dark după sistem. Panoul și bara sunt mereu dark, holul urmează tema.
- Accentul e mov (`#8A7BFF` / `#6A55E0`); galbenul nu se mai folosește.
- Interfața trebuie să rămână aerisită: fără contoare, ceas, ambient sau panouri de instrucțiuni.
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
python3 dev/shoot.py <folder>          # screenshot-uri desktop 1440 + mobil 390, light + dark
python3 dev/flow.py                    # 21 de pași funcționali (selectori pentru „Panou split-flap”)
python3 dev/a11y.py                    # contrast tokeni panou + hol, etichete, ținte, scroll orizontal la 4 lățimi
python3 dev/perf.py                    # ms/s de task-uri în repaus după încărcare (țintă < 5)
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

1. Utilizatorul copiază `Tokens`, `Styles`, `Index`, `App` și `Icons` în Apps Script și testează „Panou calm” pe `/dev` (tema movă, bara neagră, panoul pe toată lățimea, rândul pe 4 coloane, finalul listei, News). De urmărit: dacă panoul pe toată lățimea în tema light pare prea întunecat și dacă pe mobil selecturile (ordine, prioritate) lasă prea puțin loc pentru status și zone.
2. **Deploy automat și link scurt**: secretele `CLASPRC_JSON`, `SCRIPT_ID`, `DEPLOYMENT_ID` sunt setate (login clasp cu `saiu.antonio.arrise@gmail.com`, doar cele 3 permisiuni Apps Script). Rularea manuală fără `deploy` a ieșit verde (run 37252776774): manifestul luat cu `clasp pull`, 7 fișiere împinse pe `/dev`. Utilizatorul a văzut aplicația pe `/dev`. Rularea cu `deploy` (run 37253096113) a publicat versiunea 22 pe `/exec`. Branch-ul implicit pe GitHub e deja `main` (singurul branch). Link scurt: https://tinyurl.com/wfm-extended → `/exec` (făcut de utilizator; domeniu propriu refuzat, rămânem pe TinyURL). Punctul 2 e încheiat.
   - Secretul se ia cu `cloudshell download ~/.clasprc.json` + Notepad; copiat din terminal se strică (JSON invalid).
   - Workflow-ul folosește `@google/clasp@3` (Node 20); `deploy --deploymentId` e încă valid în v3. Aplicația rămâne pe Apps Script.
   - De confirmat cu utilizatorul: rularea de test verde și `/dev` actualizat. Dacă firma blochează Cloud Shell/clasp, varianta e `clasp login` local cu Node.js.
   - Vechiul branch `claude/sleepy-heisenberg-8bihmr` se șterge doar dacă utilizatorul confirmă.
   - Recomandat link TinyURL; Google Sites e alternativa (aplicația în cadru). Dacă la Sites pagina apare goală, trebuie `setXFrameOptionsMode(ALLOWALL)` în `doGet` (neverificat).
