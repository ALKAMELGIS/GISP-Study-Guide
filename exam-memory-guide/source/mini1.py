from mf_common import *

# ---------- AREA 1 ----------
def c1_datum():
    f, ax = new(9, 3, (0, 10), (0, 3.3))
    ax.add_patch(Rectangle((.3, .3), 6, 2.6, fc=BG, ec="#D9D3C7"))
    for x in np.arange(.3, 6.4, .6): ax.plot([x, x], [.3, 2.9], color="#E2DCCF", lw=.6)
    for y in np.arange(.3, 3, .6): ax.plot([.3, 6.3], [y, y], color="#E2DCCF", lw=.6)
    ax.add_patch(Circle((3.7, 1.9), .14, color=NAVY)); label(ax, 3.7, 2.25, "NAD83", NAVY, 10, True)
    ax.add_patch(Circle((2.7, 1.0), .14, color=RED)); label(ax, 2.7, .65, "NAD27", RED, 10, True)
    arrow(ax, (2.85, 1.1), (3.55, 1.8), c=MUTED, ms=11); label(ax, 4.6, 1.2, "same hydrant,\nnew numbers", MUTED, 9)
    label(ax, 6.7, 2.4, "The point did not move.", INK, 11, True, ha="left")
    label(ax, 6.7, 1.85, "The datum changed,", INK, 10.5, ha="left"); label(ax, 6.7, 1.45, "so its coordinates changed.", INK, 10.5, ha="left")
    label(ax, 6.7, .8, "Fix: datum transformation", GREEN, 10.5, True, ha="left")
    save(f, "c1_datum")

def c1_models():
    f, ax = new(9, 3, (0, 10), (0, 3.3))
    ax.add_patch(Circle((1.6, 1.7), 1.05, fc=LIGHT, ec=NAVY, lw=1.6)); title(ax, 1.6, .25, "Sphere")
    ax.add_patch(Ellipse((5, 1.7), 2.5, 1.85, fc=LIGHT, ec=NAVY, lw=1.6)); title(ax, 5, .25, "Ellipsoid")
    t = np.linspace(0, 2 * np.pi, 300); r = 1.0 + .08 * np.sin(5 * t) + .05 * np.cos(9 * t)
    ax.add_patch(Polygon(np.c_[8.4 + 1.2 * r * np.cos(t), 1.7 + .92 * r * np.sin(t)], fc="#CFE3D3", ec=GREEN, lw=1.6)); title(ax, 8.4, .25, "Geoid", GREEN)
    label(ax, 1.6, 1.7, "simple", MUTED, 9.5); label(ax, 5, 1.7, "flattened\nat the poles", MUTED, 9.5); label(ax, 8.4, 1.7, "lumpy:\ngravity / sea level", MUTED, 9.5)
    arrow(ax, (2.8, 1.7), (3.6, 1.7), c=GOLD); arrow(ax, (6.35, 1.7), (7.05, 1.7), c=GOLD)
    save(f, "c1_models")

def c1_geoproj():
    f, ax = new(9, 3.1, (0, 10), (0, 3.4))
    ax.add_patch(Circle((1.9, 1.75), 1.25, fc=LIGHT, ec=NAVY, lw=1.6))
    for k in (-.8, -.4, 0, .4, .8): ax.add_patch(Ellipse((1.9, 1.75 + k * 1.25), 2.5 * np.sqrt(1 - k * k), .22 * np.sqrt(1 - k * k), fill=False, ec=NAVY, lw=.6))
    for w in (.5, 1.3, 2.1): ax.add_patch(Ellipse((1.9, 1.75), w, 2.5, fill=False, ec=NAVY, lw=.6))
    title(ax, 1.9, .2, "Geographic: degrees"); label(ax, 1.9, 3.25, "25.25° N, 55.36° E", MUTED, 9.5)
    arrow(ax, (3.5, 1.75), (5.0, 1.75), c=GOLD, lw=2); label(ax, 4.25, 2.05, "project", GOLD, 9.5, True)
    ax.add_patch(Rectangle((5.4, .55), 3.6, 2.4, fc=BG, ec=NAVY, lw=1.4))
    for x in np.linspace(5.4, 9.0, 7): ax.plot([x, x], [.55, 2.95], color="#D6CEBF", lw=.7)
    for y in np.linspace(.55, 2.95, 5): ax.plot([5.4, 9.0], [y, y], color="#D6CEBF", lw=.7)
    ax.add_patch(Circle((7.1, 1.7), .1, color=RED)); label(ax, 7.1, 2.0, "x = 336,000 m\ny = 2,793,000 m", INK, 8.8)
    title(ax, 7.2, .2, "Projected: metres (UTM)")
    save(f, "c1_geoproj")

def c1_tissot():
    f, ax = new(9.5, 3.2, (0, 10), (0, 3.4))
    title(ax, 2.4, 3.2, "Mercator (conformal)"); title(ax, 7.4, 3.2, "Equal-area")
    ax.add_patch(Rectangle((.3, .2), 4.2, 2.75, fc=BG, ec=NAVY)); ax.add_patch(Rectangle((5.3, .55), 4.2, 2.05, fc=BG, ec=NAVY))
    for i, lat in enumerate([0, 30, 50, 65]):
        s = 1 / np.cos(np.radians(lat))
        y = .45 + i * .7; ax.add_patch(Circle((1.3, y), .11 * s, fc=GOLD, alpha=.85)); ax.add_patch(Circle((3.4, y), .11 * s, fc=GOLD, alpha=.85))
        y2 = .7 + i * .5; ax.add_patch(Ellipse((6.3, y2), .22 * s, .22 / s, fc=GOLD, alpha=.85)); ax.add_patch(Ellipse((8.5, y2), .22 * s, .22 / s, fc=GOLD, alpha=.85))
        label(ax, 2.35, y, f"{lat}°", MUTED, 8.5); label(ax, 7.4, y2, f"{lat}°", MUTED, 8.5)
    label(ax, 2.4, -.1, "shapes kept, sizes grow toward the poles", MUTED, 9); label(ax, 7.4, .2, "areas kept, shapes squashed", MUTED, 9)
    save(f, "c1_tissot")

