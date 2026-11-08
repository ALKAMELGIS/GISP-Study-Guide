// GISP Exam — The Exam Memory Guide (easy-to-read general summary)
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
  AlignmentType, BorderStyle, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader, LevelFormat, Header, Footer, PageNumber, SectionType, TabStopType, VerticalAlign,
} = require("docx");

const D = JSON.parse(fs.readFileSync("../../src/data.json", "utf8"));
const C = require("./content2.js");
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const shuffleQ = ([q, o, a, ex, ar]) => { const idx = o.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const na = a.split("").map(L => "ABCD"[idx.indexOf("ABCD".indexOf(L))]).sort().join(""); return [q, idx.map(i => o[i]), na, ex, ar]; };
const QS = [...D.questions, ...require("./qbank2.js").map(shuffleQ)].map((q, i) => [...q, i]).sort((a, b) => a[4] - b[4] || a[5] - b[5]);

const NAVY = "1F4E8C", INK = "1E1B17", MUTED = "5B554B", GOLD = "B8902F", LINE = "D9D3C7", TINT = "EEF3F9",
  CREAM = "FBF8F1", GOLDT = "FBF3E0", RED = "A33B2B", REDT = "FBEDEA", GREEN = "2E6B3F", GREENT = "EAF4EC";
const FONT = "Calibri", SERIF = "Georgia";
const W = 10466;
const BS = 22; // body size 11pt

const t = (text, o = {}) => new TextRun({ text, font: o.font || FONT, size: o.size || BS, bold: o.bold, italics: o.italics, color: o.color || INK });
const p = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [typeof runs === "string" ? t(runs) : runs],
  spacing: { before: o.before ?? 0, after: o.after ?? 100 }, alignment: o.align, keepNext: o.keepNext, keepLines: o.keepLines,
  indent: o.indent, border: o.border, numbering: o.numbering, pageBreakBefore: o.pageBreakBefore });
const bullet = (runs, ref = "dot", after = 70) => p(runs, { numbering: { reference: ref, level: 0 }, after });
const gap = (n = 160) => p([t("", { size: 8 })], { after: n });
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const cellB = { top: thin, bottom: thin, left: thin, right: thin };
const h2 = (txt, color = NAVY) => p([t(txt, { font: SERIF, size: 26, bold: true, color })], { before: 220, after: 90, keepNext: true });

const TOC = [];
const PAGES = fs.existsSync("./pages.json") ? JSON.parse(fs.readFileSync("./pages.json", "utf8")) : {};
const h1 = (txt, sub, brk = true) => { TOC.push([txt]); return [
  p([t(txt, { font: SERIF, size: 40, bold: true })], { pageBreakBefore: brk, after: 40, keepNext: true }),
  p([t("", { size: 4 })], { after: sub ? 60 : 160, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } }, indent: { right: W - 1100 } }),
  ...(sub ? [p([t(sub, { italics: true, color: MUTED })], { after: 160 })] : []) ]; };
