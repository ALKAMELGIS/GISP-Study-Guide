from mf_common import *

# ---------- AREA 6 ----------
def c6_query():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    title(ax, 2.8, 3.4, "Attribute query (SQL)")
    rows = [("Name", "POP"), ("Al Ain", "766,000"), ("Hatta", "12,000"), ("Al Dhaid", "52,000"), ("Kalba", "37,000")]
    for i, (a, b) in enumerate(rows):
        y = 2.7 - i * .5; hl = i in (1, 3)
        ax.add_patch(Rectangle((.4, y), 4.8, .5, fc=(NAVY if i == 0 else ("#F3E7C9" if hl else "white")), ec="#D9D3C7"))
        label(ax, 1.6, y + .25, a, "white" if i == 0 else INK, 9.5, i == 0 or hl); label(ax, 4.0, y + .25, b, "white" if i == 0 else INK, 9.5, i == 0 or hl)
    label(ax, 2.8, .05, "WHERE POP > 50000", GOLD, 10, True)
    title(ax, 9.0, 3.4, "Spatial query (by location)")
    ax.add_patch(Rectangle((6.5, .3), 5, 2.8, fc=BG, ec="#D9D3C7")); x = np.linspace(6.5, 11.5, 50); ax.plot(x, 1.7 + .4 * np.sin(x), color="#5B8FD0", lw=4)
    ax.fill_between(x, 1.7 + .4 * np.sin(x) - .55, 1.7 + .4 * np.sin(x) + .55, color="#5B8FD0", alpha=.15)
    rng = np.random.default_rng(5)
    for _ in range(12):
        px = rng.uniform(6.7, 11.3); py = rng.uniform(.5, 2.9); near = abs(py - (1.7 + .4 * np.sin(px))) < .55
        ax.add_patch(Circle((px, py), .1, color=GOLD if near else MUTED))
    label(ax, 9.0, .05, "schools within 1 km of the river", GOLD, 10, True)
    save(f, "c6_query")

def c6_buffer():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    title(ax, 2.9, 3.2, "Buffer: 100 m zone")
    x = np.linspace(.5, 5.3, 80); y = 1.5 + .5 * np.sin(x * 1.2)
    ax.fill_between(x, y - .6, y + .6, color="#F3E7C9"); ax.plot(x, y, color="#5B8FD0", lw=4)
    title(ax, 9.1, 3.2, "Dissolve: merge same values")
    ax.add_patch(Circle((7.6, 1.5), .9, fc="#F3E7C9", ec=MUTED, ls="--")); ax.add_patch(Circle((8.6, 1.5), .9, fc="#F3E7C9", ec=MUTED, ls="--"))
    arrow(ax, (9.7, 1.5), (10.1, 1.5), c=GOLD)
    from matplotlib.patches import Circle as C
    ax.add_patch(C((10.75, 1.5), .45, fc="#F3E7C9", ec="none")); ax.add_patch(C((11.25, 1.5), .45, fc="#F3E7C9", ec="none")); ax.add_patch(Rectangle((10.75, 1.05), .5, .9, fc="#F3E7C9"))
    ax.plot([10.75, 11.25], [1.95, 1.95], color=GOLD, lw=1.5); ax.plot([10.75, 11.25], [1.05, 1.05], color=GOLD, lw=1.5)
    from matplotlib.patches import Arc
    ax.add_patch(Arc((10.75, 1.5), .9, .9, theta1=90, theta2=270, color=GOLD, lw=1.5)); ax.add_patch(Arc((11.25, 1.5), .9, .9, theta1=-90, theta2=90, color=GOLD, lw=1.5))
    save(f, "c6_buffer")

