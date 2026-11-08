// GISP — دليل الحفظ للامتحان (Arabic edition, right-to-left)
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, ImageRun,
  AlignmentType, BorderStyle, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, LevelFormat, Header, Footer, PageNumber, SectionType, TabStopType, VerticalAlign,
} = require("docx");

const D = JSON.parse(fs.readFileSync("../../src/data.json", "utf8"));
const C = require("./content2.js");
const AR = require("./ar_content.js"), X = require("./ar_extra.js");
const EC = { ...require("./cards1.js"), ...require("./cards2.js") }, AC = { ...require("./ar_cards1.js"), ...require("./ar_cards2.js") };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const shuffleQ = ([q, o, a, ex, ar]) => { const idx = o.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const na = a.split("").map(L => "ABCD"[idx.indexOf("ABCD".indexOf(L))]).sort().join(""); return [q, idx.map(i => o[i]), na, ex, ar]; };
const QS = [...D.questions, ...require("./qbank2.js").map(shuffleQ)].map((q, i) => [...q, i]).sort((a, b) => a[4] - b[4] || a[5] - b[5]);

const NAVY = "1F4E8C", INK = "1E1B17", MUTED = "5B554B", GOLD = "B8902F", LINE = "D9D3C7", TINT = "EEF3F9",
  CREAM = "FBF8F1", GOLDT = "FBF3E0", RED = "A33B2B", GREEN = "2E6B3F", GREENT = "EAF4EC";
const FONT = "Arial";
const W = 10466;
const BS = 23;
const AL = { A: "أ", B: "ب", C: "ج", D: "د" };

const t = (text, o = {}) => new TextRun({ text, font: { ascii: FONT, hAnsi: FONT, cs: FONT, eastAsia: FONT }, size: o.size || BS, sizeComplexScript: o.size || BS,
  bold: o.bold, boldComplexScript: o.bold, italics: o.italics, italicsComplexScript: o.italics, color: o.color || INK, rightToLeft: !o.ltr });
const p = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [t(runs)], bidirectional: !o.ltr,
  spacing: { before: o.before ?? 0, after: o.after ?? 100, line: o.line }, alignment: o.align, keepNext: o.keepNext, keepLines: o.keepLines,
  indent: o.indent, border: o.border, numbering: o.numbering, pageBreakBefore: o.pageBreakBefore, shading: o.shading });
const bullet = (runs, ref = "dot", after = 70) => p(runs, { numbering: { reference: ref, level: 0 }, after });
const gap = (n = 160) => p([t("", { size: 8 })], { after: n });
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const cellB = { top: thin, bottom: thin, left: thin, right: thin };
const h2 = (txt, color = NAVY) => p([t(txt, { size: 28, bold: true, color })], { before: 240, after: 100, keepNext: true });
const mark = (id) => t("§" + id, { size: 2, color: "FFFFFF", ltr: true }); // invisible marker for page lookup

const TOC = [];
const PAGES = fs.existsSync("./pages_ar.json") ? JSON.parse(fs.readFileSync("./pages_ar.json", "utf8")) : {};
const h1 = (txt, sub, id) => { TOC.push([txt, undefined, id]); return [
  p([t(txt, { size: 40, bold: true }), mark(id)], { pageBreakBefore: true, after: 40, keepNext: true }),
  p([t("", { size: 4 })], { after: sub ? 60 : 160, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } }, indent: { left: W - 1100 } }),
  ...(sub ? [p([t(sub, { color: MUTED })], { after: 160 })] : []) ]; };
