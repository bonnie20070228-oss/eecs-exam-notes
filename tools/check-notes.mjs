// 規則檢查：確認每份講義符合 CLAUDE.md 的版型與命名規則。
// 用法：node tools/check-notes.mjs
// 不需要安裝任何套件。有錯誤時列出並以 exit code 1 結束。

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// 第 5 節：區塊 id、順序、數量範圍
const SECTIONS = [
  { id: "overview", title: "本章地圖" },
  { id: "concepts", title: "核心觀念", item: /<article class="concept" id="c-[a-z0-9-]+"/g, min: 3, max: 6 },
  { id: "formulas", title: "公式卡", item: /<figure class="formula( wide)?" id="f-[a-z0-9-]+"/g, min: 4, max: 10 },
  { id: "examples", title: "例題", item: /<article class="example" id="ex-\d+"/g, min: 3, max: 5 },
  { id: "pitfalls", title: "常見陷阱", item: /<li class="pitfall">/g, min: 3, max: 6 },
  { id: "terms", title: "中英術語", item: /<tr><td>/g, min: 8, max: Infinity },
  { id: "quiz", title: "自我檢測", item: /<fieldset class="q" data-answer="[a-d]">/g, min: 3, max: 5 }
];
const REQUIRED_META = ["note-id", "course", "chapter", "textbook", "updated"];
const FILE_RE = /^courses\/([a-z]+)\/ch(\d{2}[ab]?)-([a-z0-9]+(?:-[a-z0-9]+){0,3})\.html$/;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}\u{26A0}]/u;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

// 讀 catalog.js
const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(ROOT, "assets/catalog.js"), "utf8"), ctx);
const catalog = ctx.window.NOTES_CATALOG;
const courseIds = new Set(catalog.courses.map((c) => c.id));
const byPath = new Map(catalog.notes.map((n) => [n.path, n]));