def c1_spcs():
    f, ax = new(9, 3, (0, 10), (0, 3.3))
    ax.add_patch(Rectangle((1.2, .5), 1.4, 2.6, fc=LIGHT, ec=NAVY, lw=1.6)); ax.plot([1.9, 1.9], [.5, 3.1], color=GOLD, lw=2, ls="--")
    label(ax, 3.0, 2.3, "Long north–south zone", INK, 10.5, True, ha="left"); label(ax, 3.0, 1.85, "→ Transverse Mercator", NAVY, 10.5, True, ha="left")
    ax.add_patch(Rectangle((5.6, .5), 3.9, 1.05, fc="#F3E7C9", ec=GOLD, lw=1.6)); ax.plot([5.6, 9.5], [1.02, 1.02], color=NAVY, lw=2, ls="--")
    label(ax, 7.55, 2.25, "Long east–west zone", INK, 10.5, True); label(ax, 7.55, 1.85, "→ Lambert Conformal Conic", NAVY, 10.5, True)
    save(f, "c1_spcs")

def c1_discrete():
    f, ax = new(9, 3, (0, 10), (0, 3.3))
    title(ax, 2.3, 3.1, "Discrete: clear edges")
    ps = [[(.3, .3), (2, .3), (2, 1.5), (.3, 1.6)], [(2, .3), (4.3, .3), (4.3, 1.4), (2, 1.5)], [(.3, 1.6), (2, 1.5), (2.2, 2.8), (.3, 2.8)], [(2, 1.5), (4.3, 1.4), (4.3, 2.8), (2.2, 2.8)]]
    for p, c in zip(ps, [LIGHT, "#F3E7C9", "#CFE3D3", "#F7EDEA"]): ax.add_patch(Polygon(p, fc=c, ec=NAVY, lw=1.4))
    title(ax, 7.4, 3.1, "Continuous: a value everywhere")
    x, y = np.meshgrid(np.linspace(0, 1, 120), np.linspace(0, 1, 80)); z = np.sin(x * 3) + np.cos(y * 4) + x
    ax.imshow(z, extent=[5.3, 9.5, .3, 2.8], cmap="RdYlBu_r", origin="lower", aspect="auto")
    label(ax, 7.4, .05, "temperature, elevation, rainfall", MUTED, 9); label(ax, 2.3, .05, "parcels, roads, soil units", MUTED, 9)
    save(f, "c1_discrete")

def c1_geomatics():
    f, ax = new(9, 3, (0, 10), (0, 3.3))
    box(ax, 4.0, 1.25, 2, .8, "GEOMATICS", GOLD)
    items = [("Surveying", 1.2, 2.6), ("GNSS", 5.0, 2.85), ("Photogrammetry", 8.8, 2.6), ("Remote sensing", 1.2, .5), ("Cartography", 5.0, .3), ("GIS", 8.8, .5)]
    for s, x, y in items: ax.plot([5, x], [1.65, y], color="#C9C1B0", lw=1.2, zorder=0)
    for s, x, y in items: box(ax, x - 1.0, y - .25, 2.0, .5, s, NAVY, fs=9.5)
    box(ax, 4.0, 1.25, 2, .8, "GEOMATICS", GOLD)
    save(f, "c1_geomatics")

# ---------- AREA 2 ----------
def c2_topology():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    title(ax, 2, 3.35, "Overlap"); ax.add_patch(Rectangle((.4, .5), 2, 2, fc=LIGHT, ec=NAVY, alpha=.8)); ax.add_patch(Rectangle((1.6, .9), 2, 2, fc="#F3E7C9", ec=GOLD, alpha=.8)); ax.add_patch(Rectangle((1.6, .9), .8, 1.6, fc=RED, alpha=.5))
    title(ax, 6, 3.35, "Gap"); ax.add_patch(Rectangle((4.4, .5), 1.4, 2.4, fc=LIGHT, ec=NAVY)); ax.add_patch(Rectangle((6.1, .5), 1.4, 2.4, fc="#F3E7C9", ec=GOLD)); ax.add_patch(Rectangle((5.8, .5), .3, 2.4, fc=RED, alpha=.5))
    title(ax, 10, 3.35, "Dangle (undershoot)"); ax.plot([8.5, 11.5], [2.4, 2.4], color=NAVY, lw=2.5); ax.plot([10, 10], [.5, 2.1], color=NAVY, lw=2.5); ax.add_patch(Circle((10, 2.1), .12, color=RED)); label(ax, 10.6, 1.8, "gap!", RED, 9.5, True)
    label(ax, 6, .1, "Topology rules find these digitising errors", MUTED, 9.5)
    save(f, "c2_topology")

