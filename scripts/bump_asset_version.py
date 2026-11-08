#!/usr/bin/env python3
"""Cache-busting for the static site (stdlib only).

Computes an 8-hex version from the contents of docs/src (with every ?v=<8-hex>
removed, CRLF normalised to LF, files sorted by relative path) and writes it as
?v=<hash> onto:
  * local .css/.js links and script tags in docs/index.html and docs/it/**/index.html
  * every relative or root-absolute import / export-from / dynamic import() of a
    .js file inside docs/src/js
  * local CSS @import and url() that point to another .css/.js file in docs/src/css

Idempotent: a second run changes nothing. Line endings are preserved.
Run before committing any CSS or JS change:  python scripts/bump_asset_version.py
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SRC = DOCS / "src"

VER = re.compile(rb"\?v=[0-9a-f]{8}")
EXT = r"\.(?:js|css)"

# import x from './a.js' / export {x} from './a.js' / import './a.js' / import('./a.js')
JS_SPEC = re.compile(
    r"""(\b(?:from|import)\s*\(?\s*)(['"])((?:\.{1,2}/|/)[^'"?#\s]*""" + EXT + r""")(?:\?v=[0-9a-f]{8})?\2"""
)
CSS_IMPORT = re.compile(
    r"""(@import\s+(?:url\(\s*)?)(['"]?)([^'")\s?#]*""" + EXT + r""")(?:\?v=[0-9a-f]{8})?\2"""
)
CSS_URL = re.compile(
    r"""(\burl\(\s*)(['"]?)([^'")\s?#]*""" + EXT + r""")(?:\?v=[0-9a-f]{8})?\2(?=\s*\))"""
)
HTML_ATTR = re.compile(
    r"""(\b(?:src|href)=)(["'])([^"'?#]*""" + EXT + r""")(?:\?v=[0-9a-f]{8})?\2"""
)


def compute_version():
    h = hashlib.sha256()
    for p in sorted((q for q in SRC.rglob("*") if q.is_file()),
                    key=lambda q: q.relative_to(SRC).as_posix()):
        data = VER.sub(b"", p.read_bytes()).replace(b"\r\n", b"\n")
        h.update(p.relative_to(SRC).as_posix().encode() + b"\0" + data + b"\0")
    return h.hexdigest()[:8]


def is_local(path):
    return not (path.startswith("//") or "://" in path)


def rewrite(text, patterns, ver):
    def sub(m):
        if not is_local(m.group(3)):
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}{m.group(3)}?v={ver}{m.group(2)}"
    for pat in patterns:
        text = pat.sub(sub, text)
    return text


def process(path, patterns, ver):
    raw = path.read_bytes()
    new = rewrite(raw.decode("utf-8"), patterns, ver).encode("utf-8")  # no newline translation
    if new != raw:
        path.write_bytes(new)
        return True
    return False


def main():
    ver = compute_version()
    jobs = []
    jobs += [(p, [HTML_ATTR]) for p in [DOCS / "index.html", *sorted((DOCS / "it").rglob("index.html"))]]
    jobs += [(p, [JS_SPEC]) for p in sorted((SRC / "js").glob("*.js"))]
    jobs += [(p, [CSS_IMPORT, CSS_URL]) for p in sorted((SRC / "css").glob("*.css"))]
    changed = [p for p, pats in jobs if p.exists() and process(p, pats, ver)]
    # Editing files under docs/src does not alter the hash (versions are stripped), so it is stable.
    assert compute_version() == ver, "version unstable"
    print(f"version: {ver}")
    print(f"files changed: {len(changed)}")
    for p in changed:
        print("  " + p.relative_to(ROOT).as_posix())
    return 0


if __name__ == "__main__":
    sys.exit(main())
