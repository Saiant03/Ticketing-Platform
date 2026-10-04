---
version: 1
slug: "src-index-html"
primary_target: "src/Index.html"
related_targets: []
---

# Surface brief: WFM Extended (src/Index.html)

Scope: întreaga aplicație (Tichete, News, Jurnal admin). Mode: Operate, cu ambiție expresivă cerută explicit de utilizator (animații, tranziții, nivel Awwwards; varianta „Sistem de zone” respinsă ca prea „tabel de birou”).
Audiență: specialiști pe desktop care verifică și raportează probleme din WFM Extended; 3 admini care triază.
Task principal: găsește dacă problema există deja; dacă nu, raportează-o în sub un minut; urmărește starea.
Constrângeri: Apps Script HtmlService, fără build step, include-uri `<?!= include() ?>`, toate funcțiile server păstrate; fundalul ambient se oprește când mouse-ul stă, tab-ul e ascuns sau e activ reduced-motion.

## Direction contract

THESIS: lista de tichete este un panou de plecări split-flap. Fiecare tichet e o „cursă”: ora, codul, zona, problema, observația de status. Când ceva se schimbă, plăcuțele se rotesc literă cu literă. Refuză tabelul gri de birou și cardurile glass.

OWN-WORLD: panoul e un obiect negru mat, cu plăcuțe grafit, caractere albe și observații colorate ca în aeroport (alb = deschis, galben semnal = în lucru, verde = rezolvat, roșu = critic). În jurul lui, holul terminalului: fond deschis sau noapte după temă, semnalistică galben-negru tip Schiphol (bara de sus galbenă, butoane galbene cu text negru, săgeți de orientare). Un singur font variabil, Archivo: îngust și majuscul pe plăcuțe, lat și gros pe semnalistică.

STORY: specialistul intră, panoul se „așază” rotind plăcuțele, vede contoarele (deschise / în lucru / critice) și ora. Filtrează pe zonă sau caută, rândurile se rearanjează animat; deschide un tichet și panoul lateral alunecă; trimite un tichet nou și codul TIS se rotește pe un afișaj mare, apoi rândul nou intră pe panou.

FIRST VIEWPORT: bară galbenă 60px (marcă, Tichete/News/Jurnal, „Tichet nou” negru, Admin). Stânga: panoul negru pe toată înălțimea: antet cu contoare split-flap mari + ceas, rând de filtre (căutare, zone cu pictograme, status), apoi rânduri de 56px: ORA | COD (plăcuțe) | ZONĂ | PROBLEMĂ + raportor | PRIORITATE | STATUS (plăcuțe colorate). Dreapta: panoul de detaliu de 460px pe fondul holului, cu indicatoare de orientare când nu e nimic selectat.

FORM: panou de plecări split-flap + semnalistică de aeroport galben-negru, poziția 1 din lista nouă (alegerea utilizatorului peste rolul degradat care a dat poziția 4); seed key c34d746a, reroll 1, roll degradat fără challengeri.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Semnătură: rotirea plăcuțelor split-flap la intrare, la schimbare de status/contoare și la crearea unui tichet.
Mișcare: View Transitions pentru rearanjarea rândurilor, deschiderea panoului și schimbarea paginii; scroll-driven reveal în News; lumină ambientală în hol + reflex de lumină pe panou care urmărește mouse-ul, oprite la inactivitate.
Nerezolvat: News nu are câmp de zonă.
