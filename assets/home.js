// 首頁：依 catalog.js 列出每門課的講義，並顯示這台瀏覽器上的複習進度。
(function () {
  "use strict";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function loadReviewed() {
    try {
      return JSON.parse(localStorage.getItem("eecs-notes-reviewed") || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(document.querySelector(".hero-card"), {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }

    var cat = window.NOTES_CATALOG;
    var host = document.getElementById("courses");
    if (!cat || !host) return;
    var reviewed = loadReviewed();
    var reviewedCount = 0;

    cat.courses.forEach(function (c) {
      var notes = cat.notes.filter(function (n) { return n.course === c.id; });
      var block = el("section", "course-block course-" + c.id);
      block.id = c.id;
      block.setAttribute("aria-labelledby", c.id + "-title");

      var head = el("header");
      var h2 = el("h2", null, c.name);
      h2.id = c.id + "-title";
      h2.appendChild(el("span", "en", c.en));
      head.appendChild(h2);
      head.appendChild(el("p", "textbook", "課本：" + c.textbook));
      block.appendChild(head);

      if (!notes.length) {
        block.appendChild(el("p", "empty", "這門課還沒有講義。"));
      } else {
        var ul = el("ul", "chapter-list");
        notes.forEach(function (n) {
          var li = el("li");
          var a = el("a");
          a.href = n.path;
          a.appendChild(el("span", "chno", "Ch " + n.chapter));
          var ttl = el("span", "ttl", n.title);
          ttl.appendChild(el("span", "en", n.en));
          a.appendChild(ttl);

          var side = el("span", "side");
          if (reviewed[n.id]) {
            reviewedCount++;
            side.appendChild(el("span", "reviewed", "已複習"));
            side.appendChild(document.createElement("br"));
          }
          if (n.exam) {
            side.appendChild(document.createTextNode(n.exam));
            side.appendChild(document.createElement("br"));
          }
          side.appendChild(document.createTextNode("更新 " + n.updated));
          a.appendChild(side);

          a.appendChild(el("span", "topics", n.topics.join("、")));
          li.appendChild(a);
          ul.appendChild(li);
        });
        block.appendChild(ul);
      }
      host.appendChild(block);
    });

    var stats = document.getElementById("stats");
    if (stats) {
      var items = [
        [cat.courses.length, "門課"],
        [cat.notes.length, "章講義"],
        [reviewedCount, "章已複習"]
      ];
      items.forEach(function (it) {
        var li = el("li");
        li.appendChild(el("b", null, String(it[0])));
        li.appendChild(document.createTextNode(it[1]));
        stats.appendChild(li);
      });
    }

    var repo = document.querySelectorAll("[data-repo-link]");
    repo.forEach(function (a) {
      a.href = cat.site.repo + (a.getAttribute("data-repo-link") || "");
    });
  });
})();
