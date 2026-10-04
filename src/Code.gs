/**
 * Tichete TIS - backend Google Apps Script
 * Datele se salvează în foaia "Tichete". Capturile se salvează în Google Drive (folder dedicat).
 * Jurnal de acțiuni în foaia "Jurnal". Ștergerea = arhivare (recuperabilă); există și ștergere definitivă.
 */

// Codurile de admin NU stau în cod (repo-ul e public).
// Se setează în editorul Apps Script: Project Settings > Script Properties,
// cheia ADMINS, valoare JSON: {"cod1":"Nume 1","cod2":"Nume 2"}

var SHEET_NAME = 'Tichete';
var NEWS_SHEET = 'News';
var JOURNAL_SHEET = 'Jurnal';
var FOLDER_NAME = 'Tichete TIS - Capturi';
var MAX_FILES = 5;
var MAX_BYTES = 5 * 1024 * 1024;
var HEADERS = ['Cod', 'N', 'Raportat', 'Titlu', 'Descriere', 'Prioritate', 'Status', 'Creat', 'Raspuns', 'RaspunsDe', 'Atasamente', 'Arhivat', 'ModificatDe', 'ModificatLa', 'Categorie', 'Comentarii'];
var NEWS_HEADERS = ['Id', 'N', 'Titlu', 'Continut', 'Tip', 'Autor', 'Creat', 'Atasamente'];
var JOURNAL_HEADERS = ['Data', 'Admin', 'Actiune', 'Cod', 'Detaliu'];
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

/** Adaugă o intrare în jurnal (cine, ce, când). Nu blochează fluxul dacă eșuează. */
function log_(admin, action, cod, detail) {
  try {
    getJournalSheet_().appendRow([new Date(), admin || '', action || '', cod || '', String(detail || '').slice(0, 500)]);
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

/** Verifică codul de admin, cu protecție la încercări repetate (blocare 60s după 5 greșeli). */
function verifyPin(pin) {
  var props = PropertiesService.getScriptProperties();
  var WINDOW = 60000, MAXF = 5;
  var raw = props.getProperty('PINLOCK');
  var st = raw ? JSON.parse(raw) : { fails: 0, since: 0 };
  var now = Date.now();
  var longName = String(pin).length >= LONG_PIN ? adminName_(pin) : '';
  if (longName) return longName;
  if (st.fails >= MAXF && (now - st.since) < WINDOW) {
    var wait = Math.ceil((WINDOW - (now - st.since)) / 1000);
    throw new Error('Prea multe încercări greșite. Reîncearcă în ' + wait + ' secunde.');
  }
  if (st.fails >= MAXF) st = { fails: 0, since: 0 };
  var name = adminName_(pin);
  if (name) { props.deleteProperty('PINLOCK'); return name; }
  st.fails = (st.fails || 0) + 1;
  if (st.fails >= MAXF) st.since = now;
  props.setProperty('PINLOCK', JSON.stringify(st));
  return '';
}

function parseAtt_(raw) {
  try { var a = JSON.parse(raw || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}

function parseComments_(r) {
  var arr = [];
  try { var a = JSON.parse(r[15] || '[]'); if (Array.isArray(a)) arr = a; } catch (e) {}
  var out = arr.map(function (c) { return { author: c.a || '', admin: !!c.ad, text: c.t || '', at: c.at ? Number(c.at) : null }; });
  if (!out.length && r[8]) {
    var at = r[13] ? new Date(r[13]).getTime() : (r[7] ? new Date(r[7]).getTime() : null);
    out.push({ author: r[9] || 'Admin', admin: true, text: String(r[8]), at: at });
  }
  return out;
}
function mapTicket_(r) {
  return {
    id: r[0], n: r[1], reporter: r[2], title: r[3], desc: r[4],
    priority: r[5], status: r[6],
    created: r[7] ? new Date(r[7]).getTime() : null,
    reply: r[8] || '', replyBy: r[9] || '',
    attachments: parseAtt_(r[10]),
    archived: !!r[11],
    updatedBy: r[12] || '',
    updatedAt: r[13] ? new Date(r[13]).getTime() : null,
    category: r[14] || '',
    comments: parseComments_(r),
  };
}

/** Tichete active (nearhivate), cel mai nou primul. Public. */
function getTickets() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = values.filter(function (r) { return !r[11]; }).map(mapTicket_);
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

/** Tichete arhivate. REZERVAT ADMINILOR. */
function getArchived(pin) {
  if (!adminName_(pin)) throw new Error('Doar adminii pot vedea arhiva.');
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = values.filter(function (r) { return !!r[11]; }).map(mapTicket_);
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

/** Ultimele intrări din jurnal. REZERVAT ADMINILOR. */
function getJournal(pin, limit) {
  if (!adminName_(pin)) throw new Error('Doar adminii pot vedea jurnalul.');
  var sh = getJournalSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var n = Math.min(last - 1, limit || 100);
  var values = sh.getRange(last - n + 1, 1, n, JOURNAL_HEADERS.length).getValues();
  var out = values.map(function (r) {
    return { at: r[0] ? new Date(r[0]).getTime() : null, admin: r[1], action: r[2], cod: r[3], detail: r[4] };
  });
  out.reverse();
  return out;
}

/** Încarcă o captură în Drive. Public. Returnează {id, name}. */
function uploadAttachment(b64, mime, name) {
  if (!/^image\//.test(String(mime || ''))) throw new Error('Doar imagini sunt permise.');
  var bytes = Utilities.base64Decode(String(b64 || ''));
  if (bytes.length > MAX_BYTES) throw new Error('Imaginea depășește 5 MB.');
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
  var atts = [];
  if (payload && Array.isArray(payload.attachments)) {
    payload.attachments.slice(0, MAX_FILES).forEach(function (a) {
      if (a && typeof a.id === 'string') atts.push({ id: a.id, name: String(a.name || 'captura') });
    });
  }
  var cod;
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
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
      String(payload.reporter || '').slice(0, 200),
      String(payload.title || '').slice(0, 300),
      String(payload.desc || '').slice(0, 4000),
      payload.priority || 'medie',
      'deschis', new Date(), '', '',
      JSON.stringify(atts),
      '', '', '',
      String((payload && payload.category) || '').slice(0, 60),
      '',
    ]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  log_(String(payload.reporter || '?'), 'creat', cod, String(payload.title || ''));
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
  var adminN = adminName_(pin);
  var author = adminN || String(name || '').slice(0, 120) || 'Anonim';
  var isAdmin = !!adminN;
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      var raw = sh.getRange(row, 16).getValue();
      var arr = [];
      try { var a = JSON.parse(raw || '[]'); if (Array.isArray(a)) arr = a; } catch (e) {}
      if (!arr.length) {
        var legacy = sh.getRange(row, 9).getValue();
        if (legacy) {
          var la = sh.getRange(row, 14).getValue() || sh.getRange(row, 8).getValue();
          arr.push({ a: sh.getRange(row, 10).getValue() || 'Admin', ad: true, t: String(legacy), at: la ? new Date(la).getTime() : Date.now() });
        }
      }
      arr.push({ a: author, ad: isAdmin, t: clean, at: Date.now() });
      sh.getRange(row, 16).setValue(JSON.stringify(arr));
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
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să schimbi statusul.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 7).setValue(status); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'status → ' + status, cod, '');
  return getTickets();
}

function updatePriority(cod, priority, pin) {
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să schimbi prioritatea.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 6).setValue(priority); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'prioritate → ' + priority, cod, '');
  return getTickets();
}

function replyTicket(cod, text, pin) {
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să răspunzi.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      var clean = String(text || '').slice(0, 4000);
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
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să editezi.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      if (payload.title != null) sh.getRange(row, 4).setValue(String(payload.title).slice(0, 300));
      if (payload.desc != null) sh.getRange(row, 5).setValue(String(payload.desc).slice(0, 4000));
      if (payload.priority != null) sh.getRange(row, 6).setValue(payload.priority);
      if (payload.category != null) sh.getRange(row, 15).setValue(String(payload.category).slice(0, 60));
      setMeta_(sh, row, name);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'editat', cod, '');
  return getTickets();
}

