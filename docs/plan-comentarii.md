# Plan: comentariile fără limita de 50.000 de caractere (runda 7)

Doar `src/Code.gs` și `dev/`. Fără schimbări de UI: clientul primește aceeași formă `comments: [{author, admin, text, at}]`. Semnăturile și apelurile `google.script.run` rămân.

## Problema

Toate comentariile unui tichet stau ca JSON în coloana `Comentarii` (16) a rândului. O celulă Sheets ține cel mult 50.000 de caractere; un comentariu are până la 4.000. După ~12 comentarii lungi (sau sute de scurte) `setValue` aruncă eroare și tichetul nu mai primește comentarii.

## Soluția

O foaie nouă **Comentarii**, câte un rând pe comentariu: `Cod | Autor | Admin | Text | Data`.

- `addComment`: verifică că tichetul există (ca acum), apoi `appendRow` în Comentarii (autor și text prin `txt_`, `Admin` boolean, `Data` = `new Date()`); `setMeta_` pentru admin ca acum. Coloana 16 nu se mai scrie.
- Citire: `getTickets` și `archived_` citesc foaia Comentarii o singură dată, grupează pe cod și le dau lui `mapTicket_`. Comentariile unui tichet = cele vechi din coloana 16 (și răspunsul vechi din coloana 9, ca acum, doar dacă 16 e goală) + cele din foaia nouă, ordonate după `at`.
- Fără migrare: datele vechi rămân unde sunt și se citesc în continuare; nimic nu se pierde, nimic nu se rescrie.
- `purgeTicket`: șterge și rândurile lui din Comentarii.
- Foaia se creează la prima utilizare, ca Tichete/News/Jurnal.

## Verificare

- `dev/gs-test.js`: 20 de comentarii de 4.000 de caractere pe același tichet (peste 50.000 în total) se salvează și se citesc; comentarii vechi din coloana 16 + noi, în ordine; răspunsul vechi din coloana 9; `txt_` pe text și autor; tichet inexistent → nimic scris; `purgeTicket` șterge rândurile; arhiva are comentariile; nicio valoare `Date` în răspuns.
- `dev/mock-gas.js`: neschimbat (forma datelor e aceeași).
- `flow.py` fără regresii (comentariul din flux trece prin mock).

## Livrare

Push pe `main` → `/dev`. Utilizatorul verifică: comentariile vechi ale unui tichet apar ca înainte și un comentariu nou se adaugă (și apare foaia Comentarii în Sheet). Apoi `/exec` și `memory.md`.

## Stare

- [ ] implementare (executor)
- [ ] review + verificări (runner)
- [ ] push `/dev`, verificat de utilizator
- [ ] `/exec` + `memory.md`