// catalog 本身
const seenIds = new Set();
for (const n of catalog.notes) {
  for (const k of ["id", "course", "chapter", "title", "en", "path", "topics", "updated"]) {
    if (n[k] === undefined || n[k] === "") err("assets/catalog.js", `講義 ${n.id || "?"} 缺少欄位 ${k}`);
  }
  if (seenIds.has(n.id)) err("assets/catalog.js", `講義 ID 重複：${n.id}`);
  seenIds.add(n.id);
  if (!courseIds.has(n.course)) err("assets/catalog.js", `${n.id} 的課程 ${n.course} 不在 courses 裡`);
  if (!existsSync(join(ROOT, n.path))) err("assets/catalog.js", `${n.id} 指向不存在的檔案 ${n.path}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.updated)) err("assets/catalog.js", `${n.id} 的 updated 不是 YYYY-MM-DD`);
}
// 同一課程內依章號排序
for (const c of courseIds) {
  const chs = catalog.notes.filter((n) => n.course === c).map((n) => parseFloat(n.chapter));
  if (chs.some((v, i) => i > 0 && v < chs[i - 1])) err("assets/catalog.js", `課程 ${c} 的講義沒有依章號排序`);
}

// 掃描 courses/ 底下所有 html
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(join(ROOT, "courses")).filter((f) => f.endsWith(".html"));

for (const abs of files) {
  const file = relative(ROOT, abs).split("\\").join("/");
  const html = readFileSync(abs, "utf8");

  // 4.2 檔名
  const m = file.match(FILE_RE);
  if (!m) {
    err(file, "檔名不符合 courses/<課程>/ch<兩位數章號>-<slug>.html");
    continue;
  }
  const [, course, chapter] = m;
  if (!courseIds.has(course)) err(file, `資料夾 ${course} 不是 catalog 裡的課程代號`);

  // meta
  const meta = {};
  for (const name of REQUIRED_META) {
    const mm = html.match(new RegExp(`<meta name="${name}" content="([^"]*)">`));
    if (!mm || !mm[1]) err(file, `缺少 <meta name="${name}">`);
    else meta[name] = mm[1];
  }
  const expectedId = `${course}-ch${chapter}`;
  if (meta["note-id"] && meta["note-id"] !== expectedId) err(file, `note-id 應為 ${expectedId}，目前是 ${meta["note-id"]}`);
  if (meta.course && meta.course !== course) err(file, `meta course 應為 ${course}`);
  if (!html.includes(`<body class="note" data-course="${course}">`)) err(file, `<body> 要寫成 class="note" data-course="${course}"`);

  // catalog 對應
  const entry = byPath.get(file);
  if (!entry) err(file, "沒有登記在 assets/catalog.js");
  else {
    if (entry.id !== meta["note-id"]) err(file, `catalog 的 id（${entry.id}）和 note-id 不一致`);
    if (entry.updated !== meta.updated) warn(file, `catalog 的 updated（${entry.updated}）和頁面（${meta.updated}）不同`);
  }

  // title 格式
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  if (!/^Ch\d+[ab]? .+ \| .+ \| 電資考前講義庫$/.test(title)) err(file, `<title> 格式應為「Ch<章號> <章名> | <課程> | 電資考前講義庫」，目前是「${title}」`);
  const chNum = chapter.replace(/^0/, "");
  if (meta.chapter && meta.chapter !== chNum) err(file, `meta chapter 應為 ${chNum}，目前是 ${meta.chapter}`);
  if (title && !title.startsWith(`Ch${chNum} `)) err(file, `<title> 應以「Ch${chNum} 」開頭`);
  if (entry && String(entry.chapter) !== chNum) err(file, `catalog 的 chapter 應為 ${chNum}`);

  // 第 5 節：區塊順序與數量
  const order = [...html.matchAll(/<section id="([a-z-]+)">/g)].map((x) => x[1]);
  const expected = SECTIONS.map((s) => s.id);
  if (order.join(",") !== expected.join(",")) err(file, `區塊順序應為 ${expected.join(" > ")}，目前是 ${order.join(" > ")}`);

  for (const s of SECTIONS) {
    const start = html.indexOf(`<section id="${s.id}">`);
    if (start < 0) continue;
    const end = html.indexOf("</section>", start);
    const body = html.slice(start, end);
    if (!body.includes(`<h2>${s.title}`)) err(file, `#${s.id} 的標題應為「${s.title}」`);
    if (s.item) {
      const n = (body.match(s.item) || []).length;
      if (n < s.min || n > s.max) err(file, `#${s.id} 有 ${n} 個項目，規定 ${s.min}～${s.max === Infinity ? "不限" : s.max}`);
    }
  }

  // 公式卡必須有 p.use
  const cards = html.split('<figure class="formula').slice(1);
  cards.forEach((c, i) => {
    const one = c.slice(0, c.indexOf("</figure>"));
    if (!one.includes('<p class="use">')) err(file, `第 ${i + 1} 張公式卡缺少 p.use（何時用）`);
    if (!one.includes('<span class="zh">') || !one.includes('<span class="en">')) err(file, `第 ${i + 1} 張公式卡缺少中英名稱`);
  });

  // 例題：英文題目、詳解、答案
  const exs = html.split('<article class="example"').slice(1);
  exs.forEach((c, i) => {
    const one = c.slice(0, c.indexOf("</article>"));
    if (!one.includes(`id="ex-${i + 1}"`)) err(file, `例題 id 應依序為 ex-${i + 1}`);
    if (!one.includes('<div class="problem" lang="en">')) err(file, `例題 ${i + 1} 缺少英文題目 div.problem[lang=en]`);
    if (!one.includes('<details class="solution">')) err(file, `例題 ${i + 1} 缺少可展開的詳解`);
    if (!one.includes('<p class="answer">')) err(file, `例題 ${i + 1} 缺少 p.answer`);
  });

  // 測驗：答案要存在於選項中，name 要依序
  const qs = html.split('<fieldset class="q"').slice(1);
  const answers = [];
  qs.forEach((c, i) => {
    const one = c.slice(0, c.indexOf("</fieldset>"));
    const ans = (one.match(/data-answer="([a-d])"/) || [])[1];
    answers.push(ans);
    if (!one.includes(`name="q${i + 1}" value="${ans}"`)) err(file, `測驗第 ${i + 1} 題：name 應為 q${i + 1}，且要有 value="${ans}" 的選項`);
    if (!one.includes('<p class="explain">')) err(file, `測驗第 ${i + 1} 題缺少解析`);
  });
  if (answers.length >= 3 && new Set(answers).size === 1) warn(file, "測驗每題答案都是同一個選項，請分散");

  // 術語表欄位
  if (!html.includes("<thead><tr><th>中文</th><th>English</th><th>符號／備註</th></tr></thead>")) err(file, "術語表表頭必須是「中文、English、符號／備註」");

  // id 不可重複
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) err(file, `id 重複：${[...new Set(dup)].join(", ")}`);

  // 第 2、8、11 節的禁止事項
  if (EMOJI_RE.test(html)) err(file, "含有 emoji 或裝飾符號");
  if (/<style[\s>]/.test(html) || /\sstyle="/.test(html)) err(file, "講義頁不能有 <style> 或 inline style");
  if (/(src|href)="\/(?!\/)/.test(html)) err(file, "有 / 開頭的絕對路徑，請改用相對路徑");
  if (/(src|href)="https?:\/\/(?!fonts\.)[^"]*(katex|mathjax)/i.test(html)) err(file, "KaTeX 必須用 assets/vendor 的本地檔案");
  if (/\\\(|\\\)/.test(html)) warn(file, "數學式請用 $...$，不要用 \\( \\)");
  if (!html.includes('src="../../assets/notes.js"')) err(file, "沒有載入 ../../assets/notes.js");
  if (!html.includes('<footer class="note-foot"></footer>')) err(file, "頁尾 footer.note-foot 應保持空白，由 notes.js 產生");
}

// catalog 裡有、但 courses/ 底下沒有的檔案已在上面檢查
const total = files.length;
for (const w of warnings) console.log("警告  " + w);
for (const e of errors) console.log("錯誤  " + e);
if (errors.length) {
  console.log(`\n檢查 ${total} 份講義：${errors.length} 個錯誤，${warnings.length} 個警告。`);
  process.exit(1);
} else {
  console.log(`檢查 ${total} 份講義：全部符合規則（${warnings.length} 個警告）。`);
}
