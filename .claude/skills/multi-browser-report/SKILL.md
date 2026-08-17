---
name: multi-browser-report
description: Chạy một bộ automation trên ba browser engine thành các lượt riêng biệt, mỗi lượt sinh một HTML report mang "Run by <MSSV>" kèm timestamp ISO, gộp số liệu thành bảng tổng hợp, và đọc đúng ý nghĩa của khác biệt giữa các engine. Dùng cho yêu cầu 9 lượt browser của HW04 Task 1 và mọi khi cần bằng chứng multi-browser.
---

# Multi-Browser Report Skill

§6: *"Run on at least 3 browsers. Each feature must run on all three browsers — at least 9 browser
runs in total. Each run must produce an HTML report that visibly displays 'Run by: {StudentID}'."*
§11 (chống gian lận): report **phải** chứa `Run by` + timestamp ISO, và TA sẽ **mở ra xem**.

## Khi nào dùng

- Bước 6 của skill `automation-suite`, sau khi cả 3 feature đã chạy ổn trên 1 engine.
- Bất cứ khi nào cần bằng chứng multi-browser kiểm chứng được.

---

## Quy trình — 6 bước

### Bước 1 — Khởi động SUT và KIỂM TRƯỚC khi chạy

```
cd <backend>; node database.js       # reset DB về seed gốc
npm run preflight                     # phải toàn [OK]
```

Chạy 9 lượt khi backend chưa lên = 9 report toàn Fail vì môi trường, **vô giá trị làm bằng chứng**.
Reset DB trước để 9 lượt cùng xuất phát từ một trạng thái.

### Bước 2 — Chạy đủ 9 lượt, mỗi lượt MỘT report riêng

```
node tools/run-all-browsers.mjs        # 3 feature × 3 engine
```

**Vì sao phải 9 lệnh riêng, không phải 1 lệnh gộp:**
1. §6 đòi *"each run must produce an HTML report"* — 1 lệnh gộp chỉ ra 1 report.
2. Playwright **xoá sạch `outputDir`** ở đầu mỗi lần chạy ⇒ dùng chung thư mục thì ảnh Fail của 8
   lượt đầu bị mất, mà bug report cần **đúng ảnh của lượt sinh ra bug**.

**Hai cái bẫy phải tránh:**

| Bẫy | Hậu quả | Cách tránh |
|---|---|---|
| Truyền `--reporter=...` trên CLI | Cờ này **ghi đè cả mảng reporter** trong config ⇒ `html` và `json` biến mất, **không file report nào được tạo** | Để config tự quyết định; không thêm `--reporter` |
| `spawnSync(cmd, args, {shell:true})` trên Windows | Không tự quote arg ⇒ chuỗi có khoảng trắng bị **tách vụn** | Tự quote arg có khoảng trắng trước khi truyền |

### Bước 3 — Kiểm bằng chứng MSSV trên report THẬT

Đưa `Run by` vào **ba chỗ độc lập**, để TA kiểm ở chỗ nào cũng thấy:

| # | Chỗ | Do đâu |
|---|---|---|
| 1 | Khối **metadata** đầu report | `metadata` trong `playwright.config.js` |
| 2 | **Annotation từng test case** | fixture `runMeta` (`auto: true`) |
| 3 | **Dải cố định chân trang** + thẻ `<title>` | `tools/stamp-report.mjs` |

> **Không bịa số:** mọi con số trong dải chân trang đọc từ **file JSON kết quả thật** của đúng lượt
> đó. Script chỉ trình bày lại.

**Cạm bẫy khi đọc tên engine:** `report.config.projects` liệt kê **cả 3 project cấu hình**, không
phải project **đã chạy** ⇒ đọc `projects[0].name` sẽ **luôn** ra phần tử đầu (`chromium`) dù đang
xử lý report của firefox. Tên engine thật nằm ở **`spec.tests[0].projectName`**.

Kiểm bằng mắt (bắt buộc, và nên chụp lại):
- [ ] Thẻ `<title>` trên **thanh tab** hiện `Run by: <MSSV>` — Playwright **không chụp được**
      thanh tab, phải chụp tay
- [ ] Dải chân trang hiện `Run by` + `Run at (ISO 8601)`
- [ ] Mở một test bất kỳ → thấy annotation `Run by`, `Test case`, `Technique`
- [ ] Làm lại với **cả 9** thư mục

### Bước 4 — Tổng hợp số liệu, KHÔNG đếm tay

```
node tools/summarize.mjs               # → reports/summary.md
```

**Luật:** mọi con số trong `README.md` và `report/main-report.md` phải **copy từ `summary.md`**.
Đếm tay là chỗ dễ lệch nhất, và số liệu lệch nhau giữa hai tài liệu là thứ TA phát hiện trong 30
giây.

### Bước 5 — ⭐ Đọc kết quả cho ĐÚNG

Đây là bước dùng nhiều nhất, và cũng là chỗ dễ kết luận sai nhất:

| Quan sát | Nghĩa là | Viết gì vào báo cáo |
|---|---|---|
| Fail **giống nhau trên cả 3 engine** | **Bug thật của SUT**, không phụ thuộc trình duyệt | "Fail phản ánh SUT, 0 flaky" |
| Fail **chỉ trên 1 engine** | **PHẢI ĐIỀU TRA — không được đoán.** Đọc thông báo lỗi thật, rồi **chạy lại riêng TC đó** trên engine đó | Nêu TC, nguyên nhân thật, đã sửa hay giữ nguyên kèm lý do |
| Pass nhưng thấy nghi | Nghĩ tới **Pass giả** — thử phá kỳ vọng rồi chạy lại; không Fail ⇒ Pass giả | Mục riêng trong gap analysis |

**Ca thật trong bài:** 2 TC chỉ Fail trên firefox. Nếu đoán, sẽ kết luận *"hệ thống hành xử khác
nhau theo browser"* và viết hẳn vào báo cáo — **sai**. Đọc thông báo lỗi thật thì thấy
`browserContext.close: Protocol error` — lỗi **hạ tầng của Firefox** lúc đóng context, assertion
nghiệp vụ đã Pass xong trước đó. Chạy lại riêng 2 TC trên firefox ⇒ **Pass**. Xếp vào *hạn chế
môi trường*, không báo là bug.

> Bài học: **số liệu tổng hợp không tự giải thích chính nó.** Một dòng "Fail 1/3 engine" có thể là
> bug cross-browser, có thể là lỗi script, có thể là lỗi hạ tầng — chỉ đọc log thật mới biết.

### Bước 6 — Nộp kèm những gì

| Nộp | Không nộp |
|---|---|
| `reports/html/<f>-<e>/` × 9 (có ảnh Fail nhúng sẵn) | `reports/artifacts/` (trace nặng, đã `.gitignore`) |
| `reports/json/` × 9 (nguồn của mọi con số) | |
| `reports/summary.md` | |
| `reports/evidence/` (ảnh chụp bằng chứng `Run by`) | |

---

## Tiêu chí nghiệm thu

- [ ] Đủ **9** thư mục trong `reports/html/` và **9** file trong `reports/json/`
- [ ] Cả 9 report hiện `Run by: <MSSV>` + timestamp ISO — đã kiểm **bằng mắt**, không suy đoán
- [ ] Cột engine trong `summary.md` hiện đúng **3 tên khác nhau**, không phải toàn `chromium`
- [ ] `summary.md` sinh tự động; số trong README khớp với nó
- [ ] Mọi TC Fail lệch engine đã được **điều tra bằng log thật**, không đoán
- [ ] Dữ liệu test được dọn sạch sau 9 lượt (kiểm bằng API)
