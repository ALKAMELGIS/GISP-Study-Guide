const fs = require("fs");
const D = require("docx");
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, HeadingLevel, Footer, PageNumber, LevelFormat, TextWrappingType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, PageBreak, VerticalAlign } = D;
const C = require("./content");

const NAVY = "0B2545", TEAL = "13A89E", AMBER = "F2A541", LIGHT = "EEF4F8", INK = "1F2A37", MUTED = "5B6B7C";
const FONT = "Arial";
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1080; // A4, 0.75"
const CW = PAGE_W - 2 * MARGIN; // 9746

const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: none, bottom: none, left: none, right: none };
const thin = (c = "D5DEE7") => ({ style: BorderStyle.SINGLE, size: 4, color: c });

const t = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 100, line: 276 }, ...o });
const body = (text, o = {}) => p([t(text, { size: 21, color: INK })], o);
const bullet = (runs, level = 0) => new Paragraph({ numbering: { reference: "bul", level }, spacing: { after: 70, line: 264 }, children: runs });

function h1(num, title, weight) {
  return [
    new Paragraph({ pageBreakBefore: true, spacing: { after: 0 }, children: [t(num ? `KNOWLEDGE AREA ${num}` : " ", { size: 18, bold: true, color: AMBER, characterSpacing: 40 })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(title)] }),
    ...(weight ? [new Paragraph({ spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 6 } },
      children: [t(`Exam weight: ${weight}%  •  about ${weight} of 100 scored questions`, { size: 19, color: MUTED })] })] : [
      new Paragraph({ spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 6 } }, children: [] })]),
  ];
}
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(text)] });

function callout(title, items, fill, bar, icon) {
  const kids = [new Paragraph({ spacing: { after: 80 }, children: [t(`${icon}  ${title}`, { bold: true, size: 20, color: NAVY })] })];
  items.forEach(i => kids.push(new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 50, line: 260 }, children: [t(i, { size: 19, color: INK })] })));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], rows: [new TableRow({ children: [
    new TableCell({ width: { size: CW, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      borders: { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 36, color: bar } },
      margins: { top: 140, bottom: 120, left: 220, right: 200 }, children: kids })] })] });
}
const gap = (a = 120) => new Paragraph({ spacing: { after: a }, children: [] });

function termTable(rows, headers = ["Exam keyword", "Simple meaning"], widths = [3000, CW - 3000]) {
  const hdr = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: NAVY, color: "auto" },
    borders: { top: thin(NAVY), bottom: thin(NAVY), left: thin(NAVY), right: thin(NAVY) }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [t(h, { bold: true, color: "FFFFFF", size: 19 })] })] })) });
  const body = rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: ri % 2 ? "FFFFFF" : LIGHT, color: "auto" },
    borders: { top: thin(), bottom: thin(), left: thin(), right: thin() }, margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ spacing: { line: 252 }, children: [t(c, { size: 19, bold: i === 0, color: i === 0 ? NAVY : INK })] })] })) }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: widths, rows: [hdr, ...body] });
}

function img(file, w, h) { return new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: w, height: h } }); }

// ---------------- COVER ----------------
const coverSection = {
  properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 } } },
  children: [new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync("cover.png"),
    transformation: { width: 794, height: 1123 },
    floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
      wrap: { type: TextWrappingType.NONE }, behindDocument: true, allowOverlap: true } })] })],
};

// ---------------- MAIN ----------------
const kids = [];

// Contents
kids.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t("Contents")] }));
kids.push(new Paragraph({ spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 6 } }, children: [] }));
const toc = [["A", "The exam at a glance"], ["B", "Your 4-week plan"],
  ...C.areas.map(a => [String(a.n), `${a.title}  (${a.w}%)`]),
  ["C", "Commonly confused pairs"], ["D", "Numbers & formulas to memorise"], ["E", "46 practice questions"], ["F", "Answer key with explanations"], ["G", "Exam-day strategy & sources"]];
toc.forEach(([n, s]) => kids.push(new Paragraph({ spacing: { after: 90 }, children: [
  t(`${n}`.padEnd(3, " "), { bold: true, color: AMBER, size: 22 }), t("   " + s, { size: 22, color: NAVY })] })));
kids.push(gap(200));
kids.push(callout("How to use this guide", [
  "Each knowledge area has: the official KSA codes, simple key ideas, an exam-keyword table, exam traps, and lessons from GISCI's retired official practice exam.",
  "Watch the GISP Study YouTube video with the SAME KSA number (e.g., '101 Datums…') right after reading that section.",
  "The exam is software-agnostic: learn concepts, not button names.",
  "Do the 46 practice questions without looking, then check the answer key.",
], LIGHT, TEAL, "◆"));

