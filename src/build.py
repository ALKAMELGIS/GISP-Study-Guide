"""Build the single-file GISP 3D study book (../index.html) from the sources in this folder.

Usage:  python3 src/build.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SKELETON_HEAD = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                 '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                 '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}'
                 '[hidden]{display:none!important}</style></head><body>')

def read(name):
    return (HERE / name).read_text(encoding="utf-8")

js = ("const DATA=" + read("data.json") + ";\n" + read("fb_lessons.js") + "\n" + read("fb_ar.js")
      + "\n" + read("fb_book.js") + "\n" + read("fb_app.js"))
page = SKELETON_HEAD + read("fb_head.html") + "\n<script>\n" + js + "\n</script>\n</body></html>\n"
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written ({len(page):,} bytes)")
