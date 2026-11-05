// 講義頁共用行為。講義頁本身只寫內容，這裡負責：
// 1. 渲染 KaTeX  2. 產生本頁目錄並標示目前位置  3. 自我檢測評分
// 4. 頁尾的上一章／下一章與「標記為已複習」  5. 列印時展開詳解
(function () {
  "use strict";

  var REVIEW_KEY = "eecs-notes-reviewed";

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute("content") : "";
  }

  // 根目錄的相對路徑：講義在 courses/<課程>/ 底下，所以是 ../../
  var ROOT = "../../";

  function loadReviewed() {
    try {
      return JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveReviewed(data) {
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function renderMath() {
    if (typeof renderMathInElement !== "function") return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false
    });
  }

  function buildToc() {
    var toc = document.querySelector(".toc");
    if (!toc) return;
    var sections = document.querySelectorAll("main section[id]");
    var title = document.createElement("p");
    title.textContent = "本頁目錄";
    var list = document.createElement("ol");
    var links = [];
    sections.forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + sec.id;
      // 只取中文標題，不含英文副標
      a.textContent = (h2.firstChild && h2.firstChild.nodeType === 3 ? h2.firstChild.textContent : h2.textContent).trim();
      li.appendChild(a);
      list.appendChild(li);
      links.push({ a: a, sec: sec });
    });
    toc.appendChild(title);
    toc.appendChild(list);

    if (!("IntersectionObserver" in window)) return;
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = null;
      for (var i = 0; i < links.length; i++) {
        if (visible[links[i].sec.id]) { current = links[i]; break; }
      }
      if (!current) return;
      links.forEach(function (l) {
        var on = l === current;
        l.a.classList.toggle("active", on);
        if (on) l.a.setAttribute("aria-current", "location");
        else l.a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-80px 0px -55% 0px" });
    links.forEach(function (l) { io.observe(l.sec); });
  }

  function setupQuiz() {
    var questions = document.querySelectorAll("#quiz fieldset.q");
    if (!questions.length) return;
    var score = document.createElement("p");
    score.className = "quiz-score";
    score.setAttribute("aria-live", "polite");
    var quiz = document.querySelector("#quiz .quiz");
    if (quiz) quiz.after(score);

    function updateScore() {
      var done = document.querySelectorAll("#quiz fieldset.q.answered").length;
      var right = document.querySelectorAll("#quiz fieldset.q.correct").length;
      score.textContent = done
        ? "已作答 " + done + " / " + questions.length + " 題，答對 " + right + " 題。"
        : "";
    }

    questions.forEach(function (q) {
      var answer = q.getAttribute("data-answer");
      var explain = q.querySelector(".explain");
      var verdict = document.createElement("span");
      verdict.className = "verdict";
      if (explain) explain.prepend(verdict);
      q.addEventListener("change", function (ev) {
        var input = ev.target;
        if (!input || input.type !== "radio") return;
        var ok = input.value === answer;
        q.classList.add("answered");
        q.classList.toggle("correct", ok);
        q.classList.toggle("wrong", !ok);
        q.querySelectorAll("label").forEach(function (lab) {
          var r = lab.querySelector("input");
          lab.classList.toggle("is-right", r.value === answer);
          lab.classList.toggle("is-wrong", r === input && !ok);
        });
        verdict.textContent = ok ? "答對了。" : "再想想。";
        updateScore();
      });
    });
  }

  function buildFooter() {
    var foot = document.querySelector(".note-foot");
    var cat = window.NOTES_CATALOG;
    var id = meta("note-id");
    if (!foot || !cat || !id) return;

    var note = null;
    cat.notes.forEach(function (n) { if (n.id === id) note = n; });

    // 已複習按鈕
    var reviewed = loadReviewed();
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "review-btn";
    function paint() {
      var on = !!reviewed[id];
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? "已複習（再按一次取消）" : "標記為已複習";
    }
    btn.addEventListener("click", function () {
      if (reviewed[id]) delete reviewed[id];
      else reviewed[id] = new Date().toISOString().slice(0, 10);
      saveReviewed(reviewed);
      paint();
    });
    paint();
    foot.appendChild(btn);

    // 同一門課的上一章／下一章
    if (note) {
      var same = cat.notes.filter(function (n) { return n.course === note.course; });
      var idx = same.indexOf(note);
      var pager = document.createElement("nav");
      pager.className = "pager";
      pager.setAttribute("aria-label", "上一章與下一章");
      if (idx > 0) pager.appendChild(pagerLink(same[idx - 1], "上一章", "prev"));
      if (idx < same.length - 1) pager.appendChild(pagerLink(same[idx + 1], "下一章", "next"));
      if (pager.children.length) foot.appendChild(pager);
    }

    var upd = meta("updated");
    if (upd) {
      var p = document.createElement("p");
      p.className = "updated";
      p.textContent = "最後更新：" + upd;
      foot.appendChild(p);
    }
  }

  function pagerLink(n, label, cls) {
    var a = document.createElement("a");
    a.href = ROOT + n.path;
    a.className = cls;
    var small = document.createElement("small");
    small.textContent = label;
    a.appendChild(small);
    a.appendChild(document.createTextNode("Ch" + n.chapter + " " + n.title));
    return a;
  }

  function setupPrint() {
    var opened = [];
    window.addEventListener("beforeprint", function () {
      document.querySelectorAll("details.solution:not([open])").forEach(function (d) {
        d.open = true;
        opened.push(d);
      });
    });
    window.addEventListener("afterprint", function () {
      opened.forEach(function (d) { d.open = false; });
      opened = [];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderMath();
    buildToc();
    setupQuiz();
    buildFooter();
    setupPrint();
  });
})();
