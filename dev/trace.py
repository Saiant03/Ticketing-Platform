"""Defalcarea costului pe firul principal, cu CPU încetinit 4x. Rulare: python3 dev/trace.py (preview pe :8080)."""
import sys, json, collections
sys.path.insert(0, __import__('os').path.dirname(__file__))
from browser import launch
from playwright.sync_api import sync_playwright

NAMES = ('Paint', 'PaintImage', 'RasterTask', 'Layout', 'UpdateLayoutTree', 'PrePaint', 'Layerize', 'UpdateLayer',
         'FunctionCall', 'EvaluateScript', 'FireAnimationFrame', 'TimerFire', 'HitTest', 'Commit', 'CompositeLayers',
         'ParseHTML', 'RunTask', 'ScheduleStyleRecalculation')

def run(pg, cdp, label, action, ms):
    cdp.send('Tracing.start', {'categories': 'devtools.timeline,disabled-by-default-devtools.timeline', 'transferMode': 'ReturnAsStream'})
    action(); pg.wait_for_timeout(ms)
    done = {}
    cdp.on('Tracing.tracingComplete', lambda e: done.update(e))
    cdp.send('Tracing.end')
    while 'stream' not in done: pg.wait_for_timeout(50)
    buf = ''
    while True:
        r = cdp.send('IO.read', {'handle': done['stream']}); buf += r['data']
        if r.get('eof'): break
    ev = json.loads(buf); ev = ev['traceEvents'] if isinstance(ev, dict) else ev
    main = {(e['pid'], e['tid']) for e in ev if e.get('name') == 'thread_name' and e.get('args', {}).get('name') == 'CrRendererMain'}
    tot = collections.Counter(); cnt = collections.Counter(); runs = []
    for e in ev:
        if e.get('ph') == 'X' and (e['pid'], e['tid']) in main and e.get('name') in NAMES:
            d = e.get('dur', 0) / 1000; tot[e['name']] += d; cnt[e['name']] += 1
            if e['name'] == 'RunTask': runs.append(d)
    runs.sort(reverse=True)
    print(f'--- {label} ({ms} ms): main-thread RunTask total {tot["RunTask"]:.0f} ms = {tot["RunTask"] / ms * 100:.0f}% busy; longest tasks {[round(x) for x in runs[:5]]}')
    for n, v in tot.most_common():
        if n != 'RunTask': print(f'   {n:28s} {v:8.1f} ms  x{cnt[n]}')

with sync_playwright() as p:
    b = launch(p)
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    cdp = pg.context.new_cdp_session(pg)
    pg.goto('http://localhost:8080/'); pg.wait_for_timeout(3000)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    pg.mouse.move(700, 40); pg.wait_for_timeout(3000)
    run(pg, cdp, 'S1 rotation, no input', lambda: None, 5000)
    run(pg, cdp, 'S2 map->list', lambda: pg.click('#viewList'), 2000)
    run(pg, cdp, 'S3 list->map', lambda: pg.click('#viewMap'), 2000)
    run(pg, cdp, 'S4 tichete->news', lambda: pg.click(".tab[data-page='news']"), 2000)
    run(pg, cdp, 'S5 news->tichete', lambda: pg.click(".tab[data-page='tichete']"), 2000)
    run(pg, cdp, 'S6 mouse parallax', lambda: [pg.mouse.move(200 + i * 40, 300 + (i % 5) * 30) for i in range(25)], 2000)
    b.close()
