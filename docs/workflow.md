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

- Se alege directia vizuala (frontend-design) si se fixeaza in `docs/design/DESIGN.md`: culori, tipografie, spatiere, componente (buton, input, badge status/prioritate, tabel, card ticket, modal, toast).
- Tokens implementati in `src/styles.html`.

## 3. Redesign pe ecrane

Un ecran per branch/PR, in ordinea: layout general + navigatie, lista tickete, detaliu ticket, formular creare, dashboard/rapoarte, setari/admin.

Pentru fiecare: aplica design system-ul, pastreaza apelurile `google.script.run`, verifica empty/loading/error states.

## 4. QA

- `webapp-testing`: screenshot-uri inainte/dupa, verificare responsive (375px, 768px, 1280px).
- `impeccable` polish + harden: contrast, focus vizibil, texte lungi, liste goale, erori server.
- Test manual pe URL-ul `/dev` al deployment-ului.

## 5. Deploy

GitHub Action `.github/workflows/deploy.yml`:
- push pe `main` cu modificari in `src/` -> `clasp push` (actualizeaza HEAD, vizibil pe `/dev`).
- rulare manuala cu `deploy = true` -> versiune noua pe deployment-ul `/exec` (productie).

Secrete necesare in GitHub (Settings > Secrets and variables > Actions):
- `CLASPRC_JSON` - continutul `~/.clasprc.json` dupa `clasp login`.
- `SCRIPT_ID` - ID-ul proiectului Apps Script.
- `DEPLOYMENT_ID` - ID-ul deployment-ului web app (`clasp deployments`).

Fara secrete, action-ul face skip.
