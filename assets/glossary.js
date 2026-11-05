// 術語表：依 catalog.js 讀取每份講義，取出 #terms 表格的每一列並合併。
// 欄位順序固定為「中文、English、符號／備註」（CLAUDE.md 6.5）。
(function () {
  "use strict";

  var rows = [];
  var courseName = {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function fetchNote(n) {
    return fetch(n.path)
      .then(function (r) {
        if (!r.ok) throw new Error(n.path + " 回傳 " + r.status);
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var trs = doc.querySelectorAll("#terms table.terms tbody tr");
        var out = [];
        trs.forEach(function (tr) {
          var td = tr.querySelectorAll("td");
          if (td.length < 2) return;
          out.push({
            zh: td[0].textContent.trim(),
            en: td[1].textContent.trim(),
            note: td[2] ? td[2].innerHTML.trim() : "",
            source: n
          });
        });
        return out;
      });
  }

  function merge(list) {
    var map = {};
    list.forEach(function (t) {
      var key = t.zh + "|" + t.en.toLowerCase();
      if (!map[key]) {
        map[key] = { zh: t.zh, en: t.en, note: t.note, sources: [] };
      } else if (!map[key].note && t.note) {
        map[key].note = t.note;
      }
      if (map[key].sources.indexOf(t.source) < 0) map[key].sources.push(t.source);
    });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) {
      return a.en.toLowerCase().localeCompare(b.en.toLowerCase());
    });
  }

  function render() {
    var q = document.getElementById("q").value.trim().toLowerCase();
    var course = document.getElementById("course").value;
    var tbody = document.querySelector("#glossary-table tbody");
    tbody.textContent = "";
    var shown = 0;
    rows.forEach(function (r) {
      if (course && !r.sources.some(function (s) { return s.course === course; })) return;
      if (q && (r.zh + " " + r.en).toLowerCase().indexOf(q) < 0) return;
      shown++;
      var tr = el("tr");
      tr.appendChild(el("td", null, r.zh));
      tr.appendChild(el("td", null, r.en));
      var note = el("td");
      note.innerHTML = r.note;
      tr.appendChild(note);
      var src = el("td", "src");
      r.sources.forEach(function (s) {
        var a = el("a", null, courseName[s.course] + " Ch" + s.chapter);
        a.href = s.path + "#terms";
        a.className = "course-" + s.course;
        src.appendChild(a);
      });
      tr.appendChild(src);
      tbody.appendChild(tr);
    });
    document.getElementById("count").textContent =
      "共 " + rows.length + " 個術語" + (shown !== rows.length ? "，符合條件 " + shown + " 個" : "") + "。";
    if (typeof renderMathInElement === "function") {
      renderMathInElement(tbody, {
        delimiters: [{ left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cat = window.NOTES_CATALOG;
    if (!cat) return;
    var select = document.getElementById("course");
    cat.courses.forEach(function (c) {
      courseName[c.id] = c.name;
      var opt = el("option", null, c.name);
      opt.value = c.id;
      select.appendChild(opt);
    });

    Promise.all(cat.notes.map(fetchNote))
      .then(function (lists) {
        rows = merge([].concat.apply([], lists));
        render();
      })
      .catch(function (err) {
        var msg = el("p", "load-error",
          "讀不到講義檔案（" + err.message + "）。如果是直接用瀏覽器打開檔案，請改用 python3 -m http.server 開本機伺服器再瀏覽。");
        document.getElementById("count").replaceWith(msg);
      });

    document.getElementById("q").addEventListener("input", render);
    select.addEventListener("change", render);
  });
})();