def c2_relations():
    f, ax = new(10, 2.6, (0, 15), (0, 3.6))
    cfg = [("Contains", 1.5), ("Within", 4.5), ("Touches", 7.5), ("Intersects", 10.5), ("Disjoint", 13.5)]
    for k, (s, x) in enumerate(cfg):
        title(ax, x, 3.3, s, fs=10.5)
        if k == 0: ax.add_patch(Rectangle((x - 1.1, .6), 2.2, 2.2, fc=LIGHT, ec=NAVY)); ax.add_patch(Circle((x, 1.7), .15, color=RED))
        if k == 1: ax.add_patch(Rectangle((x - 1.1, .6), 2.2, 2.2, fc=BG, ec=MUTED)); ax.add_patch(Rectangle((x - .5, 1.2), 1, 1, fc=GOLD, ec=GOLD))
        if k == 2: ax.add_patch(Rectangle((x - 1.2, .9), 1.2, 1.6, fc=LIGHT, ec=NAVY)); ax.add_patch(Rectangle((x, .9), 1.2, 1.6, fc="#F3E7C9", ec=GOLD))
        if k == 3: ax.add_patch(Circle((x - .4, 1.7), .8, fc=LIGHT, ec=NAVY, alpha=.85)); ax.add_patch(Circle((x + .4, 1.7), .8, fc="#F3E7C9", ec=GOLD, alpha=.7))
        if k == 4: ax.add_patch(Circle((x - .7, 1.7), .55, fc=LIGHT, ec=NAVY)); ax.add_patch(Circle((x + .7, 1.7), .55, fc="#F3E7C9", ec=GOLD))
    save(f, "c2_relations")

def c2_quality():
    f, ax = new(9.5, 3, (0, 12), (0, 3.8))
    items = [("Positional", "is it in the\nright place?"), ("Attribute", "are the values\ncorrect?"), ("Completeness", "is anything\nmissing?"), ("Temporal", "is it\nup to date?"), ("Logical\nconsistency", "does it follow\nthe rules?"), ("Lineage", "where did it\ncome from?")]
    for i, (a, b) in enumerate(items):
        x = (i % 3) * 4 + .15; y = 2.0 if i < 3 else .1
        box(ax, x, y, 3.7, 1.6, "", [NAVY, TEAL, GOLD, GREEN, NAVY, TEAL][i])
        label(ax, x + 1.85, y + 1.12, a, "white", 11 if "\n" not in a else 9.5, True); label(ax, x + 1.85, y + .45, b, "white", 9)
    save(f, "c2_quality")

def c2_qaqc():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    box(ax, .2, 1.1, 3.0, 1.1, "Plan & train", NAVY, sub="standards, manuals"); box(ax, 4.4, 1.1, 3.0, 1.1, "Collect data", TEAL, sub="field / digitising"); box(ax, 8.6, 1.1, 3.2, 1.1, "Check product", GOLD, sub="inspect, topology checks")
    arrow(ax, (3.3, 1.65), (4.3, 1.65)); arrow(ax, (7.5, 1.65), (8.5, 1.65))
    ax.add_patch(Rectangle((.2, 2.5), 7.2, .4, fc=LIGHT)); label(ax, 3.8, 2.7, "QA = prevent errors (before & during)", NAVY, 10.5, True)
    ax.add_patch(Rectangle((8.6, 2.5), 3.2, .4, fc="#F3E7C9")); label(ax, 10.2, 2.7, "QC = check after", GOLD, 10.5, True)
    label(ax, 6, .5, "QA = Ahead · QC = Check", INK, 11, True)
    save(f, "c2_qaqc")

def c2_rmse():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    pts = [(1, 2.6, .3, -.4), (2.6, 1.0, .8, .0), (4.2, 2.4, 0, 0), (1.8, .4, -.3, .4)]
    ax.add_patch(Rectangle((.3, .1), 4.8, 3.2, fc=BG, ec="#D9D3C7"))
    for (x, y, dx, dy), e in zip(pts, [5, 4, 0, 3]):
        ax.add_patch(Circle((x, y), .1, color=NAVY)); ax.add_patch(Circle((x + dx, y + dy), .1, color=RED))
        if e: arrow(ax, (x, y), (x + dx, y + dy), c=RED, ms=8, lw=1); label(ax, x + dx / 2 + .25, y + dy / 2 + .2, f"{e} m", RED, 9, True)
    label(ax, .5, -.15, "● true (survey)", NAVY, 9, ha="left"); label(ax, 2.6, -.15, "● data", RED, 9, ha="left")
    label(ax, 5.8, 2.8, "Errors: 5, 4, 0, 3 m", INK, 11, True, ha="left")
    label(ax, 5.8, 2.2, "1. square:  25 + 16 + 0 + 9 = 50", INK, 10.5, ha="left")
    label(ax, 5.8, 1.7, "2. divide by n:  50 ÷ 4 = 12.5", INK, 10.5, ha="left")
    label(ax, 5.8, 1.2, "3. square root:  √12.5 ≈ 3.54 m", NAVY, 10.5, True, ha="left")
    label(ax, 5.8, .5, "NSSDA (95%) = 1.7308 × RMSEr", GOLD, 10.5, True, ha="left")
    save(f, "c2_rmse")

