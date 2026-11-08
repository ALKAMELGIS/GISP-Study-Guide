"""Explanatory diagrams for the GISP Exam Memory Guide (all drawn from scratch)."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Polygon, FancyArrowPatch, Ellipse, FancyBboxPatch, Wedge
from matplotlib.path import Path
import os
OUT = "./figs"; os.makedirs(OUT, exist_ok=True)
NAVY, GOLD, INK, MUTED, LIGHT, RED, GREEN, TEAL = "#1F4E8C", "#B8902F", "#1E1B17", "#6B655B", "#C9D8EC", "#A33B2B", "#2E6B3F", "#3C8D93"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "text.color": INK, "axes.edgecolor": MUTED})

def fig(w=10, h=4.6):
    f = plt.figure(figsize=(w, h), dpi=170); return f
def save(f, name):
    f.savefig(f"{OUT}/{name}.png", dpi=170, bbox_inches="tight", facecolor="white", pad_inches=0.15); plt.close(f)
def blank(ax, title=None):
    ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]
    if title: ax.set_title(title, fontsize=12.5, fontweight="bold", color=NAVY, pad=6)
def arrow(ax, a, b, c=INK, lw=1.6, style="-|>", ms=14, **k):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=ms, color=c, lw=lw, **k))

# ---------------- AREA 1 ----------------
def heights():
    f = fig(10, 4.6); ax = f.add_subplot(111); blank(ax)
    x = np.linspace(0, 10, 400); E0 = 0.6
    geo = 1.25 + 0.3 * np.sin(x * 0.7 + 2.2) + 0.08 * np.sin(x * 2.1)
    ter = geo + 1.0 + 0.8 * np.exp(-((x - 6.2) ** 2) / 1.2) + 0.1 * np.sin(x * 4)
    ax.fill_between(x, -1.4, ter, color="#EFE8D8")
    ax.plot(x, ter, color="#7A5B2E", lw=2.4); ax.plot(x, geo, color=TEAL, lw=2.2, ls="--"); ax.plot(x, E0 + 0 * x, color=NAVY, lw=2.2)
    ax.text(0.1, ter[5] + .12, "Terrain (real surface)", color="#7A5B2E", fontsize=10, fontweight="bold")
    ax.text(0.1, geo[5] + .1, "Geoid ≈ mean sea level", color=TEAL, fontsize=10, fontweight="bold")
    ax.text(0.1, E0 - .3, "Ellipsoid (smooth math model)", color=NAVY, fontsize=10, fontweight="bold")
    px = 6.2; i = np.argmin(abs(x - px)); te, ge = ter[i], geo[i]
    arrow(ax, (px - .5, E0), (px - .5, te), c=NAVY, style="<|-|>", ms=11, lw=1.9); ax.text(px - .62, (E0 + te) / 2 + .3, "h", ha="right", color=NAVY, fontsize=15, fontweight="bold"); ax.text(px - .62, (E0 + te) / 2 - .05, "GPS height", ha="right", color=NAVY, fontsize=9)
    arrow(ax, (px + .5, ge), (px + .5, te), c=GREEN, style="<|-|>", ms=11, lw=1.9); ax.text(px + .62, (ge + te) / 2 + .1, "H", color=GREEN, fontsize=15, fontweight="bold"); ax.text(px + .62, (ge + te) / 2 - .22, "map height", color=GREEN, fontsize=9)
    arrow(ax, (px + 1.9, E0), (px + 1.9, geo[np.argmin(abs(x - px - 1.9))]), c=TEAL, style="<|-|>", ms=9, lw=1.7); ax.text(px + 2.02, .78, "N", color=TEAL, fontsize=15, fontweight="bold"); ax.text(px + 2.3, .8, "geoid height", color=TEAL, fontsize=9)
    ax.add_patch(Circle((px, te + .1), .1, color=RED, zorder=5)); ax.text(px, te + .3, "GPS receiver", ha="center", color=RED, fontsize=9.5)
    ax.text(0.1, -.65, "H = h − N", fontsize=20, fontweight="bold", color=INK)
    ax.text(3.0, -.62, "map height = GPS height − geoid height", fontsize=11, color=INK)
    ax.set_xlim(0, 10); ax.set_ylim(-1.1, 3.6)
    save(f, "a1_heights")

def projections():
    f = fig(10.5, 3.9); titles = [("Cylinder", "Mercator, Transverse Mercator (UTM)", "Equator / a meridian"), ("Cone", "Lambert Conformal Conic, Albers", "Mid-latitudes, wide E–W"), ("Plane (azimuthal)", "Polar stereographic, gnomonic", "Poles, true direction from centre")]
    for k, (t, ex, best) in enumerate(titles):
        ax = f.add_subplot(1, 3, k + 1); blank(ax, t); ax.set_aspect("equal"); ax.set_xlim(-1.6, 1.6); ax.set_ylim(-1.75, 1.6)
        ax.add_patch(Circle((0, 0), 0.8, fc=LIGHT, ec=NAVY, lw=1.6))
        for lat in (-.5, 0, .5): ax.add_patch(Ellipse((0, lat * .8), 1.6 * np.sqrt(1 - lat ** 2), .18 * np.sqrt(1 - lat ** 2), fill=False, ec=NAVY, lw=.6))
        ax.add_patch(Ellipse((0, 0), .55, 1.6, fill=False, ec=NAVY, lw=.6))
        if k == 0:
            ax.add_patch(Rectangle((-.8, -1.15), 1.6, 2.3, fill=False, ec=GOLD, lw=2.2)); ax.add_patch(Ellipse((0, 1.15), 1.6, .25, fill=False, ec=GOLD, lw=2)); ax.add_patch(Ellipse((0, -1.15), 1.6, .25, fill=False, ec=GOLD, lw=2))
        elif k == 1:
            ax.add_patch(Polygon([[0, 1.45], [-1.15, -.45], [1.15, -.45]], fill=False, ec=GOLD, lw=2.2)); ax.add_patch(Ellipse((0, -.45), 2.3, .35, fill=False, ec=GOLD, lw=2))
        else:
            ax.add_patch(Polygon([[-1.3, .95], [1.0, .95], [1.4, .7], [-.9, .7]], fc="#F3E7C9", ec=GOLD, lw=2.2, alpha=.9))
        ax.text(0, -1.42, ex, ha="center", fontsize=9, color=INK); ax.text(0, -1.68, "Best for: " + best, ha="center", fontsize=9, color=MUTED, style="italic")
    f.suptitle("Projection families: what the Earth is 'unrolled' onto", fontsize=12, color=INK, y=1.02)
    save(f, "a1_projections")

def utm():
    f = fig(10, 3.7); ax = f.add_subplot(121); blank(ax, "60 zones × 6° = 360°")
    for z in range(60):
        c = NAVY if z % 2 else LIGHT
        ax.add_patch(Rectangle((z * 6 - 180, -80), 6, 164, fc=c, ec="white", lw=.3))
    ax.add_patch(Rectangle((54 - 180 + 180, -80), 6, 164, fc=GOLD, ec="white"))
    ax.text(57, 90, "Zone 40\n(54°E–60°E)", ha="center", fontsize=9, color=GOLD, fontweight="bold")
    ax.set_xlim(-185, 185); ax.set_ylim(-90, 110); ax.text(-180, -97, "180°W", fontsize=8, color=MUTED); ax.text(160, -97, "180°E", fontsize=8, color=MUTED)
    ax.text(0, -112, "Zone = floor((longitude + 180) ÷ 6) + 1", ha="center", fontsize=10, fontweight="bold")
    ax2 = f.add_subplot(122); blank(ax2, "Inside one zone")
    ax2.add_patch(Polygon([[.5, 0], [3.5, 0], [3.2, 4], [.8, 4]], fc=LIGHT, ec=NAVY, lw=1.5)); ax2.plot([2, 2], [0, 4], color=GOLD, lw=2.5)
    ax2.text(2, 4.2, "Central meridian\nscale 0.9996", ha="center", fontsize=9.5, color=GOLD, fontweight="bold")
    ax2.text(2, -.35, "x = 500,000 m (false easting)", ha="center", fontsize=9.5, color=NAVY, fontweight="bold")
    ax2.annotate("", (.55, .3), (2, .3), arrowprops=dict(arrowstyle="<->", color=MUTED)); ax2.text(1.27, .4, "< 500 km", ha="center", fontsize=8.5, color=MUTED)
    ax2.annotate("", (3.45, .3), (2, .3), arrowprops=dict(arrowstyle="<->", color=MUTED)); ax2.text(2.73, .4, "> 500 km", ha="center", fontsize=8.5, color=MUTED)
    ax2.text(3.7, 2, "Units:\nmetres", fontsize=10, color=INK); ax2.set_xlim(0, 4.6); ax2.set_ylim(-.6, 4.8)
    save(f, "a1_utm")

# ---------------- AREA 2 ----------------
def models():
    f = fig(10.5, 3.8)
    ax = f.add_subplot(131); blank(ax, "Vector: points, lines, polygons"); ax.set_aspect("equal")
    ax.add_patch(Polygon([[1, 1], [4, 1.3], [4.6, 3.6], [2.2, 4.4], [.8, 3.1]], fc=LIGHT, ec=NAVY, lw=1.8)); ax.plot([0, 2, 3.5, 6], [5.3, 4.9, 5.4, 5.6], color=RED, lw=2.5)
    for p in [(5, 2), (5.5, 3.2), (.5, .4)]: ax.add_patch(Circle(p, .14, color=GOLD))
    ax.text(2.6, 2.6, "lake\n(polygon)", ha="center", fontsize=9, color=NAVY); ax.text(4.5, 5.75, "road (line)", fontsize=9, color=RED); ax.text(5.3, 1.5, "wells\n(points)", fontsize=9, color=GOLD)
    ax.set_xlim(0, 6.5); ax.set_ylim(0, 6.3)
    ax = f.add_subplot(132); blank(ax, "Raster: grid of cells"); ax.set_aspect("equal")
    g = np.zeros((10, 10)); yy, xx = np.mgrid[0:10, 0:10]; g[((xx - 4) ** 2 / 9 + (yy - 4) ** 2 / 6) < 1] = 1; g[8, :] = 2
    cols = {0: "#F4F1EA", 1: LIGHT, 2: "#E8B4A8"}
    for r in range(10):
        for c in range(10): ax.add_patch(Rectangle((c, r), 1, 1, fc=cols[g[r, c]], ec="white", lw=.8))
    ax.text(5, -1, "cell size = resolution", ha="center", fontsize=9.5, color=MUTED); ax.set_xlim(-.2, 10.2); ax.set_ylim(-1.6, 10.3)
    ax = f.add_subplot(133); blank(ax, "TIN: triangles for terrain"); ax.set_aspect("equal")
    rng = np.random.default_rng(3); P = rng.random((16, 2)) * 6
    from matplotlib.tri import Triangulation
    tri = Triangulation(P[:, 0], P[:, 1]); z = np.exp(-((P[:, 0] - 3) ** 2 + (P[:, 1] - 3) ** 2) / 4)
    ax.tripcolor(tri, z, cmap="Blues", alpha=.75, shading="flat"); ax.triplot(tri, color=NAVY, lw=.8); ax.plot(P[:, 0], P[:, 1], "o", color=GOLD, ms=4)
    ax.text(3, -.8, "irregular points joined into triangles", ha="center", fontsize=9.5, color=MUTED); ax.set_xlim(-.2, 6.2); ax.set_ylim(-1.3, 6.3)
    save(f, "a2_models")

def accuracy():
    f = fig(10.5, 3.2); rng = np.random.default_rng(5)
    cases = [("Accurate + precise", 0, 0, .12, GREEN), ("Precise, NOT accurate", .55, .45, .1, RED), ("Accurate, NOT precise", 0, 0, .45, GOLD), ("Neither", -.45, .5, .4, MUTED)]
    for k, (t, dx, dy, s, c) in enumerate(cases):
        ax = f.add_subplot(1, 4, k + 1); blank(ax); ax.set_aspect("equal")
        for r, fc in [(1, "#F4F1EA"), (.66, LIGHT), (.33, "#9DB6D8")]: ax.add_patch(Circle((0, 0), r, fc=fc, ec=NAVY, lw=.8))
        ax.add_patch(Circle((0, 0), .06, color=NAVY)); pts = rng.normal([dx, dy], s, (9, 2)); ax.plot(pts[:, 0], pts[:, 1], "o", color=c, ms=6, mec="white")
        ax.set_xlim(-1.1, 1.1); ax.set_ylim(-1.1, 1.1); ax.set_title(t, fontsize=10.5, color=c if c != MUTED else INK, fontweight="bold")
    f.text(.5, -.04, "Accuracy = close to the truth (centre).   Precision = close to each other (repeatable).", ha="center", fontsize=10.5, color=INK)
    save(f, "a2_accuracy")

def scale():
    f = fig(10, 2.9); ax = f.add_subplot(111); blank(ax)
    for k, (lab, sub, w) in enumerate([("1:1,200", "LARGE scale\nsmall area · lots of detail", 1.0), ("1:24,000", "medium scale", .62), ("1:1,000,000", "SMALL scale\nlarge area · little detail", .3)]):
        x0 = k * 3.4; ax.add_patch(Rectangle((x0, 0), 2.8, 2, fc="#F4F1EA", ec=NAVY))
        rng = np.random.default_rng(k); n = int(40 * w)
        for _ in range(n):
            px, py = rng.random() * 2.5 + x0 + .15, rng.random() * 1.7 + .15; ax.add_patch(Rectangle((px, py), .12 * w + .03, .1 * w + .03, color=NAVY if w > .5 else MUTED))
        ax.text(x0 + 1.4, 2.25, lab, ha="center", fontsize=13, fontweight="bold", color=NAVY); ax.text(x0 + 1.4, -.55, sub, ha="center", fontsize=9.5, color=INK)
    ax.text(3.15, 1, "→", fontsize=22, ha="center", va="center", color=GOLD); ax.text(6.55, 1, "→", fontsize=22, ha="center", va="center", color=GOLD)
    ax.set_xlim(-.1, 9.9); ax.set_ylim(-1.1, 2.6)
    save(f, "a2_scale")

# ---------------- AREA 3 ----------------
def visvars():
    f = fig(10.5, 3.6); ax = f.add_subplot(111); blank(ax)
    rows = [("Nominal", "names / categories", "hue (colour type)", "hue"), ("Ordinal", "ranked: low – med – high", "lightness (value)", "value"), ("Interval / Ratio", "numbers, amounts", "size", "size")]
    for r, (lvl, ex, vv, kind) in enumerate(rows):
        y = 2 - r
        ax.text(0, y, lvl, fontsize=13, fontweight="bold", color=NAVY, va="center"); ax.text(0, y - .3, ex, fontsize=9.5, color=MUTED, va="center")
        ax.text(3.3, y, "→  " + vv, fontsize=11.5, va="center")
        for i in range(4):
            cx = 6.6 + i * .9
            if kind == "hue": ax.add_patch(Rectangle((cx - .3, y - .3), .6, .6, color=["#4E79A7", "#E15759", "#59A14F", "#EDC948"][i]))
            elif kind == "value": ax.add_patch(Rectangle((cx - .3, y - .3), .6, .6, color=["#DCE6F2", "#9DB6D8", "#4F7BB5", "#1F4E8C"][i]))
            else: ax.add_patch(Circle((cx, y), .08 + i * .09, color=GOLD))
    ax.text(0, 2.75, "N-O-I-R: match the symbol to the data", fontsize=12.5, fontweight="bold")
    ax.set_xlim(-.1, 10); ax.set_ylim(-.6, 3.0); ax.set_aspect("equal")
    save(f, "a3_visvars")

def schemes():
    f = fig(10.5, 3.3)
    cfg = [("Sequential", "low → high (density, income)", ["#EEF3F9", "#C9D8EC", "#8FB0D8", "#4F7BB5", "#1F4E8C"]), ("Diverging", "above / below a midpoint (change %)", ["#A33B2B", "#E3A79B", "#F5F2EC", "#9DB6D8", "#1F4E8C"]), ("Qualitative", "categories (land use)", ["#4E79A7", "#F28E2B", "#59A14F", "#B07AA1", "#EDC948"])]
    for k, (t, s, cs) in enumerate(cfg):
        ax = f.add_subplot(1, 3, k + 1); blank(ax, t)
        for i, c in enumerate(cs): ax.add_patch(Rectangle((i, 0), 1, 1, color=c))
        ax.text(2.5, -.35, s, ha="center", fontsize=9.5, color=MUTED); ax.set_xlim(-.1, 5.1); ax.set_ylim(-.7, 1.1)
    save(f, "a3_schemes")

def chorovs():
    f = fig(10, 3.6)
    rng = np.random.default_rng(2); vals = rng.random((3, 4)); pop = rng.integers(5, 100, (3, 4))
    ax = f.add_subplot(121); blank(ax, "Choropleth: RATES (per km², %)"); ax.set_aspect("equal")
    cm = plt.get_cmap("Blues")
    for r in range(3):
        for c in range(4): ax.add_patch(Rectangle((c, r), 1, 1, fc=cm(.15 + .8 * vals[r, c]), ec="white", lw=2))
    ax.set_xlim(-.1, 4.1); ax.set_ylim(-.1, 3.1)
    ax = f.add_subplot(122); blank(ax, "Proportional symbols: TOTALS (counts)"); ax.set_aspect("equal")
    for r in range(3):
        for c in range(4): ax.add_patch(Rectangle((c, r), 1, 1, fc="#F4F1EA", ec="white", lw=2)); ax.add_patch(Circle((c + .5, r + .5), .05 + .42 * np.sqrt(pop[r, c] / 100), color=GOLD, alpha=.9))
    ax.set_xlim(-.1, 4.1); ax.set_ylim(-.1, 3.1)
    save(f, "a3_choro")

def surfaces():
    f = fig(10.5, 3.6); x, y = np.meshgrid(np.linspace(-3, 3, 200), np.linspace(-3, 3, 200)); z = np.exp(-((x - .6) ** 2 + y ** 2) / 1.6) * 2 + np.exp(-((x + 1.4) ** 2 + (y + 1) ** 2) / .8)
    ax = f.add_subplot(131); blank(ax, "Contours"); cs = ax.contour(x, y, z, 10, colors=NAVY, linewidths=.8); ax.set_aspect("equal"); ax.text(0, -3.6, "lines close together = steep", ha="center", fontsize=9, color=MUTED)
    from matplotlib.colors import LightSource
    ax = f.add_subplot(132); blank(ax, "Hillshade (light from 315°, 45°)"); ls = LightSource(azdeg=315, altdeg=45); ax.imshow(ls.hillshade(z, vert_exag=6), cmap="gray", origin="lower", extent=[-3, 3, -3, 3]); ax.text(0, -3.6, "light from the north-west", ha="center", fontsize=9, color=MUTED)
    ax = f.add_subplot(133); blank(ax, "Profile (along a line)"); line = z[100, :]; ax.fill_between(np.linspace(0, 6, 200), 0, line, color="#E9E1CF"); ax.plot(np.linspace(0, 6, 200), line, color="#7A5B2E", lw=2); ax.set_ylim(0, 2.6); ax.text(3, -.35, "elevation change along a path", ha="center", fontsize=9, color=MUTED)
    save(f, "a3_surfaces")

# ---------------- AREA 4 ----------------
def spectral():
    f = fig(10, 4); ax = f.add_subplot(111)
    wl = np.linspace(.4, 1.1, 300)
    veg = np.where(wl < .68, .05 + .07 * np.exp(-((wl - .55) ** 2) / .002), .05 + .45 / (1 + np.exp(-(wl - .72) / .012)))
    soil = .1 + .25 * (wl - .4); water = .08 * np.exp(-(wl - .4) / .15)
    ax.axvspan(.63, .69, color="#F6D5CF"); ax.axvspan(.76, .9, color="#E5DCEF")
    ax.text(.66, .55, "RED", ha="center", color=RED, fontweight="bold"); ax.text(.83, .55, "NEAR-INFRARED", ha="center", color="#6A4C93", fontweight="bold")
    ax.plot(wl, veg, color=GREEN, lw=2.6, label="Healthy vegetation"); ax.plot(wl, soil, color="#8C6A3F", lw=2.2, label="Bare soil"); ax.plot(wl, water, color=NAVY, lw=2.2, label="Water")
    ax.set_xlabel("Wavelength (µm)"); ax.set_ylabel("Reflectance"); ax.set_ylim(0, .62); ax.legend(frameon=False, loc="upper left")
    ax.text(1.09, .03, "NDVI = (NIR − Red) ÷ (NIR + Red)\nPlants: low Red, high NIR → NDVI near +1", ha="right", va="bottom", fontsize=10.5, fontweight="bold", color=INK, bbox=dict(fc="white", ec="#D9D3C7"))
    ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)
    save(f, "a4_spectral")

def dop():
    f = fig(10, 3.3)
    for k, (t, angs, c, s) in enumerate([("GOOD geometry → LOW PDOP", [20, 70, 120, 160], GREEN, "satellites spread across the sky"), ("POOR geometry → HIGH PDOP", [80, 88, 96, 104], RED, "satellites bunched together")]):
        ax = f.add_subplot(1, 2, k + 1); blank(ax, t); ax.set_aspect("equal")
        ax.add_patch(Wedge((0, 0), 2, 0, 180, fc="#EEF3F9", ec=NAVY)); ax.plot([-2.2, 2.2], [0, 0], color="#7A5B2E", lw=3)
        for a in angs:
            p = (1.75 * np.cos(np.radians(a)), 1.75 * np.sin(np.radians(a))); ax.plot([0, p[0]], [0, p[1]], color=c, lw=1, ls="--"); ax.add_patch(Rectangle((p[0] - .1, p[1] - .07), .2, .14, color=c))
        ax.add_patch(Circle((0, 0), .09, color=INK)); ax.text(0, -.4, s, ha="center", fontsize=9.5, color=MUTED); ax.set_xlim(-2.3, 2.3); ax.set_ylim(-.6, 2.2)
    f.text(.5, -.05, "At least 4 satellites for a 3D fix (x, y, z + receiver clock)", ha="center", fontsize=11, fontweight="bold")
    save(f, "a4_dop")

def confusion():
    f = fig(9.5, 4); ax = f.add_subplot(111); blank(ax)
    M = np.array([[45, 4, 1], [5, 38, 2], [0, 3, 32]]); cls = ["Forest", "Crop", "Water"]
    ax.text(1.5, 4.25, "Reference (ground truth)", ha="center", fontsize=11, fontweight="bold", color=NAVY)
    ax.text(-1.15, 1.5, "Classified\n(the map)", ha="center", va="center", fontsize=11, fontweight="bold", color=NAVY, rotation=90)
    for j, c in enumerate(cls): ax.text(j + .5, 3.75, c, ha="center", fontsize=10)
    for i, c in enumerate(cls): ax.text(-.15, 2.5 - i, c, ha="right", va="center", fontsize=10)
    for i in range(3):
        for j in range(3):
            ax.add_patch(Rectangle((j, 2 - i), 1, 1, fc=("#CFE3D3" if i == j else "#F7EDEA"), ec="white", lw=2)); ax.text(j + .5, 2.5 - i, str(M[i, j]), ha="center", va="center", fontsize=13, fontweight="bold" if i == j else None)
    ax.text(3.15, 2.5, "← row: User's accuracy\n    (errors = commission)", va="center", fontsize=9.8, color=GOLD, fontweight="bold")
    ax.text(.5, -.35, "↑ column: Producer's accuracy (errors = omission)", fontsize=9.8, color=TEAL, fontweight="bold")
    ax.text(3.15, .9, f"Overall accuracy =\ndiagonal ÷ total\n= {M.trace()} ÷ {M.sum()} = {M.trace() / M.sum():.0%}", fontsize=11, fontweight="bold")
    ax.set_xlim(-1.6, 6.3); ax.set_ylim(-.7, 4.5)
    save(f, "a4_confusion")

# ---------------- AREA 5 ----------------
def resample():
    f = fig(10.5, 3.4); src = np.array([[1, 1, 3], [1, 2, 3], [2, 2, 3]])
    from scipy.ndimage import zoom
    nn = zoom(src, 2, order=0); bl = zoom(src.astype(float), 2, order=1)
    for k, (t, A, cm, s) in enumerate([("Original (3 classes)", src, "Set2", ""), ("Nearest neighbour", nn, "Set2", "keeps original values → categories"), ("Bilinear", bl, "Blues", "averages → new values (continuous data only)")]):
        ax = f.add_subplot(1, 3, k + 1); blank(ax, t); ax.imshow(A, cmap=cm, vmin=1, vmax=3 if cm == "Blues" else 8)
        for (r, c), v in np.ndenumerate(A): ax.text(c, r, f"{v:.1f}".rstrip("0").rstrip(".") if isinstance(v, float) else v, ha="center", va="center", fontsize=8 if A.shape[0] > 3 else 12, color="white" if (cm == "Blues" and v > 2.3) else INK)
        ax.text(A.shape[1] / 2 - .5, A.shape[0] + .2 - .5 + .6, s, ha="center", fontsize=9.3, color=MUTED)
    save(f, "a5_resample")

def generalise():
    f = fig(10.5, 3.0); ops = ["Simplify", "Aggregate", "Collapse", "Displace"]
    for k, t in enumerate(ops):
        ax = f.add_subplot(1, 4, k + 1); blank(ax, t); ax.set_aspect("equal"); ax.set_xlim(0, 4.2); ax.set_ylim(-.6, 2.2)
        ax.plot([2.1, 2.1], [0, 2], color="#D9D3C7", lw=1)
        if k == 0:
            x = np.linspace(.1, 1.9, 30); ax.plot(x, 1 + .35 * np.sin(x * 9) + .2 * np.sin(x * 23), color=NAVY, lw=1.5); ax.plot([.1, .7, 1.3, 1.9], [1.1, .7, 1.3, .8], color=NAVY, lw=2); ax.lines[-1].set_xdata([2.3, 2.9, 3.5, 4.1])
        elif k == 1:
            for p in [(.2, .3), (.9, .4), (.4, 1.1), (1.1, 1.2), (.7, .75)]: ax.add_patch(Rectangle(p, .45, .35, color=NAVY))
            ax.add_patch(Polygon([[2.4, .3], [3.8, .35], [3.9, 1.6], [2.5, 1.6]], color=NAVY))
        elif k == 2:
            ax.add_patch(Polygon([[.3, .4], [1.7, .5], [1.6, 1.6], [.4, 1.5]], fc=LIGHT, ec=NAVY)); ax.text(1, 1, "city", ha="center", fontsize=8); ax.add_patch(Circle((3.2, 1), .14, color=NAVY)); ax.text(3.2, .6, "city", ha="center", fontsize=8)
        else:
            ax.plot([.1, 1.9], [1, 1], color=TEAL, lw=3); ax.plot([.1, 1.9], [1.08, 1.08], color=RED, lw=3); ax.plot([2.3, 4.1], [.8, .8], color=TEAL, lw=3); ax.plot([2.3, 4.1], [1.25, 1.25], color=RED, lw=3)
        ax.text(1, -.35, "before", ha="center", fontsize=9, color=MUTED); ax.text(3.2, -.35, "after", ha="center", fontsize=9, color=MUTED)
    save(f, "a5_generalise")

def georef():
    f = fig(10, 3.4); ax = f.add_subplot(111); blank(ax); ax.set_aspect("equal")
    ax.add_patch(Polygon([[0, .3], [3, 0], [3.3, 2.6], [.2, 2.9]], fc="#F3E7C9", ec=GOLD, lw=1.6)); ax.text(1.6, 3.2, "Scanned map (no coordinates)", ha="center", fontsize=10, fontweight="bold", color=GOLD)
    ax.add_patch(Rectangle((5.5, 0), 3.2, 2.9, fc=LIGHT, ec=NAVY, lw=1.6)); ax.text(7.1, 3.2, "Real coordinates (reference layer)", ha="center", fontsize=10, fontweight="bold", color=NAVY)
    src = [(.6, .7), (2.6, .6), (2.8, 2.3), (.7, 2.4)]; dst = [(6, .5), (8.2, .5), (8.2, 2.4), (6, 2.4)]
    for i, (a, b) in enumerate(zip(src, dst)):
        ax.add_patch(Circle(a, .08, color=RED)); ax.add_patch(Circle(b, .08, color=RED)); arrow(ax, a, b, c=RED, lw=1, ms=9, connectionstyle="arc3,rad=-.15")
    ax.text(4.4, -.6, "Control points link the two  ·  1st order needs 3 · 2nd 6 · 3rd 10  ·  check the RMS error", ha="center", fontsize=10.5)
    ax.set_xlim(-.3, 9); ax.set_ylim(-.9, 3.5)
    save(f, "a5_georef")

# ---------------- AREA 6 ----------------
def overlay():
    f = fig(10.5, 2.5)
    ops = ["Input A + B", "Intersect (A AND B)", "Union (A OR B)", "Clip (A cut by B)", "Erase (A minus B)"]
    from matplotlib.patches import PathPatch
    a = Circle((0, 0), 1); b = Circle((1, 0), 1)
    for k, t in enumerate(ops):
        ax = f.add_subplot(1, 5, k + 1); blank(ax); ax.set_title(t, fontsize=10, color=NAVY, fontweight="bold"); ax.set_aspect("equal"); ax.set_xlim(-1.2, 2.2); ax.set_ylim(-1.3, 1.3)
        X, Y = np.meshgrid(np.linspace(-1.2, 2.2, 300), np.linspace(-1.3, 1.3, 240)); A = X ** 2 + Y ** 2 < 1; B = (X - 1) ** 2 + Y ** 2 < 1
        R = {0: A | B, 1: A & B, 2: A | B, 3: A & B, 4: A & ~B}[k]
        img = np.ones(R.shape + (4,)); img[..., 3] = 0; col = np.array(matplotlib.colors.to_rgba(GOLD if k else LIGHT)); img[R] = col
        ax.imshow(img, extent=[-1.2, 2.2, -1.3, 1.3], origin="lower")
        ax.add_patch(Circle((0, 0), 1, fill=False, ec=NAVY, lw=1.4)); ax.add_patch(Circle((1, 0), 1, fill=False, ec=RED, lw=1.4, ls="--" if k in (3, 4) else "-"))
        if k == 0: ax.text(-.45, 0, "A", fontsize=13, fontweight="bold", color=NAVY, ha="center", va="center"); ax.text(1.45, 0, "B", fontsize=13, fontweight="bold", color=RED, ha="center", va="center")
    f.text(.5, .08, "Intersect and Clip keep the same area: Intersect keeps attributes of BOTH layers, Clip keeps only A's.", ha="center", fontsize=10, color=MUTED)
    save(f, "a6_overlay")

def mapalgebra():
    f = fig(10.5, 3.3); rng = np.random.default_rng(1)
    for k, (t, s) in enumerate([("Local", "cell by cell (A + B)"), ("Focal", "cell + its neighbours (3×3)"), ("Zonal", "per zone (mean by watershed)"), ("Global", "whole raster (distance)")]):
        ax = f.add_subplot(1, 4, k + 1); blank(ax, t); ax.set_aspect("equal")
        for r in range(5):
            for c in range(5):
                fc = "#F4F1EA"
                if k == 0 and (r, c) == (2, 2): fc = GOLD
                if k == 1 and abs(r - 2) <= 1 and abs(c - 2) <= 1: fc = LIGHT if (r, c) != (2, 2) else GOLD
                if k == 2: fc = [LIGHT, "#E9E1CF", "#CFE3D3"][(0 if c < 2 else 1) if r < 3 else 2]
                if k == 3: fc = plt.get_cmap("Blues")(.15 + .12 * np.hypot(r - 4, c))
                ax.add_patch(Rectangle((c, r), 1, 1, fc=fc, ec="white", lw=1.5))
        ax.set_xlim(-.1, 5.1); ax.set_ylim(-.9, 5.1); ax.text(2.5, -.6, s, ha="center", fontsize=9.3, color=MUTED)
    save(f, "a6_mapalgebra")

def patterns():
    f = fig(10.5, 3.2); rng = np.random.default_rng(4)
    pts = [np.vstack([rng.normal(c, .35, (12, 2)) for c in [(1.2, 1.2), (3.6, 3.2)]]), rng.random((24, 2)) * 5, np.array([(x + .5 + (y % 2) * .45, y + .5) for x in range(0, 5) for y in range(5)])[:24] * [.93, 1]]
    labs = [("Clustered", "NNI R < 1  ·  Moran's I > 0", RED), ("Random", "R ≈ 1  ·  I ≈ 0", MUTED), ("Dispersed", "R > 1  ·  I < 0", GREEN)]
    for k, ((t, s, c), P) in enumerate(zip(labs, pts)):
        ax = f.add_subplot(1, 3, k + 1); blank(ax, t); ax.set_aspect("equal"); ax.add_patch(Rectangle((0, 0), 5, 5, fc="#F7F5F0", ec="#D9D3C7")); ax.plot(P[:, 0], P[:, 1], "o", color=c, ms=6)
        ax.set_xlim(-.1, 5.1); ax.set_ylim(-.9, 5.1); ax.text(2.5, -.55, s, ha="center", fontsize=10, color=INK)
    save(f, "a6_patterns")

def classify():
    f = fig(10.5, 3.3); rng = np.random.default_rng(8); v = np.sort(np.concatenate([rng.normal(10, 3, 25), rng.normal(30, 4, 12), rng.normal(70, 6, 5)]))
    cuts = {"Equal interval\n(same width)": np.linspace(v.min(), v.max(), 5)[1:-1], "Quantile\n(same COUNT)": np.quantile(v, [.25, .5, .75]), "Natural breaks\n(natural gaps)": [19, 45, 60]}
    for k, (t, cs) in enumerate(cuts.items()):
        ax = f.add_subplot(1, 3, k + 1); ax.hist(v, bins=30, color=LIGHT, ec=NAVY, lw=.4)
        for c in cs: ax.axvline(c, color=GOLD, lw=2)
        ax.set_title(t, fontsize=10.5, color=NAVY, fontweight="bold"); ax.set_yticks([]); [ax.spines[s].set_visible(False) for s in ("top", "right", "left")]
    save(f, "a6_classify")

# ---------------- AREA 7 ----------------
def tablebox(ax, x, y, name, fields, w=2.2, c=NAVY):
    ax.add_patch(Rectangle((x, y), w, .45, fc=c)); ax.text(x + w / 2, y + .22, name, ha="center", va="center", color="white", fontweight="bold", fontsize=10)
    for i, (f_, tag) in enumerate(fields):
        yy = y - .4 * (i + 1); ax.add_patch(Rectangle((x, yy), w, .4, fc="white", ec="#D9D3C7"))
        ax.text(x + .12, yy + .2, f_, va="center", fontsize=9.5); ax.text(x + w - .1, yy + .2, tag, va="center", ha="right", fontsize=8.5, color=GOLD, fontweight="bold")

def erd():
    f = fig(10.5, 3.6); ax = f.add_subplot(111); blank(ax); ax.set_aspect("equal")
    tablebox(ax, 0, 2.6, "OWNER", [("OwnerID", "PK"), ("Name", ""), ("Phone", "")])
    tablebox(ax, 4, 2.6, "OWNERSHIP (junction)", [("OwnerID", "FK"), ("ParcelID", "FK"), ("Share %", "")], w=2.6, c=GOLD)
    tablebox(ax, 8.4, 2.6, "PARCEL", [("ParcelID", "PK"), ("Area", ""), ("Zoning", "")])
    arrow(ax, (2.2, 2.0), (4, 2.0), c=NAVY, style="-", lw=1.6); ax.text(2.35, 2.12, "1", fontsize=11, fontweight="bold"); ax.text(3.75, 2.12, "M", fontsize=11, fontweight="bold")
    arrow(ax, (6.6, 1.6), (8.4, 2.0), c=NAVY, style="-", lw=1.6); ax.text(6.7, 1.75, "M", fontsize=11, fontweight="bold"); ax.text(8.2, 2.12, "1", fontsize=11, fontweight="bold")
    ax.text(5.3, .3, "Many owners ↔ many parcels (M:N) → split it with a junction table, use a RELATE", ha="center", fontsize=10.5, fontweight="bold")
    ax.text(5.3, -.1, "PK = primary key (unique, not null)   ·   FK = foreign key (points to a PK)", ha="center", fontsize=9.5, color=MUTED)
    ax.set_xlim(-.2, 10.8); ax.set_ylim(-.4, 3.3)
    save(f, "a7_erd")

def joinrelate():
    f = fig(10.5, 3.0); ax = f.add_subplot(111); blank(ax); ax.set_aspect("equal")
    ax.text(2.4, 2.75, "JOIN: copies fields into one table (1:1, M:1)", ha="center", fontsize=11, fontweight="bold", color=NAVY)
    tablebox(ax, 0, 2.1, "Parcels", [("ID", ""), ("Area", "")], w=1.5); tablebox(ax, 1.7, 2.1, "+ Zoning", [("Zone", ""), ("Max ht", "")], w=1.5, c=GOLD)
    arrow(ax, (3.35, 1.5), (3.9, 1.5), c=INK); tablebox(ax, 4.0, 2.1, "Parcels", [("ID · Area", ""), ("Zone · Max ht", "")], w=1.4)
    ax.text(8.6, 2.75, "RELATE: tables stay separate (1:M, M:N)", ha="center", fontsize=11, fontweight="bold", color=NAVY)
    tablebox(ax, 6.8, 2.1, "Parcel", [("ID", "")], w=1.5); tablebox(ax, 9.0, 2.1, "Inspections", [("ID", ""), ("ID", ""), ("ID", "")], w=1.5, c=GOLD)
    for yy in (1.5, 1.1, .7): arrow(ax, (8.3, 1.9), (9.0, yy + .2), c=NAVY, style="-", lw=1)
    ax.set_xlim(-.2, 10.7); ax.set_ylim(.3, 3.0)
    save(f, "a7_join")

# ---------------- AREA 8 ----------------
def webgis():
    f = fig(10.5, 3.6); ax = f.add_subplot(111); blank(ax)
    def node(x, y, w, h, t, c, s=""):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=.05,rounding_size=.12", fc=c, ec="none")); ax.text(x + w / 2, y + h / 2 + (.15 if s else 0), t, ha="center", va="center", color="white", fontweight="bold", fontsize=11)
        if s: ax.text(x + w / 2, y + h / 2 - .22, s, ha="center", va="center", color="white", fontsize=8.5)
    node(0, 1.2, 2, 1.1, "Client", NAVY, "browser / app"); node(4, 1.2, 2.2, 1.1, "GIS server", TEAL, "services"); node(8.4, 1.2, 2, 1.1, "Database", GOLD, "geodatabase")
    arrow(ax, (2.1, 2.0), (3.9, 2.0), c=INK); ax.text(3, 2.15, "request (GET)", ha="center", fontsize=9); arrow(ax, (3.9, 1.5), (2.1, 1.5), c=INK); ax.text(3, 1.2, "response", ha="center", fontsize=9)
    arrow(ax, (6.3, 1.75), (8.3, 1.75), c=INK, style="<|-|>"); ax.text(7.3, 1.9, "SQL", ha="center", fontsize=9)
    ax.text(3, 2.7, "HTTPS = HTTP + encryption", ha="center", fontsize=9.5, color=GREEN, fontweight="bold")
    items = [("WMS", "map picture"), ("WFS", "features (WFS-T edits)"), ("WCS", "raster coverage"), ("WMTS", "cached tiles"), ("WPS", "processing")]
    for i, (a, b) in enumerate(items): ax.text(.2 + i * 2.1, .35, a, fontsize=11, fontweight="bold", color=NAVY); ax.text(.2 + i * 2.1, .02, b, fontsize=9, color=MUTED)
    ax.set_xlim(-.1, 10.5); ax.set_ylim(-.2, 3.0)
    save(f, "a8_webgis")

def devmethods():
    f = fig(10.5, 3.2); ax = f.add_subplot(121); blank(ax, "Waterfall: one stage after another")
    st = ["Requirements", "Design", "Build", "Test", "Deploy"]
    for i, s in enumerate(st):
        ax.add_patch(FancyBboxPatch((i * .9, 3.6 - i * .8), 1.7, .55, boxstyle="round,pad=.02", fc=NAVY if i % 2 == 0 else TEAL, ec="none")); ax.text(i * .9 + .85, 3.88 - i * .8, s, ha="center", va="center", color="white", fontsize=9, fontweight="bold")
        if i < 4: arrow(ax, (i * .9 + 1.72, 3.85 - i * .8), (i * .9 + 1.72, 3.45 - i * .8), c=INK, ms=10, connectionstyle="arc3,rad=-.5")
    ax.set_xlim(-.1, 5.6); ax.set_ylim(-.1, 4.4)
    ax = f.add_subplot(122); blank(ax, "Agile / Scrum: short sprints, test always"); ax.set_aspect("equal")
    for k, lab in enumerate(["Plan", "Build", "Test", "Review"]):
        a = 90 - k * 90; ax.add_patch(Wedge((0, 0), 1.3, a - 85, a + 5 - 0, width=.35, fc=[NAVY, TEAL, GREEN, GOLD][k])); ax.text(1.65 * np.cos(np.radians(a - 40)), 1.65 * np.sin(np.radians(a - 40)), lab, ha="center", va="center", fontsize=9.5, fontweight="bold")
    ax.text(0, 0, "Sprint\n1–4 weeks", ha="center", va="center", fontsize=9.5); ax.set_xlim(-2.2, 2.2); ax.set_ylim(-2.1, 2.0)
    f.text(.5, -.04, "Testing order: Unit → Integration → System → User acceptance (UAT)", ha="center", fontsize=10.5, fontweight="bold")
    save(f, "a8_dev")

# ---------------- AREA 9 ----------------
def tiers():
    f = fig(10.5, 3.6); ax = f.add_subplot(111); blank(ax)
    zones = [(0, 2.6, "Internet", "#F4F1EA"), (2.8, 2.6, "DMZ", "#F7EDEA"), (5.6, 4.8, "Internal network", "#EEF3F9")]
    for x, w, t, c in zones: ax.add_patch(Rectangle((x, 0), w, 3.2, fc=c, ec="none")); ax.text(x + w / 2, 3.0, t, ha="center", fontsize=10.5, fontweight="bold", color=MUTED)
    for x in (2.7, 5.5): ax.add_patch(Rectangle((x, 0), .2, 3.2, fc=RED)); ax.text(x + .1, -.25, "firewall", ha="center", fontsize=8.5, color=RED)
    def box(x, y, t, s, c):
        ax.add_patch(FancyBboxPatch((x, y), 1.9, .9, boxstyle="round,pad=.04", fc=c, ec="none")); ax.text(x + .95, y + .58, t, ha="center", color="white", fontweight="bold", fontsize=10); ax.text(x + .95, y + .25, s, ha="center", color="white", fontsize=8.3)
    box(.35, 1.1, "Users", "thin client = browser", NAVY); box(3.2, 1.1, "Web server", "tier 1: presentation", TEAL); box(6.0, 1.1, "App / GIS server", "tier 2: logic", TEAL); box(8.3, 1.1, "Database", "tier 3: data", GOLD)
    for a, b in [((2.3, 1.55), (3.15, 1.55)), ((5.15, 1.55), (5.95, 1.55)), ((7.95, 1.55), (8.25, 1.55))]: arrow(ax, a, b, c=INK, ms=10)
    ax.set_xlim(-.1, 10.5); ax.set_ylim(-.4, 3.3)
    save(f, "a9_tiers")

def cloud():
    f = fig(10.5, 3.8); ax = f.add_subplot(111); blank(ax)
    layers = ["Applications", "Data", "Runtime / middleware", "Operating system", "Servers · storage · network"]
    models = [("On-premises", 5), ("IaaS", 4), ("PaaS", 2), ("SaaS", 0)]
    for m, (name, you) in enumerate(models):
        x = m * 2.6; ax.text(x + 1.1, 5.35, name, ha="center", fontsize=12, fontweight="bold", color=NAVY)
        for i, l in enumerate(layers):
            mine = i < you; ax.add_patch(Rectangle((x, 4.4 - i * .95), 2.2, .85, fc=NAVY if mine else "#D8D2C4", ec="white"))
            ax.text(x + 1.1, 4.82 - i * .95, l, ha="center", va="center", fontsize=8.6, color="white" if mine else INK)
    ax.add_patch(Rectangle((0, -.75), .35, .3, fc=NAVY)); ax.text(.45, -.6, "You manage", va="center", fontsize=9.5); ax.add_patch(Rectangle((2.4, -.75), .35, .3, fc="#D8D2C4")); ax.text(2.85, -.6, "Provider manages", va="center", fontsize=9.5)
    ax.text(10.3, -.6, "IaaS = rent servers · PaaS = platform · SaaS = ready software", ha="right", va="center", fontsize=9.5, color=MUTED)
    ax.set_xlim(-.1, 10.4); ax.set_ylim(-.9, 5.6)
    save(f, "a9_cloud")

# ---------------- AREA 10 ----------------
def pm():
    f = fig(10.5, 3.6); ax = f.add_subplot(121); blank(ax, "Project phases")
    ph = ["Initiate", "Plan", "Execute", "Close"]
    for i, p in enumerate(ph):
        ax.add_patch(Polygon([[i * 1.25, 1.2], [i * 1.25 + 1.05, 1.2], [i * 1.25 + 1.3, 1.6], [i * 1.25 + 1.05, 2.0], [i * 1.25, 2.0], [i * 1.25 + .25, 1.6]], fc=NAVY if i % 2 == 0 else TEAL))
        ax.text(i * 1.25 + .65, 1.6, p, ha="center", va="center", color="white", fontsize=9.5, fontweight="bold")
    ax.add_patch(FancyBboxPatch((0, .3), 5.05, .5, boxstyle="round,pad=.02", fc=GOLD, ec="none")); ax.text(2.55, .55, "Monitor & control: during ALL phases", ha="center", va="center", color="white", fontweight="bold", fontsize=9.5)
    ax.set_xlim(-.1, 5.3); ax.set_ylim(0, 2.4)
    ax = f.add_subplot(122); blank(ax, "Triple constraint"); ax.set_aspect("equal")
    T = np.array([[0, 0], [2.4, 0], [1.2, 2.0]]); ax.add_patch(Polygon(T, fc="#EEF3F9", ec=NAVY, lw=2))
    ax.text(1.2, -.3, "TIME", ha="center", fontweight="bold", color=NAVY); ax.text(.25, 1.1, "COST", ha="center", fontweight="bold", color=NAVY, rotation=59); ax.text(2.15, 1.1, "SCOPE", ha="center", fontweight="bold", color=NAVY, rotation=-59)
    ax.text(1.2, .7, "Quality", ha="center", fontsize=10.5, color=GOLD, fontweight="bold"); ax.text(1.2, -.75, "Change one side → the others move", ha="center", fontsize=9.5, color=MUTED)
    ax.set_xlim(-.5, 2.9); ax.set_ylim(-1, 2.3)
    save(f, "a10_pm")

def ethics():
    f = fig(10.5, 2.9); ax = f.add_subplot(111); blank(ax)
    items = [("Society", "public good,\nhonesty", NAVY), ("Employers\n& funders", "quality work,\nno conflicts of interest", TEAL), ("Colleagues\n& profession", "give credit,\nkeep learning", GOLD), ("Individuals", "respect privacy\nand personal data", GREEN)]
    for i, (t, s, c) in enumerate(items):
        x = i * 2.65; ax.add_patch(FancyBboxPatch((x, .4), 2.45, 1.7, boxstyle="round,pad=.04,rounding_size=.15", fc=c, ec="none"))
        ax.text(x + 1.22, 1.62, t, ha="center", va="center", color="white", fontweight="bold", fontsize=10.5); ax.text(x + 1.22, .85, s, ha="center", va="center", color="white", fontsize=9)
    ax.text(5.2, 2.45, "GISCI Code of Ethics: obligations to four groups (S-E-P-I)", ha="center", fontsize=12, fontweight="bold")
    ax.text(5.2, .05, "When in doubt: be honest and transparent. Legal property boundaries → licensed surveyor.", ha="center", fontsize=10, color=MUTED)
    ax.set_xlim(-.1, 10.6); ax.set_ylim(-.1, 2.7)
    save(f, "a10_ethics")

for fn in [heights, projections, utm, models, accuracy, scale, visvars, schemes, chorovs, surfaces, spectral, dop, confusion, resample, generalise, georef, overlay, mapalgebra, patterns, classify, erd, joinrelate, webgis, devmethods, tiers, cloud, pm, ethics]:
    try: fn(); print("ok", fn.__name__)
    except Exception as e: print("FAIL", fn.__name__, e)
