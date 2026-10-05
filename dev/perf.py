"""Masoara costul in repaus: ms de task-uri pe secunda, dupa incarcare, fara interactiune (tinta < 5). Rulare: python3 dev/perf.py (cu dev/preview.py pornit)."""
import os
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    pg=b.new_page(viewport={'width':1440,'height':900}, ignore_https_errors=True)
    cdp=pg.context.new_cdp_session(pg); cdp.send("Performance.enable")
    pg.goto("http://localhost:8080/"); pg.wait_for_timeout(4000)  # incarcare + animatia de intrare
    def task():
        return {m['name']:m['value'] for m in cdp.send("Performance.getMetrics")['metrics']}['TaskDuration']
    t0=task(); pg.wait_for_timeout(5000); rest=(task()-t0)/5*1000
    print(f"repaus dupa incarcare: {rest:.1f} ms/s | tinta < 5 ms/s")
    b.close()