def c2_metadata():
    f, ax = new(9, 3, (0, 11), (0, 3.6))
    box(ax, .3, .3, 4, 3, "", LIGHT); label(ax, 2.3, 2.95, "roads_2024", NAVY, 12, True)
    for i, (k, v) in enumerate([("Who", "City GIS office"), ("What", "road centrelines"), ("When", "March 2024"), ("Where", "UTM zone 40N"), ("How good", "±1 m, 98% complete")]):
        label(ax, .6, 2.45 - i * .45, k + ":", NAVY, 9.8, True, ha="left"); label(ax, 1.9, 2.45 - i * .45, v, INK, 9.8, ha="left")
    label(ax, 4.9, 2.7, "Metadata = data about data", INK, 12, True, ha="left")
    label(ax, 4.9, 2.05, "Standards:", MUTED, 10.5, ha="left")
    label(ax, 4.9, 1.6, "ISO 19115  (content)", NAVY, 10.5, True, ha="left"); label(ax, 4.9, 1.15, "ISO 19139  (XML encoding)", NAVY, 10.5, True, ha="left"); label(ax, 4.9, .7, "FGDC CSDGM  (US federal)", NAVY, 10.5, True, ha="left")
    save(f, "c2_metadata")

def c2_temporal():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    rng = np.random.default_rng(1)
    for k, (yr, n) in enumerate([(2000, 6), (2010, 16), (2020, 30)]):
        x0 = .3 + k * 4; ax.add_patch(Rectangle((x0, .5), 3.4, 2.5, fc="#CFE3D3", ec=GREEN))
        for _ in range(n):
            r = rng.normal(0, .55 + .1 * k, 2); ax.add_patch(Rectangle((x0 + 1.7 + r[0], 1.75 + r[1] * .7), .22, .18, color=MUTED))
        title(ax, x0 + 1.7, 3.3, str(yr));
        if k < 2: arrow(ax, (x0 + 3.45, 1.75), (x0 + 3.95, 1.75), c=GOLD)
    label(ax, 6, .15, "Same place, three dates → measure city growth", MUTED, 9.5)
    save(f, "c2_temporal")

def c2_standards():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.2))
    for i, (n, s, ex, c) in enumerate([("ISO/TC 211", "international", "ISO 19115, 19139, 19100 series", NAVY), ("OGC", "open web standards", "WMS, WFS, GML, GeoPackage, KML", TEAL), ("FGDC", "US federal", "CSDGM metadata, NSDI, NSSDA", GOLD)]):
        box(ax, .2 + i * 4, .4, 3.6, 2.4, "", c); label(ax, 2 + i * 4, 2.25, n, "white", 13, True); label(ax, 2 + i * 4, 1.7, s, "white", 9.5); label(ax, 2 + i * 4, .95, ex, "white", 8.6, wrap=True)
    save(f, "c2_standards")

def c2_uncertainty():
    f, ax = new(9, 3, (0, 11), (0, 3.6))
    title(ax, 2.6, 3.35, "Drawn: one sharp line")
    ax.add_patch(Rectangle((.3, .4), 2.3, 2.6, fc="#E9DCC0")); ax.add_patch(Rectangle((2.6, .4), 2.3, 2.6, fc="#CFE3D3")); ax.plot([2.6, 2.6], [.4, 3.0], color=INK, lw=2)
    title(ax, 8.2, 3.35, "Reality: gradual change")
    g = np.linspace(0, 1, 200)[None, :].repeat(40, 0); from matplotlib.colors import LinearSegmentedColormap
    ax.imshow(g, extent=[5.8, 10.6, .4, 3.0], cmap=LinearSegmentedColormap.from_list("s", ["#E9DCC0", "#E9DCC0", "#CFE3D3", "#CFE3D3"]), aspect="auto")
    ax.annotate("", (7.2, .2), (9.2, .2), arrowprops=dict(arrowstyle="<->", color=RED)); label(ax, 8.2, -.05, "uncertainty zone", RED, 9, True)
    save(f, "c2_uncertainty")

# ---------- AREA 3 ----------
def c3_elements():
    f, ax = new(9.5, 3.4, (0, 12), (0, 4.4))
    ax.add_patch(Rectangle((.3, .2), 7, 4, fc="white", ec=INK, lw=1.5))
    label(ax, 3.8, 3.85, "Flood Risk Zones, 2026", INK, 12, True)
    ax.add_patch(Rectangle((.6, .5), 4.6, 3.0, fc="#EEF3F9", ec=MUTED, lw=.6)); ax.add_patch(Polygon([(1, .8), (3, 1.2), (4.5, 2.6), (2, 3.2)], fc="#9DB6D8"))
    ax.add_patch(Rectangle((5.5, 2.4), 1.6, 1.0, fc="white", ec=MUTED)); label(ax, 6.3, 3.2, "Legend", INK, 8.5, True); ax.add_patch(Rectangle((5.65, 2.6), .3, .25, fc="#9DB6D8")); label(ax, 6.5, 2.72, "high risk", INK, 7.5)
    ax.plot([5.6, 6.6], [1.8, 1.8], color=INK, lw=3); label(ax, 6.1, 1.55, "0   1 km", INK, 7.5)
    arrow(ax, (6.3, .6), (6.3, 1.2), c=INK, ms=12); label(ax, 6.3, 1.3, "N", INK, 9, True)
    ax.add_patch(Rectangle((.75, 2.55), .9, .8, fc="white", ec=INK, lw=.8))
    for s, y in [("Title", 3.85), ("Inset map", 3.3), ("Legend", 2.75), ("Scale bar", 1.75), ("North arrow", .9), ("Source & date", .35)]:
        label(ax, 8.0, y, "← " + s, NAVY, 10, True, ha="left")
    label(ax, 3.9, .35, "Source: City GIS, 2026", MUTED, 7.5)
    save(f, "c3_elements")