def c6_thiessen():
    from scipy.spatial import Voronoi
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    rng = np.random.default_rng(7); P = np.c_[rng.uniform(.5, 6.5, 10), rng.uniform(.4, 3.2, 10)]
    V = Voronoi(np.vstack([P, [[-20, -20], [30, -20], [-20, 30], [30, 30]]]))
    cols = [LIGHT, "#F3E7C9", "#CFE3D3", "#F7EDEA", "#E3DCEF"]
    for i in range(len(P)):
        reg = V.regions[V.point_region[i]]
        if -1 in reg: continue
        ax.add_patch(Polygon(V.vertices[reg], fc=cols[i % 5], ec=NAVY, lw=1))
    ax.add_patch(Rectangle((7, 0), 6, 4, fc="white", zorder=3)); ax.add_patch(Rectangle((-1, 3.6), 9, 2, fc="white", zorder=3)); ax.add_patch(Rectangle((-1, -1), 9, 1.25, fc="white", zorder=3)); ax.add_patch(Rectangle((-1, -1), 1.3, 6, fc="white", zorder=3))
    ax.add_patch(Rectangle((.3, .25), 6.7, 3.35, fill=False, ec=MUTED, zorder=4))
    for p in P: ax.add_patch(Circle(p, .09, color=RED, zorder=5))
    label(ax, 7.4, 2.6, "● rain gauge", RED, 10.5, True, ha="left"); label(ax, 7.4, 1.9, "Each polygon = all places", INK, 10.5, ha="left"); label(ax, 7.4, 1.45, "closest to its gauge", INK, 10.5, ha="left")
    ax.set_xlim(.2, 12); ax.set_ylim(.15, 3.7); save(f, "c6_thiessen")

def c6_network():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    N = {"A": (.8, 1.8), "B": (2.6, 3.0), "C": (2.8, 1.0), "D": (4.8, 2.4), "E": (5.2, .6), "F": (7.0, 1.7)}
    E = [("A", "B", 4), ("A", "C", 2), ("B", "D", 3), ("C", "D", 6), ("C", "E", 3), ("D", "F", 2), ("E", "F", 6)]
    best = {("A", "B"), ("B", "D"), ("D", "F")}
    for a, b, w in E:
        on = (a, b) in best; ax.plot(*zip(N[a], N[b]), color=GREEN if on else "#C9C1B0", lw=4 if on else 2.5)
        m = ((N[a][0] + N[b][0]) / 2, (N[a][1] + N[b][1]) / 2); label(ax, m[0], m[1] + .2, f"{w} min", INK, 9, on)
    for k, p in N.items(): ax.add_patch(Circle(p, .2, color=NAVY, zorder=4)); label(ax, p[0], p[1], k, "white", 9.5, True, zorder=5)
    label(ax, 8.0, 2.6, "Best route A → F = 9 min", GREEN, 10.5, True, ha="left")
    label(ax, 8.0, 1.9, "(A–C–D–F = 10;", MUTED, 9.5, ha="left"); label(ax, 8.0, 1.5, " A–C–E–F = 11)", MUTED, 9.5, ha="left")
    label(ax, 8.0, .8, "Cost = travel time on lines", INK, 10, ha="left")
    save(f, "c6_network")

def c6_interp():
    f = plt.figure(figsize=(10, 2.8), dpi=170); rng = np.random.default_rng(3)
    P = rng.uniform(0, 1, (18, 2)); z = np.sin(P[:, 0] * 4) + np.cos(P[:, 1] * 3)
    ax = f.add_subplot(1, 3, 1); ax.scatter(P[:, 0], P[:, 1], c=z, cmap="Blues", s=60, edgecolor=NAVY); ax.set_title("Sample points", fontsize=10.5, color=NAVY, fontweight="bold")
    gx, gy = np.meshgrid(np.linspace(0, 1, 120), np.linspace(0, 1, 120)); d = np.hypot(gx[..., None] - P[:, 0], gy[..., None] - P[:, 1]) + 1e-6; w = 1 / d ** 2; Z = (w * z).sum(-1) / w.sum(-1)
    ax2 = f.add_subplot(1, 3, 2); ax2.imshow(Z, origin="lower", extent=[0, 1, 0, 1], cmap="Blues"); ax2.scatter(P[:, 0], P[:, 1], s=8, c=RED); ax2.set_title("Surface (IDW)", fontsize=10.5, color=NAVY, fontweight="bold")
    ax3 = f.add_subplot(1, 3, 3); ax3.imshow(np.min(d, -1), origin="lower", extent=[0, 1, 0, 1], cmap="Reds"); ax3.scatter(P[:, 0], P[:, 1], s=8, c=NAVY); ax3.set_title("Kriging also gives ERROR\n(high far from points)", fontsize=10, color=RED, fontweight="bold")
    for a in (ax, ax2, ax3): a.set_xticks([]); a.set_yticks([]); a.set_aspect("equal")
    save(f, "c6_interp")

def c6_hydro():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    for i, (a, b, c) in enumerate([("1. Fill sinks", "remove pits", NAVY), ("2. Flow direction", "which way water goes", TEAL), ("3. Flow accumulation", "how many cells drain in", GOLD), ("4. Streams &\nwatersheds", "", GREEN)]):
        box(ax, .1 + i * 3, .8, 2.7, 1.5, "", c); label(ax, 1.45 + i * 3, 1.75 if b else 1.55, a, "white", 10, True);
        if b: label(ax, 1.45 + i * 3, 1.15, b, "white", 8.5)
        if i < 3: arrow(ax, (2.85 + i * 3, 1.55), (3.05 + i * 3, 1.55), ms=10)
    save(f, "c6_hydro")

