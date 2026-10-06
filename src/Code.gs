/**
 * Tichete TIS - backend Google Apps Script
 * Datele se salvează în foaia "Tichete". Capturile se salvează în Google Drive (folder dedicat).
 * Comentariile stau în foaia "Comentarii" (câte un rând). Jurnal de acțiuni în foaia "Jurnal". Ștergerea = arhivare (recuperabilă); există și ștergere definitivă.
 */

// Codurile de admin NU stau în cod (repo-ul e public).
// Se setează în editorul Apps Script: Project Settings > Script Properties,
// cheia ADMINS, valoare JSON: {"cod1":"Nume 1","cod2":"Nume 2"}

var SHEET_NAME = 'Tichete';
var NEWS_SHEET = 'News';
var JOURNAL_SHEET = 'Jurnal';
var COMMENTS_SHEET = 'Comentarii';
var FOLDER_NAME = 'Tichete TIS - Capturi';
var MAX_FILES = 5;
var MAX_BYTES = 5 * 1024 * 1024;
var UP_HOUR = 60, UP_DAY = 300;   // limită globală de upload-uri pe oră / pe zi
var TK_HOUR = 20, CM_HOUR = 60;   // limită globală de tichete noi / comentarii de specialist pe oră
var HEADERS = ['Cod', 'N', 'Raportat', 'Titlu', 'Descriere', 'Prioritate', 'Status', 'Creat', 'Raspuns', 'RaspunsDe', 'Atasamente', 'Arhivat', 'ModificatDe', 'ModificatLa', 'Categorie', 'Comentarii'];
var NEWS_HEADERS = ['Id', 'N', 'Titlu', 'Continut', 'Tip', 'Autor', 'Creat', 'Atasamente'];
var JOURNAL_HEADERS = ['Data', 'Admin', 'Actiune', 'Cod', 'Detaliu'];
var COMMENT_HEADERS = ['Cod', 'Autor', 'Admin', 'Text', 'Data'];
var NEWS_TYPES = ['update', 'fix', 'anunt'];

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('WFM Extended')
    .setFaviconUrl('https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f3ab.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Include un fișier HTML (CSS/JS) în template: <?!= include('Styles') ?> */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    return sh;
  }
  if (sh.getLastColumn() < HEADERS.length) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  }
  return sh;
}

function getJournalSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(JOURNAL_SHEET);
  if (!sh) {
    sh = ss.insertSheet(JOURNAL_SHEET);
    sh.getRange(1, 1, 1, JOURNAL_HEADERS.length).setValues([JOURNAL_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getCommentsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(COMMENTS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(COMMENTS_SHEET);
    sh.getRange(1, 1, 1, COMMENT_HEADERS.length).setValues([COMMENT_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Adaugă o intrare în jurnal (cine, ce, când). Nu blochează fluxul dacă eșuează. */
function log_(admin, action, cod, detail) {
  try {
    getJournalSheet_().appendRow([new Date(), txt_(admin, 120), action || '', txt_(cod, 40), txt_(detail, 500)]);
  } catch (e) {}
}

/** Folderul de capturi din Drive; îl creează la prima utilizare și îi reține ID-ul. */
function getFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('TIS_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('TIS_FOLDER_ID', folder.getId());
  return folder;
}

function pad2_(n) { return String(n).length < 2 ? '0' + n : String(n); }
function adminName_(pin) {
  var admins = {};
  try { admins = JSON.parse(PropertiesService.getScriptProperties().getProperty('ADMINS') || '{}'); } catch (e) {}
  return admins.hasOwnProperty(String(pin)) ? admins[String(pin)] : '';
}

// Codurile de cel puțin atâtea caractere nu pot fi ghicite prin încercări și trec
// și în timpul blocării, ca încercările greșite ale altcuiva să nu blocheze adminii.
var LONG_PIN = 12;
var WINDOW = 60000, MAXF = 5;   // blocare 60s după 5 greșeli
var STATUS_KEYS = ['deschis', 'in_lucru', 'rezolvat'];
var PRIO_KEYS = ['scazuta', 'medie', 'ridicata', 'critica'];

/** Contorul de greșeli {fails, since} din PINLOCK; tolerant la JSON stricat. */
function lockState_(props) {
  try {
    var s = JSON.parse(props.getProperty('PINLOCK') || 'null');
    return { fails: Number(s && s.fails) || 0, since: Number(s && s.since) || 0 };
  } catch (e) { return { fails: 0, since: 0 }; }
}

/** Numele adminului pentru cod, sau '' (cod gol/greșit). Cod greșit = încercare numărată; blocare 60s după 5. */
function admin_(pin) {
  pin = String(pin == null ? '' : pin);
  if (!pin) return '';
  var name = adminName_(pin);
  if (name && pin.length >= LONG_PIN) return name;
  var props = PropertiesService.getScriptProperties();
  var st = lockState_(props);
  var now = Date.now();
  if (st.fails >= MAXF && now - st.since < WINDOW) throw new Error('Prea multe încercări greșite. Reîncearcă în ' + Math.ceil((WINDOW - (now - st.since)) / 1000) + ' secunde.');
  if (name) { if (st.fails) props.deleteProperty('PINLOCK'); return name; }
  var lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    st = lockState_(props);   // re-citit sub lock: alt apel a putut număra între timp
    if (st.fails >= MAXF && now - st.since >= WINDOW) st = { fails: 0, since: 0 };   // fereastra a expirat
    if (st.fails < MAXF) {   // blocare deja activă: nu o prelungi
      st.fails++; if (st.fails >= MAXF) st.since = now;
      props.setProperty('PINLOCK', JSON.stringify(st));
    }
  } finally { lock.releaseLock(); }
  return '';
}

/** Verifică codul de admin (vezi admin_). */
function verifyPin(pin) { return admin_(pin); }

/** Text de utilizator pentru foaie: prefixul ' face Sheets să-l păstreze ca text (nu formulă =…, nu dată 1/2); getValue îl omite. */
function txt_(v, max) { var s = String(v == null ? '' : v).slice(0, max); return s ? "'" + s : s; }

/** Text din foaie; o dată rămasă într-o coloană text devine string (Date nu trece prin google.script.run). */
function str_(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(v == null ? '' : v); }

function parseAtt_(raw) {
  try { var a = JSON.parse(raw || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

/** Comentariile din foaia "Comentarii", grupate pe cod: {cod: [{author, admin, text, at}]}. O singură citire; nu creează foaia (citire fără lock). */
function commentsByCod_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMENTS_SHEET);
  var by = {};
  if (!sh || sh.getLastRow() < 2) return by;
  var last = sh.getLastRow();
  sh.getRange(2, 1, last - 1, COMMENT_HEADERS.length).getValues().forEach(function (r) {
    (by[r[0]] = by[r[0]] || []).push({ author: str_(r[1]), admin: !!r[2], text: str_(r[3]), at: r[4] ? new Date(r[4]).getTime() : null });
  });
  return by;
}

/** Comentariile unui tichet: cele vechi (JSON în coloana 16, sau răspunsul vechi din 9 dacă 16 e goală) + `extra` din foaia "Comentarii", după `at`. */
function parseComments_(r, extra) {
  var arr = [];
  try { var a = JSON.parse(r[15] || '[]'); if (Array.isArray(a)) arr = a; } catch (e) {}
  var out = arr.map(function (c) { return { author: String(c.a || ''), admin: !!c.ad, text: String(c.t || ''), at: c.at ? Number(c.at) : null }; })
    .concat(extra || []).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
  if (!arr.length && r[8]) {   // răspunsul vechi stă primul: ModificatLa (folosit ca dată) se mută la fiecare comentariu de admin
    var at = r[13] ? new Date(r[13]).getTime() : (r[7] ? new Date(r[7]).getTime() : null);
    out.unshift({ author: r[9] || 'Admin', admin: true, text: String(r[8]), at: at });
  }
  return out;
}
function mapTicket_(r, cm) {
  return {
    id: r[0], n: r[1], reporter: str_(r[2]), title: str_(r[3]), desc: str_(r[4]),
    priority: r[5], status: r[6],
    created: r[7] ? new Date(r[7]).getTime() : null,
    reply: str_(r[8]), replyBy: str_(r[9]),
    attachments: parseAtt_(r[10]),
    archived: !!r[11],
    updatedBy: r[12] || '',
    updatedAt: r[13] ? new Date(r[13]).getTime() : null,
    category: str_(r[14]),
    comments: parseComments_(r, cm && cm[r[0]]),
  };
}

/** Tichete active (nearhivate), cel mai nou primul. Public. */
function getTickets() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var cm = commentsByCod_();
  var out = values.filter(function (r) { return !r[11]; }).map(function (r) { return mapTicket_(r, cm); });
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

/** Tichete arhivate. REZERVAT ADMINILOR. */
function getArchived(pin) {
  if (!admin_(pin)) throw new Error('Doar adminii pot vedea arhiva.');
  return archived_();
}

function archived_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var cm = commentsByCod_();
  var out = values.filter(function (r) { return !!r[11]; }).map(function (r) { return mapTicket_(r, cm); });
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

/** Ultimele intrări din jurnal. REZERVAT ADMINILOR. */
function getJournal(pin, limit) {
  if (!admin_(pin)) throw new Error('Doar adminii pot vedea jurnalul.');
  var sh = getJournalSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var n = Math.min(last - 1, limit || 100);
  var values = sh.getRange(last - n + 1, 1, n, JOURNAL_HEADERS.length).getValues();
  var out = values.map(function (r) {
    return { at: r[0] ? new Date(r[0]).getTime() : null, admin: str_(r[1]), action: str_(r[2]), cod: str_(r[3]), detail: str_(r[4]) };
  });
  out.reverse();
  return out;
}

/** Limită globală pe upload (60/oră, 300/zi), contoare în cache sub lock. */
function uploadQuota_() {
  var lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    var cache = CacheService.getScriptCache(), now = Date.now();
    var hk = 'up-h-' + Math.floor(now / 3600000), dk = 'up-d-' + Math.floor(now / 86400000);
    var h = Number(cache.get(hk)) || 0, d = Number(cache.get(dk)) || 0;
    if (h >= UP_HOUR || d >= UP_DAY) throw new Error('Prea multe capturi încărcate. Reîncearcă mai târziu.');
    cache.put(hk, String(h + 1), 3600);
    cache.put(dk, String(d + 1), 21600);   // maximul CacheService e 6 h: contorul zilnic = cel mult 300 în ultimele ≤ 6 h din zi
  } finally { lock.releaseLock(); }
}

/** Limită globală pe oră (contor în cache); se apelează sub lock-ul deja luat. */
function hourQuota_(prefix, max, msg) {
  var cache = CacheService.getScriptCache(), k = prefix + '-' + Math.floor(Date.now() / 3600000);
  var n = Number(cache.get(k)) || 0;
  if (n >= max) throw new Error(msg);
  cache.put(k, String(n + 1), 3600);
}

/** Curățarea capturilor orfane cel mult o dată la 24 h (marcaj CLEANUP_AT); fără trigger, ca să nu cerem scope nou. */
function maybeCleanup_() {
  var props = PropertiesService.getScriptProperties();
  var at = Number(props.getProperty('CLEANUP_AT')) || 0;
  if (at && Date.now() - at < 86400000) return;
  props.setProperty('CLEANUP_AT', String(Date.now()));   // întâi marcajul, ca apelurile paralele să nu pornească a doua curățare
  cleanupOrphans_();
}

/** Mută la coș capturile din folder care nu sunt în Tichete (inclusiv arhivate) sau News și au peste 24 h. Returnează numărul. */
function cleanupOrphans_() {
  var start = Date.now(), used = {}, n = 0;
  function collect(sh, col) {
    var last = sh.getLastRow();
    if (last < 2) return;
    sh.getRange(2, col, last - 1, 1).getValues().forEach(function (r) {
      parseAtt_(r[0]).forEach(function (a) { if (a && a.id) used[a.id] = true; });
    });
  }
  collect(getSheet_(), 11);
  collect(getNewsSheet_(), 8);
  if (!Object.keys(used).length) return 0;   // nicio referință: foaie redenumită/ștearsă (getSheet_ o recreează goală), nu trimite tot la coș
  var it = getFolder_().getFiles();
  while (it.hasNext() && Date.now() - start < 20000) {
    var f = it.next();
    if (!used[f.getId()] && start - f.getDateCreated().getTime() > 86400000) { f.setTrashed(true); n++; }
  }
  if (n > 0) log_('sistem', 'curățare capturi', '', n + ' capturi orfane mutate la coș');
  return n;
}

/** Încarcă o captură în Drive. Public. Returnează {id, name}. */
function uploadAttachment(b64, mime, name) {
  if (!/^image\//.test(String(mime || ''))) throw new Error('Doar imagini sunt permise.');
  var bytes = Utilities.base64Decode(String(b64 || ''));
  if (bytes.length > MAX_BYTES) throw new Error('Imaginea depășește 5 MB.');
  // octeți cu semn în Apps Script, de aici & 255
  if (!((bytes[0] & 255) === 0xFF && (bytes[1] & 255) === 0xD8 && (bytes[2] & 255) === 0xFF)) throw new Error('Doar imagini JPEG sunt permise.');
  uploadQuota_();
  try { maybeCleanup_(); } catch (e) {}
  var safeName = String(name || 'captura.jpg').replace(/[^\w.\-]+/g, '_').slice(0, 80);
  var blob = Utilities.newBlob(bytes, mime, safeName);
  var f = getFolder_().createFile(blob);
  return { id: f.getId(), name: safeName };
}

/** Fișierul cu ID-ul dat, doar dacă e în folderul de capturi. */
function ownFile_(id) {
  var f = DriveApp.getFileById(String(id));
  var folderId = getFolder_().getId();
  var parents = f.getParents();
  while (parents.hasNext()) { if (parents.next().getId() === folderId) return f; }
  throw new Error('Fișier neautorizat.');
}

/** Returnează conținutul unei capturi (doar din folderul nostru). Public. */
function getAttachment(id) {
  var blob = ownFile_(id).getBlob();
  return { data: Utilities.base64Encode(blob.getBytes()), mime: blob.getContentType() };
}

/** Miniatura unei capturi (doar din folderul nostru), pentru liste. Public. */
function getAttachmentThumb(id) {
  var f = ownFile_(id);
  var thumb = null;
  try { thumb = f.getThumbnail(); } catch (e) {}
  var blob = thumb || f.getBlob();
  return { data: Utilities.base64Encode(blob.getBytes()), mime: blob.getContentType() || 'image/png' };
}

/** Adaugă un tichet. Public. Returnează {code, tickets}. */
function addTicket(payload) {
  payload = payload || {};
  if (!String(payload.title || '').trim()) throw new Error('Titlul este obligatoriu.');
  var prio = PRIO_KEYS.indexOf(payload.priority) >= 0 ? payload.priority : 'medie';
  var atts = [];
  if (Array.isArray(payload.attachments)) {
    payload.attachments.slice(0, MAX_FILES).forEach(function (a) {
      if (a && typeof a.id === 'string') atts.push({ id: a.id, name: String(a.name || 'captura') });
    });
  }
  var cod;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    hourQuota_('tk-h', TK_HOUR, 'Prea multe tichete noi în ultima oră. Reîncearcă mai târziu.');
    var sh = getSheet_();
    var last = sh.getLastRow();
    var maxN = 0;
    if (last >= 2) {
      var nums = sh.getRange(2, 2, last - 1, 1).getValues();
      nums.forEach(function (row) { var v = Number(row[0]); if (v > maxN) maxN = v; });
    }
    var n = maxN + 1;
    cod = 'TIS-' + pad2_(n);
    sh.appendRow([
      cod, n,
      txt_(payload.reporter, 200),
      txt_(payload.title, 300),
      txt_(payload.desc, 4000),
      prio,
      'deschis', new Date(), '', '',
      JSON.stringify(atts),
      '', '', '',
      txt_(payload.category, 60),
      '',
    ]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  log_(payload.reporter || '?', 'creat', cod, payload.title);
  return { code: cod, tickets: getTickets() };
}

function findRow_(sh, cod) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var codes = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < codes.length; i++) { if (codes[i][0] === cod) return i + 2; }
  return -1;
}

/** Adaugă un comentariu la un tichet. Public: specialistul dă numele; adminul dă codul. */
function addComment(cod, text, name, pin) {
  var clean = String(text || '').slice(0, 4000);
  if (!clean) throw new Error('Comentariul este gol.');
  var adminN = admin_(pin);
  var author = adminN || String(name || '').slice(0, 120) || 'Anonim';
  var isAdmin = !!adminN;
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    if (!isAdmin) hourQuota_('cm-h', CM_HOUR, 'Prea multe comentarii în ultima oră. Reîncearcă mai târziu.');
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      getCommentsSheet_().appendRow([txt_(cod, 40), txt_(author, 120), isAdmin, txt_(clean, 4000), new Date()]);
      if (isAdmin) setMeta_(sh, row, author);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(author, 'comentariu', cod, isAdmin ? '(admin)' : '(specialist)');
  return getTickets();
}

/** Marchează cine/când a modificat (coloanele ModificatDe / ModificatLa). */
function setMeta_(sh, row, name) {
  sh.getRange(row, 13).setValue(name);
  sh.getRange(row, 14).setValue(new Date());
}

function updateStatus(cod, status, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să schimbi statusul.');
  if (STATUS_KEYS.indexOf(status) < 0) throw new Error('Status invalid.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 7).setValue(status); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'status → ' + status, cod, '');
  return getTickets();
}

function updatePriority(cod, priority, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să schimbi prioritatea.');
  if (PRIO_KEYS.indexOf(priority) < 0) throw new Error('Prioritate invalidă.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 6).setValue(priority); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'prioritate → ' + priority, cod, '');
  return getTickets();
}

function replyTicket(cod, text, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să răspunzi.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      var clean = txt_(text, 4000);
      sh.getRange(row, 9).setValue(clean);
      sh.getRange(row, 10).setValue(clean ? name : '');
      setMeta_(sh, row, name);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'răspuns', cod, '');
  return getTickets();
}

/** Editează titlul/descrierea/prioritatea unui tichet. REZERVAT ADMINILOR. */
function editTicket(cod, payload, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să editezi.');
  payload = payload || {};
  if (payload.priority != null && PRIO_KEYS.indexOf(payload.priority) < 0) throw new Error('Prioritate invalidă.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      if (payload.title != null) sh.getRange(row, 4).setValue(txt_(payload.title, 300));
      if (payload.desc != null) sh.getRange(row, 5).setValue(txt_(payload.desc, 4000));
      if (payload.priority != null) sh.getRange(row, 6).setValue(payload.priority);
      if (payload.category != null) sh.getRange(row, 15).setValue(txt_(payload.category, 60));
      setMeta_(sh, row, name);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'editat', cod, '');
  return getTickets();
}

/** Arhivează un tichet (recuperabil). REZERVAT ADMINILOR. Îl scoate din lista activă. */
function deleteTicket(cod, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să arhivezi tichete.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 12).setValue(true); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'arhivat', cod, '');
  return getTickets();
}

/** Restaurează un tichet arhivat. REZERVAT ADMINILOR. */
function restoreTicket(cod, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să restaurezi.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 12).setValue(false); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'restaurat', cod, '');
  return archived_();
}

/** Șterge DEFINITIV un tichet arhivat și mută capturile la coș. REZERVAT ADMINILOR. */
function purgeTicket(cod, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să ștergi definitiv.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      var atts = parseAtt_(sh.getRange(row, 11).getValue());
      atts.forEach(function (a) { try { DriveApp.getFileById(a.id).setTrashed(true); } catch (e) {} });
      sh.deleteRow(row);
      var cs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(COMMENTS_SHEET), cl = cs ? cs.getLastRow() : 0;
      if (cl >= 2) {
        var codes = cs.getRange(2, 1, cl - 1, 1).getValues();
        for (var i = codes.length - 1; i >= 0; i--) { if (String(codes[i][0]) === cod) cs.deleteRow(i + 2); }
      }
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'șters definitiv', cod, '');
  return archived_();
}

/** Export CSV al tuturor tichetelor (active + arhivate). REZERVAT ADMINILOR. */
function exportTicketsCsv(pin) {
  if (!admin_(pin)) throw new Error('Doar adminii pot exporta.');
  var sh = getSheet_();
  var last = sh.getLastRow();
  var tz = Session.getScriptTimeZone();
  function fd(v) { return v ? Utilities.formatDate(new Date(v), tz, 'yyyy-MM-dd HH:mm') : ''; }
  var head = ['Cod', 'Raportat', 'Titlu', 'Descriere', 'Prioritate', 'Categorie', 'Status', 'Creat', 'Raspuns', 'RaspunsDe', 'Arhivat', 'ModificatDe', 'ModificatLa'];
  var rows = [head];
  if (last >= 2) {
    var v = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    v.forEach(function (r) {
      rows.push([r[0], r[2], r[3], r[4], r[5], r[14], r[6], fd(r[7]), r[8], r[9], r[11] ? 'DA' : '', r[12], fd(r[13])]);
    });
  }
  return rows.map(function (row) {
    return row.map(function (c) {
      var s = String(c == null ? '' : c);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // fără formule în Excel
      if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    }).join(',');
  }).join('\n');
}


/* ===================== NEWS ===================== */

function getNewsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(NEWS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NEWS_SHEET);
    sh.getRange(1, 1, 1, NEWS_HEADERS.length).setValues([NEWS_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    return sh;
  }
  if (sh.getLastColumn() < NEWS_HEADERS.length) {
    sh.getRange(1, 1, 1, NEWS_HEADERS.length).setValues([NEWS_HEADERS]).setFontWeight('bold');
  }
  return sh;
}

function getNews() {
  var sh = getNewsSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, NEWS_HEADERS.length).getValues();
  var out = values.map(function (r) {
    return {
      id: r[0], n: r[1], title: str_(r[2]), body: str_(r[3]),
      type: r[4] || 'anunt', author: str_(r[5]),
      created: r[6] ? new Date(r[6]).getTime() : null,
      attachments: parseAtt_(r[7]),
    };
  });
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

function addNews(payload, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să publici anunțuri.');
  payload = payload || {};
  var tip = NEWS_TYPES.indexOf(payload.type) >= 0 ? payload.type : 'anunt';
  var atts = [];
  if (Array.isArray(payload.attachments)) {
    payload.attachments.slice(0, MAX_FILES).forEach(function (a) {
      if (a && typeof a.id === 'string') atts.push({ id: a.id, name: String(a.name || 'captura') });
    });
  }
  var nid;
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getNewsSheet_();
    var last = sh.getLastRow();
    var maxN = 0;
    if (last >= 2) {
      var nums = sh.getRange(2, 2, last - 1, 1).getValues();
      nums.forEach(function (row) { var v = Number(row[0]); if (v > maxN) maxN = v; });
    }
    var n = maxN + 1;
    nid = 'NW-' + pad2_(n);
    sh.appendRow([
      nid, n,
      txt_(payload.title, 300),
      txt_(payload.body, 8000),
      tip, name, new Date(), JSON.stringify(atts),
    ]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  log_(name, 'anunț publicat', nid, payload.title);
  return getNews();
}

function findNewsRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) { if (ids[i][0] === id) return i + 2; }
  return -1;
}

/** Editează un anunț. REZERVAT ADMINILOR. */
function editNews(id, payload, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să editezi anunțuri.');
  payload = payload || {};
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getNewsSheet_(); var row = findNewsRow_(sh, id);
    if (row > 0) {
      if (payload.title != null) sh.getRange(row, 3).setValue(txt_(payload.title, 300));
      if (payload.body != null) sh.getRange(row, 4).setValue(txt_(payload.body, 8000));
      if (payload.type != null && NEWS_TYPES.indexOf(payload.type) >= 0) sh.getRange(row, 5).setValue(payload.type);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'anunț editat', id, '');
  return getNews();
}

/** Șterge un anunț și capturile lui. REZERVAT ADMINILOR. */
function deleteNews(id, pin) {
  var name = admin_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să ștergi anunțuri.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getNewsSheet_(); var row = findNewsRow_(sh, id);
    if (row > 0) {
      var atts = parseAtt_(sh.getRange(row, 8).getValue());
      atts.forEach(function (a) { try { DriveApp.getFileById(a.id).setTrashed(true); } catch (e) {} });
      sh.deleteRow(row);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'anunț șters', id, '');
  return getNews();
}
