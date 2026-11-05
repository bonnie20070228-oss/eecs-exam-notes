// 講義目錄：首頁、上下章導覽、術語表都讀這份清單。
// 新增講義時在 notes 加一筆，同一課程內依章號排序。欄位說明見 CLAUDE.md 第 9 節。
window.NOTES_CATALOG = {
  site: {
    title: "電資考前講義庫",
    repo: "https://github.com/bonnie20070228-oss/eecs-exam-notes"
  },

  courses: [
    {
      id: "em",
      name: "電磁學",
      en: "Engineering Electromagnetics",
      textbook: "David K. Cheng, Fundamentals of Engineering Electromagnetics"
    },
    {
      id: "circuits",
      name: "電路學",
      en: "Electric Circuits",
      textbook: "Alexander & Sadiku, Fundamentals of Electric Circuits"
    },
    {
      id: "electronics",
      name: "電子學",
      en: "Microelectronic Circuits",
      textbook: "Sedra & Smith, Microelectronic Circuits"
    }
  ],

  notes: [
    {
      id: "em-ch02",
      course: "em",
      chapter: "2",
      title: "向量分析",
      en: "Vector Analysis",
      path: "courses/em/ch02-vector-analysis.html",
      topics: ["內積與外積", "三種座標系", "梯度", "散度定理", "旋度與 Stokes 定理", "Helmholtz 定理"],
      exam: "期中考一",
      updated: "2026-11-04"
    },
    {
      id: "circuits-ch08",
      course: "circuits",
      chapter: "8",
      title: "二階電路",
      en: "Second-Order Circuits",
      path: "courses/circuits/ch08-second-order-circuits.html",
      topics: ["初值與終值", "串聯 RLC 零輸入響應", "並聯 RLC", "三種阻尼", "步級響應"],
      exam: "期中考",
      updated: "2026-11-04"
    },
    {
      id: "electronics-ch04",
      course: "electronics",
      chapter: "4",
      title: "二極體",
      en: "Diodes",
      path: "courses/electronics/ch04-diodes.html",
      topics: ["理想二極體", "指數模型與迭代", "定電壓降模型", "小訊號模型", "整流與峰值檢波"],
      updated: "2026-11-04"
    }
  ]
};
