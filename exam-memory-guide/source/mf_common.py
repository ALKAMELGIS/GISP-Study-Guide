import numpy as np, matplotlib, os
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Polygon, FancyArrowPatch, Ellipse, FancyBboxPatch, Wedge
OUT = "./figs"; os.makedirs(OUT, exist_ok=True)
NAVY, GOLD, INK, MUTED, LIGHT, RED, GREEN, TEAL, SAND, BG = "#1F4E8C", "#B8902F", "#1E1B17", "#6B655B", "#C9D8EC", "#A33B2B", "#2E6B3F", "#3C8D93", "#EFE8D8", "#F4F1EA"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "text.color": INK, "axes.edgecolor": MUTED})

def new(w=9, h=3.0, xlim=(0, 10), ylim=(0, 3.3), aspect=True):
    f = plt.figure(figsize=(w, h), dpi=170); ax = f.add_axes([0, 0, 1, 1])
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]
    if aspect: ax.set_aspect("equal")
    return f, ax
def save(f, name):
    f.savefig(f"{OUT}/{name}.png", dpi=170, bbox_inches="tight", facecolor="white", pad_inches=0.12); plt.close(f)
def arrow(ax, a, b, c=INK, lw=1.6, style="-|>", ms=14, **k):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=ms, color=c, lw=lw, **k))
def box(ax, x, y, w, h, text="", fc=NAVY, tc="white", fs=10.5, bold=True, sub=None, ec="none", r=.08):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=.02,rounding_size={r}", fc=fc, ec=ec, lw=1.2))
    if text: ax.text(x + w / 2, y + h / 2 + (.14 if sub else 0), text, ha="center", va="center", color=tc, fontsize=fs, fontweight="bold" if bold else None)
    if sub: ax.text(x + w / 2, y + h / 2 - .2, sub, ha="center", va="center", color=tc, fontsize=fs - 2.3)
def label(ax, x, y, s, c=INK, fs=10, bold=False, ha="center", va="center", **k):
    ax.text(x, y, s, color=c, fontsize=fs, fontweight="bold" if bold else None, ha=ha, va=va, **k)
def title(ax, x, y, s, c=NAVY, fs=11.5): label(ax, x, y, s, c=c, fs=fs, bold=True)
def ok(ax, x, y, good=True, fs=13): label(ax, x, y, "✓" if good else "✗", c=GREEN if good else RED, fs=fs, bold=True)
