# CLAUDE.md：電資考前講義庫

這份文件是給 AI（Claude Code、Codex 等）和我自己看的專案規則。
任何新增或修改內容之前，請先完整讀完這份文件，並照這裡的規則做。
規則和使用者當下的指示衝突時，以使用者的指示為準，但要先提醒哪一條規則被打破。

---

## 1. 專案目的

把我大二修的電資核心課（電磁學、電路學、電子學）整理成「一章一頁」的考前講義網站。

- 讀者：我自己和同班同學，在考前一週拿來複習。
- 考試是英文出題，所以講義採**中英對照**：中文解釋觀念，英文保留術語和題目原文的寫法。
- 每一頁講義的版型完全一樣，讀者翻到任何一章都知道公式卡、例題、陷阱在哪裡。
- 網站目標是「之後每讀完一章，就請 AI 照這份規則加一頁」，所以規則要寫到 AI 不用問我也能做出一致的頁面。

## 2. 技術限制

- 純靜態網站：HTML + CSS + 原生 JavaScript，**不使用任何建置工具**（不要加 npm、React、Vite、Jekyll 設定）。
- 部署：GitHub Pages，從 `main` 分支根目錄發布。根目錄有 `.nojekyll`，不要刪。
- 數學式用 KaTeX，檔案已放在 `assets/vendor/katex/`，**不要改用 CDN**，也不要換成 MathJax。
- 字型從 Google Fonts 載入（Noto Serif TC、Noto Sans TC），載不到時退回系統字型，版面不能壞。
- 所有連結都用**相對路徑**（網站部署在 `/eecs-exam-notes/` 子路徑下，用 `/` 開頭的絕對路徑會壞掉）。
- 本機預覽要開伺服器（術語表需要 `fetch`，直接雙擊檔案會失敗）：

  ```bash
  python3 -m http.server 8000
  # 打開 http://localhost:8000/
  ```

## 3. 目錄結構

```
eecs-exam-notes/
├── CLAUDE.md              專案規則（本檔，唯一的規則來源）
├── AGENTS.md              給其他 AI 工具的入口，內容指回本檔
├── README.md              給人看的專案介紹
├── index.html             首頁：依課程列出所有講義（由 catalog.js 產生）
├── glossary.html          術語表：自動彙整每頁「中英術語」表格
├── .nojekyll
├── assets/
│   ├── style.css          全站唯一的樣式表
│   ├── catalog.js         講義目錄（課程與章節清單），首頁和上下章導覽都讀它
│   ├── notes.js           講義頁共用行為：數學渲染、目錄、測驗、已複習標記
│   ├── home.js            首頁行為
│   ├── glossary.js        術語表行為
│   ├── favicon.svg
│   └── vendor/katex/      KaTeX（不要修改）
├── courses/
│   ├── em/                電磁學
│   ├── circuits/          電路學
│   └── electronics/       電子學
├── templates/
│   └── chapter.html       新講義的範本，新增時從這裡複製
├── tools/
│   └── check-notes.mjs    規則檢查腳本
└── .claude/commands/
    └── new-note.md        Claude Code 的 /new-note 指令
```

不要在根目錄新增其他資料夾。圖片如果真的需要，放在該課程資料夾下的 `img/`（例如 `courses/em/img/`），檔名用英文小寫加連字號。

## 4. 命名規則

### 4.1 課程代號

| 代號 | 課程 | 課本 |
|---|---|---|
| `em` | 電磁學 Engineering Electromagnetics | David K. Cheng, *Fundamentals of Engineering Electromagnetics* |
| `circuits` | 電路學 Electric Circuits | Alexander & Sadiku, *Fundamentals of Electric Circuits* |
| `electronics` | 電子學 Microelectronic Circuits | Sedra & Smith, *Microelectronic Circuits* |

課程代號只能用英文小寫，資料夾名稱 = 課程代號。

### 4.2 講義檔名

```
courses/<課程代號>/ch<兩位數章號>-<英文章名-slug>.html
```

- 章號一律補成兩位數：`ch02`、`ch08`、`ch10`。
- slug 用課本英文章名，全小寫、單字之間用 `-`，最多 4 個單字。
- 範例：`courses/em/ch02-vector-analysis.html`、`courses/circuits/ch08-second-order-circuits.html`。
- 同一章分成上下兩份時，章號後面加 `a`、`b`：`ch09a-sinusoids-phasors.html`。

