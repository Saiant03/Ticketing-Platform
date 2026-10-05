# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: specialiști care folosesc WFM Extended în munca de zi cu zi, de pe desktop (confirmat). Deschid platforma când ceva nu merge sau lipsește în WFM Extended: verifică dacă problema e deja raportată, raportează una nouă cu capturi, urmăresc ce s-a întâmplat cu tichetul lor și citesc ce s-a schimbat (News).

Secundar: un grup mic de admini (în prezent 3) care întrețin WFM Extended. Triază tichetele (status, prioritate, categorie), răspund în comentarii, arhivează, exportă CSV și publică anunțuri de update/fix.

Inferat din cod, de confirmat: specialiștii nu au cont în aplicație; se identifică doar prin numele scris în formular. Volumul e de ordinul zecilor de tichete active (codurile sunt `TIS-NN`, lista se paginează la 30).

## Product Purpose

Canalul unic prin care problemele din WFM Extended ajung la cei care îl întrețin și prin care schimbările ajung înapoi la utilizatori. Succes: o problemă se raportează în sub un minut, fără duplicate, și raportorul vede clar starea ei până la rezolvare.

## Positioning

Nu e un helpdesk generic: e bucla de feedback a unui singur tool intern. Tichetele (probleme) și News (ce s-a reparat sau adăugat) sunt două capete ale aceleiași bucle; categoriile (Import, Interfață, Date, Raportare) sunt zonele WFM Extended.

## Operating Context

- Web app Google Apps Script (HtmlService) servită printr-un link `/exec`; datele stau într-un Google Sheet (foile Tichete, News, Jurnal), capturile într-un folder Drive.
- Acces public prin link; adminii intră cu un cod personal, fără cont.
- Specialiștii o folosesc la birou, pe desktop, de obicei într-un tab lângă WFM Extended; capturile vin des prin Ctrl+V.
- Lista se reîmprospătează automat la 20s.

## Capabilities and Constraints

Funcții existente care rămân (toate apelurile `google.script.run` și semnăturile lor):
- Tichet: cod `TIS-NN`, raportor, titlu, descriere, prioritate (scăzută, medie, ridicată, critică), status (deschis, în lucru, rezolvat), categorie (General, Import, Interfață, Date, Raportare, Altul), max 5 capturi (imagini, max 5 MB), comentarii (specialist cu nume liber sau admin).
- Admin: schimbare status/prioritate, editare, arhivare (recuperabilă), restaurare, ștergere definitivă, export CSV.
- News: anunțuri de tip update / fix / anunț, cu capturi; publicare, editare, ștergere de către admin.
- Jurnal de acțiuni (server, momentan neexpus în UI).

Scope confirmat pentru redesign: UI nou + fixuri mici de backend (blocare PIN pe încercare în loc de globală, thumbnail-uri pentru capturi, jurnalul expus în UI pentru admini).

Constrângeri tehnice: HTML/CSS/JS fără build step, servit de HtmlService (iframe Google, CSP-ul Google), fișiere incluse cu `<?!= include() ?>`. Fără secrete în cod (repo public).

## Brand Commitments

- Numele „WFM Extended” rămâne (confirmat).
- Secțiunea News rămâne (confirmat).
- Interfața e în limba română, cu diacritice.
- Doar temă dark (confirmat; tema light scoasă în octombrie 2026).
- Interfața trebuie să fie expresivă, cu animații, tranziții și momente memorabile („standardul 2026”, nivel Awwwards); un aspect sobru de „tabel de birou” a fost respins explicit (confirmat).
- Efectele ambientale sunt acceptate doar dacă se opresc la inactivitate, în tab ascuns și la `prefers-reduced-motion`.

## Evidence on Hand

- Codul curent: `src/Code.gs`, `src/Index.html`.
- Audit și screenshot-uri ale UI-ului curent: `docs/audit/`.
- Nu există logo, ilustrații sau alte asset-uri de brand. Nu există date reale în repo; datele din `dev/mock-gas.js` sunt sintetice.

## Product Principles

1. Întâi verifică, apoi raportează: lista existentă e vizibilă înainte de formular, ca să nu apară duplicate.
2. Starea unui tichet se citește dintr-o privire: cod, status, prioritate, cine l-a atins ultima dată.
3. Raportarea costă cât mai puțin: câmpuri minime, lipire directă a capturilor, cod de referință imediat.
4. Adminul triază pe loc, fără să deschidă alte ecrane pentru acțiuni de rutină.
5. Nimic decorativ nu consumă atenție sau procesor într-un tab ținut deschis toată ziua.

## Accessibility & Inclusion

Ținta: WCAG 2.2 AA (contrast, etichete pe toate câmpurile, focus vizibil, navigare completă din tastatură, `prefers-reduced-motion`, cursor nativ).