def c6_hotspot():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    rng = np.random.default_rng(4); g = rng.normal(0, .5, (6, 9)); g[1:3, 1:4] += 2.5; g[3:5, 6:8] -= 2.5
    for r in range(6):
        for c in range(9):
            v = g[r, c]; col = "#C0392B" if v > 1.96 else "#E8A598" if v > 1.0 else "#2E5E9E" if v < -1.96 else "#9DB6D8" if v < -1.0 else "#EFEAE0"
            ax.add_patch(Rectangle((.3 + c * .62, .2 + r * .55), .6, .53, fc=col, ec="white"))
    label(ax, 6.3, 2.8, "Getis-Ord Gi*", INK, 12, True, ha="left")
    ax.add_patch(Rectangle((6.3, 2.0), .4, .3, fc="#C0392B")); label(ax, 6.85, 2.15, "hot spot: z > +1.96", INK, 10, ha="left")
    ax.add_patch(Rectangle((6.3, 1.4), .4, .3, fc="#2E5E9E")); label(ax, 6.85, 1.55, "cold spot: z < −1.96", INK, 10, ha="left")
    ax.add_patch(Rectangle((6.3, .8), .4, .3, fc="#EFEAE0", ec="#D9D3C7")); label(ax, 6.85, .95, "not significant", INK, 10, ha="left")
    save(f, "c6_hotspot")

def c6_centre():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    rng = np.random.default_rng(9); P = rng.normal([3, 1.8], [1.3, .6], (30, 2)); m = P.mean(0)
    ax.add_patch(Rectangle((.2, .1), 5.8, 3.4, fc=BG, ec="#D9D3C7"))
    ax.add_patch(Circle(m, np.sqrt(((P - m) ** 2).sum(1).mean()), fill=False, ec=TEAL, lw=2, ls="--"))
    ax.add_patch(Ellipse(m, 2 * 1.3 * 1.6, 2 * .6 * 1.6, fill=False, ec=GOLD, lw=2))
    ax.plot(P[:, 0], P[:, 1], "o", color=MUTED, ms=4); ax.plot(*m, "*", color=RED, ms=18)
    label(ax, 6.6, 2.7, "★ mean centre = (mean x, mean y)", RED, 10.5, True, ha="left")
    label(ax, 6.6, 2.0, "- - standard distance (spread)", TEAL, 10.5, True, ha="left")
    label(ax, 6.6, 1.3, "◯ deviational ellipse (direction)", GOLD, 10.5, True, ha="left")
    ax.set_xlim(.1, 12); save(f, "c6_centre")

# ---------- AREA 7 ----------
def tb(ax, x, y, name, rows, w=1.8, c=NAVY):
    ax.add_patch(Rectangle((x, y), w, .4, fc=c)); label(ax, x + w / 2, y + .2, name, "white", 9, True)
    for i, r in enumerate(rows): ax.add_patch(Rectangle((x, y - .35 * (i + 1)), w, .35, fc="white", ec="#D9D3C7")); label(ax, x + .1, y - .35 * (i + 1) + .17, r, INK, 8.5, ha="left")

def c7_card():
    f, ax = new(10, 3, (0, 12.5), (0, 3.6))
    for i, (t, l, r, lab) in enumerate([("1 : 1", "Parcel", "Tax ID", "each parcel has one tax ID"), ("1 : M", "Parcel", "Inspections", "one parcel, many inspections"), ("M : N", "Students", "Classes", "needs a junction table")]):
        x0 = .2 + i * 4.2; title(ax, x0 + 1.8, 3.35, t)
        box(ax, x0, 2.1, 1.3, .6, l, NAVY, fs=9); box(ax, x0 + 2.4, 2.1, 1.4, .6, r, GOLD, fs=9)
        ax.plot([x0 + 1.3, x0 + 2.4], [2.4, 2.4], color=INK, lw=1.5)
        if i >= 1:
            for d in (-.2, .2): ax.plot([x0 + 2.0, x0 + 2.4], [2.4, 2.4 + d], color=INK, lw=1.5)
        if i == 2:
            for d in (-.2, .2): ax.plot([x0 + 1.7, x0 + 1.3], [2.4, 2.4 + d], color=INK, lw=1.5)
            box(ax, x0 + 1.0, .9, 1.8, .55, "Enrolment", TEAL, fs=8.5); label(ax, x0 + 1.9, .6, "(junction table)", TEAL, 8)
        if i < 2: label(ax, x0 + 1.8, 1.55, lab, MUTED, 9)
    save(f, "c7_card")

