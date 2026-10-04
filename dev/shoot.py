"""Screenshot-uri ale UI-ului servit de dev/preview.py.

    python3 dev/shoot.py <folder-iesire> [url]

Captează: public desktop/mobil, admin desktop/mobil, comentarii deschise, News, popover PIN.
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "screenshots")
URL = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8080/"
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = {"desktop": (1280, 860), "mobil": (375, 812)}


def settle(page):
    page.wait_for_timeout(900)


def login(page):
    page.evaluate("sessionStorage.setItem('tis_pin','1234');sessionStorage.setItem('tis_admin','Admin Test')")
    page.reload()
    settle(page)


with sync_playwright() as p:
    exe = os.environ.get("CHROMIUM_PATH") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
    browser = p.chromium.launch(executable_path=exe)
    errors = []
    for vname, (w, h) in VIEWPORTS.items():
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, ignore_https_errors=True)
        page = ctx.new_page()
        page.on("console", lambda m: m.type == "error" and "favicon" not in m.location.get("url", "") and errors.append(f"[{vname}] {m.text}"))
        page.on("pageerror", lambda e: errors.append(f"[{vname}] {e}"))
        page.goto(URL)
        settle(page)
        page.screenshot(path=OUT / f"{vname}-public.png")
        page.screenshot(path=OUT / f"{vname}-public-full.png", full_page=True)
        if vname == "desktop":
            page.click("#fab")
            page.wait_for_timeout(300)
            page.screenshot(path=OUT / f"{vname}-pin.png")
        login(page)
        page.screenshot(path=OUT / f"{vname}-admin.png")
        page.screenshot(path=OUT / f"{vname}-admin-full.png", full_page=True)
        page.click("[data-comments='TIS-13']")
        page.wait_for_timeout(300)
        page.locator("article[data-id='TIS-13']").screenshot(path=OUT / f"{vname}-comentarii.png")
        page.click(".nav-item[data-page='news']")
        settle(page)
        page.screenshot(path=OUT / f"{vname}-news-full.png", full_page=True)
        ctx.close()
    browser.close()
    (OUT / "console-errors.txt").write_text("\n".join(errors) or "(niciuna)\n", encoding="utf-8")
    print("\n".join(errors) or "fara erori in consola")