/** Arhivează un tichet (recuperabil). REZERVAT ADMINILOR. Îl scoate din lista activă. */
function deleteTicket(cod, pin) {
  var name = adminName_(pin);
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
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să restaurezi.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) { sh.getRange(row, 12).setValue(false); setMeta_(sh, row, name); SpreadsheetApp.flush(); }
  } finally { lock.releaseLock(); }
  log_(name, 'restaurat', cod, '');
  return getArchived(pin);
}

/** Șterge DEFINITIV un tichet arhivat și mută capturile la coș. REZERVAT ADMINILOR. */
function purgeTicket(cod, pin) {
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să ștergi definitiv.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getSheet_(); var row = findRow_(sh, cod);
    if (row > 0) {
      var atts = parseAtt_(sh.getRange(row, 11).getValue());
      atts.forEach(function (a) { try { DriveApp.getFileById(a.id).setTrashed(true); } catch (e) {} });
      sh.deleteRow(row);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'șters definitiv', cod, '');
  return getArchived(pin);
}

/** Export CSV al tuturor tichetelor (active + arhivate). REZERVAT ADMINILOR. */
function exportTicketsCsv(pin) {
  if (!adminName_(pin)) throw new Error('Doar adminii pot exporta.');
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
      id: r[0], n: r[1], title: r[2], body: r[3],
      type: r[4] || 'anunt', author: r[5],
      created: r[6] ? new Date(r[6]).getTime() : null,
      attachments: parseAtt_(r[7]),
    };
  });
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

function addNews(payload, pin) {
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să publici anunțuri.');
  var tip = NEWS_TYPES.indexOf(payload.type) >= 0 ? payload.type : 'anunt';
  var atts = [];
  if (payload && Array.isArray(payload.attachments)) {
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
      String(payload.title || '').slice(0, 300),
      String(payload.body || '').slice(0, 8000),
      tip, name, new Date(), JSON.stringify(atts),
    ]);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  log_(name, 'anunț publicat', nid, String(payload.title || ''));
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
  var name = adminName_(pin);
  if (!name) throw new Error('Cod de admin invalid. Nu ai dreptul să editezi anunțuri.');
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var sh = getNewsSheet_(); var row = findNewsRow_(sh, id);
    if (row > 0) {
      if (payload.title != null) sh.getRange(row, 3).setValue(String(payload.title).slice(0, 300));
      if (payload.body != null) sh.getRange(row, 4).setValue(String(payload.body).slice(0, 8000));
      if (payload.type != null && NEWS_TYPES.indexOf(payload.type) >= 0) sh.getRange(row, 5).setValue(payload.type);
      SpreadsheetApp.flush();
    }
  } finally { lock.releaseLock(); }
  log_(name, 'anunț editat', id, '');
  return getNews();
}

/** Șterge un anunț și capturile lui. REZERVAT ADMINILOR. */
function deleteNews(id, pin) {
  var name = adminName_(pin);
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
