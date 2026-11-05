# AGENTS.md

這個專案的完整規則寫在 [CLAUDE.md](CLAUDE.md)，所有 AI 工具（Codex、Cursor、Gemini CLI、Claude Code 等）共用同一份。
開始任何修改之前，請先完整讀完 CLAUDE.md。以下只是最重要的幾條摘要，兩者不一致時以 CLAUDE.md 為準。

1. 純靜態網站（HTML + CSS + 原生 JS），不要加任何建置工具或框架；所有連結用相對路徑。
2. 每份講義放在 `courses/<課程代號>/ch<兩位數章號>-<slug>.html`，從 `templates/chapter.html` 複製。
3. 講義固定七個區塊，順序不能變：`overview`、`concepts`、`formulas`、`examples`、`pitfalls`、`terms`、`quiz`。
4. 新增講義後要在 `assets/catalog.js` 登記，並執行 `node tools/check-notes.mjs`，全部通過才算完成。
5. 例題題目用英文、數字自己設計並實際驗算；不要用 emoji。
