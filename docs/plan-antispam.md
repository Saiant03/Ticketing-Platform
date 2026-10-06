# Plan: limită anti-spam pe tichete și comentarii, teste în deploy (runda 8)

Doar `src/Code.gs`, `dev/` și `.github/workflows/deploy.yml`. Fără schimbări de UI, de semnături sau de apeluri `google.script.run`. Fără servicii noi (deci fără scope-uri noi): `CacheService` și `LockService` sunt deja folosite la upload.

## 1. Limita pe `addTicket` și `addComment`

Pragurile, globale pe oră (aplicația nu știe cine e utilizatorul anonim):

| Funcție | Limită | De ce |
|---|---|---|
| `addTicket` | **20 de tichete noi pe oră** | Ritmul real: 14 tichete în total până acum. 20 într-o oră nu apar nici într-o zi proastă, cu toată echipa raportând aceeași pană. Spam-ul e oprit la ~480 de rânduri pe zi în loc de nelimitat. |
| `addComment` (specialiști) | **60 de comentarii pe oră** | O discuție aprinsă pe câteva tichete înseamnă zeci de comentarii pe zi, nu pe oră. |
| `addComment` (admin cu cod valid) | fără limită | Adminii trebuie să poată răspunde și când limita e atinsă de spam. Codul e verificat deja de `admin_` (cu blocarea la coduri greșite), deci nu se poate ocoli cu un cod inventat. |

Mecanism, ca la `uploadQuota_`:
- un helper `hourQuota_(prefix, max, msg)`: cheie `<prefix>-<oră>` (`Math.floor(now / 3600000)`) în `CacheService`, expirare 3600 s; dacă contorul a ajuns la `max` aruncă `msg`, altfel îl crește;
- apelat **în interiorul lock-ului existent** din `addTicket` și `addComment` (fără al doilea lock), după validări (titlu gol, comentariu gol, cod de admin), înainte de scriere. Cererile invalide nu consumă din limită;
- constante lângă `UP_HOUR`: `var TK_HOUR = 20, CM_HOUR = 60;`
- `uploadQuota_` rămâne cum e.

Mesaje (aceeași formă ca la capturi):
- „Prea multe tichete noi în ultima oră. Reîncearcă mai târziu.”
- „Prea multe comentarii în ultima oră. Reîncearcă mai târziu.”

Unde apar, fără schimbări de UI (verificat în `App.html`):
- tichet: `.catch` din trimiterea formularului pune `err.message` în `S.formErr.form`, sub butonul „Trimite”; ciorna rămâne;
- comentariu: `.catch` din `sendComment` scoate comentariul optimist, pune textul înapoi în câmp și arată mesajul în toast-ul de eroare.

Compromis cunoscut: limita e globală, deci un spammer poate consuma ora pentru toți (cel mult o oră, apoi se resetează). Fără identitate nu se poate mai bine fără să schimbăm accesul la web app, care rămâne cum e (decizie confirmată). Capturile urcate înaintea unui `addTicket` refuzat rămân orfane și le ia curățarea zilnică.

## 2. Teste

- `dev/gs-test.js`: 20 de tichete trec, al 21-lea dă mesajul și nu scrie rând; după o oră trece iar; un tichet fără titlu nu consumă din limită; 60 de comentarii de specialist trec, al 61-lea dă mesajul și nu scrie rând; comentariul de admin trece peste limită; după o oră specialistul poate din nou. Testele existente care adaugă multe tichete/comentarii golesc cache-ul înainte (`cacheStore = {}`), ca să nu depindă de ordine.
- `dev/mock-gas.js`: aceleași contoare pe oră, ca la upload (admin exceptat la comentarii).
- `dev/flow.py`: pe o pagină nouă, 20 de `addTicket` direct prin `google.script.run`, apoi trimiterea din formular arată mesajul în formular; 60 de comentarii, apoi trimiterea din UI arată mesajul în toast și textul rămâne în câmp.

## 3. Teste în deploy

În `.github/workflows/deploy.yml`, după `actions/setup-node`, un pas `Teste (gs-test)` care rulează `node dev/gs-test.js`. Rulează mereu (nu depinde de secrete), înaintea pasului `clasp push`. Un test picat oprește job-ul, deci nici `clasp push` (`/dev`), nici `clasp deploy` (`/exec`) nu rulează. `setup-node` rulează și el mereu (e nevoie de Node pentru teste). Fără dependențe noi: `gs-test.js` folosește doar `fs`, `vm`, `path`.

## Verificare

- `node dev/gs-test.js` toate OK; `python3 dev/flow.py` fără FAIL (în afară de testul intermitent cunoscut de coliziuni de etichete la 1440).
- După push: rularea automată pe `/dev` arată pasul de teste verde, apoi `clasp push` verde.

## Livrare

Push pe `main` → `/dev`. Utilizatorul testează un tichet și un comentariu normal. `/exec` doar după confirmare, apoi `memory.md`.

## Stare

- [x] plan
- [x] implementare (executor)
- [x] review + verificări (runner): `gs-test.js` 70 OK, `flow.py` 59 OK, fără erori de pagină
- [x] push `/dev` (commit `991c6ba`), rularea automată verde: „Teste (gs-test)” „toate OK”, apoi `clasp push`
- [x] test utilizator pe `/dev` (confirmat)
- [x] `/exec` („Deploy Apps Script” cu `deploy: true`, verde, inclusiv „Teste (gs-test)”) + `memory.md`
