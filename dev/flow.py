"""Test functional al fluxurilor principale pe dev/preview.py (date din dev/mock-gas.js). Rulare: python3 dev/flow.py.
Selectori pentru UI-ul „Orbită” (planetele sunt div.planet cu .body și .lbl .code/.ttl); actualizează-i când se schimbă markup-ul."""
from browser import launch
from playwright.sync_api import sync_playwright
errs = []
def ok(c, m): print(("OK  " if c else "FAIL"), m)
# etichete fără coliziuni: cutiile codului (și titlului, când e afișat) nu se suprapun între ele și nu acoperă corpul altei planete
COLL = """()=>{
  const L = [], bad = [];
  document.querySelectorAll('.planet:not(.dim):not(.flying) .lbl').forEach(l => {
    const id = l.closest('.planet').dataset.id;
    const push = e => { const r = e.getBoundingClientRect(); if (r.width) L.push({ id, l: r.left, t: r.top, r: r.right, b: r.bottom }); };
    push(l.querySelector('.code'));
    const t = l.querySelector('.ttl'), cs = getComputedStyle(t);
    if (cs.display !== 'none' && cs.opacity !== '0') push(t);
  });
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j];
    if (a.id !== b.id && a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1) bad.push('lbl ' + a.id + ' x ' + b.id);
  }
  const P = [...document.querySelectorAll('.planet .body')].map(e => { const r = e.getBoundingClientRect(); return { id: e.closest('.planet').dataset.id, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, rad: r.width / 2 }; });
  L.forEach(a => P.forEach(p => {
    if (p.id === a.id) return;
    const dx = p.x - Math.max(a.l, Math.min(p.x, a.r)), dy = p.y - Math.max(a.t, Math.min(p.y, a.b));
    if (Math.hypot(dx, dy) < p.rad - 1) bad.push('lbl ' + a.id + ' on body ' + p.id);
  }));
  return { n: L.length, bad };
}"""
# animațiile inelelor (id 'orb'): câte rulează, cu ce viteză
ORB = """()=>document.getAnimations().filter(a => a.id === 'orb').map(a => [a.playState, a.playbackRate])"""
# scara matricei camerei hărții
CAMS = """()=>parseFloat(getComputedStyle(document.querySelector('#cam')).transform.replace('matrix(', ''))"""
# primul moment în care apare o planetă (ms de la navigare), pentru testul de cache
INIT = "new MutationObserver((m, o) => { if (document.querySelector('.planet')) { window.__tp = performance.now(); o.disconnect(); } }).observe(document, { childList: true, subtree: true });"
# numele inelelor: cutiile celor 5 nu se intersectează
RZ = """()=>{
  const R = [...document.querySelectorAll('.rz text')].map(e => e.getBoundingClientRect()), bad = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j];
    if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) bad.push(i + '/' + j);
  }
  return bad;
}"""
with sync_playwright() as p:
    b = launch(p)
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True); pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8080/"); pg.wait_for_timeout(1200)
    W = 400; V = 1000   # V: așteptare după orice comutare de vedere (tranziția prin nucleu, ~0,75 s)
    ok(pg.get_attribute("[data-status='all']", "aria-pressed") == "true", "default filter is Toate")
    # --- Hartă ---
    ok(pg.locator(".planet").count() == 7, "map: 7 planets (Toate, includes resolved)")
    pg.wait_for_timeout(1300)   # tick-ul de ~1 s a plasat etichetele
    r = pg.evaluate(COLL); ok(r['n'] >= 14 and not r['bad'], f"labels 1440 (Toate): {r['n']} boxes, collisions: {r['bad'] or 'none'}")
    # rotația: 5 animații de inel; rulează cu viteza 1 cu mouse-ul în afara hărții, se oprește (rata 0) cu mouse-ul pe hartă
    pg.mouse.move(60, 30); pg.wait_for_timeout(700)
    o = pg.evaluate(ORB); ok(len(o) == 5 and all(x == ['running', 1] for x in o), f"rotation: 5 orb animations running at rate 1 (mouse off the map): {o}")
    pg.mouse.move(720, 450); pg.wait_for_timeout(600)
    o = pg.evaluate(ORB); ok(len(o) == 5 and all(x[1] == 0 for x in o), f"rotation: rate 0 with the mouse on the map: {o}")
    pg.click(".rz[data-ring='Interfață']"); pg.wait_for_timeout(W)
    ok(pg.locator(".planet:not(.dim)").count() == 2 and pg.locator(".planet.dim").count() == 5, "map: ring name click filters Interfață -> 2 lit, 5 dim")
    pg.click(".rz[data-ring='Interfață']"); pg.wait_for_timeout(W)
    ok(pg.locator(".planet.dim").count() == 0, "map: second click clears the zone filter")
    pg.click(".planet[data-id='TIS-13']"); pg.wait_for_timeout(700)
    ok(pg.is_visible("#panel") and "TIS-13" in pg.inner_text("#panelInner"), "map: planet click opens card with TIS-13")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700)
    ok(not pg.is_visible("#panel"), "map: Escape closes the card")
    # căutare pe hartă: un rezultat => zoom ~1.8x; Escape => camera revine; Enter deschide primul rezultat
    pg.mouse.move(60, 30); pg.keyboard.press("/"); pg.keyboard.type("safari"); pg.wait_for_timeout(1200)
    s = pg.evaluate(CAMS); ok(abs(s - 1.8) < 0.05, f"map: search 'safari' zooms the camera to ~1.8 (scale {s:.2f})")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(1200)
    s = pg.evaluate(CAMS); ok(abs(s - 1) < 0.05, f"map: Escape in search returns the camera (scale {s:.2f})")
    pg.keyboard.type("safari"); pg.wait_for_timeout(400); pg.keyboard.press("Enter"); pg.wait_for_timeout(700)
    ok(pg.is_visible("#panel") and "TIS-12" in pg.inner_text("#panelInner"), "map: Enter in search opens TIS-12")
    pg.keyboard.press("Escape"); pg.keyboard.press("Escape"); pg.wait_for_timeout(1200)
    s = pg.evaluate(CAMS); ok(abs(s - 1) < 0.05 and not pg.is_visible("#panel"), f"map: Escape twice clears search and card (scale {s:.2f})")
    # --- Listă (fluxurile de până acum) ---
    pg.mouse.move(60, 30)
    pg.click("#viewList"); pg.wait_for_function("document.querySelectorAll('.row').length > 0", timeout=2000)   # rândurile apar la ~330 ms (harta se apropie 320 ms)
    n = pg.evaluate("[document.querySelectorAll('.row').length, [...document.querySelectorAll('.row')].filter(r => r.getAnimations().length).length]")
    ok(n[0] == 7 and n[0] == n[1], f"list: every row has an entrance animation as soon as the list renders: {n}")
    pg.wait_for_timeout(V)
    ok(pg.is_visible("#list") and not pg.is_visible("#map") and pg.locator(".row").count() == 7, "map -> list transition: #list visible, #map hidden, 7 rows")
    pg.click("[data-status='active']"); pg.wait_for_timeout(W)
    ok(pg.locator(".row").count() == 6, "Active -> 6 rows")
    pg.click("#zoneSel"); pg.click("#ddList [role=option]:has-text('Interfață')"); pg.wait_for_timeout(W)
    ok(pg.locator(".row").count() == 2, "zone filter Interfață -> 2")
    pg.click("#zoneSel"); pg.click("#ddList [role=option]:has-text('Toate zonele')"); pg.wait_for_timeout(W)
    # --- meniu derulant (#ddList): tastatură, Escape, clic în afară, numerele de prioritate ---
    ACT = "document.getElementById('ddList').getAttribute('aria-activedescendant')"
    ROWS = "[...document.querySelectorAll('.row')].map(r => r.dataset.id).join()"
    rows0 = pg.evaluate(ROWS)
    pg.focus("#sortSel"); pg.keyboard.press("ArrowDown"); pg.wait_for_timeout(200)
    ok(pg.is_visible("#ddList") and pg.get_attribute("#sortSel", "aria-expanded") == "true" and pg.evaluate("document.activeElement.id") == "ddList" and pg.evaluate(ACT) == "ddo-0" and pg.get_attribute("#ddo-0", "aria-selected") == "true",
       "dropdown: ArrowDown on #sortSel opens #ddList, aria-expanded=true, focus on listbox, activedescendant = selected option")
    pg.keyboard.press("ArrowDown"); pg.keyboard.press("Enter"); pg.wait_for_timeout(W)
    rows1 = pg.evaluate(ROWS)
    ok(not pg.is_visible("#ddList") and pg.evaluate("document.activeElement.id") == "sortSel" and pg.get_attribute("#sortSel", "value") == "prio" and rows1.split(",")[0] == "TIS-14" and rows1 != rows0,
       f"dropdown: ArrowDown + Enter picks 'prio', closes, focus back on #sortSel, rows reordered ({rows0} -> {rows1})")
    pg.keyboard.press("ArrowDown"); pg.keyboard.press("ArrowUp"); pg.keyboard.press("Space"); pg.wait_for_timeout(W)
    ok(not pg.is_visible("#ddList") and pg.get_attribute("#sortSel", "value") == "new" and pg.evaluate(ROWS) == rows0, "dropdown: ArrowUp + Space back to 'new' (Space does not reopen the menu), row order restored")
    pg.click(".row[data-id='TIS-13']"); pg.wait_for_timeout(700)
    pg.focus("#sortSel"); pg.keyboard.press("ArrowDown"); pg.wait_for_timeout(200); pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    ok(not pg.is_visible("#ddList") and pg.evaluate("document.activeElement.id") == "sortSel" and pg.get_attribute("#sortSel", "value") == "new" and pg.get_attribute("#sortSel", "aria-expanded") == "false" and pg.is_visible("#panel") and "TIS-13" in pg.inner_text("#panelInner"),
       "dropdown: Escape closes only the menu, focus on button, value unchanged, card stays open")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700)
    pg.focus("#sortSel"); pg.keyboard.press("ArrowDown"); pg.wait_for_timeout(200)
    pg.keyboard.press("End"); a1 = pg.evaluate(ACT); pg.keyboard.press("Home"); a2 = pg.evaluate(ACT); pg.keyboard.press("m"); a3 = pg.evaluate(ACT)
    ok((a1, a2, a3) == ("ddo-2", "ddo-0", "ddo-2") and "Modificate" in pg.inner_text("#ddo-2"), f"dropdown: End/Home move the active option, 'm' jumps to 'Modificate recent' ({a1}, {a2}, {a3})")
    pg.keyboard.press("Escape")
    pg.click("#sortSel"); pg.wait_for_timeout(200); pg.click(".brand"); pg.wait_for_timeout(200)
    ok(not pg.is_visible("#ddList") and pg.get_attribute("#sortSel", "aria-expanded") == "false", "dropdown: click outside closes the menu")
    def crit(label, status):
        pg.click(f"[data-status='{status}']"); pg.wait_for_timeout(W)
        pg.click("#prioFilter"); n = pg.inner_text(f"#ddList [role=option]:has-text('{label}') .n"); pg.keyboard.press("Escape"); return int(n)
    # mock: 1 critică (TIS-14, deschis); 3 medii în total (TIS-12, 9, 8), 2 nerezolvate
    c_all, m_all, c_act, m_act = crit("Critică", "all"), crit("Medie", "all"), crit("Critică", "active"), crit("Medie", "active")
    ok((c_all, m_all, c_act, m_act) == (1, 3, 1, 2), f"dropdown: priority numbers follow the status filter: Toate Critică/Medie {c_all}/{m_all} (expected 1/3), Active {c_act}/{m_act} (expected 1/2)")
    pg.keyboard.press("/"); pg.keyboard.type("safari"); pg.wait_for_timeout(100)
    ok(pg.locator(".row").count() == 1, "search safari -> 1")
    pg.keyboard.press("Escape"); pg.keyboard.press("Escape")
    pg.locator(".brand").click()
    pg.keyboard.press("j"); pg.wait_for_timeout(W)
    ok(pg.locator(".row[aria-current='true']").count() == 1, "j selects a row")
    pg.keyboard.press("n"); pg.wait_for_timeout(W)
    ok(pg.locator("#newForm").count() == 1, "n opens form")
    pg.click("#nf-submit"); pg.wait_for_timeout(100)
    ok(pg.locator("#nf-reporter-err").count() == 1, "validation error on empty name")
    pg.fill("#nf-reporter", "Test User"); pg.fill("#nf-title", "Exportul CSV nu are diacritice")
    pg.click("[data-zone-pick='Raportare']"); pg.click("[data-prio-pick='ridicata']")
    pg.fill("#nf-desc", "pasi")
    pg.click("#nf-submit"); pg.wait_for_timeout(1500)
    ok("TIS-15" in pg.inner_text("#panelInner"), "created TIS-15")
    ok(pg.locator(".row[data-id='TIS-15']").count() == 1, "TIS-15 in list")
    pg.click("[data-open='TIS-15']"); pg.wait_for_timeout(W)
    pg.fill("#cm-text", "Adaug un detaliu"); pg.click(".composer button[type=submit]"); pg.wait_for_timeout(800)
    ok("Adaug un detaliu" in pg.inner_text("#panelInner"), "comment added")
    # --- Admin, din iconița lacăt ---
    ok(pg.get_attribute("#adminBtn", "aria-label") == "Admin" and pg.inner_text("#adminBtn").strip() == "", "admin button is a lock icon only")
    pg.click("#adminBtn"); pg.fill("#pinInput", "0000"); pg.click("#pinSubmit"); pg.wait_for_timeout(600)
    ok(pg.is_visible("#pinErr"), "wrong pin shows error")
    pg.fill("#pinInput", "1234"); pg.click("#pinSubmit"); pg.wait_for_timeout(600)
    ok(pg.is_visible(".tab[data-page='jurnal']"), "admin login -> jurnal tab")
    pg.click(".row[data-id='TIS-12']"); pg.wait_for_timeout(W)
    pg.click("[data-set-status='in_lucru']"); pg.wait_for_timeout(600)
    ok("În lucru" in pg.inner_text(".row[data-id='TIS-12']"), "status change applied")
    pg.click("#ad-zone"); pg.click("#ddList [role=option]:has-text('Date')"); pg.wait_for_timeout(600)
    ok(pg.locator(".row[data-id='TIS-12'] .r-zone[data-z='date']").count() == 1 and pg.evaluate("document.activeElement.id") == "ad-zone", "zone change applied, focus stays on #ad-zone")
    pg.click("[data-act='edit']"); pg.fill("#ed-title", "Butonul Export nu merge pe Safari 17"); pg.click("form.edit button[type=submit]"); pg.wait_for_timeout(600)
    ok("Safari 17" in pg.inner_text(".row[data-id='TIS-12']"), "edit title applied")
    pg.click("[data-act='archive-ask']"); pg.click("[data-act='archive']"); pg.wait_for_timeout(700)
    ok(pg.locator(".row[data-id='TIS-12']").count() == 0, "archived removed from list")
    pg.click("[data-status='archive']"); pg.wait_for_timeout(900)
    ok(pg.locator(".row[data-id='TIS-12']").count() == 1, "archive shows TIS-12")
    pg.click(".row[data-id='TIS-12']"); pg.wait_for_timeout(W); pg.click("[data-act='restore']"); pg.wait_for_timeout(900)
    pg.click("[data-status='active']"); pg.wait_for_timeout(W)
    ok(pg.locator(".row[data-id='TIS-12']").count() == 1, "restored back to active")
    pg.click(".tab[data-page='news']"); pg.wait_for_timeout(900)
    ok(pg.is_visible("#page-news") and not pg.is_visible("#page-tichete") and pg.locator(".page.leaving").count() == 0, "page transition: #page-news visible, #page-tichete hidden, no .page.leaving")
    pg.click("#newsNewBtn"); pg.wait_for_timeout(200); pg.fill("#nw-title", "Test anunt"); pg.fill("#nw-body", "Corp"); pg.click("[data-ntype='fix']"); pg.click("#nw-submit"); pg.wait_for_timeout(800)
    ok(pg.locator(".news-item").count() == 3, "news published")
    pg.click(".tab[data-page='jurnal']"); pg.wait_for_timeout(900)
    ok("status: În lucru" in pg.inner_text("#journal"), "journal humanized")
    pg.click("#adminBtn"); pg.wait_for_timeout(200)
    ok("Admin Test" in pg.inner_text("#adminPop"), "admin popover shows the admin name")
    pg.click("#logoutBtn"); pg.wait_for_timeout(300)
    ok(not pg.is_visible(".tab[data-page='jurnal']"), "logout hides jurnal")
    pg.wait_for_timeout(900)
    pg.click("#viewMap"); pg.wait_for_timeout(V)
    ok(pg.is_visible("#map") and pg.locator(".planet").count() > 0, "list -> map transition: #map visible, planets present")
    # --- cache local: o pagină nouă din același context arată planete înainte să răspundă serverul (mock: 300 ms) ---
    ok(pg.evaluate("!!localStorage.getItem('tis_cache_t') && !!localStorage.getItem('tis_cache_n')"), "cache: tis_cache_t and tis_cache_n written after load")
    pc = ctx.new_page(); pc.add_init_script(INIT); pc.goto("http://localhost:8080/", wait_until="commit"); pc.wait_for_timeout(1500)
    tc = pc.evaluate("window.__tp"); pc.close()
    pf = b.new_context(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True).new_page(); pf.add_init_script(INIT); pf.goto("http://localhost:8080/", wait_until="commit"); pf.wait_for_timeout(1500)
    tf = pf.evaluate("window.__tp")
    ok(tc is not None and tf is not None and tc < tf - 150, f"cache: planets appear from cache at {tc:.0f} ms, without cache at {tf:.0f} ms (server latency 300 ms)")
    # --- mobil 390x844, pe hartă ---
    pm = b.new_page(viewport={'width': 390, 'height': 844}, ignore_https_errors=True)
    pm.on("pageerror", lambda e: errs.append(str(e)))
    pm.goto("http://localhost:8080/"); pm.wait_for_timeout(1200)
    if pm.get_attribute("#viewMap", "aria-pressed") != "true": pm.click("#viewMap"); pm.wait_for_timeout(V)
    pm.wait_for_timeout(1300)
    r = pm.evaluate(COLL); ok(r['n'] == 7 and not r['bad'], f"labels 390: {r['n']} boxes, collisions: {r['bad'] or 'none'}")
    bad = pm.evaluate(RZ); ok(not bad, f"ring names 390: no overlapping boxes {bad or ''}")
    pm.click("#prioFilter"); pm.wait_for_timeout(300)
    r = pm.evaluate("""()=>{const b=document.getElementById('ddList').getBoundingClientRect();return {l:b.left,r:b.right,b:b.bottom,sw:document.documentElement.scrollWidth,iw:innerWidth,h:Math.min(...[...document.querySelectorAll('#ddList [role=option]')].map(o=>o.getBoundingClientRect().height))}}""")
    ok(r['l'] >= 0 and r['r'] <= 390 and r['b'] <= 844 and r['sw'] <= r['iw'] and r['h'] >= 32, f"dropdown 390: #ddList inside the viewport, no horizontal scroll, options >= 32px tall: {r}")
    pm.keyboard.press("Escape")
    b.close()
print("page errors:", errs or "none")
