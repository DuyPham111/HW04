# AI Audit Report — HW04 Automation Testing (§9)

> ⚠️ **BỘ KHUNG.** Ghi **ngay sau mỗi phiên** làm việc với AI, prompt phải **nguyên văn**.
> Hướng dẫn: [docs/11-AI-AUDIT-CRITIQUE.md](../docs/11-AI-AUDIT-CRITIQUE.md). Xóa dòng này trước khi nộp.

**Sinh viên:** Phạm Vũ Ngọc Duy — 23127183

**Khai báo:** *I use AI tools for the following tasks:*

| # | Công cụ AI | Thời điểm | Việc |
|---|---|---|---|
| AI-01 | | | Sinh `playwright.config.js` |
| AI-02 | | | Sinh `tools/preflight.mjs` |
| AI-03 | | | Sinh `data-loader.js` + `assertions.js` |
| AI-05 | Claude Code (Sonnet 5) | 2026-08-15 ~16:30 (+07) | Sinh `feature-a-login.csv` (16 TC) + `login.page.js` + `feature-a-login.spec.js` cho FR-02 |
| AI-06 | Claude Code (Sonnet 5) | 2026-08-15 18:50 (+07) | Sửa định dạng `feature-a-login.csv` (thiếu BOM UTF-8, quote không nhất quán) + vá `data-loader.js` |
| AI-07 | | | Đọc UI `/checkout`, phân tích state giỏ hàng |
| AI-08 | | | Sinh `feature-b-coupon.json` |
| AI-09 | | | Sinh `checkout.page.js` + `feature-b-coupon.spec.js` |
| AI-10 | | | Đọc UI admin, phân tích `handleProductSubmit`/`deleteProduct` |
| AI-11 | | | Sinh `feature-c-product-admin.csv` |
| AI-12 | | | Sinh `admin-products.page.js` + spec |
| AI-13 | | | Sinh `run-all-browsers.mjs` + `stamp-report.mjs` + `summarize.mjs` |
| AI-14 | | | Hỗ trợ phân loại Fail / viết gap analysis |

---

## [AI-01]..[AI-04] `<còn thiếu — xem ghi chú>`

> Các mục AI-01 (playwright.config.js), AI-02 (tools/preflight.mjs), AI-03 (data-loader.js +
> assertions.js), AI-04 (tests/utils/env.js + fixtures/base.js) đã được **sinh và review**
> trong các phiên trước nhưng **chưa điền chi tiết prompt nguyên văn vào đây**. Việc backfill
> 4 mục này vẫn còn nằm trong việc bạn cần làm — xem checklist cuối file.

---

## [AI-05] Sinh data file + page object + spec cho Feature A (FR-02)

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~16:30 (+07) |
| Bước trong quy trình | Bước 4-6 của `docs/03-FEATURE-A-FR02.md` — data file, page object, spec |

**Prompt (nguyên văn — nguyên văn tin nhắn của tôi trong chat):**

> "1. khởi động sut cho tôi
> 2. chạy các prompt các phần trong file docs/03 và trình bày chi tiết các phần tôi cần tự làm
> ở phần này sau khi chạy prompt và để tôi điền nội dung vào"

**Output của AI:**
- `tests/data/feature-a-login.csv` — 16 test case (5 login, 2 ui-check, 7 lockout, 2 robust)
- `tests/pages/login.page.js` — page object neo selector theo `label:text-is(...) + input`
- `tests/feature-a-login.spec.js` — spec 4 mode (login/ui-check/lockout/lockout-wait)
- AI tự thêm 4 cột so với schema gợi ý trong `docs/03` (`wrongPassword`, `finalAction`,
  `expectedAttempts`, `expectedLocked`, `expectedLastFailStatus`) vì schema gốc thiếu chỗ
  chứa mật khẩu SAI dùng để làm rớt tài khoản (khác mật khẩu ĐÚNG dùng để đăng ký/đăng nhập
  lại) — quyết định mở rộng schema này **cần tôi (sinh viên) xác nhận lại**, xem checklist.