def c7_stages():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    for i, (a, b, c) in enumerate([("Conceptual", "entities & relationships\n(E-R diagram)", NAVY), ("Logical", "tables, keys,\nnormalisation", TEAL), ("Physical", "real DBMS, data types,\nindexes", GOLD)]):
        box(ax, .2 + i * 4, .6, 3.4, 1.9, "", c); label(ax, 1.9 + i * 4, 2.0, a, "white", 12, True); label(ax, 1.9 + i * 4, 1.2, b, "white", 9)
        if i < 2: arrow(ax, (3.65 + i * 4, 1.55), (4.15 + i * 4, 1.55), lw=2)
    label(ax, 6, .2, "from WHAT to HOW", MUTED, 10, True)
    save(f, "c7_stages")

def c7_norm():
    f, ax = new(10, 3, (0, 12.5), (0, 3.6))
    title(ax, 2.6, 3.35, "Before: breaks 1NF", RED)
    cols = ["ID", "Name", "Phone1", "Phone2", "Phone3"]
    for j, c in enumerate(cols): ax.add_patch(Rectangle((.1 + j * 1.0, 2.5), 1.0, .45, fc=NAVY if j < 2 else RED, ec="white")); label(ax, .6 + j * 1.0, 2.72, c, "white", 8.5, True)
    for j, c in enumerate(["7", "Ali", "050…", "055…", ""]): ax.add_patch(Rectangle((.1 + j * 1.0, 2.05), 1.0, .45, fc="white", ec="#D9D3C7")); label(ax, .6 + j * 1.0, 2.27, c, INK, 8.5)
    arrow(ax, (5.4, 2.4), (6.4, 2.4), c=GOLD, lw=2)
    title(ax, 9.3, 3.35, "After: one value per cell", GREEN)
    tb(ax, 6.7, 2.7, "PERSON", ["ID  (PK)", "Name"], w=2.2); tb(ax, 9.6, 2.7, "PHONE", ["ID  (FK)", "Number"], w=2.2, c=GOLD)
    label(ax, 6.25, .6, "1NF one value per cell · 2NF the whole key · 3NF nothing but the key", INK, 10, True)
    save(f, "c7_norm")

def c7_domain():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    title(ax, 2.8, 3.2, "Free text: typos", RED)
    for i, s in enumerate(["Steel", "Stell", "steel ", "STEEL"]): ax.add_patch(Rectangle((1.3, 2.3 - i * .5), 3, .45, fc="white", ec="#D9D3C7")); label(ax, 1.5, 2.52 - i * .5, s, RED if i else INK, 10, ha="left")
    title(ax, 9.0, 3.2, "Coded-value domain", GREEN)
    ax.add_patch(Rectangle((7.4, 2.3), 3.2, .45, fc="white", ec=NAVY)); label(ax, 7.6, 2.52, "Steel", INK, 10, ha="left"); label(ax, 10.4, 2.52, "▾", NAVY, 10)
    for i, s in enumerate(["PVC", "Steel", "Copper"]): ax.add_patch(Rectangle((7.4, 1.8 - i * .45), 3.2, .45, fc=LIGHT if s == "Steel" else "white", ec="#D9D3C7")); label(ax, 7.6, 2.02 - i * .45, s, INK, 10, ha="left")
    save(f, "c7_domain")

def c7_version():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    title(ax, 2.9, 3.4, "Versioning: many editors")
    box(ax, 1.9, 2.1, 2, .6, "DEFAULT", NAVY, fs=10)
    for i, x in enumerate((.3, 2.3, 4.3)):
        box(ax, x, .5, 1.5, .55, f"Editor {i + 1}", TEAL, fs=9); arrow(ax, (x + .75, 1.1), (2.9, 2.05), c=MUTED, ms=9, lw=1)
    label(ax, 2.9, 1.55, "reconcile & post", GOLD, 9, True)
    title(ax, 9.2, 3.4, "Replication: remote office")
    box(ax, 6.7, 1.3, 2, .9, "HQ database", NAVY, fs=9.5); box(ax, 9.9, 1.3, 2, .9, "Field office\nreplica", GOLD, fs=9.5)
    arrow(ax, (8.75, 1.95), (9.85, 1.95), c=INK, style="<|-|>"); label(ax, 9.3, 2.3, "sync", INK, 9, True); label(ax, 9.3, .7, "works on a slow link", MUTED, 9)
    save(f, "c7_version")