function table(cols, rows, o = {}) {
  const total = cols.reduce((a, b) => a + b, 0), n = rows.length;
  const mk = (cells, head, ri) => new TableRow({ tableHeader: head, cantSplit: true,
    children: cells.map((c, i) => new TableCell({
      width: { size: cols[i], type: WidthType.DXA }, borders: cellB, verticalAlign: VerticalAlign.CENTER,
      margins: o.tight ? { top: 18, bottom: 18, left: 90, right: 90 } : { top: 70, bottom: 70, left: 110, right: 110 },
      shading: head ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY } : (o.zebra && ri % 2 ? { type: ShadingType.CLEAR, color: "auto", fill: CREAM } : (o.firstFill && i === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: o.firstFill } : undefined)),
      children: (Array.isArray(c) ? c : [c]).map(x => x instanceof Paragraph ? x :
        p([t(String(x), { bold: head || (o.boldFirst && i === 0), color: head ? "FFFFFF" : (o.boldFirst && i === 0 ? NAVY : INK), size: o.size || 21, ltr: o.ltrCols && o.ltrCols.includes(i) && !head })],
          { after: 0, keepNext: !!o.keep && ri < n - 1, ltr: o.ltrCols && o.ltrCols.includes(i) && !head })),
    })) });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: cols, visuallyRightToLeft: true,
    rows: [...(o.head ? [mk(o.head, true, -1)] : []), ...rows.map((r, ri) => mk(r, false, ri))] });
}
function box(title, lines, fill = TINT, bar = NAVY) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], visuallyRightToLeft: true, rows: [new TableRow({ cantSplit: true, children: [new TableCell({
    width: { size: W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: "auto", fill },
    borders: { top: NB, bottom: NB, left: NB, right: { style: BorderStyle.SINGLE, size: 28, color: bar } },
    margins: { top: 120, bottom: 120, left: 180, right: 200 },
    children: [...(title ? [p([t(title, { bold: true, color: bar, size: 24 })], { after: 80 })] : []), ...lines],
  })] })] });
}
function band(right, left) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W - 3000, 3000], visuallyRightToLeft: true, rows: [new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: W - 3000, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY }, margins: { top: 160, bottom: 160, left: 120, right: 240 }, verticalAlign: VerticalAlign.CENTER, children: right }),
    new TableCell({ width: { size: 3000, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, shading: { type: ShadingType.CLEAR, color: "auto", fill: GOLD }, margins: { top: 160, bottom: 160, left: 200, right: 120 }, verticalAlign: VerticalAlign.CENTER, children: left }),
  ] })] });
}
const img = (file, w, h) => new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: w, height: h }, altText: { title: file, description: file, name: file } });
const fullPage = (file) => p([new ImageRun({ type: "jpg", data: fs.readFileSync(file), transformation: { width: 794, height: 1123 },
  floating: { horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, allowOverlap: true },
  altText: { title: "cover", description: "GISP دليل الحفظ للامتحان", name: "cover" } })], { after: 0 });
const cover = [fullPage("./cover/cover_ar_a4.jpg")];
const back = [fullPage("./cover/back_ar_a4.jpg")];

// ---------- the exam on one page ----------
const body = [];
body.push(...h1("الامتحان في صفحة واحدة", "", "exam"));
body.push(table([2600, W - 2600], [
  ["ما هو", "امتحان المعرفة التقنية الأساسية في العلوم الجغرافية المكانية من معهد GISCI (شرط للحصول على GISP)"],
  ["الأسئلة", "100 سؤال محسوب + ما يصل إلى 60 سؤالاً تجريبياً غير محسوب. لا يمكن تمييزها، فتعامل معها كلها بجدية"],
  ["الزمن", "4 ساعات: نحو دقيقة ونصف لكل سؤال"],
  ["درجة النجاح", "73 درجة معيارية (ناجح / راسب)"],
  ["المحتوى", "مخطط 2019: عشرة مجالات معرفية، و45 مهارة (KSA)"],
  ["لغة الامتحان ونمطه", "بالإنجليزية. مفاهيم لا أزرار برامج: سيناريوهات، ومعادلات، وأسئلة NOT/EXCEPT، واختيار متعدد، وتعليمات زائفة"],
], { boldFirst: true, firstFill: TINT }));
body.push(h2("أين تتركز الدرجات"));
body.push(p([img("./weights.png", 640, 320)], { align: AlignmentType.CENTER, after: 80 }));
body.push(p([t("المجالات من 1 إلى 7 تمثل 78% من الدرجات، فابدأ بها.", { bold: true, color: NAVY })], { align: AlignmentType.CENTER, after: 160 }));
body.push(box("كيف تحفظ كل هذا", [
  bullet([t("اقرأ "), t("مجالاً واحداً كل يوم", { bold: true }), t("، وابدأ بالفكرة الكبرى ثم بطاقات المفاهيم.")]),
  bullet([t("ردّد "), t("حيل الحفظ", { bold: true }), t(" بصوت مسموع؛ الترديد أقوى من إعادة القراءة.")]),
  bullet([t("غطِّ الإجابات وحلّ أسئلة "), t("اختبر نفسك", { bold: true }), t("؛ الاسترجاع هو ما يثبّت المعلومة.")]),
  bullet([t("عد إلى المجال نفسه بعد "), t("يوم، ثم 3 أيام، ثم 7 أيام", { bold: true }), t(" (التكرار المتباعد).")]),
  bullet([t("اقرأ صفحة "), t("ليلة الامتحان", { bold: true }), t(" كل يوم في الأسبوع الأخير.")]),
  bullet([t("المصطلحات الإنجليزية بين قوسين مقصودة: "), t("الامتحان بالإنجليزية", { bold: true }), t("، فاحفظ المصطلح بلغته.")]),
]));

