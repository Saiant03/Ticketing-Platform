// Rulează src/Code.gs real în Node, cu serviciile Apps Script simulate în memorie. Rulare: node dev/gs-test.js
// Foaia păstrează valorile exact cum sunt scrise (`rows`, ca să se vadă ce ajunge în Sheet), dar ca Sheets real:
// getValues scoate apostroful de la început din text, iar o celulă peste 50.000 de caractere aruncă eroare.
var fs = require('fs'), vm = require('vm'), path = require('path');
var failed = false;
function ok(c, m) { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) failed = true; }

function Sheet() {
  var rows = [];
  function chk(v) { if (typeof v === 'string' && v.length > 50000) throw new Error('Celula depășește 50000 de caractere'); return v; }
  var sh = {
    getLastRow: function () { return rows.length; },
    getLastColumn: function () { return rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); },
    getRange: function (r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      var rg = {
        getValues: function () {
          var out = [];
          for (var i = 0; i < nr; i++) { var row = rows[r - 1 + i] || [], o = []; for (var j = 0; j < nc; j++) { var v = row[c - 1 + j]; o.push(v === undefined ? '' : typeof v === 'string' ? v.replace(/^'/, '') : v); } out.push(o); }
          return out;
        },
        setValues: function (vals) {
          vals.forEach(function (vr, i) { var row = rows[r - 1 + i] = rows[r - 1 + i] || []; vr.forEach(function (v, j) { row[c - 1 + j] = chk(v); }); });
          return rg;
        },
        getValue: function () { return rg.getValues()[0][0]; },
        setValue: function (v) { return rg.setValues([[v]]); },
        setFontWeight: function () { return rg; }
      };
      return rg;
    },
    appendRow: function (row) { rows.push(row.map(chk)); },
    deleteRow: function (r) { rows.splice(r - 1, 1); },
    setFrozenRows: function () {},
    rows: rows
  };
  return sh;
}

var sheets = {}, props = { ADMINS: '{"1234":"Admin Test","cod-lung-de-test":"Admin Lung"}' };
function pad(n) { return n < 10 ? '0' + n : '' + n; }
var clock = Date.now();   // ceasul simulat (Date.now din Code.gs), mutat mai jos
// CacheService în memorie, cu expirare după ceasul simulat
var cacheStore = {};
var cacheSvc = {
  getScriptCache: function () {
    return {
      get: function (k) { var e = cacheStore[k]; return e && e.exp > clock ? e.v : null; },
      put: function (k, v, sec) { cacheStore[k] = { v: String(v), exp: clock + sec * 1000 }; }
    };
  }
};
// Drive cu un singur folder în memorie; fișierele se creează cu ceasul simulat
var drive = { files: [], n: 0 };
var folder = {
  getId: function () { return 'FOLDER1'; },
  createFile: function (blob) { return drive.add(0, blob); },
  getFiles: function () {
    var list = drive.files.filter(function (f) { return !f.isTrashed(); }), i = 0;
    return { hasNext: function () { return i < list.length; }, next: function () { return list[i++]; } };
  }
};
drive.add = function (ageMs, blob) {
  var created = new Date(clock - ageMs), trashed = false, id = 'file' + (++drive.n);
  var f = {
    blob: blob, getId: function () { return id; }, getDateCreated: function () { return created; },
    setTrashed: function (v) { trashed = v; return f; }, isTrashed: function () { return trashed; },
    getParents: function () { var d = false; return { hasNext: function () { return !d; }, next: function () { d = true; return folder; } }; }
  };
  drive.files.push(f); return f;
};
var driveSvc = {
  getFolderById: function (id) { if (id !== 'FOLDER1') throw new Error('nu există'); return folder; },
  getFoldersByName: function () { var d = true; return { hasNext: function () { return !d; }, next: function () { return folder; } }; },
  createFolder: function () { return folder; },
  getFileById: function (id) { return drive.files.filter(function (f) { return f.getId() === id; })[0]; }
};
var ctx = vm.createContext({
  SpreadsheetApp: {
    getActiveSpreadsheet: function () {
      return {
        getSheetByName: function (n) { return sheets[n] || null; },
        insertSheet: function (n) { return (sheets[n] = Sheet()); }
      };
    },
    flush: function () {}
  },
  PropertiesService: {
    getScriptProperties: function () {
      return {
        getProperty: function (k) { return props.hasOwnProperty(k) ? props[k] : null; },
        setProperty: function (k, v) { props[k] = String(v); },
        deleteProperty: function (k) { delete props[k]; }
      };
    }
  },
  LockService: { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } },
  CacheService: cacheSvc,
  DriveApp: driveSvc,
  Utilities: {
    // octeți cu semn, ca în Apps Script
    base64Decode: function (s) { return Array.from(Buffer.from(s, 'base64')).map(function (b) { return b > 127 ? b - 256 : b; }); },
    newBlob: function (bytes, mime, name) { return { bytes: bytes, mime: mime, name: name }; },
    formatDate: function (d, tz, f) {
      return f.replace('yyyy', d.getUTCFullYear()).replace('MM', pad(d.getUTCMonth() + 1)).replace('dd', pad(d.getUTCDate()))
        .replace('HH', pad(d.getUTCHours())).replace('mm', pad(d.getUTCMinutes()));
    }
  },
  Session: { getScriptTimeZone: function () { return 'UTC'; } }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'Code.gs'), 'utf8'), ctx);
ctx.__clock = function () { return clock; };
vm.runInContext('Date.now = function () { return __clock(); };', ctx);

function thrown(fn) { try { fn(); return null; } catch (e) { return e.message; } }
function hasDate(v) {
  if (Object.prototype.toString.call(v) === '[object Date]') return true;
  if (v && typeof v === 'object') return Object.keys(v).some(function (k) { return hasDate(v[k]); });
  return false;
}
function reset() { delete props.PINLOCK; }
var T = function () { return sheets['Tichete']; };

// 1. addTicket: text ca text, titlu obligatoriu, prioritate invalidă
var evil = '=IMPORTXML("http://x","//a")';
ctx.addTicket({ reporter: '1/2', title: evil, desc: '+1', priority: 'xyz', category: 'Date' });
var row = T().rows[1];
ok(row[2] === "'1/2" && row[3] === "'" + evil && row[4] === "'+1" && row[14] === "'Date", 'addTicket: reporter, title, desc, category încep cu \'');
ok(row[5] === 'medie', 'addTicket: prioritate invalidă -> medie (scris: ' + row[5] + ')');
ok(/Titlul este obligatoriu/.test(thrown(function () { ctx.addTicket({ reporter: 'a', title: '   ' }); }) || ''), 'addTicket: titlu gol -> eroare');
ok(/Titlul este obligatoriu/.test(thrown(function () { ctx.addTicket(); }) || ''), 'addTicket: fără payload -> eroare, nu TypeError');
ok(T().rows.length === 2, 'addTicket: cererile respinse nu scriu rânduri');

// 2. rând vechi cu Date în Titlu
var oldRow = ['TIS-02', 2, 'Vechi', vm.runInContext('new Date()', ctx), 'desc', 'medie', 'deschis', vm.runInContext('new Date()', ctx), '', '', '[]', '', '', '', '', ''];
T().appendRow(oldRow);
var tk = ctx.getTickets();
var t2 = tk.filter(function (x) { return x.id === 'TIS-02'; })[0];
ok(t2 && typeof t2.title === 'string' && !hasDate(tk.map(function (x) { return { title: x.title, reporter: x.reporter, desc: x.desc, reply: x.reply, replyBy: x.replyBy, category: x.category }; })), 'getTickets: Date din Titlu devine string (' + (t2 && t2.title) + ')');
ok(t2 && t2.created === oldRow[7].getTime(), 'getTickets: câmpul created rămâne număr');

// 3. validare
reset();
ok(thrown(function () { ctx.updateStatus('TIS-01', 'hack', '1234'); }) === 'Status invalid.', 'updateStatus: status hack -> Status invalid.');
ok(thrown(function () { ctx.updatePriority('TIS-01', 'x', '1234'); }) === 'Prioritate invalidă.', 'updatePriority: x -> Prioritate invalidă.');
ok(thrown(function () { ctx.editTicket('TIS-01', { priority: 'x' }, '1234'); }) === 'Prioritate invalidă.', 'editTicket: prioritate x -> Prioritate invalidă.');
ok(T().rows[1][6] === 'deschis' && T().rows[1][5] === 'medie', 'valorile invalide nu au fost scrise');
ctx.updateStatus('TIS-01', 'in_lucru', '1234');
ok(T().rows[1][6] === 'in_lucru', 'updateStatus: status valid scris');

// 4. blocare
reset();
var all5 = true;
for (var i = 0; i < 5; i++) all5 = all5 && /Cod de admin invalid/.test(thrown(function () { ctx.updateStatus('TIS-01', 'deschis', '9999'); }) || '');
ok(all5, 'blocare: 5 x cod greșit -> „Cod de admin invalid”');
ok(/Prea multe încercări/.test(thrown(function () { ctx.updateStatus('TIS-01', 'deschis', '1234'); }) || ''), 'blocare: al 6-lea apel cu codul corect -> Prea multe încercări');
ok(/Prea multe încercări/.test(thrown(function () { ctx.getArchived('0000'); }) || ''), 'blocare: getArchived(0000) blocat');
ok(thrown(function () { ctx.getArchived('cod-lung-de-test'); }) === null, 'blocare: codul lung trece în timpul blocării');
var before = props.PINLOCK;
thrown(function () { ctx.verifyPin('0000'); });
ok(props.PINLOCK === before, 'blocare: încercările în timpul blocării nu prelungesc fereastra');
clock += 61000;
ok(thrown(function () { ctx.updateStatus('TIS-01', 'deschis', '1234'); }) === null, 'blocare: după 61 s codul corect merge');
ok(!props.PINLOCK, 'blocare: contorul s-a resetat (PINLOCK șters)');
// fereastra expirată + cod greșit: contor nou, nu blocare
for (i = 0; i < 5; i++) ctx.verifyPin('0000');
clock += 61000;
ctx.verifyPin('0000');
ok(JSON.parse(props.PINLOCK).fails === 1, 'blocare: după expirare, o greșeală pornește de la 1');
props.PINLOCK = '{stricat';
ok(ctx.verifyPin('0000') === '' && JSON.parse(props.PINLOCK).fails === 1, 'blocare: PINLOCK cu JSON stricat nu strică verificarea');

// 5. comentariu public, fără cod
reset();
for (i = 0; i < 10; i++) ctx.addComment('TIS-01', 'salut ' + i, 'Ana', undefined);
ok(!props.PINLOCK, 'addComment fără cod x10: nicio blocare');
ok(sheets['Comentarii'].rows.length === 11 && sheets['Comentarii'].rows.slice(1).every(function (r) { return r[0] === "'TIS-01"; }), 'addComment: comentariile sunt salvate în foaia Comentarii');
ctx.addComment('TIS-01', 'cu cod greșit', 'Ana', '0000');
var cm = sheets['Comentarii'].rows.pop();
ok(cm[2] === false && cm[1] === "'Ana" && cm[3] === "'cu cod greșit", 'addComment: cod greșit nu face admin');
reset();

// 6. export CSV
var csv = ctx.exportTicketsCsv('1234');
ok(csv.indexOf("'=IMPORTXML") >= 0 && csv.indexOf("''=") < 0, 'CSV: titlul cu formulă are un singur \' în față');
T().appendRow(['TIS-03', 3, 'x', '=1+1', '-5', 'medie', 'deschis', '', '', '', '[]', '', '', '', '', '']);
csv = ctx.exportTicketsCsv('1234');
ok(csv.indexOf("'=1+1") >= 0 && csv.indexOf("'-5") >= 0, 'CSV: valorile fără apostrof care încep cu = sau - primesc \'');
ok(thrown(function () { ctx.exportTicketsCsv('0000'); }) === 'Doar adminii pot exporta.', 'CSV: cod greșit -> refuz');
reset();

// 7. verifyPin
ok(ctx.verifyPin('1234') === 'Admin Test', 'verifyPin(1234) -> Admin Test');
ok(ctx.verifyPin('') === '' && !props.PINLOCK, 'verifyPin("") -> "" fără PINLOCK');

// extra: răspuns, news, jurnal
ctx.replyTicket('TIS-01', '=HYPERLINK("x")', '1234');
ok(T().rows[1][8] === "'=HYPERLINK(\"x\")" && T().rows[1][9] === 'Admin Test', 'replyTicket: text cu \', RaspunsDe = nume');
ctx.addNews({ title: '1/2', body: '=1+1', type: 'fix' }, '1234');
ok(sheets['News'].rows[1][2] === "'1/2" && sheets['News'].rows[1][3] === "'=1+1", 'addNews: titlu și corp cu \'');
ok(thrown(function () { ctx.addNews(undefined, '1234'); }) === null, 'addNews fără payload nu aruncă TypeError');
var jr = ctx.getJournal('1234', 100);
ok(jr.length > 0 && !hasDate(jr.map(function (j) { return [j.admin, j.action, j.cod, j.detail]; })), 'getJournal: câmpurile sunt string-uri');
ok(sheets['Jurnal'].rows.some(function (r) { return r[4] === "'" + evil; }), 'log_: detaliul liber are \'');
ok(ctx.restoreTicket('TIS-01', '1234').length === 0 && ctx.getArchived('1234').length === 0, 'restoreTicket/getArchived merg');

ctx.updateStatus('=1+1', 'deschis', '1234');
ok(sheets['Jurnal'].rows.some(function (r) { return r[3] === "'=1+1"; }), 'log_: codul din jurnal are \'');

// 8. upload: JPEG real, limită pe oră/zi, curățare orfani
var HOUR = 3600000, DAY = 86400000;
function b64(bytes) { return Buffer.from(bytes).toString('base64'); }
function up() { return ctx.uploadAttachment(b64([0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3]), 'image/jpeg', 'a b.jpg'); }
function trashedIds() { return drive.files.filter(function (f) { return f.isTrashed(); }).map(function (f) { return f.getId(); }); }
var r8 = up();
ok(r8 && r8.id && r8.name === 'a_b.jpg', 'uploadAttachment: JPEG valid -> {id, name}');
ok(/Doar imagini JPEG/.test(thrown(function () { ctx.uploadAttachment(b64([0x89, 0x50, 0x4E, 0x47, 1, 2]), 'image/png', 'x.png'); }) || ''), 'uploadAttachment: octeți PNG -> Doar imagini JPEG');
ok(/Doar imagini JPEG/.test(thrown(function () { ctx.uploadAttachment(b64([0xFF, 0xD8, 1]), 'image/jpeg', 'x.jpg'); }) || ''), 'uploadAttachment: mime JPEG dar octeți fără FF D8 FF -> respins');
ok(drive.files.length === 1, 'uploadAttachment: respingerile nu creează fișiere');

// limita pe oră: 60 trec, al 61-lea nu; după o oră trece iar
cacheStore = {}; props.CLEANUP_AT = String(clock);
var allOk = true;
for (i = 0; i < 60; i++) allOk = allOk && thrown(up) === null;
ok(allOk, 'limită: 60 de upload-uri în aceeași oră trec');
ok(/Prea multe capturi/.test(thrown(up) || ''), 'limită: al 61-lea în aceeași oră -> Prea multe capturi');
clock += HOUR;
ok(thrown(up) === null, 'limită: după o oră trece din nou');
// limita pe zi: cheia zilei la 300 oprește chiar și cu contor orar liber
cacheStore = {}; cacheStore['up-d-' + Math.floor(clock / DAY)] = { v: '300', exp: clock + HOUR };
ok(/Prea multe capturi/.test(thrown(up) || ''), 'limită: 300 pe zi -> Prea multe capturi');
cacheStore = {};

// curățare: doar orfanul vechi merge la coș
drive.files = []; delete props.CLEANUP_AT;
var fT = drive.add(2 * DAY), fA = drive.add(2 * DAY), fN = drive.add(2 * DAY), fO = drive.add(2 * DAY), fNew = drive.add(HOUR);
T().appendRow(['TIS-90', 90, 'x', 't', 'd', 'medie', 'deschis', '', '', '', JSON.stringify([{ id: fT.getId(), name: 'a.jpg' }]), '', '', '', '', '']);
T().appendRow(['TIS-91', 91, 'x', 't', 'd', 'medie', 'deschis', '', '', '', JSON.stringify([{ id: fA.getId(), name: 'a.jpg' }]), true, '', '', '', '']);
sheets['News'].appendRow(['NW-90', 90, 't', 'b', 'fix', 'x', '', JSON.stringify([{ id: fN.getId(), name: 'a.jpg' }])]);
up();
ok(trashedIds().join() === fO.getId(), 'curățare: doar orfanul vechi la coș (coș: ' + trashedIds().join() + ')');
ok(sheets['Jurnal'].rows.some(function (r) { return r[2] === 'curățare capturi' && /1 capturi orfane/.test(r[4]); }), 'curățare: jurnalul are „curățare capturi”');
ok(Number(props.CLEANUP_AT) === clock, 'curățare: CLEANUP_AT setat');
var fO2 = drive.add(2 * DAY);
up();
ok(!fO2.isTrashed(), 'curățare: al doilea upload în aceeași zi nu o mai rulează');
clock += 25 * HOUR;
up();
ok(fO2.isTrashed() && !fT.isTrashed() && !fA.isTrashed() && !fN.isTrashed(), 'curățare: după +25 h rulează din nou (referitele rămân)');

// o eroare în curățare nu oprește upload-ul și nu trimite nimic la coș
var realNews = ctx.getNewsSheet_, fO3 = drive.add(2 * DAY);
ctx.getNewsSheet_ = function () { throw new Error('boom'); };
delete props.CLEANUP_AT;
var r9; ok(thrown(function () { r9 = up(); }) === null && r9 && r9.id, 'curățare: eroare în curățare -> upload-ul merge');
ok(!fO3.isTrashed(), 'curățare: citirea ID-urilor a eșuat -> nu se șterge nimic');
ctx.getNewsSheet_ = realNews;

// fără nicio referință (foi goale/redenumite): curățarea nu mută nimic la coș
var saveT = sheets['Tichete'], saveN = sheets['News'];
delete sheets['Tichete']; delete sheets['News'];
var fE = drive.add(3 * DAY);
ok(ctx.cleanupOrphans_() === 0 && !fE.isTrashed(), 'curățare: foi fără atașamente -> nimic la coș');
sheets['Tichete'] = saveT; sheets['News'] = saveN;

// 9. comentarii în foaia "Comentarii" (fără limita de 50.000 de caractere pe celulă)
var C = function () { return sheets['Comentarii']; };
function tkt(cod, list) { return (list || ctx.getTickets()).filter(function (x) { return x.id === cod; })[0]; }
function mk(cod, n, extra) { T().appendRow([cod, n, 'x', 't', 'd', 'medie', 'deschis', '', '', '', '[]', '', '', '', '', extra === undefined ? '' : extra]); }
mk('TIS-C1', 101);
var cmts = [];
for (i = 0; i < 20; i++) { var big = new Array(3997).join('x') + ('000' + i).slice(-4); cmts.push(big); ctx.addComment('TIS-C1', big, 'Ana', undefined); }
ok(cmts.length === 20 && cmts[0].length === 4000, 'comentarii: 20 x 4000 de caractere (80.000 în total) se salvează fără eroare');
var got = tkt('TIS-C1').comments;
ok(got.length === 20 && got.every(function (c, k) { return c.text === cmts[k]; }), 'comentarii: getTickets le întoarce pe toate 20, în ordine');
ok(T().rows.every(function (r) { return r.every(function (v) { return typeof v !== 'string' || v.length <= 50000; }); }) && C().rows.every(function (r) { return r.every(function (v) { return typeof v !== 'string' || v.length <= 50000; }); }), 'comentarii: nicio celulă peste 50.000 de caractere');
ok(T().rows[T().rows.length - 1][15] === '', 'comentarii: coloana 16 din Tichete nu se mai scrie');
var chkThrow = thrown(function () { sheets['Comentarii'].appendRow(['x', 'a', false, new Array(50002).join('x'), '']); });
ok(/50000/.test(chkThrow || ''), 'stub: o celulă peste 50.000 de caractere aruncă, ca Sheets');

// JSON vechi în coloana 16 (2 comentarii) + 1 nou -> 3, după `at`
var oldJson = JSON.stringify([{ a: 'Vechi1', ad: false, t: 'v1', at: 1000 }, { a: 'Vechi2', ad: true, t: 'v2', at: 2000 }]);
mk('TIS-C2', 102, oldJson);
ctx.addComment('TIS-C2', 'nou', 'Ana', undefined);
var c2 = tkt('TIS-C2').comments;
ok(c2.length === 3 && c2.map(function (c) { return c.text; }).join() === 'v1,v2,nou' && c2[0].at === 1000 && c2[2].at > 2000, 'comentarii: 2 vechi (col. 16) + 1 nou = 3, după at');
ok(T().rows[T().rows.length - 1][15] === oldJson, 'comentarii: JSON-ul vechi din coloana 16 rămâne neatins');

// răspuns vechi în coloana 9, coloana 16 goală + 1 nou -> 2
T().appendRow(['TIS-C3', 103, 'x', 't', 'd', 'medie', 'deschis', new Date(5000), 'răspuns vechi', 'Admin Vechi', '[]', '', '', '', '', '']);
ctx.addComment('TIS-C3', 'nou', 'Ana', undefined);
var c3 = tkt('TIS-C3').comments;
ok(c3.length === 2 && c3[0].text === 'răspuns vechi' && c3[0].admin === true && c3[0].author === 'Admin Vechi' && c3[1].text === 'nou', 'comentarii: răspunsul vechi (col. 9) + 1 nou = 2');

// txt_ pe autor și text
ctx.addComment('TIS-C3', '=1+1', '=HYPERLINK("http://x")', undefined);
var last9 = C().rows[C().rows.length - 1];
ok(last9[1] === "'=HYPERLINK(\"http://x\")" && last9[3] === "'=1+1" && last9[0] === "'TIS-C3", 'comentarii: autor, text și cod scrise cu \'');
var c3b = tkt('TIS-C3').comments.pop();
ok(c3b.author === '=HYPERLINK("http://x")' && c3b.text === '=1+1', 'comentarii: la citire apostroful nu apare');

// cod inexistent
var n9 = C().rows.length;
ctx.addComment('TIS-NU', 'fantomă', 'Ana', undefined);
ok(C().rows.length === n9, 'comentarii: cod inexistent -> nimic adăugat în Comentarii');
ok(/Comentariul este gol/.test(thrown(function () { ctx.addComment('TIS-C1', '', 'Ana'); }) || '') && C().rows.length === n9, 'comentarii: text gol -> eroare, nimic scris');

// comentariu de admin: autor = numele adminului, admin = true
reset();
ctx.addComment('TIS-C1', 'de la admin', 'Altcineva', '1234');
var ca = C().rows[C().rows.length - 1];
ok(ca[1] === "'Admin Test" && ca[2] === true && T().rows[1 + T().rows.slice(1).findIndex(function (r) { return r[0] === 'TIS-C1'; })][12] === 'Admin Test', 'comentarii: admin -> autor = numele din cod, Admin = true, ModificatDe setat');

// purgeTicket + arhivă
ctx.deleteTicket('TIS-C3', '1234');
var arch = ctx.getArchived('1234');
var ac = tkt('TIS-C3', arch);
ok(ac && ac.comments.length === 3 && ac.comments[2].text === '=1+1' && !hasDate(arch), 'getArchived: include comentariile tichetului arhivat, fără valori Date');
ok(!hasDate(ctx.getTickets()), 'getTickets: nicio valoare Date în răspuns');
var otherBefore = C().rows.filter(function (r) { return r[0] !== "'TIS-C3"; }).length;
ok(C().rows.some(function (r) { return r[0] === "'TIS-C3"; }), 'purgeTicket: (înainte) există rânduri pentru TIS-C3');
var after = ctx.purgeTicket('TIS-C3', '1234');
ok(!C().rows.some(function (r) { return r[0] === "'TIS-C3"; }), 'purgeTicket: rândurile TIS-C3 din Comentarii au dispărut');
ok(C().rows.filter(function (r) { return r[0] !== "'TIS-C3"; }).length === otherBefore && tkt('TIS-C1').comments.length === 21, 'purgeTicket: comentariile altor tichete rămân');
ok(!tkt('TIS-C3', after) && after.every(function (x) { return x.id !== 'TIS-C3'; }), 'purgeTicket: tichetul nu mai e în arhivă');
reset();

// citirea și ștergerea definitivă nu creează foaia Comentarii (doar addComment, sub lock)
var saveC = sheets['Comentarii'];
delete sheets['Comentarii'];
ok(ctx.getTickets().length > 0 && !sheets['Comentarii'], 'getTickets: fără foaia Comentarii nu o creează');
ok(Array.isArray(ctx.getArchived('1234')) && !sheets['Comentarii'], 'getArchived: fără foaia Comentarii nu o creează');
mk('TIS-C9', 109); ctx.deleteTicket('TIS-C9', '1234');
ok(Array.isArray(ctx.purgeTicket('TIS-C9', '1234')) && !sheets['Comentarii'], 'purgeTicket: fără foaia Comentarii nu o creează');
ctx.addComment('TIS-C1', 'creează foaia', 'Ana', undefined);
ok(!!sheets['Comentarii'] && sheets['Comentarii'].rows.length === 2, 'addComment: creează foaia Comentarii la prima utilizare');
sheets['Comentarii'] = saveC;
reset();

console.log(failed ? 'EȘEC' : 'toate OK');
process.exit(failed ? 1 : 0);