function table(cols, rows, o = {}) {
  const total = cols.reduce((a, b) => a + b, 0);
  const n = rows.length;
  const mk = (cells, head, ri) => new TableRow({ tableHeader: head, cantSplit: true,
    children: cells.map((c, i) => new TableCell({
      width: { size: cols[i], type: WidthType.DXA }, borders: cellB, verticalAlign: VerticalAlign.CENTER,
      margins: o.tight ? { top: 18, bottom: 18, left: 90, right: 90 } : { top: 70, bottom: 70, left: 110, right: 110 },
      shading: head ? { type: ShadingType.CLEAR, color: "auto", fill: o.headFill || NAVY } : (o.zebra && ri % 2 ? { type: ShadingType.CLEAR, color: "auto", fill: CREAM } : (o.firstFill && i === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: o.firstFill } : undefined)),
      children: (Array.isArray(c) ? c : [c]).map(x => x instanceof Paragraph ? x :
        p([t(String(x), { bold: head || (o.boldFirst && i === 0), color: head ? "FFFFFF" : (o.boldFirst && i === 0 ? NAVY : INK), size: o.size || 21 })], { after: 0, keepNext: !!o.keep && ri < n - 1 })),
    })) });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: cols,
    rows: [...(o.head ? [mk(o.head, true, -1)] : []), ...rows.map((r, ri) => mk(r, false, ri))] });
}
function box(title, lines, fill = TINT, bar = NAVY) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ cantSplit: true, children: [new TableCell({
    width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: "auto", fill },
    borders: { top: NB, bottom: NB, right: NB, left: { style: BorderStyle.SINGLE, size: 28, color: bar } },
    margins: { top: 120, bottom: 120, left: 200, right: 180 },
    children: [...(title ? [p([t(title, { bold: true, color: bar, size: 23 })], { after: 80 })] : []), ...lines],
  })] })] });
}
function band(left, right) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W - 3000, 3000], rows: [new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: W - 3000, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY }, margins: { top: 160, bottom: 160, left: 240, right: 120 }, verticalAlign: VerticalAlign.CENTER, children: left }),
    new TableCell({ width: { size: 3000, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, shading: { type: ShadingType.CLEAR, color: "auto", fill: GOLD }, margins: { top: 160, bottom: 160, left: 120, right: 200 }, verticalAlign: VerticalAlign.CENTER, children: right }),
  ] })] });
}
const img = (file, w, h) => new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: w, height: h },
  altText: { title: file, description: file, name: file } });

// ---------- cover ----------
const fullPage = (file) => p([new ImageRun({ type: "jpg", data: fs.readFileSync(file), transformation: { width: 794, height: 1123 },
  floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, allowOverlap: true },
  altText: { title: "cover", description: "GISP The Exam Memory Guide cover", name: "cover" } })], { after: 0 });
const cover = [fullPage("./cover/cover_a4.jpg")];
const back = [fullPage("./cover/back_a4.jpg")];

// ---------- the exam on one page ----------
const body = [];
body.push(...h1("The exam on one page", "", true));
body.push(table([2600, W - 2600], [
  ["What", "GISCI Geospatial Core Technical Knowledge Exam (needed for the GISP)"],
  ["Questions", "100 scored + up to 60 unscored test questions. You can't tell which, so treat all as real"],
  ["Time", "4 hours: about 1.5 minutes per question"],
  ["Pass mark", "Scaled score of 73 (pass / fail)"],
  ["Content", "2019 blueprint: 10 knowledge areas, 45 skills (KSAs)"],
  ["Style", "Concepts, not software buttons. Scenarios, formulas, NOT/EXCEPT, select-all, pseudocode"],
], { boldFirst: true, firstFill: TINT }));
body.push(h2("Where the marks are"));
body.push(p([img("./weights.png", 640, 320)], { align: AlignmentType.CENTER, after: 80 }));
body.push(p([t("Areas 1–7 give 78% of the marks. Learn them first.", { bold: true, color: NAVY })], { align: AlignmentType.CENTER, after: 160 }));
body.push(box("How to remember it all", [
  bullet([t("Read ", {}), t("one area a day", { bold: true }), t(". Start with the big idea, then the bullets.")]),
  bullet([t("Say the "), t("memory tricks", { bold: true }), t(" out loud. Saying beats re-reading.")]),
  bullet([t("Cover the answers and do the "), t("Test yourself", { bold: true }), t(" questions. Retrieval is what makes facts stick.")]),
  bullet([t("Come back to the same area after "), t("1 day, 3 days and 7 days", { bold: true }), t(" (spaced repetition).")]),
  bullet([t("Read the "), t("Night before", { bold: true }), t(" page every day of the last week.")]),
]));

