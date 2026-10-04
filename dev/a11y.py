"""Verificari a11y: contrastul tokenilor din src/Tokens.html, campuri fara eticheta, tinte sub 32px, scroll orizontal. Rulare: python3 dev/a11y.py"""
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
pairs=[('ink','surface'),('ink-2','surface'),('ink-3','surface'),('ink-3','bg'),('ink-3','surface-2'),('on-primary','primary'),('danger','surface'),('danger','danger-soft'),('ok','surface'),('ink','sel')]
for z in ['import','interfata','date','raportare','general','altul']: pairs.append((f'z-{z}-on',f'z-{z}'))
for name,t in (('light',light),('dark',dark)):
    bad=[f"{a}/{b}={cr(t[a],t[b]):.2f}" for a,b in pairs if cr(t[a],t[b])<(3 if a.startswith('z-') else 4.5)]
    print(name, "below threshold:", bad or "none")
    print(name, "zone glyph min:", min(round(cr(t[a],t[b]),2) for a,b in pairs if a.startswith('z-')))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    for w in (1440,390):
        pg=b.new_page(viewport={'width':w,'height':900}, ignore_https_errors=True)
        pg.goto("http://localhost:8080/"); pg.wait_for_timeout(900)
        pg.evaluate("sessionStorage.setItem('tis_pin','1234');sessionStorage.setItem('tis_admin','Admin Test')"); pg.reload(); pg.wait_for_timeout(900)
        pg.click(".row[data-id='TIS-14']"); pg.wait_for_timeout(300)
        r=pg.evaluate("""()=>{
          const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
          const unl=[...document.querySelectorAll('input:not([type=file]):not([type=hidden]),textarea,select')].filter(vis).filter(e=>!e.labels.length&&!e.getAttribute('aria-label')).map(e=>e.id);
          const small=[...document.querySelectorAll('button,a,select,input')].filter(vis).filter(e=>{const r=e.getBoundingClientRect();return r.height<32}).map(e=>(e.className||e.id||e.tagName)+':'+Math.round(e.getBoundingClientRect().height));
          return {unlabeled:unl, under32:small.slice(0,12), hscroll:document.documentElement.scrollWidth>innerWidth}
        }""")
        print(w, r)
    b.close()
