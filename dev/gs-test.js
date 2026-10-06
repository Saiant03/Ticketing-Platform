// Rulează src/Code.gs real în Node, cu serviciile Apps Script simulate în memorie. Rulare: node dev/gs-test.js
// Foaia păstrează valorile exact cum sunt scrise (nu le interpretează), ca să se vadă ce ajunge în Sheet.
var fs = require('fs'), vm = require('vm'), path = require('path');
var failed = false;
function ok(c, m) { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) failed = true; }

function Sheet() {
  var rows = [];
  var sh = {
    getLastRow: function () { return rows.length; },
    getLastColumn: function () { return rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0); },
    getRange: function (r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      var rg = {
        getValues: function () {
          var out = [];
          for (var i = 0; i < nr; i++) { var row = rows[r - 1 + i] || [], o = []; for (var j = 0; j < nc; j++) { var v = row[c - 1 + j]; o.push(v === undefined ? '' : v); } out.push(o); }
          return out;
        },
        setValues: function (vals) {
          vals.forEach(function (vr, i) { var row = rows[r - 1 + i] = rows[r - 1 + i] || []; vr.forEach(function (v, j) { row[c - 1 + j] = v; }); });
          return rg;
        },
        getValue: function () { return rg.getValues()[0][0]; },
        setValue: function (v) { return rg.setValues([[v]]); },
        setFontWeight: function () { return rg; }
      };
      return rg;
    },
    appendRow: function (row) { rows.push(row.slice()); },
    deleteRow: function (r) { rows.splice(r - 1, 1); },
    setFrozenRows: function () {},
    rows: rows
  };
  return sh;
}

var sheets = {}, props = { ADMINS: '{"1234":"Admin Test","cod-lung-de-test":"Admin Lung"}' };
function pad(n) { return n < 10 ? '0' + n : '' + n; }
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
  Utilities: {
    formatDate: function (d, tz, f) {
      return f.replace('yyyy', d.getUTCFullYear()).replace('MM', pad(d.getUTCMonth() + 1)).replace('dd', pad(d.getUTCDate()))
        .replace('HH', pad(d.getUTCHours())).replace('mm', pad(d.getUTCMinutes()));
    }
  },
  Session: { getScriptTimeZone: function () { return 'UTC'; } }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'Code.gs'), 'utf8'), ctx);
var clock = Date.now();
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
ok(JSON.parse(T().rows[1][15]).length === 10, 'addComment: comentariile sunt salvate');
ctx.addComment('TIS-01', 'cu cod greșit', 'Ana', '0000');
var cm = JSON.parse(T().rows[1][15]).pop();
ok(cm.ad === false && cm.a === 'Ana', 'addComment: cod greșit nu face admin');
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

console.log(failed ? 'EȘEC' : 'toate OK');
process.exit(failed ? 1 : 0);
