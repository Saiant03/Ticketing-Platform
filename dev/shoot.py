"""Screenshot-uri ale UI-ului servit de dev/preview.py.

    python3 dev/shoot.py <folder-iesire> [url]

Captează pe desktop (1440x900) și mobil (390x844), light și dark:
listă, detaliu tichet, formular tichet nou, admin, News, Jurnal.
Erorile din consolă se scriu în <folder>/console-errors.txt.
"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "screenshots")
URL = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8080/"
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = {"desktop": (1440, 900), "mobil": (390, 844)}


def settle(page, ms=900):
    page.wait_for_timeout(ms)


def as_admin(page):
    page.evaluate("sessionStorage.setItem('tis_pin','1234');sessionStorage.setItem('tis_admin','Admin Test')")
    page.reload()
    settle(page)


def run(browser, vname, size, scheme, errors):
    w, h = size
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                              ignore_https_errors=True, color_scheme=scheme)
    page = ctx.new_page()
    tag = f"{vname}-{scheme}"
    page.on("console", lambda m: m.type == "error" and "favicon" not in m.location.get("url", "") and errors.append(f"[{tag}] {m.text}"))
    page.on("pageerror", lambda e: errors.append(f"[{tag}] {e}"))
    shot = lambda name: page.screenshot(path=OUT / f"{vname}-{scheme}-{name}.png")

    page.goto(URL)
    settle(page, 2600)  # intrarea: plăcuțele se așază în ~1.5s
    shot("lista")
    page.click(".row[data-id='TIS-13']")
    settle(page)
    shot("detaliu")
    if vname == "mobil":
        page.click(".p-back")
        settle(page)
    page.click("#newBtn")
    settle(page)
    page.fill("#nf-title", "Importul nu completează data")
    settle(page, 300)
    shot("tichet-nou")
    if scheme == "light":
        page.click("#nf-submit")
        settle(page, 300)
        shot("tichet-nou-erori")
    page.keyboard.press("Escape")

    as_admin(page)
    page.click(".row[data-id='TIS-14']")
    settle(page)
    shot("admin-detaliu")
    if scheme == "light":
        page.click(".tab[data-page='news']")
        settle(page, 1200)
        page.screenshot(path=OUT / f"{vname}-{scheme}-news.png", full_page=True)
        page.click(".tab[data-page='jurnal']")
        settle(page, 1200)
        shot("jurnal")
    ctx.close()


with sync_playwright() as p:
    exe = os.environ.get("CHROMIUM_PATH") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
    browser = p.chromium.launch(executable_path=exe)
    errors = []
    for vname, size in VIEWPORTS.items():
        for scheme in ("light", "dark"):
            run(browser, vname, size, scheme, errors)
    browser.close()
    (OUT / "console-errors.txt").write_text("\n".join(errors) or "(niciuna)\n", encoding="utf-8")
    print("\n".join(errors) or "fara erori in consola")