**Human review:** Chạy thật trên chromium 2 lần liên tiếp trên SUT thật (không phải giả lập).
Đối chiếu 10 Fail với bảng dự đoán trong `docs/03` §2 — cả 10 đều khớp đúng 6 bug đã biết
(B001, B002, B003, B004, B005, B012), không có Fail nào do selector sai/script sai. Xác nhận
`cleanup` fixture dọn sạch: sau 2 lần chạy DB chỉ còn 2 user seed.

**Tôi đã sửa:** Không phải sửa lỗi — vì UI thật (`Login.jsx`, `AuthContext.jsx`, `server.js`)
đã được đọc trực tiếp từ đầu phiên làm việc (không phải AI đoán mù), nên selector và logic
đúng ngay từ lần sinh đầu. Đây là điểm cần LƯU Ý khi viết Critique (§10): quy trình bình
thường sẽ có vòng "AI đoán selector sai → sửa" mà lần này không có, vì bước đọc UI đã tách
riêng và làm trước.

**Kết quả sau khi sửa:** 16/16 test chạy, 6 pass / 10 fail / 0 flaky trên chromium (2 lần
độc lập, cùng kết quả).

---

## [AI-06] Sửa định dạng file `feature-a-login.csv`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 18:50 (+07) |
| Bước trong quy trình | Review lại data file sau AI-05 |

**Prompt (nguyên văn):**

> "khởi tạo lại file tests/data/feature-a-login.csv với format đẹp cho tôi bị lỗi format,
> định dạng ngôn ngữ quá nhiều có thể ghi lỗi ai phần này cho tôi"

**Output của AI (lần AI-05) có vấn đề gì:** File CSV gốc quote KHÔNG NHẤT QUÁN (một số cột
bọc `"..."`, một số để trần) và **không có BOM (Byte Order Mark) UTF-8** ở đầu file. Trên
Windows, Excel mở trực tiếp một file CSV UTF-8 không có BOM sẽ đoán nhầm bảng mã hệ thống
(thường là Windows-1252) và hiển thị toàn bộ dấu tiếng Việt thành ký tự lỗi (mojibake) — đây
là lỗi rất phổ biến với CSV tiếng Việt, đúng như tôi phản ánh.

**Vì sao AI (ở lần AI-05) không tự bắt được lỗi này:** AI sinh file bằng cách ghi trực tiếp
chuỗi UTF-8 thường (không BOM) — hành vi mặc định của hầu hết công cụ ghi file, tối ưu cho
việc MÁY đọc (Node.js `fs.readFileSync(..., 'utf8')` không cần BOM). AI không mô phỏng bước
"người dùng mở file này bằng Excel trên Windows" nên không tự phát hiện ra sự khác biệt giữa
"máy đọc được" và "người mở bằng Excel thấy đúng".

**Tôi (AI) đã sửa:**
1. `tests/utils/data-loader.js` — thêm hàm `stripBom()`, áp dụng cho cả `loadCsv` và
   `loadJson`, để loader không vỡ nếu file có BOM (kể cả khi sau này bạn mở/sửa/lưu lại file
   bằng Excel — Excel tự động chèn BOM mỗi lần "Save As → CSV UTF-8").
2. `tests/data/feature-a-login.csv` — ghi lại với BOM UTF-8 ở đầu file, và bọc TẤT CẢ 19 cột
   trong dấu ngoặc kép một cách nhất quán (kể cả số và dấu "-").
3. Gặp lỗi `EPERM`/`Device or resource busy` khi ghi đè — file đang bị một chương trình khác
   (nhiều khả năng VS Code) khóa. Đã hỏi lại và chờ người dùng đóng file trước khi ghi lại.

**Kết quả sau khi sửa:** Xác nhận 3 byte đầu file là `EF BB BF` (đúng chuẩn BOM UTF-8) bằng
`xxd`. `loadCsv` đọc đúng 16 dòng, cột đầu tiên của header là `"tcId"` sạch (không dính BOM).
Chạy lại `feature-a-login.spec.js` trên chromium: **kết quả giống hệt trước khi sửa format**
(6 pass / 10 fail / 0 flaky) — xác nhận việc đổi format không ảnh hưởng dữ liệu hay logic.

---

*(lặp block trên cho từng lượt tương tác — còn thiếu AI-01..AI-04, và AI-07 trở đi cho
Feature B/C, xem checklist cuối file `docs/11-AI-AUDIT-CRITIQUE.md`)*
