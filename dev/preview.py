"""Servește src/*.html local cu google.script.run simulat (dev/mock-gas.js).

    python3 dev/preview.py            -> http://localhost:8080/  (Index)
    python3 dev/preview.py 9000       -> alt port

Scriptlet-urile <?!= include('X') ?> sunt înlocuite cu conținutul src/X.html.
"""
import http.server, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, MOCK = ROOT / "src", ROOT / "dev" / "mock-gas.js"
INCLUDE = re.compile(r"<\?!=\s*include\(\s*['\"]([\w\-/]+)['\"]\s*\)\s*;?\s*\?>")


def render(name):
    html = (SRC / f"{name}.html").read_text(encoding="utf-8")
    for _ in range(5):
        html = INCLUDE.sub(lambda m: (SRC / f"{m.group(1)}.html").read_text(encoding="utf-8"), html)
    mock = f"<script>{MOCK.read_text(encoding='utf-8')}</script>"
    return html.replace("<head>", "<head>\n" + mock, 1)


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        name = self.path.strip("/").split("?")[0] or "Index"
        if not (SRC / f"{name}.html").exists():
            self.send_error(404)
            return
        body = render(name).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"http://localhost:{port}/")
    http.server.ThreadingHTTPServer(("", port), Handler).serve_forever()
