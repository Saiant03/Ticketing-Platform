---
version: 1
slug: "src-index-html"
primary_target: "src/Index.html"
related_targets: []
---

# Surface brief: WFM Extended (src/Index.html)

Scope: întreaga aplicație (Tichete, News, Jurnal admin). Mode: Operate.
Audiență: specialiști pe desktop care verifică și raportează probleme din WFM Extended; 3 admini care triază.
Task principal: găsește dacă problema există deja; dacă nu, raportează-o în sub un minut; urmărește starea.
Constrângeri: Apps Script HtmlService, fără build step, include-uri `<?!= include() ?>`, toate funcțiile server păstrate.

## Direction contract

THESIS: WFM Extended e o hartă de zone (Import, Interfață, Date, Raportare, General, Altul), iar fiecare tichet aparține unei zone. Interfața e un sistem de informare în stilul programelor de identitate Otl Aicher: fiecare zonă are o culoare și o pictogramă fixe, folosite identic în bară, filtre, rânduri și formular. Refuză lista gri cu un singur accent violet și cardurile glass.

OWN-WORLD: fond alb-rece / grafit în dark, cerneală albastru-noapte; șase culori de zonă plate, saturate, din paleta München '72 (cer, verde, galben-chihlimbar, violet, argint, ardezie); roșul rezervat exclusiv pentru prioritate critică și erori. Un singur font grotesc industrial (Archivo) cu cifre tabulare. Pictograme pătrate, colțuri drepte, linii de 1px, fără umbre decorative, fără gradient.

STORY: specialistul vede imediat încărcarea fiecărei zone, filtrează zona lui dintr-un click, găsește tichetul existent sau deschide „Tichet nou”, unde titlul tastat îi arată tichete asemănătoare. Primește codul TIS pe loc și îl vede în listă.

FIRST VIEWPORT: bară de sus 56px (marca din 6 pătrate de zonă + „WFM Extended”, tab-uri Tichete/News, buton primar „Tichet nou”, acces admin). Sub ea, bara de zone pe toată lățimea: segmente proporționale cu tichetele active, etichete pictogramă + nume + număr. Dedesubt, două coloane: listă densă (căutare, status segmentat, prioritate; rânduri de 52px cu pictograma zonei, cod, titlu, status prin formă, prioritate prin bare) și panou de detaliu de 440px în dreapta, unde se deschide și formularul de tichet nou.

FORM: sistem de identitate cu codare cromatică pe zone (Aicher), poziția 6 din lista ordonată; seed key c34d746a (roll degradat, fără challengeri).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Semnătură: bara de zone (încărcare pe zone + filtru) și pictograma de zonă repetată identic în rând, detaliu, formular.
Nerezolvat: News nu are câmp de zonă (nu se inventează); tipul anunțului rămâne update / fix / anunț.