def c7_sql():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    for i, (a, b, c, d) in enumerate([("DDL", "builds structure", "CREATE · ALTER · DROP", NAVY), ("DML", "handles data", "SELECT · INSERT\nUPDATE · DELETE", TEAL), ("DCL", "controls access", "GRANT · REVOKE", GOLD)]):
        box(ax, .2 + i * 4, .3, 3.6, 2.8, "", d); label(ax, 2 + i * 4, 2.55, a, "white", 15, True); label(ax, 2 + i * 4, 1.95, b, "white", 10); label(ax, 2 + i * 4, 1.05, c, "white", 9.5, True)
    save(f, "c7_sql")

def c7_cia():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    ax.add_patch(Polygon([(1, .4), (5, .4), (3, 3.3)], fc="#EEF3F9", ec=NAVY, lw=2)); label(ax, 3, 1.3, "CIA", NAVY, 18, True)
    label(ax, 3, 3.45, "Confidentiality", NAVY, 10.5, True); label(ax, .9, .15, "Integrity", NAVY, 10.5, True); label(ax, 5.1, .15, "Availability", NAVY, 10.5, True)
    for y, a, b in [(2.8, "Confidentiality", "only the right people see it (roles, encryption)"), (1.9, "Integrity", "data is not changed wrongly (permissions, logs)"), (1.0, "Availability", "it works when needed (backups, uptime)")]:
        label(ax, 6.2, y + .2, a, GOLD, 10.5, True, ha="left"); label(ax, 6.2, y - .2, b, INK, 9, ha="left")
    ax.set_ylim(-.1, 3.7); save(f, "c7_cia")

# ---------- AREA 8 ----------
def c8_protocols():
    f, ax = new(9.5, 3, (0, 12), (0, 3.8))
    items = [("HTTP", "web pages", False), ("HTTPS", "web + encryption", True), ("FTP", "file transfer", False), ("SFTP", "secure file transfer", True), ("SSH", "secure remote login", True), ("SMTP", "sending email", False)]
    for i, (a, b, sec) in enumerate(items):
        x = (i % 3) * 4 + .15; y = 2.0 if i < 3 else .1
        box(ax, x, y, 3.7, 1.6, "", GREEN if sec else NAVY); label(ax, x + 1.85, y + 1.1, ("🔒 " if False else "") + a, "white", 13, True); label(ax, x + 1.85, y + .5, b + ("  (secure)" if sec else ""), "white", 9)
    save(f, "c8_protocols")

def c8_rest():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    box(ax, .2, 1.0, 2.4, 1.3, "Client", NAVY, sub="browser / app"); box(ax, 9.4, 1.0, 2.4, 1.3, "REST service", TEAL)
    arrow(ax, (2.7, 2.0), (9.3, 2.0), lw=1.8); label(ax, 6, 2.35, "GET  /parcels/query?where=zone='R1'&f=json", NAVY, 9.5, True, family="monospace")
    arrow(ax, (9.3, 1.3), (2.7, 1.3), lw=1.8); label(ax, 6, .95, '{"features":[{"id":7,"zone":"R1"}]}', GREEN, 9.5, True, family="monospace")
    label(ax, 6, .3, "GET = read · POST = create · PUT = update · DELETE = remove", MUTED, 9.5)
    save(f, "c8_rest")

def c8_json():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    title(ax, 2.9, 3.2, "GeoJSON (JSON)"); title(ax, 9.0, 3.2, "GML (XML)")
    box(ax, .2, .3, 5.4, 2.6, "", "#F4F1EA", r=.05)
    for i, s in enumerate(['{ "type": "Feature",', '  "geometry": {', '    "type": "Point",', '    "coordinates": [55.3, 25.2] },', '  "properties": { "id": 12 } }']): label(ax, .4, 2.6 - i * .45, s, INK, 8.6, ha="left", family="monospace")
    box(ax, 6.3, .3, 5.5, 2.6, "", "#F4F1EA", r=.05)
    for i, s in enumerate(['<gml:Point srsName="EPSG:4326">', '  <gml:pos>25.2 55.3</gml:pos>', '</gml:Point>', '<id>12</id>']): label(ax, 6.5, 2.6 - i * .45, s, INK, 8.6, ha="left", family="monospace")
    save(f, "c8_json")

