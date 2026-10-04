# Ticketing Platform

Platforma de tickete pentru munca, rulata ca web app Google Apps Script (HtmlService). Proiectul e in faza de redesign complet al UI-ului.

## Structura

- `src/` - codul Apps Script, sincronizat cu clasp (`rootDir`). Fisiere `.gs` (server) si `.html` (UI).
- `docs/audit/` - rezultatele auditului pe UI-ul curent (screenshot-uri, probleme gasite).
- `PRODUCT.md` / `DESIGN.md` - adevarul despre produs si design system-ul (tokens, reguli); `.impeccable/` - contractul de directie si screenshot-urile de review.
- `docs/workflow.md` - fazele de lucru si comenzile.
- `dev/` - rulare locala cu `google.script.run` simulat (`preview.py`, `mock-gas.js`) si screenshot-uri (`shoot.py`).
- `.claude/skills/` - skill-urile folosite in proiect (vezi `SOURCES.md`).

## Reguli

- Repo-ul e public: niciun cod de admin, ID de spreadsheet sau alt secret in cod. Codurile de admin stau in Script Properties (`ADMINS`).
- Orice functie server noua sau schimbata se oglindeste in `dev/mock-gas.js`.
- Verificarea vizuala se face cu `python3 dev/preview.py` + `python3 dev/shoot.py`.

- Logica server (`.gs`) nu se schimba in timpul redesign-ului decat daca UI-ul nou o cere explicit. Redesign-ul inseamna HTML/CSS/JS client.
- Pastreaza toate apelurile `google.script.run` existente si semnaturile functiilor server.
- CSS si JS comun stau in fisiere `.html` separate incluse cu `<?!= include('...') ?>`, nu duplicate in fiecare pagina.
- Fara framework-uri care cer build step. CDN-uri doar daca sunt necesare.
- `<meta name="viewport">` se pune in HTML, plus `.addMetaTag('viewport', ...)` pe `HtmlOutput` in `doGet`.
- Design tokens (culori, spatiere, fonturi) ca CSS custom properties intr-un singur fisier.
- Inainte de orice schimbare vizuala, verifica `DESIGN.md` (radacina repo-ului). Culorile de zona sunt doar pentru zone.

## Skill-uri si cand se folosesc

| Faza | Skill |
|---|---|
| Audit UI curent | `impeccable` (audit, critique), `webapp-testing` pentru screenshot-uri |
| Design system | `ui-ux-pro-max` (`--design-system`), `frontend-design` pentru directie |
| Redesign pagini | `redesign-existing-projects`, `impeccable` (layout, typeset, colorize) |
| Cod Apps Script | `google-apps-script` |
| Finisare / QA | `impeccable` (polish, harden, adapt), `webapp-testing` |