// ---------- concept card ----------
const cardImg = (name) => { const b = fs.readFileSync(`./figs/${name}.png`); const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  let W2 = 600, H2 = Math.round(W2 * h / w); if (H2 > 270) { H2 = 270; W2 = Math.round(H2 * w / h); }
  return new ImageRun({ type: "png", data: b, transformation: { width: W2, height: H2 }, altText: { title: name, description: name, name } }); };
const tag = (s, c) => t(s + "   ", { bold: true, color: c, size: 18 });
function card(e, a, num) {
  const [term, def, ex, q, opts, why] = a;
  const sh = (fill, bar, runs, o = {}) => new Paragraph({ children: runs, bidirectional: true, shading: { type: ShadingType.CLEAR, color: "auto", fill },
    border: { right: { style: BorderStyle.SINGLE, size: 24, color: bar, space: 8 } }, indent: { right: 200, left: 120 },
    spacing: { before: o.before ?? 0, after: o.after ?? 0 }, keepNext: true, keepLines: true });
  const kids = [
    p([t(num + "  ", { bold: true, color: GOLD, size: 30 }), t(term, { bold: true, color: NAVY, size: 30 })], { after: 100, keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 4 } } }),
    sh(TINT, NAVY, [tag("التعريف", NAVY), t(def, { size: 24 })]),
    p([tag("مثال", GREEN), t(ex, { size: 23 })], { before: 140, after: 100, keepNext: true }),
    p([cardImg(e.f)], { align: AlignmentType.CENTER, after: 120, keepNext: true }),
    sh(GREENT, GREEN, [t("سؤال امتحان متوقع", { bold: true, color: GREEN, size: 18 })]),
    sh(GREENT, GREEN, [t(q, { bold: true, size: 23 })], { after: 40 }),
    ...opts.map((o, k) => sh(GREENT, GREEN, [t(`      ${AL["ABCD"[k]]})  ${o}`, { size: 22 })])),
    sh(GREENT, GREEN, [t(`✔ الإجابة: ${AL[e.a]}`, { bold: true, color: GREEN, size: 21 }), t(`  ·  ${why}`, { color: MUTED, size: 21 })], { before: 60 }),
  ];
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], visuallyRightToLeft: true, rows: [new TableRow({ cantSplit: true, children: [new TableCell({
    width: { size: W, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: kids })] })] }),
    p([t("", { size: 4 })], { after: 260 })];
}

// ---------- KSA checklist ----------
body.push(...h1("قائمة التغطية", null, "check"));
body.push(p([t("هذه المهارات الخمس والأربعون (KSAs) في مخطط الامتحان الرسمي لعام 2019، وكلها مشروحة في هذا الدليل. ضع علامة عندما تستطيع شرح المهارة دون النظر.", { color: MUTED })], { after: 120 }));
body.push(table([800, W - 800 - 1100 - 2000, 1100, 2000], D.areas.flatMap(a => a.ksas.map(k => { const id = k.split(" ")[0]; return [id, AR.ksas[id], "المجال " + a.n, "☐ قرأت    ☐ أتقنت"]; })), { head: ["الرمز", "المهارة", "الموقع", "التقدم"], zebra: true, size: 19, tight: true }));

