"""Lansează Chromium pentru scripturile din dev/: întâi $CHROMIUM_PATH, apoi căile cunoscute, apoi Chromium-ul implicit Playwright."""
import os

CANDIDATES = ("/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")


def launch(p):
    for exe in (os.environ.get("CHROMIUM_PATH"),) + CANDIDATES:
        if exe and os.path.isfile(exe):
            return p.chromium.launch(executable_path=exe)
    return p.chromium.launch()
