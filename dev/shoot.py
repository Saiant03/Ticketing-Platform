"""Screenshot-uri ale UI-ului servit de dev/preview.py.

    python3 dev/shoot.py <folder-iesire> [url]

Captează pe desktop (1440x900) și mobil (390x844), doar dark:
hartă, hartă cu card, listă, detaliu tichet, formular tichet nou, admin, meniurile derulante deschise, News, Jurnal.
Erorile din consolă se scriu în <folder>/console-errors.txt.
"""
import re, sys, pathlib
from browser import launch
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
    settle(page, 1600)


def run(browser, vname, size, scheme, errors):
    w, h = size
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1,
                              ignore_https_errors=True, color_scheme=scheme)
    page = ctx.new_page()
    tag = f"{vname}-{scheme}"
    page.on("console", lambda m: m.type == "error" and not re.search("favicon|fonts\\.g", m.location.get("url", "")) and errors.append(f"[{tag}] {m.text}"))
    page.on("pageerror", lambda e: errors.append(f"[{tag}] {e}"))
    shot = lambda name: page.screenshot(path=OUT / f"{vname}-{scheme}-{name}.png")
    mobile = vname == "mobil"

    def menu(sel, name):
        page.click(sel)
        settle(page, 300)
        shot(name)
        page.keyboard.press("Escape")

    page.goto(URL)
    settle(page, 2600)
    # vederea implicită: hartă pe desktop, listă pe mobil
    shot("lista" if mobile else "harta")
    menu("#prioFilter", "meniu-prioritate")
    page.click("#viewMap" if mobile else "#viewList")
    settle(page, 1000)   # tranziția prin nucleu durează ~0,75 s
    shot("harta" if mobile else "lista")

    page.click("#viewMap")
    settle(page, 1000)
    page.mouse.move(w / 2, 450)   # mouse pe hartă: rotația se oprește, ținta nu mai e în mișcare
    settle(page, 450)
    page.click(".planet[data-id='TIS-13']")
    settle(page, 1300)
    shot("harta-detaliu")
    page.keyboard.press("Escape")
    settle(page, 700)

    page.click("#viewList")
    settle(page, 1000)
    menu("#zoneSel", "meniu-zona")
    page.click(".row[data-id='TIS-13']")
    settle(page, 900)
    shot("detaliu")
    page.keyboard.press("Escape")
    settle(page, 700)
    page.click("#newBtn")
    settle(page, 900)
    page.fill("#nf-title", "Importul nu completează data")
    settle(page, 300)
    shot("tichet-nou")
    page.click("#nf-submit")
    settle(page, 300)
    shot("tichet-nou-erori")
    page.keyboard.press("Escape")
    settle(page, 700)

    as_admin(page)
    page.click("#adminBtn")
    settle(page, 400)
    shot("admin-popover")
    page.keyboard.press("Escape")
    page.click(".row[data-id='TIS-14']")
    settle(page, 900)
    shot("admin-detaliu")
    menu("#ad-zone", "admin-meniu-zona")
    page.keyboard.press("Escape")
    settle(page, 700)
    page.click(".tab[data-page='news']")
    settle(page, 1200)
    page.screenshot(path=OUT / f"{vname}-{scheme}-news.png", full_page=True)
    page.click(".tab[data-page='jurnal']")
    settle(page, 1200)
    shot("jurnal")
    ctx.close()


with sync_playwright() as p:
    browser = launch(p)
    errors = []
    for vname, size in VIEWPORTS.items():
        for scheme in ("dark",):
            run(browser, vname, size, scheme, errors)
    browser.close()
    (OUT / "console-errors.txt").write_text("\n".join(errors) or "(niciuna)\n", encoding="utf-8")
    print("\n".join(errors) or "fara erori in consola")