def c3_hierarchy():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    for k, x0 in enumerate([.2, 6.2]):
        ax.add_patch(Rectangle((x0, .3), 5.5, 2.9, fc="white", ec="#D9D3C7"))
        rng = np.random.default_rng(3)
        for i in range(9): ax.plot([x0 + .2, x0 + 5.3], [.5 + i * .32, .5 + i * .32 + rng.normal(0, .1)], color=(INK if k == 0 else "#CFC8BA"), lw=(2 if k == 0 else .9))
        ax.plot([x0 + .4, x0 + 2.5, x0 + 4.9], [.6, 2.1, 2.9], color=(INK if k == 0 else RED), lw=(2 if k == 0 else 4.5))
    title(ax, 2.95, 3.4, "No hierarchy: everything shouts", RED); title(ax, 8.95, 3.4, "Hierarchy: route stands out", GREEN)
    save(f, "c3_hierarchy")

def c3_type():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    ax.add_patch(Rectangle((.2, .2), 11.6, 3.2, fc="#F6EEDC"))
    x = np.linspace(.5, 6, 100); ax.plot(x, 1.2 + .3 * np.sin(x * 1.3), color="#5B8FD0", lw=5)
    label(ax, 3.2, 1.75, "Nile", "#2F6DB5", 15, rotation=-8, style="italic")
    label(ax, 8.0, 2.6, "CAIRO", INK, 16, True); ax.add_patch(Circle((8.0, 2.15), .12, color=INK))
    label(ax, 8.6, 1.0, "S   A   H   A   R   A", "#8C6A3F", 13)
    label(ax, 2.8, 2.9, "water = blue italic", NAVY, 9.5); label(ax, 10.6, 2.2, "big city =\nbold capitals", NAVY, 9); label(ax, 8.6, .45, "area = letters spread across it", NAVY, 9)
    save(f, "c3_type")

def c3_viewshed():
    f, ax = new(9.5, 3, (0, 12), (0, 3.4), aspect=False)
    x = np.linspace(0, 12, 400); y = 1 + .7 * np.sin(x * .8) + .4 * np.sin(x * 2.1) + .08 * x
    ax.fill_between(x, 0, y, color=SAND); ax.plot(x, y, color="#7A5B2E", lw=2)
    ox, oy = 1.2, np.interp(1.2, x, y) + .5; ax.plot([1.2, 1.2], [oy - .5, oy], color=INK, lw=2); ax.add_patch(Circle((ox, oy), .08, color=RED))
    ang = np.arctan2(y - oy, x - ox); vis = np.maximum.accumulate(np.where(x > ox, ang, -9)) <= ang + 1e-9
    for i in range(len(x) - 1):
        if x[i] > ox: ax.plot(x[i:i + 2], y[i:i + 2], color=(GREEN if vis[i] else RED), lw=4)
    label(ax, 1.2, oy + .35, "observer", RED, 9.5, True); label(ax, 8, 3.15, "green = visible   red = hidden", INK, 10, True)
    save(f, "c3_viewshed")

def c3_dsm():
    f, ax = new(9.5, 3, (0, 12), (0, 3.4), aspect=False)
    x = np.linspace(0, 12, 600); g = .8 + .25 * np.sin(x * .5)
    top = g.copy()
    for a, b, h in [(1.5, 2.6, 1.4), (6.5, 7.3, 1.9), (7.6, 8.4, 1.2)]: top[(x > a) & (x < b)] += h
    tr = np.exp(-((x - 4.3) ** 2) / .3) * 1.3 + np.exp(-((x - 10.2) ** 2) / .35) * 1.1; top = np.maximum(top, g + tr)
    ax.fill_between(x, 0, g, color=SAND); ax.plot(x, top, color=RED, lw=2.4, label="DSM: top surface (roofs, trees)"); ax.plot(x, g, color="#7A5B2E", lw=2.4, label="DEM / DTM: bare ground")
    ax.fill_between(x, g, top, color="#E4E0D6")
    ax.legend(loc="upper left", frameon=False, fontsize=10); ax.set_ylim(0, 3.6)
    save(f, "c3_dsm")

# ---------- AREA 4 ----------
def c4_digitise():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    title(ax, 2, 3.15, "Overshoot"); ax.plot([.5, 3.5], [1.5, 1.5], color=NAVY, lw=2.5); ax.plot([2, 2], [.4, 2.3], color=NAVY, lw=2.5); ax.plot([2, 2], [1.5, 2.3], color=RED, lw=3)
    title(ax, 6, 3.15, "Undershoot (dangle)"); ax.plot([4.5, 7.5], [2.3, 2.3], color=NAVY, lw=2.5); ax.plot([6, 6], [.4, 1.9], color=NAVY, lw=2.5); ax.plot([6, 6], [1.9, 2.3], color=RED, lw=2, ls=":")
    title(ax, 10, 3.15, "Sliver"); ax.add_patch(Polygon([(8.4, .4), (10, .4), (10.1, 2.6), (8.4, 2.6)], fc=LIGHT, ec=NAVY)); ax.add_patch(Polygon([(10.25, .4), (11.7, .4), (11.7, 2.6), (10.1, 2.6)], fc="#F3E7C9", ec=GOLD)); ax.add_patch(Polygon([(10, .4), (10.25, .4), (10.1, 2.6)], fc=RED))
    label(ax, 6, .05, "Prevent with snapping and topology rules", MUTED, 9.5)
    save(f, "c4_digitise")