// ---------- the 10 areas ----------
C.forEach((A) => {
  const a = D.areas.find(x => x.n === A.n), R = AR.areas[a.n];
  TOC.push([`المجال ${a.n}`, a.w, `area${a.n}`, R.title]);
  body.push(p([t("", { size: 4 })], { pageBreakBefore: true, after: 0 }));
  body.push(band(
    [p([t(`المجال ${a.n}`, { bold: true, color: "C9D8EC", size: 21 }), mark(`area${a.n}`)], { after: 20 }), p([t(R.title, { bold: true, color: "FFFFFF", size: 36 })], { after: 20 }), p([t(a.title, { color: "C9D8EC", size: 18, ltr: true })], { after: 0 })],
    [p([t(`${a.w}%`, { bold: true, color: "FFFFFF", size: 44, ltr: true })], { align: AlignmentType.CENTER, after: 0 }), p([t(`≈ ${a.w} سؤالاً من 100`, { color: "FFFFFF", size: 19 })], { align: AlignmentType.CENTER, after: 0 })]
  ));
  body.push(gap(140));
  body.push(box("الفكرة الكبرى", [p([t(R.big, { size: 26 })], { after: 0 })], GOLDT, GOLD));
  const ec = EC[a.n], ac = AC[a.n];
  body.push(h2(`تعلّم: ${ec.length} مفاهيم، واحداً تلو الآخر`));
  body.push(p([t("كل مفهوم: ", { color: MUTED, size: 21 }), t("تعريف ← مثال ← صورة ← سؤال امتحان", { bold: true, color: NAVY, size: 21 })], { after: 160 }));
  ec.forEach((c, i) => body.push(...card(c, ac[i], `${a.n}.${i + 1}`)));
  body.push(gap(120));
  body.push(box("حيل للحفظ", R.tricks.map(([k, v]) => p([t("★  ", { color: GOLD, bold: true }), t(k, { bold: true }), t("   " + v, { color: MUTED })], { after: 70 })), TINT, NAVY));
  body.push(h2("إذا قال السؤال… ففكّر في…"));
  body.push(table([W / 2, W / 2], R.keys, { head: ["إذا قال السؤال…", "…ففكّر في"], zebra: true, keep: true }));
  body.push(h2("لا تقع في الفخ", RED));
  R.traps.forEach(x => body.push(bullet([t(x)], "cross", 70)));
  body.push(gap(80));
  body.push(box("اختبر نفسك  (غطِّ الإجابات)", R.test.flatMap(([q, ans], i) => [
    p([t(`${i + 1}.  `, { bold: true, color: GREEN }), t(q, { bold: true })], { after: 30, keepNext: true }),
    p([t("الإجابة: " + ans, { size: 20, color: MUTED })], { after: 90 }),
  ]), GREENT, GREEN));
});

// ---------- pairs, numbers, night before ----------
body.push(...h1("مفاهيم يخلط بينها الناس", "يحب الامتحان اختبار الفرق. اقرأ كل صف من اليمين إلى اليسار.", "pairs"));
body.push(table([2000, 2000, W - 4000], AR.pairs, { head: ["هذا", "مقابل هذا", "الفرق"], zebra: true, size: 21 }));
body.push(...h1("الأرقام والمعادلات", "كل رقم قد يطلب منك الامتحان استخدامه أو حسابه.", "numbers"));
body.push(table([3200, W - 3200], AR.numbers, { boldFirst: true, zebra: true, size: 21, keep: true }));
body.push(...h1("ليلة الامتحان: 40 معلومة", "إذا لم تتذكر إلا صفحة واحدة، فلتكن هذه.", "night"));
const half = Math.ceil(AR.top.length / 2);
const mini = (arr, start) => arr.map(([k, v], i) => p([t(`${start + i}. `, { bold: true, color: GOLD, size: 20 }), t(k + ": ", { bold: true, color: NAVY, size: 20 }), t(v, { size: 20 })], { after: 70 }));
body.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W / 2, W / 2], visuallyRightToLeft: true, rows: [new TableRow({ children: [
  new TableCell({ width: { size: W / 2, type: WidthType.DXA }, borders: { top: NB, bottom: NB, right: NB, left: thin }, margins: { right: 60, left: 200 }, children: mini(AR.top.slice(0, half), 1) }),
  new TableCell({ width: { size: W / 2, type: WidthType.DXA }, borders: { top: NB, bottom: NB, left: NB, right: NB }, margins: { right: 200, left: 60 }, children: mini(AR.top.slice(half), half + 1) }),
] })] }));
body.push(gap(120));
body.push(box("يوم الامتحان", [
  bullet([t("احضر قبل الموعد بـ 30 دقيقة ومعك الهوية المطابقة لحجزك في Pearson VUE.")], "check"),
  bullet([t("اقرأ أسئلة NOT / EXCEPT و\"select all\" مرتين.")], "check"),
  bullet([t("استبعد خيارين خاطئين أولاً، ثم اختر الصحيح في كل الحالات.")], "check"),
  bullet([t("علّم الأسئلة الصعبة وتجاوزها، وأجب عن كل الأسئلة: لا خصم على التخمين.")], "check"),
], GREENT, GREEN));