const FIGS = {
  1: [["a1_heights", "Three surfaces, three heights"], ["a1_projections", "Projection families"], ["a1_utm", "How UTM zones work"]],
  2: [["a2_models", "Vector, raster and TIN"], ["a2_accuracy", "Accuracy vs precision"], ["a2_scale", "Large scale vs small scale"]],
  3: [["a3_visvars", "Levels of measurement and visual variables"], ["a3_choro", "Rates → choropleth, totals → symbols"], ["a3_schemes", "Colour schemes"], ["a3_surfaces", "Ways to show a surface"]],
  4: [["a4_spectral", "Why NDVI works"], ["a4_dop", "Satellite geometry and PDOP"], ["a4_confusion", "Reading a confusion matrix"]],
  5: [["a5_georef", "Georeferencing with control points"], ["a5_resample", "Resampling methods"], ["a5_generalise", "Generalisation operators"]],
  6: [["a6_overlay", "Overlay tools"], ["a6_mapalgebra", "The four map-algebra operations"], ["a6_classify", "Classification methods on the same data"], ["a6_patterns", "Spatial patterns"]],
  7: [["a7_erd", "Keys, cardinality and a junction table"], ["a7_join", "Join vs relate"]],
  8: [["a8_webgis", "How a web map request works"], ["a8_dev", "Development methods and testing order"]],
  9: [["a9_tiers", "Three-tier architecture with a DMZ"], ["a9_cloud", "Who manages what in the cloud"]],
  10: [["a10_pm", "Project phases and the triple constraint"], ["a10_ethics", "The Code of Ethics in one picture"]],
};
const figImg = (name) => { const b = fs.readFileSync(`./figs/${name}.png`); const w = b.readUInt32BE(16), h = b.readUInt32BE(20); const W2 = 640; return new ImageRun({ type: "png", data: b, transformation: { width: W2, height: Math.round(W2 * h / w) }, altText: { title: name, description: name, name } }); };
const CARDS = { ...require("./cards1.js"), ...require("./cards2.js") };
const cardImg = (name) => { const b = fs.readFileSync(`./figs/${name}.png`); const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  let W2 = 600, H2 = Math.round(W2 * h / w); if (H2 > 270) { H2 = 270; W2 = Math.round(H2 * w / h); }
  return new ImageRun({ type: "png", data: b, transformation: { width: W2, height: H2 }, altText: { title: name, description: name, name } }); };
const tag = (s, c) => t(s + "   ", { bold: true, color: c, size: 17 });
function card(c, num) {
  const sh = (fill, bar, runs, o = {}) => new Paragraph({ children: runs, shading: { type: ShadingType.CLEAR, color: "auto", fill },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: bar, space: 8 } }, indent: { left: 200 + (o.ind || 0), right: 120 },
    spacing: { before: o.before ?? 0, after: o.after ?? 0 }, keepNext: true, keepLines: true });
  const kids = [
    p([t(num + "  ", { font: SERIF, bold: true, color: GOLD, size: 28 }), t(c.t, { font: SERIF, bold: true, color: NAVY, size: 28 })], { after: 100, keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 } } }),
    sh(TINT, NAVY, [tag("DEFINITION", NAVY), t(c.d, { size: 23 })], { before: 0 }),
    p([tag("EXAMPLE", GREEN), t(c.e, { size: 22 })], { before: 140, after: 100, keepNext: true }),
    p([cardImg(c.f)], { align: AlignmentType.CENTER, after: 120, keepNext: true }),
    sh(GREENT, GREEN, [t("LIKELY EXAM QUESTION", { bold: true, color: GREEN, size: 17 })], { before: 0 }),
    sh(GREENT, GREEN, [t(c.q, { bold: true, size: 22 })], { after: 40 }),
    ...c.o.map((o, k) => sh(GREENT, GREEN, [t(`      ${"ABCD"[k]})  ${o}`, { size: 21 })])),
    sh(GREENT, GREEN, [t(`✔ Answer: ${c.a}`, { bold: true, color: GREEN, size: 20 }), t(`  ·  ${c.w}`, { italics: true, color: MUTED, size: 20 })], { before: 60, after: 0 }),
  ];
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], rows: [new TableRow({ cantSplit: true, children: [new TableCell({
    width: { size: W, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: kids })] })] }),
    p([t("", { size: 4 })], { after: 260 })];
}
const EXTRA = {
  2: [["Validation & uncertainty", "Validation = checking data against rules and references: topology rules, domains, range checks, field checks and comparison with better data. Uncertainty = what we do not know about a value. Report it with RMSE, confidence levels or error bands, and remember fuzzy boundaries (soil or vegetation edges). Errors propagate through analysis: the result is never better than the weakest input."]],
  10: [["Documenting & communicating", "Record methods, data sources, assumptions and limits (metadata, project reports, README files). Match the message to the audience: managers want results and decisions, technical staff want methods. Use clear maps, dashboards and story maps, and state uncertainty honestly."]],
};
// ---------- KSA checklist ----------
body.push(...h1("Your coverage checklist", null)); body.push(p([t("These are all 45 skills (KSAs) on the official 2019 blueprint. Every one is covered in this guide. Tick a box when you can explain the skill without looking.", { italics: true, color: MUTED })], { after: 120 }));
body.push(table([800, W - 800 - 1100 - 2000, 1100, 2000], D.areas.flatMap(a => a.ksas.map(k => { const m = k.match(/^(\d+)\s+(.*)$/); return [m[1], m[2], "Area " + a.n, "☐ Read    ☐ Know it"]; })), { head: ["KSA", "Skill", "Where", "Progress"], zebra: true, size: 18, tight: true }));

