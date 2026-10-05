# Workflow

## 0. Setup (o singura data)

```bash
npm install -g @google/clasp
clasp login
cp .clasp.json.example .clasp.json   # pune scriptId-ul (Apps Script > Project Settings > Script ID)
clasp pull                           # aduce codul curent in src/
git add src && git commit -m "Import cod Apps Script existent"
```

Fara acces la clasp: copiaza manual fisierele din editorul Apps Script in `src/` (`Code.gs`, `Index.html` etc.) plus `appsscript.json` (Project Settings > Show manifest).

Codurile de admin NU se pun in cod. In editorul Apps Script: Project Settings > Script Properties > cheia `ADMINS`, valoare JSON, de ex. `{"cod-lung-1":"Nume 1","cod-lung-2":"Nume 2"}`.

## Rulare locala (fara Apps Script)

```bash
python3 dev/preview.py                      # http://localhost:8080/ cu google.script.run simulat
python3 dev/shoot.py docs/audit/<folder>    # screenshot-uri desktop + mobil, public + admin
python3 dev/flow.py                         # 21 de pași funcționali
python3 dev/a11y.py                         # contrast, etichete, ținte, scroll orizontal
python3 dev/perf.py                         # cost în repaus (țintă < 5 ms/s)
```

`dev/mock-gas.js` tine date de test in memorie (cod admin de test: `1234`). Cand adaugi o functie server noua, adaug-o si in mock.
`dev/shoot.py` are nevoie de `pip install playwright`; foloseste Chromium din `CHROMIUM_PATH` sau `/opt/pw-browsers/chromium`.

## 1. Audit UI curent

- Screenshot-uri ale fiecarui ecran (desktop + mobil) in `docs/audit/`.
- Rulare `impeccable` audit/critique pe fisierele `.html`.
- Rezultat: `docs/audit/AUDIT.md` cu lista ecranelor, fluxurilor (creare ticket, asignare, status, comentarii etc.) si problemelor gasite.

## 2. Design system

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "work ticketing helpdesk internal tool" --design-system
```

- Se alege directia vizuala (frontend-design, `impeccable`) si se fixeaza in `DESIGN.md` (radacina): culori, tipografie, spatiere, componente. Contractul de directie sta in `.impeccable/surfaces/`.
- Tokens implementati in `src/Tokens.html`.

## 3. Redesign pe ecrane

Un ecran per branch/PR, in ordinea: layout general + navigatie, lista tickete, detaliu ticket, formular creare, dashboard/rapoarte, setari/admin.

Pentru fiecare: aplica design system-ul, pastreaza apelurile `google.script.run`, verifica empty/loading/error states.

## 4. QA

- `webapp-testing`: screenshot-uri inainte/dupa, verificare responsive (375px, 768px, 1280px).
- `impeccable` polish + harden: contrast, focus vizibil, texte lungi, liste goale, erori server.
- Test manual pe URL-ul `/dev` al deployment-ului.

## Stare

- Faza 1 (audit): gata, `docs/audit/AUDIT.md`.
- Faza 2 (design system): direcția „Sistem de zone” respinsă de utilizator („prea tabel de birou”); înlocuită cu „Panou split-flap” (contract în `.impeccable/surfaces/src-index-html.md`, plan în `docs/plan-split-flap.md`).
- Faza 3 (redesign): „Panou split-flap” implementat pentru Tichete, News, Jurnal; `DESIGN.md` + `.impeccable/design.json` rescrise din build; screenshot-uri în `.impeccable/review/`.
- Faza 3b: „Panou calm” + accent mov după feedback-ul de pe `/dev` (mai puțin încărcat); `DESIGN.md`, `design.json` și capturile din `.impeccable/review/` actualizate.
- Faza 4 (QA): local `flow.py` 21/21, `a11y.py` curat, `perf.py` 0.2 ms/s în repaus; rămâne testul pe `/dev` cu date reale.