// A. Exam at a glance
kids.push(...h1(null, "A. The exam at a glance"));
const facts = [
  ["Official name", "GISCI Geospatial Core Technical Knowledge Exam®"],
  ["Blueprint for December 2026", "2019 Exam Blueprint — 10 knowledge areas, 45 KSAs (the new 2026 blueprint starts with the June 2027 exam)"],
  ["Questions", "100 scored + up to 60 unscored pre-test questions (you cannot tell which is which — treat all as real)"],
  ["Time", "4 hours (average candidate finishes in about 3 hours)"],
  ["Passing", "Scaled score of 73; results reported as pass/fail only"],
  ["Where / when", "Proctored Pearson VUE test centres, June and December windows"],
  ["Level", "Written at a 4-year professional-experience level; software-agnostic"],
  ["Question styles", "Single best answer, 'Select all that apply', NOT/EXCEPT questions, short scenarios, formulas, graphics, pseudocode"],
  ["Official practice exam", "50 retired questions on PSI G*Metrix, $30, 2 attempts, 1 hour each, 73% to pass"],
];
kids.push(termTable(facts, ["Item", "Details"], [2900, CW - 2900]));
kids.push(gap(160));
kids.push(h2("Where the questions come from"));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [img("weights.png", 620, 336)] }));
kids.push(body("Area 2 (Geospatial Data Fundamentals) is the biggest at 15%. Areas 1–7 together are 78% of the exam — master them first, then cover 8–10.", { spacing: { before: 80, after: 100 } }));

// B. Plan
kids.push(...h1(null, "B. Your 4-week plan"));
const plan = [
  ["Week 1", "Areas 1 + 2 (25%)", "Datums & projections, data models, topology, data quality, metadata, standards. Watch videos 101–104 and 201–208."],
  ["Week 2", "Areas 3 + 4 + 5 (32%)", "Cartography, GNSS, remote sensing, lidar, georeferencing, generalisation, file formats. Videos 301–304, 401–405, 501–504."],
  ["Week 3", "Areas 6 + 7 (21%)", "SQL, classification, overlay, map algebra, statistics, database design and security. Videos 601–605, 701–704. Do practice questions 1–35."],
  ["Week 4", "Areas 8 + 9 + 10 (22%) + review", "Protocols, coding basics, Agile, architecture, cloud, ethics, project management. Take the official practice exam, revise weak areas, re-read sections C and D twice."],
  ["Last 2 days", "Light review only", "Keyword tables + confused pairs + formulas. Sleep well; check your Pearson VUE confirmation and ID."],
];
kids.push(termTable(plan, ["When", "Focus", "What to do"], [1500, 2500, CW - 4000]));
kids.push(gap(160));
kids.push(callout("Daily routine (about 1.5–2 hours)", [
  "20 min — read one section of this guide.",
  "30–40 min — watch the matching GISP Study video(s).",
  "20 min — make flashcards from the keyword table (or use the Quizlet sets GISCI lists).",
  "15 min — practice questions; write down WHY each wrong answer is wrong.",
], "FFF6E8", AMBER, "◆"));

// Areas
C.areas.forEach(a => {
  kids.push(...h1(a.n, a.title, a.w));
  kids.push(new Paragraph({ spacing: { after: 60 }, children: [t("Blueprint KSAs", { bold: true, size: 19, color: TEAL })] }));
  a.ksas.forEach(k => kids.push(new Paragraph({ spacing: { after: 30 }, indent: { left: 200 }, children: [
    t(k.split(" ")[0] + "  ", { bold: true, size: 19, color: AMBER }), t(k.split(" ").slice(1).join(" "), { size: 19, color: MUTED })] })));
  kids.push(gap(80));
  kids.push(h2("Key ideas"));
  a.ideas.forEach(([b, x]) => kids.push(bullet([t(b + ": ", { bold: true, size: 21, color: NAVY }), t(x, { size: 21, color: INK })])));
  kids.push(gap(80));
  kids.push(h2("Exam keywords"));
  kids.push(termTable(a.terms));
  kids.push(gap(160));
  kids.push(callout("Exam traps", a.traps, "FFF6E8", AMBER, "⚠"));
  kids.push(gap(120));
  kids.push(callout("Lessons from GISCI's retired practice exam (question → answer)", a.lessons, "E7F6F4", TEAL, "✓"));
});

// C. Pairs
kids.push(...h1(null, "C. Commonly confused pairs"));
kids.push(body("Many wrong options are the 'twin' of the right answer. Know the difference in one line."));
kids.push(termTable(C.pairs.map(([a, b, d]) => [a + "  vs  " + b, d]), ["Pair", "The difference"], [3200, CW - 3200]));

// D. Numbers
kids.push(...h1(null, "D. Numbers & formulas to memorise"));
kids.push(termTable(C.numbers, ["Topic", "Remember"], [2900, CW - 2900]));
kids.push(gap(160));
kids.push(callout("Worked RMSE example", [
  "Sample A: 100 points, sum of squared errors = 400 → 400 ÷ 100 = 4 → √4 = 2.",
  "Sample B: 10 points, sum = 90 → 90 ÷ 10 = 9 → √9 = 3.",
  "Lower RMSE = more accurate → Sample A wins.",
], LIGHT, TEAL, "◆"));

