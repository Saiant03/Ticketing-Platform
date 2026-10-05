# Deploy automat și link scurt

Toți pașii se fac cu contul Google care poate edita scriptul (cel cu care deschizi Sheet-ul).

## A. Pornește Apps Script API (o dată)

1. Deschide https://script.google.com/home/usersettings
2. La „Google Apps Script API” apasă comutatorul până arată **On**.

## B. Obține `CLASPRC_JSON` (cheia de acces pentru GitHub)

1. Deschide https://shell.cloud.google.com (Google Cloud Shell). Dacă cere, acceptă termenii. Se deschide un terminal jos.
2. Scrie `node -v` și Enter. Trebuie să arate `v20` sau mai mare.
3. Scrie `npx @google/clasp@3 login --no-localhost` și Enter (la „Ok to proceed?” apasă `y`).
4. Apare un link lung. Click pe el, alege contul, apasă **Allow** / **Permite**.
5. Browserul ajunge pe o pagină care nu se încarcă (`localhost`). E normal. Copiază **toată adresa** din bara browserului.
6. Întoarce-te în Cloud Shell, lipește adresa la întrebarea „copy the URL from your browser and paste it here” și Enter.
7. Scrie `cat ~/.clasprc.json` și Enter. Selectează tot textul afișat, de la `{` până la ultima `}`, și copiază-l. Acesta e `CLASPRC_JSON`.

Dacă firma blochează Cloud Shell sau autorizarea clasp, aceeași comandă merge pe calculatorul tău după instalarea Node.js (https://nodejs.org, versiunea LTS), fără `--no-localhost`.

Textul ăsta dă acces la scripturile contului. Nu-l pune nicăieri altundeva decât în secretul GitHub.

## C. Obține `SCRIPT_ID`

1. Deschide Sheet-ul aplicației → meniul **Extensions** (Extensii) → **Apps Script**.
2. În bara din stânga, click pe rotița **Project Settings** (Setări proiect).
3. La „IDs”, lângă **Script ID**, apasă **Copy**.

## D. Obține `DEPLOYMENT_ID` (linkul `/exec`)

1. În editorul Apps Script, sus-dreapta: **Deploy** → **Manage deployments**.
2. Click pe deployment-ul activ din stânga.
3. La **Deployment ID**, apasă **Copy**. (Tot aici e și **Web app URL**, cel care se termină în `/exec`; păstrează-l pentru pasul G.)

## E. Pune cele 3 secrete în GitHub

1. Deschide https://github.com/Saiant03/Ticketing-Platform/settings/secrets/actions
2. **New repository secret** → Name: `CLASPRC_JSON`, Secret: textul de la B → **Add secret**.
3. La fel pentru `SCRIPT_ID` (de la C) și `DEPLOYMENT_ID` (de la D).

## F. Branch-ul implicit și primul test

1. https://github.com/Saiant03/Ticketing-Platform/settings → secțiunea **Default branch** → butonul cu două săgeți → alege `main` → **Update** → confirmă.
2. https://github.com/Saiant03/Ticketing-Platform/actions → în stânga **Deploy Apps Script** → **Run workflow** → branch `main`, căsuța `deploy` nebifată → **Run workflow**.
3. După ~1 minut rularea trebuie să fie verde. Deschide `/dev` (Deploy → Test deployments) și verifică aplicația.

De acum: fiecare push pe `main` care schimbă `src/` actualizează singur `/dev`. Pentru `/exec` (ce văd colegii): pasul F.2 cu căsuța `deploy` **bifată**. Linkul `/exec` rămâne același la fiecare versiune nouă.

Revenire la o versiune veche: Deploy → Manage deployments → creion → Version → alege versiunea → Deploy.

## G. Link scurt (recomandat)

1. Deschide https://tinyurl.com
2. Lipește Web app URL-ul `/exec` de la D.3.
3. La „Customize your link” scrie un nume, de ex. `wfm-tichete`.
4. **Shorten URL** → linkul devine `https://tinyurl.com/wfm-tichete`.

Accesul rămâne controlat de Google: linkul scurt doar trimite la `/exec`.

Alternativă, Google Sites (aplicația apare într-un cadru cu înălțime fixă, deci mai puțin loc): https://sites.google.com → **Blank site** → în dreapta **Insert** → **Embed** → lipește URL-ul `/exec` → **Insert** → trage de colțuri să ocupe pagina → **Publish**.