// ---------- practice (kept in English on purpose) ----------
body.push(...h1(`${QS.length} سؤال تدريب`, "أسئلة من تأليف الكاتب على نمط الامتحان، موزعة على المجالات بنسب أوزانها (ليست أسئلة GISCI رسمية).", "practice"));
body.push(box("لماذا الأسئلة بالإنجليزية؟", [
  bullet([t("الامتحان الحقيقي "), t("بالإنجليزية فقط", { bold: true }), t("، لذلك تركنا أسئلة التدريب بلغتها لتتعوّد على صياغتها وكلماتها المفتاحية.")]),
  bullet([t("الشرح بالعربية في "), t("مفتاح الإجابات", { bold: true }), t(" بعد الأسئلة.")]),
  bullet([t("80% فأكثر", { bold: true }), t(" في كل مجال: أنت في وضع جيد. أقل من 70%: أعد قراءة بطاقات ذلك المجال، ثم أعد الأسئلة الخاطئة بعد 3 أيام.")]),
], GOLDT, GOLD));
let lastArea = 0;
QS.forEach(([q, opts, ans, ex, area], i) => {
  if (area !== lastArea) { lastArea = area;
    body.push(p([t(`المجال ${area} · ${AR.areas[area].title}`, { size: 27, bold: true, color: NAVY })], { before: 260, after: 60, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 3 } } })); }
  body.push(p([t(`${i + 1}. `, { bold: true, color: NAVY, ltr: true }), t(q, { bold: true, ltr: true })], { before: 100, after: 40, keepNext: true, ltr: true }));
  opts.forEach((o, k) => body.push(p([t(`${"ABCD"[k]})  ${o}`, { size: 21, ltr: true })], { after: 20, indent: { left: 360 }, keepNext: k < opts.length - 1, ltr: true })));
});
body.push(...h1("مفتاح الإجابات", null, "key"));
body.push(table([600, 900, 800, W - 2300], QS.map(([q, o, ans, ex, area, oi], i) => [String(i + 1), ans, String(area), X.why[oi]]), { head: ["س", "الإجابة", "المجال", "السبب"], zebra: true, size: 19, tight: true }));

// ---------- glossary ----------
const gl = D.areas.flatMap(a => a.terms.map(([k]) => [k, a.n])).sort((x, y) => x[0].localeCompare(y[0]));
const glossary = [...h1("مسرد المصطلحات", `${gl.length} مصطلحاً من مصطلحات الامتحان بترتيبها الإنجليزي، مع مقابلها العلمي العربي.`, "glossary")];
glossary.push(table([3400, W - 3400 - 800, 800], gl.map(([k, n]) => [k, X.gl[k], String(n)]), { head: ["المصطلح", "المقابل العربي", "المجال"], zebra: true, size: 20, tight: true, ltrCols: [0] }));
glossary.push(p([t("مادة دراسية مستقلة مبنية على مخطط امتحان GISCI لعام 2019، وغير تابعة لمعهد GISCI ولا معتمدة منه. أسئلة التدريب من تأليف الكاتب وليست أسئلة امتحان رسمية. المعلومات الرسمية: gisci.org.  © 2026 محمد الكامل.", { color: MUTED, size: 17 })], { before: 200, border: { top: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 6 } } }));

