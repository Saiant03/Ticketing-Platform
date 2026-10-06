# Plan: limită pe upload și curățarea capturilor orfane (runda 6)

Doar `src/Code.gs` și `dev/`. Fără schimbări de UI: eroarea serverului apare deja în formular (`S.formErr.form`) și ciorna rămâne. Semnăturile și apelurile `google.script.run` rămân.

## Constrângere: fără permisiuni noi

`src/appsscript.json` nu e în repo; deploy-ul ia manifestul live. Un serviciu care cere un scope nou (ex. `ScriptApp` pentru triggere) ar bloca aplicația până când proprietarul o reautorizează în editor. De aceea:
- contoarele stau în `CacheService` (fără scope nou), sub `LockService` (deja folosit);
- curățarea nu folosește un trigger cu timp, ci rulează cel mult o dată pe zi din `uploadAttachment` (sursa capturilor orfane), cu limită de timp.

## 1. Limita pe `uploadAttachment`

- Global (aplicația nu are identitatea utilizatorului anonim): cel mult **60 de capturi pe oră** și **300 pe zi**. Contoare în cache, chei pe oră și pe zi (`up-h-<oră>`, `up-d-<zi>`), incrementate sub lock; peste limită: „Prea multe capturi încărcate. Reîncearcă mai târziu.”
- Conținutul trebuie să fie JPEG real (primii octeți `FF D8 FF`). Clientul comprimă oricum totul în JPEG, deci nu se pierde nimic; Drive nu mai primește fișiere arbitrare sub eticheta „imagine”.
- Neschimbat: maximum 5 MB pe captură.
- Costul unui atac susținut: ~1.5 GB pe zi, care dispar la curățarea următoare.

## 2. Curățarea capturilor orfane

- `cleanupOrphans_()`: ID-urile folosite = atașamentele din toate rândurile din Tichete (inclusiv arhivate) și din News. Fișierele din folderul de capturi care nu sunt folosite și sunt mai vechi de **24 h** merg la coș (`setTrashed`, recuperabile 30 de zile).
- Rulează din `uploadAttachment` cel mult o dată la 24 h (marcaj `CLEANUP_AT` în Script Properties), înainte de upload, cu limită de 20 s; ce nu a apucat rămâne pentru data următoare. O eroare în curățare nu oprește upload-ul.
- Jurnal: o intrare „curățare capturi” cu numărul de fișiere mutate la coș (doar dacă > 0).

## Verificare

- `dev/gs-test.js`: stub-uri `CacheService` și un folder Drive în memorie; teste pentru limita pe oră și pe zi, respingerea non-JPEG, curățare (orfan vechi → coș; orfan nou, atașament de tichet arhivat și de News → rămân), o singură rulare pe 24 h, eroare în curățare → upload-ul merge.
- `dev/mock-gas.js`: aceeași limită pe oră în memorie (fără Drive, fără curățare).
- `flow.py` fără regresii.

## Livrare

Push pe `main` → `/dev`. Nimic vizibil de testat manual în afară de un upload normal (o captură la un tichet nou) → apoi `/exec` și `memory.md`.

## Stare

- [x] implementare (executor); din review: dacă nu găsește niciun atașament referit (ex. foaia Tichete recreată goală), curățarea nu mută nimic la coș
- [x] review + verificări (runner): `gs-test.js` 54 OK, `flow.py` 55 OK, fără erori
- [x] push `/dev`, upload verificat de utilizator
- [x] `/exec` + `memory.md`