def c8_code():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    box(ax, .2, .3, 5.2, 3.0, "", "#F4F1EA", r=.05)
    for i, s in enumerate(["x = 5", "for i in 1 to 2:", "    x = x + i", "print(x)"]): label(ax, .5, 2.85 - i * .55, s, INK, 11, ha="left", family="monospace")
    label(ax, 8.4, 3.2, "Trace table", NAVY, 11, True)
    rows = [("step", "i", "x"), ("start", "–", "5"), ("loop 1", "1", "6"), ("loop 2", "2", "8")]
    for r, row in enumerate(rows):
        for c, v in enumerate(row):
            ax.add_patch(Rectangle((6.3 + c * 1.4, 2.5 - r * .5), 1.4, .5, fc=NAVY if r == 0 else ("#F3E7C9" if r == 3 else "white"), ec="#D9D3C7")); label(ax, 7.0 + c * 1.4, 2.75 - r * .5, v, "white" if r == 0 else INK, 10, r in (0, 3))
    label(ax, 8.4, .25, "prints 8", GREEN, 11, True)
    save(f, "c8_code")

def c8_test():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    for i, (a, b, c) in enumerate([("Unit", "one function", NAVY), ("Integration", "parts together", TEAL), ("System", "whole app", GOLD), ("User acceptance", "users approve", GREEN)]):
        box(ax, .1 + i * 3, .7, 2.7, 1.6, a, c, fs=11, sub=b)
        if i < 3: arrow(ax, (2.85 + i * 3, 1.5), (3.05 + i * 3, 1.5), ms=10)
    label(ax, 6, .25, "U → I → S → A", INK, 11, True)
    save(f, "c8_test")

def c8_git():
    f, ax = new(9.5, 2.6, (0, 12), (0, 3.0))
    ax.plot([.5, 11.5], [1.0, 1.0], color=NAVY, lw=3); xs = [1, 3, 5, 9, 11]
    for x in xs: ax.add_patch(Circle((x, 1.0), .22, color=NAVY, zorder=3))
    ax.plot([3, 4, 7, 9], [1.0, 2.2, 2.2, 1.0], color=GOLD, lw=3)
    for x in (4.6, 6.4): ax.add_patch(Circle((x, 2.2), .22, color=GOLD, zorder=3))
    label(ax, 1, .45, "main", NAVY, 10, True); label(ax, 5.5, 2.7, "feature branch: new tool", GOLD, 10, True); label(ax, 9, .45, "merge", GREEN, 10, True)
    save(f, "c8_git")

# ---------- AREA 9 ----------
def c9_plan():
    f, ax = new(9.5, 2.6, (0, 12.5), (0, 3.0))
    for i, (s, c) in enumerate([("Needs\nassessment", GOLD), ("Requirements", NAVY), ("Design", TEAL), ("Pilot", NAVY), ("Implement", TEAL), ("Maintain", GREEN)]):
        box(ax, .1 + i * 2.07, .9, 1.85, 1.3, s, c, fs=9.2)
        if i < 5: arrow(ax, (1.97 + i * 2.07, 1.55), (2.15 + i * 2.07, 1.55), ms=9)
    label(ax, 1.03, .45, "START HERE", GOLD, 9, True)
    save(f, "c9_plan")

def c9_req():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    box(ax, .2, .3, 5.6, 2.9, "", NAVY); box(ax, 6.2, .3, 5.6, 2.9, "", TEAL)
    label(ax, 3, 2.75, "Functional = WHAT", "white", 12.5, True); label(ax, 9, 2.75, "Non-functional = HOW WELL", "white", 12.5, True)
    for i, s in enumerate(["search by parcel ID", "print a map to PDF", "edit hydrants in the field"]): label(ax, 3, 2.0 - i * .55, "• " + s, "white", 10)
    for i, s in enumerate(["loads in < 2 seconds", "99.9% uptime", "HTTPS + MFA login"]): label(ax, 9, 2.0 - i * .55, "• " + s, "white", 10)
    save(f, "c9_req")