// ---------- the 10 areas ----------
C.forEach((A) => {
  const a = D.areas.find(x => x.n === A.n);
  TOC.push([`Area ${a.n} · ${a.title}`, a.w, a.title]);
  body.push(p([t("", { size: 4 })], { pageBreakBefore: true, after: 0 }));
  body.push(band(
    [p([t(`AREA ${a.n}`, { bold: true, color: "C9D8EC", size: 20 })], { after: 20 }), p([t(a.title, { font: SERIF, bold: true, color: "FFFFFF", size: 36 })], { after: 0 })],
    [p([t(`${a.w}%`, { font: SERIF, bold: true, color: "FFFFFF", size: 44 })], { align: AlignmentType.RIGHT, after: 0 }), p([t(`≈ ${a.w} of 100 questions`, { color: "FFFFFF", size: 19 })], { align: AlignmentType.RIGHT, after: 0 })]
  ));
  body.push(gap(140));
  body.push(box("The big idea", [p([t(A.big, { font: SERIF, size: 25, italics: true })], { after: 0 })], GOLDT, GOLD));
  const cards = CARDS[a.n];
  body.push(h2(`Learn it: ${cards.length} concepts, one by one`));
  body.push(p([t("Each concept: ", { color: MUTED, size: 20 }), t("definition → example → picture → exam question", { bold: true, color: NAVY, size: 20 })], { after: 160 }));
  cards.forEach((c, i) => body.push(...card(c, `${a.n}.${i + 1}`)));
  body.push(gap(120));
  body.push(box("Memory tricks", A.tricks.map(([k, v]) => p([t("★  ", { color: GOLD, bold: true }), t(k, { bold: true }), t("   " + v, { color: MUTED })], { after: 70 })), TINT, NAVY));
  body.push(h2("If the question says… think…"));
  body.push(table([W / 2, W / 2], A.keys, { head: ["If the question says…", "…think"], zebra: true, keep: true }));
  body.push(h2("Don't fall for it", RED));
  a.traps.forEach(x => body.push(bullet([t(x)], "cross", 70)));
  body.push(gap(80));
  body.push(box("Test yourself  (cover the answers)", A.test.flatMap(([q, ans], i) => [
    p([t(`${i + 1}.  `, { bold: true, color: GREEN }), t(q, { bold: true })], { after: 30, keepNext: true }),
    p([t("Answer: " + ans, { size: 19, color: MUTED, italics: true })], { after: 90, indent: { left: 300 } }),
  ]), GREENT, GREEN));
});

