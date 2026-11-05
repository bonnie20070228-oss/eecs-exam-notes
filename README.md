# 電資考前講義庫

電磁學、電路學、電子學的中英對照考前講義，一章一頁，版型固定。

網站：https://bonnie20070228-oss.github.io/eecs-exam-notes/

## 這個專案在做什麼

大二的電資核心課都是英文出題，但我習慣用中文理解觀念。這個網站把每一章整理成同一個版型：本章地圖、核心觀念、公式卡、例題、常見陷阱、中英術語、自我檢測。翻到任何一章，都知道要找的東西在哪裡。

重點不是這三頁講義，而是 `CLAUDE.md` 這套規則：之後每讀完一章，只要請 AI 照規則新增，就會得到格式一致、術語一致、已經登記到目錄和術語表的新頁面。

## 目前內容

| 課程 | 章節 |
|---|---|
| 電磁學（Cheng） | Ch2 向量分析 |
| 電路學（Alexander & Sadiku） | Ch8 二階電路 |
| 電子學（Sedra & Smith） | Ch4 二極體 |

## 本機預覽

```bash
python3 -m http.server 8000
```

打開 http://localhost:8000/ 。術語表會用 `fetch` 讀取各講義，所以要開伺服器，不能直接雙擊 HTML。

## 新增一章

在 Claude Code 裡：

```
/new-note circuits 9 弦波與相量 9.1~9.7
```

或對任何 AI 工具說：「照 CLAUDE.md 新增電路學第 9 章講義，範圍 9.1 到 9.7。」

完成後執行規則檢查：

```bash
node tools/check-notes.mjs
```

## 部署

GitHub Pages，Source 選 `main` 分支、`/ (root)`。不需要任何建置步驟。

## 檔案說明

- `CLAUDE.md`：專案規則（AI 和人共用）
- `AGENTS.md`：給其他 AI 工具的入口，指回 CLAUDE.md
- `templates/chapter.html`：新講義範本
- `assets/catalog.js`：講義目錄
- `tools/check-notes.mjs`：檢查每頁是否符合規則
- `.claude/commands/new-note.md`：Claude Code 的 `/new-note` 指令

數學式使用 [KaTeX](https://katex.org/)（MIT License），檔案放在 `assets/vendor/katex/`。