def c9_security():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    for i, (s, c) in enumerate([("Firewall / DMZ", RED), ("HTTPS encryption", GOLD), ("MFA + roles", TEAL), ("Patches & backups", GREEN)]):
        w = 6.4 - i * 1.4; ax.add_patch(FancyBboxPatch((3.2 - w / 2 + 0, .25 + i * .32), w, 3.2 - i * .64, boxstyle="round,pad=.02,rounding_size=.15", fc="none", ec=c, lw=3))
        label(ax, 3.2, 3.29 - i * .32, s, c, 8.8, True, bbox=dict(fc="white", ec="none", pad=.5))
    box(ax, 2.4, 1.35, 1.6, .7, "GIS data", NAVY, fs=9.5)
    label(ax, 7.1, 2.7, "Threats", RED, 11.5, True, ha="left")
    for i, s in enumerate(["phishing e-mails", "SQL injection in web forms", "ransomware", "weak passwords"]): label(ax, 7.1, 2.1 - i * .45, "✗ " + s, INK, 10, ha="left")
    save(f, "c9_security")

def c9_software():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    box(ax, .2, .3, 5.6, 2.9, "", NAVY); box(ax, 6.2, .3, 5.6, 2.9, "", GREEN)
    label(ax, 3, 2.75, "Commercial (COTS)", "white", 12.5, True); label(ax, 9, 2.75, "Open source", "white", 12.5, True)
    for i, s in enumerate(["+ vendor support, training", "+ integrated suite", "− licence fees"]): label(ax, 3, 2.0 - i * .55, s, "white", 10)
    for i, s in enumerate(["+ no licence fee", "+ change the code", "− needs in-house skills"]): label(ax, 9, 2.0 - i * .55, s, "white", 10)
    save(f, "c9_software")

def c9_arvr():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    title(ax, 2.9, 3.2, "AR: adds to the real view")
    ax.add_patch(Rectangle((.4, .3), 5, 2.6, fc="#D9D3C7")); ax.add_patch(Rectangle((.4, .3), 5, 1.1, fc="#B5AE9F"))
    ax.plot([.6, 5.2], [.75, .95], color=RED, lw=4, ls="--"); label(ax, 2.9, 1.25, "buried water pipe", RED, 9.5, True)
    title(ax, 9.1, 3.2, "VR: fully computer-made")
    ax.add_patch(Rectangle((6.6, .3), 5, 2.6, fc="#1F2B44"))
    for x, h in [(7.2, 1.2), (8.2, 1.8), (9.3, 1.0), (10.3, 1.5)]: ax.add_patch(Rectangle((x, .3), .7, h, fc="#4F7BB5", ec="#9DB6D8"))
    label(ax, 9.1, 2.6, "virtual city", "white", 9.5, True)
    save(f, "c9_arvr")

# ---------- AREA 10 ----------
def c10_policy():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    box(ax, .2, 1.1, 2.4, 1.2, "Data request", NAVY, fs=10)
    box(ax, 3.4, 1.1, 2.8, 1.2, "Licence &\npolicy allow?", GOLD, fs=10)
    box(ax, 7.0, 1.1, 2.4, 1.2, "Personal data\n(PII)?", TEAL, fs=10)
    box(ax, 10.0, 1.9, 1.9, .8, "remove it", RED, fs=9.5); box(ax, 10.0, .6, 1.9, .8, "share", GREEN, fs=9.5)
    arrow(ax, (2.7, 1.7), (3.3, 1.7)); arrow(ax, (6.3, 1.7), (6.9, 1.7)); label(ax, 6.6, 2.0, "yes", INK, 9)
    arrow(ax, (9.5, 1.9), (9.95, 2.3)); arrow(ax, (9.5, 1.4), (9.95, 1.0)); label(ax, 9.6, 2.4, "yes", INK, 8.5); label(ax, 9.6, .85, "no", INK, 8.5)
    label(ax, 4.8, .55, "no → do not share", RED, 9.5, True)
    save(f, "c10_policy")

def c10_limits():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    ax.add_patch(Rectangle((.4, .4), 2.4, 2.4, fc=LIGHT, ec=NAVY)); ax.add_patch(Rectangle((2.8, .4), 2.4, 2.4, fc="#F3E7C9", ec=GOLD))
    ax.plot([2.8, 2.8], [.4, 2.8], color=RED, lw=3, ls="--"); label(ax, 2.8, 3.1, "disputed line?", RED, 10, True)
    label(ax, 6.0, 2.4, "GIS map: shows parcels", INK, 10.5, ha="left"); label(ax, 6.0, 1.8, "Legal boundary decision:", INK, 10.5, ha="left")
    label(ax, 6.0, 1.2, "→ licensed surveyor", GREEN, 12, True, ha="left")
    save(f, "c10_limits")