// ---------- confused pairs ----------
body.push(...h1("Pairs people mix up", "The exam loves to test the difference. Read across each row."));
body.push(table([1900, 1900, W - 3800], D.pairs.map(([x, y, d]) => [x, y, d]), { head: ["This", "vs this", "The difference"], zebra: true, size: 20 }));

// ---------- numbers ----------
body.push(...h1("Numbers & formulas", "Every number the exam can ask you to use or calculate."));
body.push(table([3200, W - 3200], D.numbers, { boldFirst: true, zebra: true, size: 21, keep: D.numbers.length < 28 }));

// ---------- night before ----------
body.push(...h1("The night before: 40 facts", "If you remember only one page, make it this one."));
const half = Math.ceil(C.top.length / 2);
const mini = (arr, start) => arr.map(([k, v], i) => p([t(`${start + i}. `, { bold: true, color: GOLD, size: 19 }), t(k + ": ", { bold: true, color: NAVY, size: 19 }), t(v, { size: 19 })], { after: 70 }));
body.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W / 2, W / 2], rows: [new TableRow({ children: [
  new TableCell({ width: { size: W / 2, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: thin }, margins: { left: 60, right: 200 }, children: mini(C.top.slice(0, half), 1) }),
  new TableCell({ width: { size: W / 2, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { left: 200, right: 60 }, children: mini(C.top.slice(half), half + 1) }),
] })] }));
body.push(gap(120));
body.push(box("On exam day", [
  bullet([t("Arrive 30 minutes early with the ID that matches your Pearson VUE booking.")], "check"),
  bullet([t("Read NOT / EXCEPT and \"select all\" questions twice.")], "check"),
  bullet([t("Remove two wrong answers first, then pick the one that is true in every case.")], "check"),
  bullet([t("Flag hard questions and move on. Answer everything: no penalty for guessing.")], "check"),
], GREENT, GREEN));

// ---------- practice ----------
body.push(...h1(`${QS.length} practice questions`, "Original questions in the exam's style, grouped by knowledge area in proportion to the blueprint weights (not official GISCI items)."));
body.push(box("Are you ready?", [
  bullet([t("Answer all questions without looking, then mark them with the key.")]),
  bullet([t("80% or more", { bold: true }), t(" in every area: you are in good shape. Below 70% in an area: re-read its concept cards.")]),
  bullet([t("Redo every question you got wrong after 3 days.")]),
], GOLDT, GOLD));
let lastArea = 0;
QS.forEach(([q, opts, ans, ex, area], i) => {
  if (area !== lastArea) { lastArea = area; const a = D.areas.find(x => x.n === area);
    body.push(p([t(`Area ${area} · ${a.title}`, { font: SERIF, size: 26, bold: true, color: NAVY })], { before: 260, after: 60, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 3 } } })); }
  body.push(p([t(`${i + 1}. `, { bold: true, color: NAVY }), t(q, { bold: true })], { before: 100, after: 40, keepNext: true }));
  opts.forEach((o, k) => body.push(p([t(`${"ABCD"[k]})  ${o}`, { size: 21 })], { after: 20, indent: { left: 360 }, keepNext: k < opts.length - 1 })));
});
body.push(...h1("Answer key", null));
body.push(table([600, 900, 700, W - 2200], QS.map(([q, o, ans, ex, area], i) => [String(i + 1), ans, String(area), ex]), { head: ["Q", "Answer", "Area", "Why"], zebra: true, size: 18, tight: true }));

