"""Verificări a11y: contrastul tokenilor din src/Tokens.html pe fundalurile reale ale UI-ului „Orbită” (stele, sticlă, nebuloasă),
câmpuri fără etichetă, ținte sub 32px, scroll orizontal. Rulare: python3 dev/a11y.py (cu dev/preview.py pornit)."""
import re
from browser import launch
from playwright.sync_api import sync_playwright

def parse(v):
    v = v.strip()
    if v.startswith('#'):
        return tuple(int(v[i:i+2], 16) for i in (1, 3, 5)) + (1.0,)
    m = re.match(r'rgba?\(([^)]+)\)', v)
    p = [float(x) for x in m.group(1).split(',')]
    return (p[0], p[1], p[2], p[3] if len(p) > 3 else 1.0)
def over(fg, bg):  # fg (cu alfa) peste bg opac
    a = fg[3]; return tuple(fg[i] * a + bg[i] * (1 - a) for i in range(3)) + (1.0,)
def lum(c):
    ch = [x / 255 for x in c[:3]]
    ch = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
def cr(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True); return (la + 0.05) / (lb + 0.05)

css = open('src/Tokens.html').read()
T = {k: parse(v) for k, v in re.findall(r'--([\w-]+):\s*(#[0-9A-Fa-f]{6}|rgba?\([^)]*\))', css)}
space = T['space-0']
lit = over((*T['nebula'][:3], .40), space)                  # centrul strălucirii nebuloasei
bgs = {
    'space-0': space, 'nebula-lit': lit,
    'glass': over(T['glass'], space), 'glass-2': over(T['glass-2'], space), 'glass/lit': over(T['glass'], lit),
    'glass-dark': over(T['glass-dark'], lit), 'pill-activ': over((*T['acc'][:3], .28), space),
}
checks = []  # (fg, bg, prag, nume)
for fg in ('ink', 'ink-2', 'ink-3'):
    for name, bg in bgs.items(): checks.append((over(T[fg], bg), bg, 4.5, f'{fg} pe {name}'))
checks += [(T['on-acc'], T['acc'], 4.5, 'on-acc pe acc'), (T['on-acc'], T['acc-h'], 4.5, 'on-acc pe acc-h'), (T['on-acc'], T['danger'], 4.5, 'on-acc pe danger'),
           (T['acc-h'], bgs['space-0'], 4.5, 'acc-h (linkuri, cod) pe space-0'), (T['acc-h'], bgs['glass'], 4.5, 'acc-h pe glass'),
           (T['danger'], bgs['space-0'], 4.5, 'danger pe space-0'), (T['danger'], over(T['danger-soft'], bgs['glass']), 4.5, 'danger pe danger-soft'),
           (T['ok'], bgs['space-0'], 3.0, 'ok pe space-0 (punct)'),
           # non-text, 3:1
           (T['focus'], space, 3.0, 'focus pe space-0'), (T['acc'], space, 3.0, 'acc pe space-0'), (T['st-crit'], space, 3.0, 'st-crit pe space-0'),
           (over(T['st-done'], space), space, 3.0, 'st-done (contur planetă) pe space-0'), (T['st-open'], space, 3.0, 'st-open pe space-0'),
           (over(T['ink-3'], bgs['glass']), bgs['glass'], 3.0, 'contur câmp (ink-3) pe glass')]
bad = [f'{n}={cr(f, b):.2f} (<{m})' for f, b, m, n in checks if cr(f, b) < m]
print("contrast below threshold:", bad or "none")
print("min text contrast (ink/ink-2/ink-3 pe toate fundalurile):", min(round(cr(f, b), 2) for f, b, m, n in checks if m == 4.5))

JS = """()=>{
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
  const unl=[...document.querySelectorAll('input:not([type=file]):not([type=hidden]),textarea,select,.dd')].filter(vis).filter(e=>!e.labels.length&&!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')).map(e=>e.id);
  const small=[...document.querySelectorAll('button,a,select,input')].filter(vis).filter(e=>{const r=e.getBoundingClientRect();return r.height<32}).map(e=>(e.className||e.id||e.tagName)+':'+Math.round(e.getBoundingClientRect().height));
  const over=[...document.querySelectorAll('body *')].filter(vis).filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.seg,.jt-wrap,.sr,.list,#stars,#nebula,.skip')).map(e=>(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)||e.tagName).slice(0,6);
  const unnamed=[...document.querySelectorAll('button,[role=button]')].filter(vis).filter(e=>!(e.textContent.trim()||e.getAttribute('aria-label')||e.title)).map(e=>e.id||e.className);
  return {unlabeled:unl, unnamed, under32:small.slice(0,12), hscroll:document.documentElement.scrollWidth>innerWidth, overflow:over}
}"""
with sync_playwright() as p:
    b = launch(p)
    for w in (1440, 1280, 900, 390):
        pg = b.new_page(viewport={'width': w, 'height': 900}, ignore_https_errors=True)
        pg.goto("http://localhost:8080/"); pg.wait_for_timeout(900)
        pg.evaluate("sessionStorage.setItem('tis_pin','1234');sessionStorage.setItem('tis_admin','Admin Test')"); pg.reload(); pg.wait_for_timeout(1500)
        for view in ('viewMap', 'viewList'):
            pg.click('#' + view); pg.wait_for_timeout(1000)   # tranziția Hartă/Listă ~0,75 s
            r0 = pg.evaluate(JS)
            if view == 'viewMap': pg.mouse.move(w / 2, 450); pg.wait_for_timeout(450); pg.click(".planet[data-id='TIS-14']")   # mouse pe hartă: rotația se oprește, ținta nu mai e în mișcare
            else: pg.click(".row[data-id='TIS-14']")
            pg.wait_for_timeout(900)
            r = pg.evaluate(JS)
            print(w, view, 'fără card:', r0, '| cu card:', r)
            pg.keyboard.press('Escape'); pg.wait_for_timeout(700)
        pg.click('#newBtn'); pg.wait_for_timeout(700); print(w, 'formular nou:', pg.evaluate(JS)); pg.keyboard.press('Escape')
        for tab in ('news', 'jurnal'):
            pg.click(f".tab[data-page='{tab}']"); pg.wait_for_timeout(1000); print(w, tab, pg.evaluate(JS))
        pg.close()
    b.close()