def c10_gantt():
    f, ax = new(9.5, 3, (0, 12), (0, 3.6))
    tasks = [("Collect data", 0, 3, True), ("Clean data", 3, 2, True), ("Build web map", 3, 2, False), ("Analysis", 5, 3, True), ("Report", 8, 2, True)]
    for i, (n, s, d, crit) in enumerate(tasks):
        y = 2.9 - i * .6; label(ax, 2.0, y + .2, n, INK, 9.5, ha="right")
        ax.add_patch(Rectangle((2.3 + s * .9, y), d * .9, .4, fc=RED if crit else LIGHT, ec=RED if crit else NAVY))
    for w in range(11): ax.plot([2.3 + w * .9, 2.3 + w * .9], [.2, 3.4], color="#E7E2D7", lw=.6, zorder=0)
    label(ax, 6.8, .0, "weeks 0–10   ·   red = critical path (any delay delays the project)", RED, 9.5, True)
    ax.set_ylim(-.3, 3.6); save(f, "c10_gantt")

def c10_comm():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.4))
    for i, (a, b, c) in enumerate([("Executives", "1-page summary\n+ clear map + decision", NAVY), ("Public", "simple story map,\nplain words", TEAL), ("Technical team", "full method, data\nsources, limits", GOLD)]):
        box(ax, .2 + i * 4, .3, 3.6, 2.8, "", c); label(ax, 2 + i * 4, 2.5, a, "white", 12, True); label(ax, 2 + i * 4, 1.3, b, "white", 9.8)
    save(f, "c10_comm")

def c10_fields():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.6))
    items = [("Planning", "zoning, land use"), ("Utilities", "pipes, outages"), ("Agriculture", "precision farming"), ("Health", "disease clusters"), ("Emergency", "911 routing"), ("Environment", "habitats, floods"), ("Transport", "routes, traffic"), ("Business", "site selection")]
    for i, (a, b) in enumerate(items):
        x = (i % 4) * 3 + .1; y = 1.9 if i < 4 else .15
        box(ax, x, y, 2.8, 1.5, "", [NAVY, TEAL, GREEN, GOLD][i % 4]); label(ax, x + 1.4, y + 1.0, a, "white", 10.5, True); label(ax, x + 1.4, y + .45, b, "white", 8.8)
    save(f, "c10_fields")

def c10_orgs():
    f, ax = new(9.5, 2.8, (0, 12), (0, 3.6))
    items = [("GISCI", "GISP certification"), ("URISA", "urban & regional IS"), ("ASPRS", "photogrammetry &\nremote sensing"), ("UCGIS", "education · GIS&T\nBody of Knowledge"), ("OGC", "open standards"), ("AAG", "geographers")]
    for i, (a, b) in enumerate(items):
        x = (i % 3) * 4 + .15; y = 1.9 if i < 3 else .1
        box(ax, x, y, 3.7, 1.55, "", [GOLD, NAVY, TEAL][i % 3] if i else GOLD); label(ax, x + 1.85, y + 1.1, a, "white", 12, True); label(ax, x + 1.85, y + .45, b, "white", 8.8)
    save(f, "c10_orgs")

def c10_gisp():
    f, ax = new(9.5, 2.6, (0, 12.5), (0, 3.0))
    for i, (a, b, c) in enumerate([("Portfolio", "education, 4+ years'\nexperience, contributions", NAVY), ("Code of Ethics", "sign it", TEAL), ("Exam", "pass the GISCI\ncore exam", GOLD), ("GISP", "recertify every\n3 years", GREEN)]):
        box(ax, .1 + i * 3.1, .5, 2.8, 2.0, "", c); label(ax, 1.5 + i * 3.1, 2.05, a, "white", 11.5, True); label(ax, 1.5 + i * 3.1, 1.2, b, "white", 9)
        if i < 3: arrow(ax, (2.95 + i * 3.1, 1.5), (3.15 + i * 3.1, 1.5), ms=10)
    save(f, "c10_gisp")

for fn in [c6_query, c6_buffer, c6_thiessen, c6_network, c6_interp, c6_hydro, c6_hotspot, c6_centre, c7_card, c7_stages, c7_norm, c7_domain, c7_version, c7_sql, c7_cia, c8_protocols, c8_rest, c8_json, c8_code, c8_test, c8_git, c9_plan, c9_req, c9_security, c9_software, c9_arvr, c10_policy, c10_limits, c10_gantt, c10_comm, c10_fields, c10_orgs, c10_gisp]:
    try: fn()
    except Exception as e: print("FAIL", fn.__name__, e)
