"""Măsoară costul fundalului: ms de task-uri pe secundă (TaskDuration), pe harta Orbită, fără interacțiune.
Țintă: < 15 ms/s cât animația rulează, < 5 ms/s după ce se oprește (60 s fără activitate).
Rulare: python3 dev/perf.py (cu dev/preview.py pornit; durează ~100 s)."""
from browser import launch
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = launch(p)
    pg = b.new_page(viewport={'width': 1440, 'height': 900}, ignore_https_errors=True)
    cdp = pg.context.new_cdp_session(pg); cdp.send("Performance.enable")
    pg.goto("http://localhost:8080/"); pg.wait_for_timeout(4000)  # încărcare + așezarea planetelor
    pg.mouse.move(700, 40)  # activitate, în afara hărții (rotirea nu se oprește)
    def task():
        return {m['name']: m['value'] for m in cdp.send("Performance.getMetrics")['metrics']}['TaskDuration']
    pg.wait_for_timeout(1000)
    t0 = task(); pg.wait_for_timeout(15000); anim = (task() - t0) / 15 * 1000  # 15 s, ca să intre și o stea căzătoare
    print(f"animație pornită: {anim:.1f} ms/s | țintă < 15 ms/s")
    pg.wait_for_timeout(62000)  # 60 s fără mișcare / tastatură: bucla se oprește
    t0 = task(); pg.wait_for_timeout(10000); rest = (task() - t0) / 10 * 1000
    print(f"repaus după 60 s fără activitate: {rest:.1f} ms/s | țintă < 5 ms/s")
    pg.mouse.move(720, 300); pg.wait_for_timeout(3000)  # activitate: bucla reia, rotirea rămâne oprită cât mouse-ul e pe hartă
    t0 = task(); pg.wait_for_timeout(5000); print(f"după reluare (mouse pe hartă, rotirea oprită, stele active): {(task() - t0) / 5 * 1000:.1f} ms/s")
    b.close()