// ---------- contents ----------
function contents() {
  const out = [p([t("المحتويات", { size: 40, bold: true })], { after: 40 }),
    p([t("", { size: 4 })], { after: 220, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } }, indent: { left: W - 1100 } })];
  const dot = { style: BorderStyle.DOTTED, size: 6, color: "9DB6D8" };
  const row = (label, pg, o = {}) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W - 1000, 1000], visuallyRightToLeft: true, rows: [new TableRow({ cantSplit: true, children: [
    new TableCell({ width: { size: W - 1000, type: WidthType.DXA }, borders: { top: NB, left: NB, right: NB, bottom: dot }, margins: { top: 40, bottom: 40, right: o.ind || 0, left: 0 },
      children: [p([t(label, { size: 24, bold: o.bold }), ...(o.tag ? [t("   " + o.tag, { size: 19, color: GOLD, bold: true, ltr: true })] : [])], { after: 0 })] }),
    new TableCell({ width: { size: 1000, type: WidthType.DXA }, borders: { top: NB, left: NB, right: NB, bottom: dot }, margins: { top: 40, bottom: 40, left: 0, right: 0 },
      children: [p([t(String(pg ?? ""), { size: 24, bold: true, color: NAVY, ltr: true })], { after: 0, align: AlignmentType.LEFT })] }),
  ] })] });
  let areasHead = false;
  TOC.forEach(([label, w, id, title]) => {
    if (w !== undefined && !areasHead) { areasHead = true; out.push(p([t("المجالات المعرفية العشرة", { size: 20, bold: true, color: GOLD })], { before: 160, after: 100 })); }
    if (id === "pairs") out.push(p([t("المراجعة والتدريب", { size: 20, bold: true, color: GOLD })], { before: 200, after: 100 }));
    out.push(w !== undefined ? row(`${label.replace("المجال ", "")}.  ${title}`, PAGES[id], { tag: `${w}%`, ind: 300 }) : row(label, PAGES[id], { bold: true }));
  });
  out.push(gap(200));
  out.push(box("كيف تستخدم هذا الكتاب", [
    bullet([t("كل مجال يسير بالترتيب نفسه: "), t("الفكرة الكبرى ← بطاقات المفاهيم (تعريف، مثال، صورة، سؤال امتحان) ← حيل الحفظ ← الكلمات المفتاحية ← الفخاخ ← اختبر نفسك.", { bold: true })]),
    bullet([t("القراءة الأولى: التعريف والمثال والصورة. القراءة الثانية: غطِّ الإجابة وحلّ السؤال.")]),
    bullet([t("اختم بالأسئلة الـ 150 وبصفحة ليلة الامتحان.")]),
    bullet([t("الصور مكتوبة بالمصطلحات الإنجليزية نفسها التي ستراها في الامتحان.")]),
  ]));
  fs.writeFileSync("./toc_ar.json", JSON.stringify(TOC.map(x => [x[2], "§" + x[2]])));
  return out;
}

// ---------- document ----------
const header = new Header({ children: [p([t("GISP · دليل الحفظ للامتحان · محمد الكامل", { color: MUTED, size: 17 })], { align: AlignmentType.CENTER, after: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 4 } } })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED })] })] });
const page = { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 720, right: 720, header: 400, footer: 400 } };
const lvl = (text, color) => ({ level: 0, format: LevelFormat.BULLET, text, alignment: AlignmentType.RIGHT, style: { paragraph: { indent: { left: 380, hanging: 260 } }, run: { color, font: FONT, bold: true } } });
const doc = new Document({
  creator: "محمد الكامل", title: "GISP — دليل الحفظ للامتحان", description: "ملخص عربي مبسّط لامتحان GISCI",
  styles: { default: { document: { run: { font: FONT, size: BS, color: INK, rightToLeft: true }, paragraph: { bidirectional: true } } } },
  numbering: { config: [{ reference: "dot", levels: [lvl("•", NAVY)] }, { reference: "cross", levels: [lvl("✗", RED)] }, { reference: "check", levels: [lvl("✓", GREEN)] }] },
  sections: [
    { properties: { page }, children: cover },
    { properties: { page, type: SectionType.NEXT_PAGE }, headers: { default: header }, footers: { default: footer }, children: [...contents(), ...body, ...glossary] },
    { properties: { page, type: SectionType.NEXT_PAGE }, children: back },
  ],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync("./GISP_Exam_Memory_Guide_AR.docx", b); console.log("written", b.length); });