def c4_cogo():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    P = [(1, .5), (3.6, 1.0), (4.4, 2.9), (1.4, 3.0)]
    ax.add_patch(Polygon(P, fc=LIGHT, ec=NAVY, lw=2))
    labs = ["N 79° E, 26 m", "N 23° E, 21 m", "N 88° W, 30 m", "S 6° W, 25 m"]
    for i in range(4):
        a, b = P[i], P[(i + 1) % 4]; m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); label(ax, m[0] + (.35 if i == 1 else 0), m[1] + (-.25 if i == 0 else .22 if i == 2 else 0), labs[i], NAVY, 8.8, True, ha="left" if i == 1 else ("right" if i == 3 else "center"))
        ax.add_patch(Circle(a, .08, color=RED))
    label(ax, 6.4, 2.6, "Deed: bearings + distances", INK, 11.5, True, ha="left"); label(ax, 6.4, 2.0, "COGO calculates each corner", INK, 10.5, ha="left"); label(ax, 6.4, 1.5, "→ exact legal shape", GREEN, 10.5, True, ha="left")
    save(f, "c4_cogo")

def c4_geocode():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    ax.plot([.6, 11.4], [1.4, 1.4], color=INK, lw=6, solid_capstyle="round")
    label(ax, .6, 1.85, "100", MUTED, 10, True); label(ax, 11.4, 1.85, "198", MUTED, 10, True)
    x = .6 + (150 - 100) / 98 * 10.8; ax.add_patch(Circle((x, 1.4), .2, color=RED, zorder=4)); label(ax, x, 2.2, "150 Palm St", RED, 11, True)
    label(ax, 6, .6, "address range 100–198 → 150 is placed about halfway", INK, 10.5)
    save(f, "c4_geocode")

def c4_rtk():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    ax.plot([0, 12], [.5, .5], color="#7A5B2E", lw=3)
    for x in (2, 6, 10): ax.add_patch(Rectangle((x - .2, 3.0), .4, .25, color=NAVY)); ax.plot([x, 2.2], [3.0, 1.2], color=LIGHT, ls="--", lw=1); ax.plot([x, 9.2], [3.0, 1.2], color=LIGHT, ls="--", lw=1)
    ax.add_patch(Polygon([(1.7, .5), (2.7, .5), (2.2, 1.2)], color=GOLD)); label(ax, 2.2, .2, "Base station\n(known point)", INK, 9, True, va="top")
    ax.plot([9.2, 9.2], [.5, 1.3], color=INK, lw=2); ax.add_patch(Circle((9.2, 1.35), .12, color=RED)); label(ax, 9.2, .2, "Rover", INK, 9, True, va="top")
    arrow(ax, (2.8, 1.0), (8.9, 1.0), c=GREEN, lw=2); label(ax, 5.9, 1.3, "corrections (radio / internet)", GREEN, 10, True)
    label(ax, 5.9, 2.2, "RTK → centimetres in real time", NAVY, 11, True)
    ax.set_ylim(-.6, 3.6); save(f, "c4_rtk")

def c4_active():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    title(ax, 2.9, 3.4, "Passive (camera)")
    ax.add_patch(Circle((.7, 2.8), .35, color="#F2C14E")); ax.plot([0, 5.8], [.5, .5], color="#7A5B2E", lw=3)
    arrow(ax, (.9, 2.5), (2.6, .6), c="#E0A100"); arrow(ax, (2.8, .6), (4.4, 2.6), c="#E0A100"); ax.add_patch(Rectangle((4.3, 2.6), .6, .35, color=NAVY)); label(ax, 2.9, .15, "records reflected sunlight", MUTED, 9)
    title(ax, 9.1, 3.4, "Active (radar, lidar)")
    ax.plot([6.3, 11.9], [.5, .5], color="#7A5B2E", lw=3); ax.add_patch(Rectangle((8.8, 2.6), .6, .35, color=NAVY))
    arrow(ax, (8.9, 2.55), (8.4, .6), c=RED); arrow(ax, (8.6, .6), (9.2, 2.55), c=GREEN); label(ax, 10.6, 1.6, "sends its own\nsignal: works at\nnight & through\nclouds (radar)", INK, 9, ha="center")
    save(f, "c4_active")

def c4_res():
    f = plt.figure(figsize=(10, 2.7), dpi=170)
    names = ["Spatial\n(cell size)", "Spectral\n(bands)", "Radiometric\n(grey levels)", "Temporal\n(revisit)"]
    for k in range(4):
        ax = f.add_subplot(1, 4, k + 1); ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]; ax.set_title(names[k], fontsize=10.5, color=NAVY, fontweight="bold")
        if k == 0:
            z = np.add.outer(np.sin(np.linspace(0, 3, 32)), np.cos(np.linspace(0, 3, 32)))
            ax.imshow(np.c_[np.kron(z[::8, ::8], np.ones((8, 8)))[:, :16], z[:, 16:]], cmap="Greens"); ax.set_xlabel("30 m        10 m", fontsize=9)
        if k == 1:
            for i, (c, w) in enumerate([("#4E79A7", .45), ("#59A14F", .55), ("#E15759", .66), ("#9467BD", .84)]): ax.bar(i, 1, color=c, width=.8)
            ax.set_xticks(range(4)); ax.set_xticklabels(["B", "G", "R", "NIR"], fontsize=9); ax.set_ylim(0, 1.3)
        if k == 2:
            ax.imshow(np.vstack([np.repeat(np.linspace(0, 1, 4), 16)[None].repeat(6, 0), np.linspace(0, 1, 64)[None].repeat(6, 0)]), cmap="gray", aspect="auto"); ax.set_xlabel("2-bit (4)  vs  8-bit (256)", fontsize=9)
        if k == 3:
            for i, d in enumerate(["Jan", "Feb", "Mar", "Apr"]): ax.add_patch(Rectangle((i * 1.1, 0), .9, .9, color=["#B5D9A0", "#8CC27A", "#5FA35A", "#3D7F3F"][i])); ax.text(i * 1.1 + .45, -.25, d, ha="center", fontsize=8.5)
            ax.set_xlim(-.1, 4.4); ax.set_ylim(-.5, 1.1); ax.set_aspect("equal")
    save(f, "c4_res")