// E. Questions
kids.push(...h1(null, "E. Practice questions"));
kids.push(body("Original exam-style questions covering all 10 areas. Answer them all first, then check section F."));
let lastArea = 0;
C.questions.forEach(([q, opts, ans, ex, area], i) => {
  if (area !== lastArea) {
    lastArea = area;
    kids.push(new Paragraph({ keepNext: true, spacing: { before: 200, after: 80 }, shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
      children: [t(`  Area ${area} — ${C.areas[area - 1].title}`, { bold: true, size: 19, color: TEAL })] }));
  }
  kids.push(new Paragraph({ keepNext: true, spacing: { before: 120, after: 60 }, children: [t(`${i + 1}. `, { bold: true, color: AMBER, size: 21 }), t(q, { bold: true, size: 21, color: NAVY })] }));
  opts.forEach((o, j) => kids.push(new Paragraph({ keepNext: j < 3, indent: { left: 400 }, spacing: { after: 30 }, children: [t(String.fromCharCode(65 + j) + ".  ", { bold: true, size: 20, color: MUTED }), t(o, { size: 20, color: INK })] })));
});

// F. Answers
kids.push(...h1(null, "F. Answer key with explanations"));
kids.push(termTable(C.questions.map(([q, o, a, ex], i) => [`${i + 1}`, a.split("").join(", "), ex]), ["#", "Answer", "Why"], [700, 1200, CW - 1900]));

// G. Strategy
kids.push(...h1(null, "G. Exam-day strategy & sources"));
kids.push(h2("Strategy"));
[
  ["Pace", "About 160 questions in 240 minutes ≈ 1.5 minutes each. Do not get stuck — mark and move on."],
  ["Read the last line first", "Know exactly what is asked (NOT? best? first? select all?) before reading the scenario."],
  ["Select all that apply", "Judge each option as true/false on its own. Most have 2–3 correct answers."],
  ["Eliminate", "Remove absolute words ('always', 'guaranteed', 'never') and vendor-specific answers."],
  ["Best practice wins", "When several answers are possible, choose the professional, standards-based, documented, authoritative option."],
  ["Answer everything", "Never leave a question blank. Pre-test questions are mixed in — stay calm if some look unfamiliar."],
  ["Logistics", "Valid photo ID matching your registration, arrive early, follow Pearson VUE rules."],
].forEach(([b, x]) => kids.push(bullet([t(b + ": ", { bold: true, size: 21, color: NAVY }), t(x, { size: 21, color: INK })])));
kids.push(gap(120));
kids.push(h2("Sources used for this guide"));
[
  ["GISCI — Exam Candidate Information", "https://www.gisci.org/Want-to-be-a-GISP/The-Exam/Exam-Candidate-Information"],
  ["GISCI — 2019 Exam Blueprint (45 KSAs)", "https://www.gisci.org/Portals/0/PDF's/REVISED%20BP%20-%20Official%20-%20July%202019.pdf"],
  ["GISCI — Exam Preparation Info (study guides, retired practice exam, Quizlet sets)", "https://www.gisci.org/Want-to-be-a-GISP/The-Exam/Exam-Preparation-Info"],
  ["GISCI — Official Practice Exam", "https://www.gisci.org/Want-to-be-a-GISP/The-Exam/Practice-Exam"],
  ["GISP Study YouTube channel (one video per KSA)", "https://www.youtube.com/@gispstudy"],
  ["UCGIS — GIS&T Body of Knowledge", "https://www.ucgis.org/gis-t-body-of-knowledge"],
].forEach(([n, u]) => kids.push(bullet([t(n + " — ", { bold: true, size: 19, color: NAVY }), new D.ExternalHyperlink({ link: u, children: [t(u, { size: 17, color: TEAL, underline: {} })] })])));
kids.push(gap(160));
kids.push(callout("Note", [
  "All practice questions here are original. The 'lessons' boxes summarise concepts from GISCI's retired practice exam, which GISCI publishes free on its website — try it yourself first.",
  "GISCI warns that third-party materials (including AI-generated ones) can contain errors. Cross-check anything doubtful with the blueprint and official resources.",
], LIGHT, TEAL, "ℹ"));

const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D5DEE7", space: 6 } },
  children: [t("GISP Exam Quick Study Guide   •   ", { size: 16, color: MUTED }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED })] })] });

const doc = new Document({
  creator: "GISP Study Guide", title: "GISP Exam Quick Study Guide",
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 44, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: TEAL }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: "bul", levels: [
    { level: 0, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT, style: { run: { color: TEAL }, paragraph: { indent: { left: 360, hanging: 260 } } } },
    { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 260 } } } }] }] },
  sections: [coverSection, {
    properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    footers: { default: footer }, children: kids,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync("GISP_Exam_Quick_Study_Guide.docx", b); console.log("ok"); });
