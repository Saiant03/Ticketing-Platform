# Plan: întărirea serverului (runda 5)

Trei probleme din `src/Code.gs`, cerute de utilizator. Doar server și `dev/`; fără schimbări de UI, semnăturile funcțiilor și apelurile `google.script.run` rămân.

## 1. Limita de încercări pentru codul de admin, pe toate funcțiile

Problema: blocarea după 5 greșeli există doar în `verifyPin`. Celelalte funcții de admin verifică direct `adminName_(pin)`, deci codul se poate ghici nelimitat din consolă (`google.script.run.getArchived('0000')`). În plus, contorul `PINLOCK` se citește și se scrie fără lock: apelurile în paralel își pierd incrementările.

Schimbarea:
- `admin_(pin)` înlocuiește verificarea în toate funcțiile de admin (`getArchived`, `getJournal`, `updateStatus`, `updatePriority`, `replyTicket`, `editTicket`, `deleteTicket`, `restoreTicket`, `purgeTicket`, `exportTicketsCsv`, `addNews`, `editNews`, `deleteNews`, `addComment`); `verifyPin` devine `return admin_(pin)`.
- Ordinea în `admin_`: cod gol → `''`, fără să conteze ca greșeală (comentariile publice); cod lung (≥ 12) valid → numele, fără blocare; blocare activă → eroare „Prea multe încercări…”; cod valid → numele (resetează contorul doar dacă există); cod greșit → incrementare sub `LockService`.
- Neschimbat: fereastra de 60 s după 5 greșeli, codurile lungi ocolesc blocarea.

## 2. Textul utilizatorilor scris ca text, nu ca formulă sau dată

Problema: `appendRow`/`setValue` interpretează `=…` ca formulă și `1/2`, `2026-10-03` ca date. O dată ajunsă într-o coloană de text face ca `getTickets` să întoarcă `null` în client (Date nu trece prin `google.script.run`), deci lista se golește pentru toți. Exportul CSV are aceeași problemă în Excel.

Schimbarea:
- `txt_(v, max)`: tăiere la `max` și prefix `'` (Sheets îl ascunde și `getValue` îl omite). Aplicat la tot textul venit de la utilizatori: raportor, titlu, descriere, categorie, răspuns, News, coloanele de jurnal cu text liber.
- La citire, câmpurile text trec prin `String()` (rândurile vechi care au ajuns deja date sau numere nu mai strică răspunsul).
- CSV: celulele care încep cu `= + - @`, tab sau CR primesc prefix `'`.

## 3. Validarea valorilor pe server

- `status` ∈ `deschis | in_lucru | rezolvat`, `priority` ∈ `scazuta | medie | ridicata | critica`.
- `updateStatus` / `updatePriority` / `editTicket` resping valorile invalide cu eroare; `addTicket` pune `medie` dacă prioritatea e invalidă.
- `addTicket` cere titlu nevid și tolerează `payload` lipsă.

## Verificare

- `dev/gs-test.js` (nou): rulează `src/Code.gs` real în Node cu servicii Apps Script simulate în memorie (Sheet, Properties, Lock, Drive minim) și verifică: blocarea pe o funcție de admin după 5 greșeli, inclusiv cu codul corect; codul lung trece; cod gol la comentariu nu contează; `'` pe text; CSV; statusuri și priorități invalide; `getTickets` cu un rând vechi care are o dată în titlu.
- `dev/mock-gas.js`: oglindește blocarea și validarea; `dev/flow.py`: test nou pe o pagină separată (5 coduri greșite → și codul corect e respins; codul lung trece; status invalid respins).
- `flow.py`, `a11y.py` fără regresii.

## Livrare

1. Commit + push pe `main` → rularea automată pune codul pe `/dev`.
2. Utilizatorul verifică pe `/dev` (sau în Sheet) un tichet cu titlul `=1+1` și unul cu `1/2`: trebuie să apară exact așa, fără apostrof vizibil. Asta nu se poate testa din mediul cloud.
3. După confirmare: „Deploy Apps Script” cu `deploy: true` → `/exec`; `memory.md` actualizat.

## Stare

- [x] 1–3 implementate (executor)
- [x] `gs-test.js`, mock, flow (executor)
- [x] review (`ponytail-review`; `security-review` manual, skill-ul cere diff față de `origin/HEAD`) + verificări (runner): `gs-test.js` toate OK, `flow.py` fără FAIL (o singură suprapunere intermitentă de etichete la 1440 într-o rulare din 4, fără legătură cu runda: UI neatins)
- [x] push `/dev`
- [ ] confirmare utilizator pe `/dev`
- [ ] `/exec` + `memory.md`