def c4_ortho():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    title(ax, 2.8, 3.4, "Orthophoto: straight down")
    ax.add_patch(Rectangle((2.5, 2.6), .6, .35, color=NAVY)); ax.plot([2.8, 1.2], [2.6, .5], color=LIGHT); ax.plot([2.8, 4.4], [2.6, .5], color=LIGHT); ax.plot([.5, 5.1], [.5, .5], color="#7A5B2E", lw=3)
    for x in (1.5, 2.6, 3.7): ax.add_patch(Rectangle((x, .5), .5, .35, color=MUTED))
    label(ax, 2.8, .15, "one scale → measure on it", GREEN, 9.5, True)
    title(ax, 9.2, 3.4, "Oblique: tilted")
    ax.add_patch(Rectangle((7.0, 2.6), .6, .35, color=NAVY)); ax.plot([7.3, 8.6], [2.6, .5], color=LIGHT); ax.plot([7.3, 11.6], [2.6, .5], color=LIGHT); ax.plot([6.6, 11.9], [.5, .5], color="#7A5B2E", lw=3)
    for x in (8.8, 9.9, 11.0): ax.add_patch(Rectangle((x, .5), .5, .8, color=MUTED))
    label(ax, 9.2, .15, "shows building sides, scale changes", RED, 9.5, True)
    save(f, "c4_ortho")

def c4_lidar():
    f, ax = new(9.5, 3.2, (0, 12), (0, 4.0))
    ax.plot([0, 12], [.5, .5], color="#7A5B2E", lw=3); ax.plot([4, 4], [.5, 1.6], color="#6B4A2B", lw=5); ax.add_patch(Ellipse((4, 2.3), 2.4, 1.6, fc="#6FAE6A", alpha=.85))
    ax.add_patch(Rectangle((3.6, 3.6), .8, .3, color=NAVY)); label(ax, 4.9, 3.75, "laser scanner (plane / drone)", INK, 9.5, ha="left")
    ax.plot([4, 3.6], [3.6, .5], color=RED, lw=1.2, ls="--")
    for y, s, c in [(3.0, "1st return: treetop", GOLD), (2.0, "middle return: branch", TEAL), (.5, "last return: ground", RED)]:
        x = 4 - .4 * (3.6 - y) / 3.1; ax.add_patch(Circle((x, y), .12, color=c, zorder=5)); label(ax, 6.0, y + (.35 if y < 1 else 0), s, c, 10.5, True, ha="left")
    save(f, "c4_lidar")

def c4_vgi():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    x = np.linspace(.5, 7, 100); ax.plot(x, 1.6 + .3 * np.sin(x), color=INK, lw=3, label="true road")
    rng = np.random.default_rng(2)
    for i in range(14):
        xx = rng.uniform(.6, 6.9); err = rng.choice([.05, .1, .5, .8]); ax.add_patch(Circle((xx, 1.6 + .3 * np.sin(xx) + rng.normal(0, err)), .1, color=[GREEN, TEAL, GOLD, RED][[.05, .1, .5, .8].index(err)]))
    label(ax, 7.6, 2.5, "Many volunteers,", INK, 10.5, True, ha="left"); label(ax, 7.6, 2.0, "different devices and care", INK, 10, ha="left")
    label(ax, 7.6, 1.3, "→ quality varies", RED, 10.5, True, ha="left"); label(ax, 7.6, .7, "→ credit the source (ODbL)", NAVY, 10.5, True, ha="left")
    save(f, "c4_vgi")

# ---------- AREA 5 ----------
def c5_order():
    f = plt.figure(figsize=(10, 2.9), dpi=170)
    for k, (t, fn) in enumerate([("Original grid", lambda x, y: (x, y)), ("1st order (affine)\nshift, rotate, scale: 3 pts", lambda x, y: (x * .9 + y * .3, y * .8 - x * .15)), ("2nd order\nbends: 6 pts", lambda x, y: (x + .12 * y * y, y + .1 * x * x)), ("3rd order\nbends more: 10 pts", lambda x, y: (x + .06 * y ** 3 - .1 * y, y + .07 * x ** 3)) ]):
        ax = f.add_subplot(1, 4, k + 1); ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]; ax.set_aspect("equal"); ax.set_title(t, fontsize=9.8, color=NAVY, fontweight="bold")
        g = np.linspace(-1, 1, 7); s = np.linspace(-1, 1, 50)
        for v in g:
            X, Y = fn(np.full_like(s, v), s); ax.plot(X, Y, color=NAVY, lw=.9); X, Y = fn(s, np.full_like(s, v)); ax.plot(X, Y, color=NAVY, lw=.9)
    save(f, "c5_order")