### 4.3 講義 ID

講義 ID = `<課程代號>-ch<兩位數章號>`，例如 `em-ch02`、`circuits-ch09a`。
這個 ID 會出現在三個地方，三者必須一致：

1. 頁面 `<meta name="note-id">`
2. `assets/catalog.js` 的 `id`
3. 已複習紀錄（瀏覽器 localStorage），所以**已發布的 ID 不能改**。

### 4.4 頁面內的 id

- 七個區塊的 id 固定（見第 5 節），不能改名。
- 觀念：`c-<英文關鍵字>`，例如 `c-divergence`。
- 公式卡：`f-<英文關鍵字>`，例如 `f-divergence-theorem`。
- 例題：`ex-1`、`ex-2`……依順序編號。
- 同一頁裡 id 不能重複。

## 5. 講義頁固定版型

每一頁講義都由以下七個 `<section>` 組成，**順序和 id 都不能變**，不能少，也不要多加區塊。
內容少的區塊也要保留，寫最少數量即可。

| 順序 | id | 標題 | 內容 | 數量 |
|---|---|---|---|---|
| 1 | `overview` | 本章地圖 | 這章在解決什麼問題、考試範圍、先備知識、和其他章的關係 | 一段文字 + 範圍清單 |
| 2 | `concepts` | 核心觀念 | 每個觀念一個 `article.concept`，用直覺講清楚，再給定義 | 3～6 個 |
| 3 | `formulas` | 公式卡 | 每張卡一條公式，附中英名稱、何時用、注意條件 | 4～10 張 |
| 4 | `examples` | 例題 | 英文題目 + 中文提示 + 可展開的詳解 | 3～5 題 |
| 5 | `pitfalls` | 常見陷阱 | 「常見錯法」對「正確想法」 | 3～6 條 |
| 6 | `terms` | 中英術語 | 三欄表格：中文、English、符號或備註 | 至少 8 列 |
| 7 | `quiz` | 自我檢測 | 單選題，作答後顯示解析 | 3～5 題 |

頁首（`header.note-head`）放：麵包屑、章名（中文 + `span.en` 英文）、一句話導言、`dl.note-meta`（課本章節、考試範圍、先備、更新日期）。
頁尾（`footer.note-foot`）由 `notes.js` 自動填入上一章／下一章與「標記為已複習」按鈕，不要手寫。

## 6. 元件寫法

所有元件都已經在 `templates/chapter.html` 裡示範，新增講義時複製範本、替換內容即可。不要自創新的 class。

### 6.1 觀念

```html
<article class="concept" id="c-divergence">
  <h3>散度 <span class="en">Divergence</span></h3>
  <p>先用一句直覺講它在量什麼……</p>
  <p>再給定義：$$\nabla\cdot\mathbf{A} = \lim_{\Delta v\to 0}\frac{\oint_S \mathbf{A}\cdot d\mathbf{s}}{\Delta v}$$</p>
</article>
```

### 6.2 公式卡

```html
<figure class="formula" id="f-divergence-theorem">
  <figcaption><span class="zh">散度定理</span> <span class="en">Divergence theorem</span></figcaption>
  <div class="math">$$\int_V \nabla\cdot\mathbf{A}\,dv = \oint_S \mathbf{A}\cdot d\mathbf{s}$$</div>
  <p class="use"><b>何時用：</b>體積分難算、表面積分好算（或反過來）時互換。</p>
  <p class="note"><b>注意：</b>$S$ 必須是包住 $V$ 的封閉曲面，$d\mathbf{s}$ 朝外。</p>
</figure>
```

- `p.use` 必填；`p.note` 選填。
- 一張卡只放一條主要公式。同一概念在不同座標系的寫法，可以用 `aligned` 放在同一張卡。

### 6.3 例題

```html
<article class="example" id="ex-1">
  <h3>例題 1　<span class="topic">散度定理驗證</span></h3>
  <div class="problem" lang="en">
    <p>Given $\mathbf{A} = \ldots$, verify the divergence theorem over ...</p>
  </div>
  <p class="hint"><b>提示：</b>先算 $\nabla\cdot\mathbf{A}$，再分六個面算通量。</p>
  <details class="solution">
    <summary>看詳解</summary>
    <ol class="steps">
      <li>……</li>
    </ol>
    <p class="answer"><b>答：</b>$\ldots$</p>
  </details>
</article>
```

