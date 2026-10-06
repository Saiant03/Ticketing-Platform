// Mock pentru google.script.run: rulează UI-ul local, fără Apps Script.
// Admin de test: cod "1234" -> "Admin Test".
(function () {
  var DAY = 86400000, now = Date.now();
  var ADMINS = { '1234': 'Admin Test', 'cod-lung-de-test': 'Admin Test' };
  var IMG = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzJhMmYzYSIvPjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjU2MCIgaGVpZ2h0PSI0NCIgcng9IjYiIGZpbGw9IiMzYTQxNTAiLz48cmVjdCB4PSI0MCIgeT0iMTEwIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzNhNDE1MCIvPjxyZWN0IHg9IjQwIiB5PSIxNDUiIHdpZHRoPSI0NjAiIGhlaWdodD0iMjAiIHJ4PSI0IiBmaWxsPSIjM2E0MTUwIi8+PHJlY3QgeD0iNDAiIHk9IjE4MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiMzYTQxNTAiLz48dGV4dCB4PSIzMjAiIHk9IjMzMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IiM4YTkzYTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmNhcHR1cmEgKG1vY2spPC90ZXh0Pjwvc3ZnPg==';
  function t(n, title, status, priority, category, reporter, ago, extra) {
    return Object.assign({
      id: 'TIS-' + (n < 10 ? '0' + n : n), n: n, reporter: reporter, title: title,
      desc: 'Pași: deschid modulul, completez câmpurile și apăs Salvează.\nRezultat: ' + title.toLowerCase() + '.',
      priority: priority, status: status, created: now - ago * DAY, reply: '', replyBy: '',
      attachments: [], archived: false, updatedBy: '', updatedAt: null, category: category, comments: []
    }, extra || {});
  }
  var db = {
    tickets: [
      t(14, 'Câmpul dată nu se completează automat la import', 'deschis', 'critica', 'Import', 'Andrei Popa', 0.1,
        { attachments: [{ id: 'img1', name: 'eroare_import.jpg' }, { id: 'img2', name: 'consola.jpg' }] }),
      t(13, 'Raportul săptămânal afișează totaluri duble', 'in_lucru', 'ridicata', 'Raportare', 'Ioana Marin', 0.6,
        { updatedBy: 'Admin Test', updatedAt: now - 0.2 * DAY, comments: [
          { author: 'Ioana Marin', admin: false, text: 'Se întâmplă doar pentru echipa de noapte.', at: now - 0.5 * DAY },
          { author: 'Admin Test', admin: true, text: 'Confirmat, lucrăm la fix.', at: now - 0.2 * DAY }] }),
      t(12, 'Butonul Export nu răspunde pe Safari', 'deschis', 'medie', 'Interfață', 'Mihai Ionescu', 1.2),
      t(11, 'Lipsesc turele din 3 octombrie', 'deschis', 'ridicata', 'Date', 'Elena Dobre', 2.1),
      t(10, 'Filtrul pe echipă se resetează la refresh', 'in_lucru', 'scazuta', 'Interfață', 'Radu Stan', 3),
      t(9, 'Import CSV respinge diacriticele din nume', 'rezolvat', 'medie', 'Import', 'Ana Georgescu', 5,
        { comments: [{ author: 'Admin Test', admin: true, text: 'Rezolvat în versiunea 2.3.', at: now - 4 * DAY }] }),
      t(8, 'Text foarte lung în titlu pentru a verifica cum se comportă cardul când titlul ocupă mai multe rânduri pe ecrane mici', 'deschis', 'medie', '', 'Cristian Vasile', 6)
    ],
    archived: [t(3, 'Tichet duplicat', 'rezolvat', 'scazuta', 'General', 'Test User', 20, { archived: true, updatedBy: 'Admin Test', updatedAt: now - 10 * DAY })],
    news: [
      { id: 'NW-02', n: 2, title: 'Import automat activat pentru toate echipele', type: 'update', author: 'Admin Test', created: now - DAY,
        body: 'Începând de azi, turele se importă automat la ora 06:00.\n\nDacă observi date lipsă, deschide un tichet cu categoria Import.', attachments: [{ id: 'img1', name: 'import.jpg' }] },
      { id: 'NW-01', n: 1, title: 'Fix: totaluri duble în raport', type: 'fix', author: 'Admin Test', created: now - 3 * DAY,
        body: 'Raportul săptămânal calculează corect totalurile.', attachments: [] }
    ]
  };
  // blocare ca în Code.gs: 5 greșeli -> 60 s; codurile >= 12 caractere ocolesc; codul gol nu contează
  var fails = 0, since = 0;
  function admin(pin) {
    pin = String(pin == null ? '' : pin);
    if (!pin) return '';
    var name = ADMINS[pin] || '', t = Date.now();
    if (name && pin.length >= 12) return name;
    if (fails >= 5 && t - since < 60000) throw new Error('Prea multe încercări greșite. Reîncearcă în ' + Math.ceil((60000 - (t - since)) / 1000) + ' secunde.');
    if (name) { fails = 0; return name; }
    if (fails >= 5) fails = 0;
    if (++fails >= 5) since = t;
    return '';
  }
  function need(pin) { var n = admin(pin); if (!n) throw new Error('Cod de admin invalid.'); return n; }
  var upHour = 0, upCount = 0;
  var STATUS = ['deschis', 'in_lucru', 'rezolvat'], PRIO = ['scazuta', 'medie', 'ridicata', 'critica'];
  function find(cod) { return db.tickets.filter(function (x) { return x.id === cod; })[0]; }
  var api = {
    verifyPin: function (pin) { return admin(pin); },
    getTickets: function () { return db.tickets; },
    getArchived: function (pin) { need(pin); return db.archived; },
    getNews: function () { return db.news; },
    getAttachment: function () { return { data: IMG, mime: 'image/svg+xml' }; },
    getAttachmentThumb: function () { return { data: IMG, mime: 'image/svg+xml' }; },
    // ca în Code.gs: JPEG real (FF D8 FF = /9j/ în base64) și 60 pe oră; fără Drive, fără curățare
    uploadAttachment: function (b64, mime, name) {
      if (!/^\/9j\//.test(String(b64 || ''))) throw new Error('Doar imagini JPEG sunt permise.');
      var h = Math.floor(Date.now() / 3600000);
      if (upHour !== h) { upHour = h; upCount = 0; }
      if (upCount >= 60) throw new Error('Prea multe capturi încărcate. Reîncearcă mai târziu.');
      upCount++;
      return { id: 'up' + Date.now(), name: name };
    },
    addTicket: function (p) {
      p = p || {};
      if (!String(p.title || '').trim()) throw new Error('Titlul este obligatoriu.');
      if (PRIO.indexOf(p.priority) < 0) p.priority = 'medie';
      var n = Math.max.apply(null, db.tickets.map(function (x) { return x.n; }).concat([0])) + 1;
      var tk = t(n, p.title, 'deschis', p.priority, p.category, p.reporter, 0, { desc: p.desc, attachments: p.attachments || [] });
      db.tickets.unshift(tk); return { code: tk.id, tickets: db.tickets };
    },
    addComment: function (cod, text, name, pin) {
      var x = find(cod); var a = admin(pin);
      if (x) x.comments.push({ author: a || name || 'Anonim', admin: !!a, text: text, at: Date.now() });
      return db.tickets;
    },
    updateStatus: function (cod, s, pin) { var n = need(pin); if (STATUS.indexOf(s) < 0) throw new Error('Status invalid.'); var x = find(cod); if (x) { x.status = s; x.updatedBy = n; x.updatedAt = Date.now(); } return db.tickets; },
    updatePriority: function (cod, p, pin) { var n = need(pin); if (PRIO.indexOf(p) < 0) throw new Error('Prioritate invalidă.'); var x = find(cod); if (x) { x.priority = p; x.updatedBy = n; x.updatedAt = Date.now(); } return db.tickets; },
    editTicket: function (cod, p, pin) { var n = need(pin); p = p || {}; if (p.priority != null && PRIO.indexOf(p.priority) < 0) throw new Error('Prioritate invalidă.'); var x = find(cod); if (x) { Object.assign(x, p); x.updatedBy = n; x.updatedAt = Date.now(); } return db.tickets; },
    replyTicket: function (cod, text, pin) { var n = need(pin), x = find(cod); if (x) { x.reply = text; x.replyBy = n; } return db.tickets; },
    deleteTicket: function (cod, pin) { need(pin); var x = find(cod); db.tickets = db.tickets.filter(function (y) { return y !== x; }); if (x) { x.archived = true; db.archived.unshift(x); } return db.tickets; },
    restoreTicket: function (cod, pin) { need(pin); var x = db.archived.filter(function (y) { return y.id === cod; })[0]; db.archived = db.archived.filter(function (y) { return y !== x; }); if (x) { x.archived = false; db.tickets.unshift(x); } return db.archived; },
    purgeTicket: function (cod, pin) { need(pin); db.archived = db.archived.filter(function (y) { return y.id !== cod; }); return db.archived; },
    exportTicketsCsv: function (pin) { need(pin); return 'Cod,Titlu\n' + db.tickets.map(function (x) { return x.id + ',' + x.title; }).join('\n'); },
    getJournal: function (pin, limit) {
      need(pin);
      return [
        { at: now - 0.2 * DAY, admin: 'Admin Test', action: 'status → in_lucru', cod: 'TIS-13', detail: '' },
        { at: now - 0.2 * DAY, admin: 'Admin Test', action: 'comentariu', cod: 'TIS-13', detail: '(admin)' },
        { at: now - 0.5 * DAY, admin: 'Ioana Marin', action: 'comentariu', cod: 'TIS-13', detail: '(specialist)' },
        { at: now - DAY, admin: 'Admin Test', action: 'anunț publicat', cod: 'NW-02', detail: 'Import automat activat pentru toate echipele' },
        { at: now - 4 * DAY, admin: 'Admin Test', action: 'status → rezolvat', cod: 'TIS-09', detail: '' },
        { at: now - 10 * DAY, admin: 'Admin Test', action: 'arhivat', cod: 'TIS-03', detail: '' }
      ].slice(0, limit || 100);
    },
    addNews: function (p, pin) { var n = need(pin); var k = db.news.length + 1; db.news.unshift({ id: 'NW-0' + k, n: k, title: p.title, body: p.body, type: p.type, author: n, created: Date.now(), attachments: p.attachments || [] }); return db.news; },
    editNews: function (id, p, pin) { need(pin); db.news.forEach(function (a) { if (a.id === id) Object.assign(a, p); }); return db.news; },
    deleteNews: function (id, pin) { need(pin); db.news = db.news.filter(function (a) { return a.id !== id; }); return db.news; }
  };
  var LATENCY = 300;
  function runner(ok, fail) {
    return new Proxy({}, {
      get: function (_, prop) {
        if (prop === 'withSuccessHandler') return function (f) { return runner(f, fail); };
        if (prop === 'withFailureHandler') return function (f) { return runner(ok, f); };
        if (!api[prop]) throw new Error('mock-gas: lipsește ' + String(prop));
        return function () {
          var args = arguments;
          setTimeout(function () {
            try { var r = JSON.parse(JSON.stringify(api[prop].apply(null, args))); ok && ok(r); }
            catch (e) { fail && fail(e); }
          }, LATENCY);
        };
      }
    });
  }
  window.google = { script: { run: runner(null, null) } };
})();