def c5_convert():
    f = plt.figure(figsize=(10, 2.8), dpi=170); t = np.linspace(0, 2 * np.pi, 200); r = 1 + .25 * np.sin(5 * t)
    X, Y = 2 + 1.5 * r * np.cos(t), 2 + 1.5 * r * np.sin(t)
    from matplotlib.path import Path
    for k, (tt, n) in enumerate([("Vector polygon", 0), ("Raster, large cells", 8), ("Raster, small cells", 32)]):
        ax = f.add_subplot(1, 3, k + 1); ax.set_xticks([]); ax.set_yticks([]); [s.set_visible(False) for s in ax.spines.values()]; ax.set_aspect("equal"); ax.set_title(tt, fontsize=10.5, color=NAVY, fontweight="bold")
        if n == 0: ax.add_patch(Polygon(np.c_[X, Y], fc=LIGHT, ec=NAVY, lw=1.5))
        else:
            c = (np.arange(n) + .5) * 4 / n; gx, gy = np.meshgrid(c, c); m = Path(np.c_[X, Y]).contains_points(np.c_[gx.ravel(), gy.ravel()]).reshape(n, n)
            ax.imshow(m, extent=[0, 4, 0, 4], origin="lower", cmap=matplotlib.colors.ListedColormap(["#F4F1EA", "#9DB6D8"])); ax.plot(X, Y, color=NAVY, lw=.6, alpha=.5)
        ax.set_xlim(0, 4); ax.set_ylim(0, 4)
    save(f, "c5_convert")

def c5_reproject():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    box(ax, .2, .9, 3.2, 1.4, "WGS 84", NAVY, sub="lat / long, degrees"); box(ax, 4.4, .9, 3.2, 1.4, "WGS 84 / UTM 40N", TEAL, sub="metres, same datum"); box(ax, 8.6, .9, 3.2, 1.4, "Other datum", GOLD, sub="needs a datum transformation")
    arrow(ax, (3.5, 1.6), (4.3, 1.6)); arrow(ax, (7.7, 1.6), (8.5, 1.6)); label(ax, 3.9, 2.55, "project", MUTED, 9); label(ax, 8.1, 2.55, "+ transform", RED, 9, True)
    label(ax, 6, .35, "All layers in ONE coordinate system before overlay", INK, 10.5, True)
    save(f, "c5_reproject")

def c5_edge():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    for k, x0 in enumerate([.3, 6.3]):
        ax.add_patch(Rectangle((x0, .4), 2.6, 2.6, fc=LIGHT, ec=NAVY)); ax.add_patch(Rectangle((x0 + 2.6, .4), 2.6, 2.6, fc="#F3E7C9", ec=GOLD))
        for y in (1.0, 2.2):
            ax.plot([x0 + .2, x0 + 2.6], [y, y + .1], color=INK, lw=2.5)
            ax.plot([x0 + 2.6, x0 + 5.0], [y + (.35 if k == 0 else .1), y + .3], color=INK, lw=2.5)
            if k == 0: ax.plot([x0 + 2.6, x0 + 2.6], [y + .1, y + .35], color=RED, lw=3)
    title(ax, 2.9, 3.25, "Before: lines do not meet", RED); title(ax, 8.9, 3.25, "After edge-matching", GREEN)
    save(f, "c5_edge")

def c5_formats():
    f, ax = new(9.5, 3, (0, 12), (0, 3.8))
    items = [("Shapefile", "2 GB · 10-char fields\nno topology", NAVY), ("File geodatabase", "large · domains,\ntopology, rasters", TEAL), ("GeoPackage", "open · one SQLite file\nvector + raster", GREEN), ("GeoJSON / KML", "text · web · WGS 84", GOLD), ("GeoTIFF", "raster + coordinates", NAVY), ("LAS / LAZ", "lidar point clouds", TEAL)]
    for i, (a, b, c) in enumerate(items):
        x = (i % 3) * 4 + .15; y = 2.0 if i < 3 else .1
        box(ax, x, y, 3.7, 1.6, "", c); label(ax, x + 1.85, y + 1.15, a, "white", 11, True); label(ax, x + 1.85, y + .5, b, "white", 8.8)
    save(f, "c5_formats")

def c5_etl():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.2))
    box(ax, .2, .8, 3.2, 1.6, "EXTRACT", NAVY, fs=12, sub="read 5 offices' files"); box(ax, 4.4, .8, 3.2, 1.6, "TRANSFORM", TEAL, fs=12, sub="same CRS, fields, format"); box(ax, 8.6, .8, 3.2, 1.6, "LOAD", GOLD, fs=12, sub="into one geodatabase")
    arrow(ax, (3.5, 1.6), (4.3, 1.6), lw=2); arrow(ax, (7.7, 1.6), (8.5, 1.6), lw=2)
    save(f, "c5_etl")

for fn in [c1_datum, c1_models, c1_geoproj, c1_tissot, c1_spcs, c1_discrete, c1_geomatics, c2_topology, c2_relations, c2_quality, c2_qaqc, c2_rmse, c2_metadata, c2_temporal, c2_standards, c2_uncertainty, c3_elements, c3_hierarchy, c3_type, c3_viewshed, c3_dsm, c4_digitise, c4_cogo, c4_geocode, c4_rtk, c4_active, c4_res, c4_ortho, c4_lidar, c4_vgi, c5_order, c5_convert, c5_reproject, c5_edge, c5_formats, c5_etl]:
    try: fn()
    except Exception as e: print("FAIL", fn.__name__, e)