- 題目用英文寫，句型模仿考卷（Find / Determine / Verify / Sketch）。
- 數字自己設計，**不要照抄課本習題或例題原文**。
- 詳解每一步一個 `<li>`，寫出代入的數字，不要跳步。
- `p.answer` 必須有單位。

### 6.4 常見陷阱

```html
<li class="pitfall">
  <p class="wrong"><b>常見錯法：</b>……</p>
  <p class="right"><b>正確想法：</b>……</p>
</li>
```

所有 `li.pitfall` 放在同一個 `<ul class="pitfalls">` 裡。

### 6.5 中英術語表

```html
<table class="terms">
  <thead><tr><th>中文</th><th>English</th><th>符號／備註</th></tr></thead>
  <tbody>
    <tr><td>散度</td><td>divergence</td><td>$\nabla\cdot\mathbf{A}$</td></tr>
  </tbody>
</table>
```

- 欄位順序固定：中文、English、符號／備註。`glossary.html` 是照這個順序讀的，改了術語表就會壞。
- English 欄用小寫（專有名詞除外，例如 Stokes's theorem）。
- 同一個術語在不同章出現時，中文和英文要寫得一模一樣，術語表才會合併。新增前先開 `glossary.html` 查有沒有既有寫法。

### 6.6 自我檢測

```html
<fieldset class="q" data-answer="b">
  <legend>1. 題目……</legend>
  <label><input type="radio" name="q1" value="a"> 選項 A</label>
  <label><input type="radio" name="q1" value="b"> 選項 B</label>
  <label><input type="radio" name="q1" value="c"> 選項 C</label>
  <p class="explain">解析：為什麼是 B，以及其他選項錯在哪。</p>
</fieldset>
```

- 每題 3～4 個選項，`name` 用 `q1`、`q2`……，`data-answer` 是正確選項的 `value`。
- 題目考觀念或陷阱，不要考需要計算機的數值。
- 正確答案的位置要分散，不要每題都是同一個選項。

## 7. 數學與符號

- 行內公式 `$...$`，獨立公式 `$$...$$`。不要用 `\(...\)`。
- 向量用粗體：`\mathbf{A}`；單位向量用 `\mathbf{a}_x`、`\mathbf{a}_r`、`\mathbf{a}_\phi`（Cheng 課本的寫法，不要用 $\hat{x}$）。
- 相量（phasor）用粗體大寫：`\mathbf{V}`、`\mathbf{I}`。
- 電子學的大小寫照 Sedra & Smith：$i_D$ 總量、$I_D$ 直流、$i_d$ 交流小訊號。
- 數字和單位之間空一格：`$4.7\,\text{k}\Omega$`、`$10\,\text{V}$`。
- 指數式寫 `e^{-2t}`，不要寫 `exp(-2t)`。
- HTML 裡的 `<`、`>`、`&` 要跳脫成 `&lt;`、`&gt;`、`&amp;`，即使在 `$...$` 裡面。

## 8. 寫作規範

- 用繁體中文，語氣像學長姐寫給學弟妹的筆記：直接、口語，但不要開玩笑灌水。
- 術語第一次出現時寫成「散度（divergence）」，之後只用中文即可。
- 每個觀念先講「它在算什麼、為什麼需要它」，再給公式。
- 不要用 emoji 或裝飾符號（包含程式碼和註解）。
- 不要寫課本沒有、考試也不會考的延伸內容；超出範圍的放在「本章地圖」一句話帶過。
- 所有數值答案都要**實際驗算**（用 Python 或手算第二次），不要憑感覺給數字。

## 9. 新增一份講義的流程

使用者說「新增 <課程> 第 N 章講義，範圍是……」時，照以下步驟做：

