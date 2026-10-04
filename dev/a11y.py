"""Verificari a11y: contrastul tokenilor din src/Tokens.html (hol light/dark + panoul mereu dark), campuri fara eticheta, tinte sub 32px, scroll orizontal. Rulare: python3 dev/a11y.py"""
import os
import re
from playwright.sync_api import sync_playwright
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]; return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
css=open('src/Tokens.html').read()
light=dict(re.findall(r'--([\w-]+):\s*(#[0-9A-Fa-f]{6})', css.split('@media')[0]))
dark={**light, **dict(re.findall(r'--([\w-]+):\s*(#[0-9A-Fa-f]{6})', css.split('@media')[1]))}
# (text, fundal, prag); 3.0 = text mare sau element non-text
hall=[('ink','bg',4.5),('ink','surface',4.5),('ink-2','bg',4.5),('ink-2','surface',4.5),('ink-3','bg',4.5),('ink-3','surface',4.5),('ink-3','surface-2',4.5),
      ('bg','ink',4.5),('danger','bg',4.5),('danger','surface',4.5),('danger','danger-soft',4.5),('ok','bg',4.5),('focus','bg',3.0),('line-strong','bg',3.0)]
board=[('b-ink','b-case',4.5),('b-ink','b-plate',4.5),('b-ink','b-sel',4.5),('b-ink','b-field',4.5),('b-ink-2','b-case',4.5),('b-ink-2','b-plate',4.5),
       ('b-ink-2','b-sel',4.5),('b-ink-2','b-field',4.5),('b-ph','b-field',4.5),('st-open','b-plate',4.5),('st-work','b-plate',4.5),('st-done','b-plate',4.5),
       ('st-crit','b-plate',4.5),('st-crit','b-case',4.5),('sig','b-case',3.0),('on-sig','sig',4.5),('on-sig','st-crit',4.5),('sig','on-sig',4.5),('b-field-line','b-case',3.0)]
for name,t in (('light',light),('dark',dark)):
    bad=[f"{a}/{b}={cr(t[a],t[b]):.2f}" for a,b,m in hall+board if cr(t[a],t[b])<m]
    print(name, "below threshold:", bad or "none")
print("board min text contrast:", min(round(cr(light[a],light[b]),2) for a,b,m in board if m==4.5))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    for w in (1440,1280,900,390):
        pg=b.new_page(viewport={'width':w,'height':900}, ignore_https_errors=True)
        pg.goto("http://localhost:8080/"); pg.wait_for_timeout(900)
        pg.evaluate("sessionStorage.setItem('tis_pin','1234');sessionStorage.setItem('tis_admin','Admin Test')"); pg.reload(); pg.wait_for_timeout(1500)
        pg.click(".row[data-id='TIS-14']"); pg.wait_for_timeout(600)
        r=pg.evaluate("""()=>{
          const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
          const unl=[...document.querySelectorAll('input:not([type=file]):not([type=hidden]),textarea,select')].filter(vis).filter(e=>!e.labels.length&&!e.getAttribute('aria-label')).map(e=>e.id);
          const small=[...document.querySelectorAll('button,a,select,input')].filter(vis).filter(e=>{const r=e.getBoundingClientRect();return r.height<32}).map(e=>(e.className||e.id||e.tagName)+':'+Math.round(e.getBoundingClientRect().height));
          const over=[...document.querySelectorAll('body *')].filter(vis).filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.zchips,.seg,.jt-wrap,.sr,.list,.ambient,.sheen')).map(e=>e.className||e.tagName).slice(0,6);
          return {unlabeled:unl, under32:small.slice(0,12), hscroll:document.documentElement.scrollWidth>innerWidth, overflow:over}
        }""")
        print(w, r)
    b.close()