// ---------- glossary (two columns) ----------
const gl = D.areas.flatMap(a => a.terms.map(([k, v]) => [k, v, a.n])).sort((x, y) => x[0].localeCompare(y[0]));
const glossary = [...h1("Glossary", `${gl.length} exam terms, A to Z. The number is the knowledge area.`)];
glossary.push(table([2900, 600, W - 3500], gl.map(([k, v, n]) => [k, String(n), v]), { head: ["Term", "Area", "Meaning"], boldFirst: true, zebra: true, size: 19 }));
glossary.push(p([t("Independent study material based on the 2019 GISCI exam blueprint. Not affiliated with or endorsed by GISCI. Practice questions are original, not official exam items. Official information: gisci.org.  © 2026 Mohamed Alkamel.", { italics: true, color: MUTED, size: 16 })], { before: 200, border: { top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 6 } } }));

// ---------- contents ----------
function contents() {
  const out = [p([t("Contents", { font: SERIF, size: 40, bold: true })], { after: 40 }),
    p([t("", { size: 4 })], { after: 220, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } }, indent: { right: W - 1100 } })];
  const row = (label, pg, o = {}) => new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W, leader: "dot" }], spacing: { after: o.after ?? 110 }, indent: o.indent, children: [
    t(label, { size: o.size || 23, bold: o.bold, color: o.color || INK, font: o.font }),
    ...(o.tag ? [t("   " + o.tag, { size: 18, color: GOLD, bold: true })] : []),
    new TextRun({ text: "\t" + String(pg ?? ""), font: FONT, size: 23, bold: true, color: NAVY })] });
  let areasHead = false;
  TOC.forEach(([label, w, title]) => {
    if (w !== undefined && !areasHead) { areasHead = true; out.push(p([t("THE TEN KNOWLEDGE AREAS", { size: 18, bold: true, color: GOLD })], { before: 160, after: 100 })); }
    if (w === undefined && areasHead && label === "Pairs people mix up") out.push(p([t("REVIEW & PRACTICE", { size: 18, bold: true, color: GOLD })], { before: 200, after: 100 }));
    out.push(w !== undefined ? row(`${label.split(" · ")[0].replace("Area ", "")}.  ${title}`, PAGES[label], { tag: `${w}%`, indent: { left: 200 } }) : row(label, PAGES[label], { bold: true }));
  });
  out.push(gap(200));
  out.push(box("How to use this book", [
    bullet([t("Each area follows the same order: "), t("big idea → concept cards (definition, example, picture, exam question) → memory tricks → keywords → traps → test yourself.", { bold: true })]),
    bullet([t("First pass: read every definition and example. Second pass: cover the answers and do the exam questions.")]),
    bullet([t("Finish with the 150 questions and the night-before page.")]),
  ]));
  fs.writeFileSync("./toc.json", JSON.stringify(TOC.map(x => [x[0], x[2] || x[0]])));
  return out;
}

// ---------- document ----------
const header = new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } }, children: [t("GISP · The Exam Memory Guide", { color: MUTED, size: 16 }), new TextRun({ text: "\tMohamed Alkamel", font: FONT, size: 16, color: MUTED })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED })] })] });
const page = { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 720, right: 720, header: 400, footer: 400 } };
const lvl = (text, color) => ({ level: 0, format: LevelFormat.BULLET, text, alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 260 } }, run: { color, font: FONT, bold: true } } });

const doc = new Document({
  creator: "Mohamed Alkamel", title: "GISP — The Exam Memory Guide", description: "Easy-to-read summary of the GISCI Geospatial Core Technical Knowledge Exam",
  styles: { default: { document: { run: { font: FONT, size: BS, color: INK } } } },
  numbering: { config: [ { reference: "dot", levels: [lvl("•", NAVY)] }, { reference: "cross", levels: [lvl("✗", RED)] }, { reference: "check", levels: [lvl("✓", GREEN)] } ] },
  sections: [
    { properties: { page }, children: cover },
    { properties: { page, type: SectionType.NEXT_PAGE}, headers: { default: header }, footers: { default: footer }, children: [...contents(), ...body, ...glossary] },
    { properties: { page, type: SectionType.NEXT_PAGE }, children: back },
    
  ],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync("./GISP_Exam_Memory_Guide.docx", b); console.log("written", b.length); });