1. 讀完本檔，確認課程代號和檔名（第 4 節）。課程不存在時先照第 10 節新增課程。
2. 讀其他講義的 `#terms`（或開 `glossary.html` 搜尋），本章會用到的術語沿用既有譯名。
3. 複製 `templates/chapter.html` 到 `courses/<課程代號>/ch<NN>-<slug>.html`。
4. 填好 `<head>` 的 meta：`note-id`、`course`、`chapter`、`textbook`、`updated`（今天日期，YYYY-MM-DD），以及 `<title>`（格式：`Ch<章號> <中文章名> | <課程中文名> | 電資考前講義庫`）。
5. `<body data-course="<課程代號>">` 要改成正確的課程代號，顏色才會對。
6. 依第 5 節的順序寫七個區塊，數量落在規定範圍內。
7. 用 Python 驗算每一題例題的數值答案。
8. 在 `assets/catalog.js` 的 `notes` 陣列加一筆（同一課程內照章號排序）。欄位：
   `id`、`course`、`chapter`（字串，例如 `"9a"`）、`title`、`en`、`path`、`topics`（3～6 個短詞，顯示在首頁）、`updated`；`exam`（例如 `"期中考二"`）選填，不知道就不要寫。
9. 執行 `node tools/check-notes.mjs`，全部通過才算完成。
10. 開本機伺服器，確認：公式有渲染（沒有殘留 `$`）、手機寬度 390px 沒有橫向捲動、首頁出現新講義、術語表出現新術語。
11. 回報時列出：新增的檔案、例題答案的驗算方式、任何不確定的地方。

### 修改既有講義

- 只改使用者要求的部分，其他內容不要順手重寫。
- 改了內容就更新 `meta[name=updated]` 和 `catalog.js` 的 `updated`。
- 不要改 note ID、檔名、區塊 id。真的要改檔名時，要同步改 `catalog.js`，並告知使用者舊連結會失效。
- 修改後一樣要跑 `node tools/check-notes.mjs`。

## 10. 新增一門課

1. 決定課程代號（英文小寫、一個單字），建立 `courses/<代號>/`。
2. 在 `assets/catalog.js` 的 `courses` 陣列新增一筆：`id`、`name`、`en`、`textbook`。
3. 在 `assets/style.css` 的「課程色」區塊加一組 `--course` 顏色，亮色、暗色各一個，對比度要讓白底文字 4.5:1 以上。
4. 更新本檔第 4.1 節的課程表，以及 `tools/check-notes.mjs` 不需要改（它讀 catalog）。

## 11. 樣式規則

- 只能改 `assets/style.css`，不要在講義頁寫 `<style>` 或 `style=""`。
- 顏色只用 `:root` 裡定義的變數，不要寫死色碼。
- 公式卡是全站唯一做成「索引卡」造型的元件（上方紅線、淡藍橫線），其他元件保持樸素，不要再加卡片、陰影或漸層。
- 版面寬度：內文欄最多 72 個中文字寬；桌機左側是本頁目錄，寬度小於 960px 時目錄收到頁首下方。
- 需要支援深色模式、鍵盤操作（看得到 focus 外框）、`prefers-reduced-motion`、列印（列印時詳解自動展開）。

## 12. 完成前檢查清單

- [ ] `node tools/check-notes.mjs` 沒有錯誤
- [ ] 七個區塊都在、順序正確、數量在範圍內
- [ ] 例題答案驗算過，答案有單位
- [ ] 術語譯名和其他章一致
- [ ] `catalog.js` 已更新，首頁看得到
- [ ] 手機 390px 寬沒有橫向捲動
- [ ] 沒有 emoji、沒有 CDN 連結、沒有 `/` 開頭的絕對路徑

## 13. 不要做的事

- 不要加建置工具、套件管理檔或框架。
- 不要改 `assets/vendor/` 裡的檔案。
- 不要整段複製課本文字、習題或解答本。
- 不要刪除或重排既有講義的區塊。
- 不要在沒有使用者同意時刪除任何講義檔案。
- 不要把個人資料（學號、成績）寫進網站。

## 14. 範例指令

給 AI 的指令可以這樣下：

- 「新增電磁學第 3 章講義，範圍 3-2 庫侖定律到 3-5 電位。」
- 「電路學 ch08 的例題 2 改成臨界阻尼的並聯 RLC，其他不要動。」
- 「新增一門課：訊號與系統，代號 signals，課本 Oppenheim。」
- 在 Claude Code 裡也可以直接用：`/new-note electronics 5 MOSFET 5.1~5.3`
