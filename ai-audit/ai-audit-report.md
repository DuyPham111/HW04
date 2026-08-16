# AI Audit Report — HW04 Automation Testing (§9)

> ⚠️ **BỘ KHUNG.** Ghi **ngay sau mỗi phiên** làm việc với AI, prompt phải **nguyên văn**.
> Hướng dẫn: [docs/11-AI-AUDIT-CRITIQUE.md](../docs/11-AI-AUDIT-CRITIQUE.md). Xóa dòng này trước khi nộp.

**Sinh viên:** Phạm Vũ Ngọc Duy — 23127183

**Khai báo:** *I use AI tools for the following tasks:*

| # | Công cụ AI | Thời điểm | Việc |
|---|---|---|---|
| AI-00 | Claude Code (Sonnet 5) | 2026-08-15 ~15:45 (+07) | Kiểm + sửa `package.json` (bị `npm init -y` lấy nhầm description, key `type` trùng lặp) |
| AI-01 | Claude Code (Sonnet 5) | 2026-08-15 ~15:50 (+07) | Sinh `playwright.config.js` |
| AI-02 | Claude Code (Sonnet 5) | 2026-08-15 ~15:52 (+07) | Sinh `tools/preflight.mjs` |
| AI-03 | Claude Code (Sonnet 5) | 2026-08-15 ~15:55 (+07) | Sinh `tests/utils/env.js` + `tests/fixtures/base.js` |
| AI-04 | Claude Code (Sonnet 5) | 2026-08-15 ~16:05 (+07) | Sinh `tests/utils/data-loader.js` + `tests/utils/assertions.js` |
| AI-05 | Claude Code (Sonnet 5) | 2026-08-15 ~16:30 (+07) | Sinh `feature-a-login.csv` (16 TC) + `login.page.js` + `feature-a-login.spec.js` cho FR-02 |
| AI-06 | Claude Code (Sonnet 5) | 2026-08-15 18:50 (+07) | Sửa định dạng `feature-a-login.csv` (thiếu BOM UTF-8, quote không nhất quán) + vá `data-loader.js` |
| AI-06b | Claude Code (Sonnet 5) | 2026-08-15 19:49 (+07) | Chuyển SUT sang bản mới tải (`tham_khao/eshop-sut-main`) + vá lỗi `loadCsv` bỏ sót comment bị Excel quote |
| AI-07 | Claude Code (Opus 5) | 2026-08-15 20:55 (+07) | Đọc UI `/checkout` + `/cart` + `ProductDetail`, phân tích state giỏ hàng |
| AI-08 | Claude Code (Opus 5) | 2026-08-15 21:05 (+07) | Sinh `feature-b-coupon.json` (18 TC) + phát hiện 3 lỗi trong utils |
| AI-09 | Claude Code (Opus 5) | 2026-08-15 21:17 (+07) | Sinh `checkout.page.js` + `cart.page.js` + `feature-b-coupon.spec.js`, chạy thật |
| AI-09b | Claude Code (Sonnet 5) | 2026-08-16 12:27 (+07) | Sửa lỗi mất report HTML/JSON Feature B (tự gây ra do `--reporter=list`) |
| AI-10 | | | Đọc UI admin, phân tích `handleProductSubmit`/`deleteProduct` |
| AI-11 | | | Sinh `feature-c-product-admin.csv` |
| AI-12 | | | Sinh `admin-products.page.js` + spec |
| AI-13 | | | Sinh `run-all-browsers.mjs` + `stamp-report.mjs` + `summarize.mjs` |
| AI-14 | | | Hỗ trợ phân loại Fail / viết gap analysis |

---

## [AI-00] Kiểm và sửa `package.json`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~15:45 (+07) |
| Bước trong quy trình | Trước Bước 1 của `docs/01-SETUP.md` — kiểm môi trường đã cài |

**Prompt (nguyên văn):**

> "1. check lại file package.json xem đã chính xác chưa, nếu chưa thực hiện chính xác cho tôi
> 2. chạy các prompt bước 1,2,3,4 ở docs\01-SETUP.md cho tôi hoàn thiện phần đó xong rồi nói
> cho tôi những việc đã thực hiện được
> 3. Git commit"

**Output của AI (kiểm tra):** Phát hiện `package.json` do `npm init -y` sinh có 2 lỗi: (1)
trường `description` bị lấy nhầm nội dung từ dòng cảnh báo Markdown trong `README.md` thay vì
mô tả dự án; (2) key `"type"` xuất hiện **2 lần** trong cùng object (`"commonjs"` rồi
`"module"` — JSON hợp lệ về cú pháp nhưng khai báo trùng, giá trị cuối thắng, dễ gây nhầm khi
đọc lại).

**Vì sao lỗi này xảy ra:** Không phải AI sinh sai — đây là hành vi tự động của `npm init -y`
(đọc README tìm dòng đầu tiên làm description) cộng với việc tôi (AI) chạy `npm init -y` rồi
sau đó chỉnh sửa "scripts" mà không dọn lại 2 trường bị nhiễu từ bước init.

**Tôi đã sửa:** Viết lại `package.json` sạch: `description` đúng nội dung dự án, gộp 2 key
`type` thành một `"type": "module"` duy nhất.

**Kết quả sau khi sửa:** `node -e "JSON.parse(...)"` xác nhận file hợp lệ.

---

## [AI-01] Sinh `playwright.config.js`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~15:50 (+07) |
| Bước trong quy trình | Bước 3 của `docs/01-SETUP.md` |

**Prompt (nguyên văn, theo đúng `docs/01-SETUP.md` §3):**

> "Tôi làm bài automation testing với Playwright trên SUT EShop. Sinh giúp tôi
> `playwright.config.js` với các ràng buộc sau, giải thích lý do bằng comment tiếng Việt cho
> từng lựa chọn: (1) testDir './tests', 3 project = 3 engine chromium/firefox/webkit; (2)
> fullyParallel: false, workers: 1 — vì FR-02 (bộ đếm khóa) và FR-15 (CRUD sản phẩm) đều đụng
> state dùng chung trong SQLite; (3) retries: 0 — báo cáo phải phản ánh đúng lần chạy đầu; (4)
> reporter list+html+json, đường dẫn đọc từ biến môi trường PW_HTML_DIR/PW_JSON/PW_ARTIFACTS
> để tách 9 lượt chạy; (5) khối metadata chứa Run by/Run at/Run label/Course/SUT/Features; (6)
> use: baseURL http://localhost:5173, trace retain-on-failure, screenshot only-on-failure,
> timeout 60000 (FR-02 có TC chờ hết hạn khóa); (7) export WEB_URL/ADMIN_URL/API_URL cho
> override bằng env."

**Output của AI:** File `playwright.config.js` đầy đủ 7 ràng buộc trên.

**Human review:** Đối chiếu từng điểm trong checklist của `docs/01-SETUP.md` §3 (workers=1
thật sự? retries=0 thật sự? thư mục report mặc định có trỏ nhầm vào `reports/` không? timeout
đủ 60s không?) — cả 4 điểm đều đúng ngay từ lần sinh đầu, không phải sửa.

**Kết quả:** `node -c playwright.config.js` không lỗi cú pháp; dùng xuyên suốt không phải sửa
lại cho tới nay.

---

## [AI-02] Sinh `tools/preflight.mjs`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~15:52 (+07) |
| Bước trong quy trình | Bước 4 của `docs/01-SETUP.md` |

**Prompt (nguyên văn, theo `docs/01-SETUP.md` §4):**

> "Viết `tools/preflight.mjs` (Node ESM, không thêm dependency) kiểm tra SUT đã sẵn sàng
> trước khi chạy suite, in kết quả dạng `[OK]`/`[LOI]` và `process.exit(1)` nếu có lỗi. Kiểm 6
> thứ: GET /api/products trả 200; GET :5173/ trả 200; GET :5174/ trả 200; GET /api/products/1
> có `name`; POST /api/login admin trả 200; POST /api/apply-coupon với SAVE10 trả 200. Nếu
> lỗi, in hướng dẫn chạy lại `node database.js` rồi `node server.js`."

**Output của AI:** `tools/preflight.mjs` — 6 hàm `check()` độc lập, in `[OK]`/`[LOI]` từng
dòng.

**Human review + kết quả:** Chạy thật `npm run preflight` khi SUT CHƯA khởi động → đúng 6
dòng `[LOI]`, exit code 1. Sau khi khởi động 3 service → 6/6 `[OK]`. Dùng lại nhiều lần xuyên
suốt quá trình làm bài (trước mỗi lần chạy test), luôn báo đúng trạng thái thật của SUT,
không phải sửa.

---

## [AI-03] Sinh `tests/utils/env.js` + `tests/fixtures/base.js`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~15:55 (+07) |
| Bước trong quy trình | Bước 5-6 của `docs/01-SETUP.md` |

**Prompt (nguyên văn, theo `docs/01-SETUP.md` §5-6):**

> "Viết `tests/utils/env.js` export STUDENT_ID='23127183', STUDENT_NAME, WEB_URL/ADMIN_URL/
> API_URL (override bằng process.env), ADMIN_USER, TEST_USER, và SEED_EMAILS là Set — không
> phải test data mà là danh sách BẢO VỆ, bước dọn dữ liệu sau test không được xóa 2 tài khoản
> này.
> Viết `tests/fixtures/base.js` mở rộng test của Playwright, export test/expect/
> annotateTestCase. 4 fixture: adminToken (scope worker, POST /api/login lấy token, throw nếu
> fail kèm hướng dẫn khởi động SUT); api (APIRequestContext với Bearer token, dùng cho pattern
> P3); runMeta (auto:true, đẩy annotation Run by + Started at vào từng test); cleanup (hàng
> đợi dọn dữ liệu, chạy SAU test kể cả khi Fail, theo thứ tự ngược, nuốt lỗi)."

**Output của AI:** 2 file đúng đặc tả.

**Human review:** Kiểm riêng: `cleanup` có chạy theo thứ tự ngược và có `try/catch` không (AI
hay quên `catch`, khiến lỗi dọn dẹp làm hỏng kết quả test đang Pass) → đã có sẵn `try { } catch
{}` đúng ngay từ lần sinh đầu.

**Kết quả:** Dùng xuyên suốt Feature A, xác nhận qua nhiều lần chạy: sau mỗi lần chạy DB luôn
chỉ còn đúng 2 user seed, không sót user tạm — `cleanup` hoạt động đúng.

---

## [AI-04] Sinh `tests/utils/data-loader.js` + `tests/utils/assertions.js`

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 ~16:05 (+07) |
| Bước trong quy trình | `docs/02-DATA-DRIVEN-VA-ASSERTION.md` |

**Prompt (nguyên văn — tin nhắn của tôi trong chat):**

> "chạy các prompt ở docs/02 cho tôi, nếu cần gì có thể hỏi tôi và sau khi chạy xong viết lại
> những gì đã làm và những gì tôi cần làm tiếp theo"

**Output của AI:**
- `data-loader.js`: `loadCsv`/`loadJson` + parser CSV tự viết (ô ngoặc kép chứa dấu phẩy,
  escape `""`) + 4 token `<empty>`/`<spaces:N>`/`<repeat:X:N>`/`<uniq>`.
- `assertions.js`: 5 pattern P1-P5 (DOM, URL, backend-state, soft numeric, network/HTTP-status)
  + tiện ích `parseMoney`.

**Human review:** AI **tự viết smoke test tạm** (file `.csv`/`.json`/`.mjs` tạm trong
scratchpad, xóa ngay sau khi kiểm) để xác nhận token CSV/JSON giải đúng, `parseMoney` đọc
đúng cả 2 định dạng phân cách nghìn (`.` kiểu VN / `,` kiểu US) và không âm thầm quy `"NaN ₫"`
về 0 — tất cả pass trước khi commit. Đây là bước tự-kiểm-chứng của AI trước khi tôi review lại
lần cuối.

**Kết quả:** Dùng đúng cho toàn bộ Feature A (16 TC CSV) không phải sửa logic gốc — chỉ phải
**vá thêm 2 lần sau đó** khi file CSV đi qua Excel (xem AI-06, AI-06b) — hai lần vá đó KHÔNG
làm hỏng logic gốc của AI-04, chỉ mở rộng độ bền cho tình huống thực tế mới phát sinh.

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
  lại).

**Xác nhận của sinh viên (2026-08-15):** Đã đọc lại toàn bộ 16 dòng CSV bằng Excel, đối chiếu
lập luận `FR02-BV-03` (khóa sớm 1 lần so với thiết kế) với `backend/server.js` bằng cách **tự
tay tái lập trên trình duyệt** — quan sát thực tế (401 → 403 từ lần sai thứ 2 do tài khoản có
sẵn 2 lần sai tồn đọng) khớp đúng với cơ chế `login_attempts += 2` mà AI đã phân tích. **Đồng
ý** với việc mở rộng schema 4 cột trên.

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

## [AI-06b] Chuyển SUT sang bản mới tải + vá lỗi loadCsv sau khi file qua tay Excel

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-15 19:49 (+07) |
| Bước trong quy trình | Đổi nguồn SUT + review lại `data-loader.js` |

**Prompt (nguyên văn):**

> "tôi vừa tải file eshop-sut bản mới về folder tham_khao, hãy dừng các bản đang chạy ở hw02
> giúp tôi và chạy bản mới nhất ở hw04 giúp tôi (set up rồi run cho tôi) vì bản hw2 có thể
> tôi đã từng đổi code nên sợ k khớp"

**Output của AI:**
1. Dừng 3 process cũ (backend/web/admin chạy từ `HW02-new/eshop-sut-main`) bằng
   `Stop-Process -Force` theo PID lấy từ `Get-NetTCPConnection`.
2. `diff` toàn bộ file nguồn liên quan (`server.js`, `database.js`, `Login.jsx`,
   `Checkout.jsx`, `Cart.jsx`, `AuthContext.jsx`, `CartContext.jsx`, `App.jsx` web+admin)
   giữa bản HW02 cũ và bản mới ở `tham_khao/eshop-sut-main` — **kết quả: giống hệt nhau**,
   nỗi lo của tôi (đã lỡ sửa code bản cũ) không có cơ sở.
3. `npm install` cho cả 3 thư mục (`backend`, `frontend-web`, `frontend-admin`) của bản mới
   — thư mục vừa tải chưa có `node_modules`.
4. Seed DB + khởi động lại 3 service từ bản mới, `npm run preflight` → 6/6 `[OK]`.
5. **Phát hiện lỗi khi chạy lại `feature-a-login.spec.js` trên SUT mới**: tất cả 16 test báo
   `duplicate test title "...undefined — undefined"`. Nguyên nhân: file
   `tests/data/feature-a-login.csv` đã bị **Excel resave** (chính người dùng đã mở/lưu lại
   bằng Excel giữa 2 lượt chat) — dòng comment giải thích token `"-"` chứa dấu ngoặc kép bên
   trong, nên khi Excel lưu lại đã **tự động bọc cả dòng đó trong ngoặc kép** để escape hợp
   lệ. Dòng comment không còn bắt đầu bằng ký tự `#` ở byte đầu tiên nữa (bắt đầu bằng `"`),
   nên bộ lọc `l.trimStart().startsWith('#')` trong `loadCsv` bỏ sót nó — dòng đó bị hiểu
   nhầm thành header, làm lệch toàn bộ 16 dòng dữ liệu.

**Vì sao AI (ở các lần sinh trước) không tự bắt được lỗi này:** Bộ lọc comment ban đầu kiểm
trên CHUỖI THÔ (`l.trimStart().startsWith('#')`) thay vì trên Ô ĐÃ ĐƯỢC TÁCH bởi
`splitCsvLine`. Giả định ngầm là "dòng comment không bao giờ bị CSV-quote" — đúng với file
tự tay ghi, nhưng SAI khi file đi qua một vòng Excel "mở → sửa → lưu", vì Excel áp dụng luật
CSV-escaping cho MỌI dòng, kể cả dòng bắt đầu bằng `#`, nếu nội dung có ký tự cần escape
(dấu `"`, dấu `,`). Đây là lỗi về **giả định môi trường vận hành thực tế** (file sẽ được
người dùng mở bằng Excel) chứ không phải lỗi cú pháp.

**Tôi đã sửa:** `tests/utils/data-loader.js` — đổi bộ lọc comment sang tách ô bằng
`splitCsvLine(l)[0]` TRƯỚC rồi mới kiểm `startsWith('#')` trên ô đầu tiên đã unescape. Cách
này đúng bất kể dòng comment có bị Excel bọc quote hay không.

**Kết quả sau khi sửa:** `loadCsv` đọc lại đúng 16 dòng từ file đã qua Excel. Chạy lại
`feature-a-login.spec.js --project=chromium` trên SUT MỚI: **kết quả giống hệt** các lần
chạy trước trên SUT cũ (6 pass / 10 fail / 0 flaky, đúng cùng 10 TC Fail) — xác nhận cả việc
đổi SUT lẫn việc vá loader đều không làm thay đổi hành vi test.

---

**Xác nhận của sinh viên (2026-08-15):** Đã tự tay reset DB sau khi được cảnh báo tài khoản
`test@eshop.com` còn tồn đọng `login_attempts`, và tự kiểm chứng lại toàn bộ cơ chế B001 bằng
thao tác thật trên trình duyệt (xem AI-05). Đã duyệt lại toàn bộ nội dung Feature A (16 TC,
page object, spec, AI-00 → AI-06b) — không yêu cầu sửa gì thêm.

---

## [AI-07 → AI-09] Feature B — FR-09 Mã giảm giá (đọc UI · data file · page object · spec)

| | |
|---|---|
| Công cụ | Claude Code (**Opus 5** — đổi model từ Sonnet 5 sang Opus 5 bắt đầu từ lượt này) |
| Thời điểm | 2026-08-15 20:55 → 21:17 (+07) |
| Bước trong quy trình | Toàn bộ `docs/04-FEATURE-B-FR09.md` (Bước 1 → 6) |

**Prompt (nguyên văn):**

> "chuyển sang doc 4 cho tôi, chạy các prompt các phần trong file docs/04 và trình bày chi tiết
> các phầnđã làm sau khi chạy và các phần tôi cần bổ sung nội dung hoặc cần review lại nội dung
> thật chi tiết để tôi làm để hoàn thiện phần 04 trước khi qua 05"

**Output của AI:**
- `tests/data/feature-b-coupon.json` — 18 TC, 6 mode (cart-flow / total-set / guest /
  empty-code / usage-seed / ui-check).
- `tests/pages/checkout.page.js`, `tests/pages/cart.page.js` — page object, không assertion.
- `tests/feature-b-coupon.spec.js` — spec data-driven.
- **3 phát hiện quan trọng khi đọc UI thật (Bước 1)** mà `docs/04` viết trước đó chưa lường:
  1. `ProductDetail.jsx` **nuốt click đầu tiên** vào "Thêm vào giỏ hàng" (`clickCount === 0 →
     return`). Đây là bug của FR-07, không phải FR-09 → nếu để lẫn vào sẽ làm nhoè kết quả
     Feature B. Xử lý: TC `DT-01` vào giỏ từ **trang chủ** (nút này chạy ngay click đầu), TC
     `DT-08` vào từ **trang chi tiết** với hàm chờ-xác-nhận-rồi-bấm-bù.
  2. Trang chủ có cặp `<a href="/product/{id}">` và `<button>Thêm vào giỏ</button>` **liền kề
     nhau** → selector `a[href="..."] + button` chính xác tuyệt đối, không cần đếm thứ tự thẻ.
  3. Thanh toán thành công **không đổi URL** (chỉ đổi state `success`) → Feature B **không dùng
     được pattern P2**, phải bù bằng P3 (đối chiếu UI với body API).

**Human review — AI tự soát và tìm ra 3 lỗi THẬT trong code của chính các bước trước:**

| # | Lỗi | Vì sao lọt qua các bước trước |
|---|---|---|
| 1 | `parseMoney` **nuốt dấu âm** | Feature A không có phép tính tiền nào, nên hàm chỉ được kiểm với số dương. Bug B007 sinh ra tiền giảm ÂM (`-54.000.000 ₫`); hàm cũ trả về `54000000` → test vẫn Fail nhưng **bug report sẽ ghi sai trị số thực tế**, làm hỏng bằng chứng. |
| 2 | `loadJson` **tự trim chuỗi** → **Pass giả** | `resolveToken` trim mọi giá trị (đúng cho CSV — khoảng trắng quanh ô là nhiễu định dạng). Nhưng TC `FR09-BV-R03` kiểm *"SUT có tự cắt khoảng trắng thừa trong mã giảm giá không"*: với loader trim sẵn, TC nhận chuỗi **đã được cắt** và Pass mà **không kiểm gì cả** — công lao trim là của loader chứ không phải của SUT. |
| 3 | Thiếu cách so khớp thông báo tiếng Việt không phụ thuộc dấu | File dữ liệu ghi `expectedError` dạng không dấu (để sống sót qua các vòng chuyển đổi bảng mã như đã gặp ở AI-06/AI-06b), nhưng SUT trả thông báo **có dấu** → so khớp trực tiếp sẽ luôn sai. |

**Tôi đã sửa:**
1. `parseMoney` giữ dấu trừ khi nó nằm ngay trước cụm chữ số. Unit-test 8 trường hợp.
2. `resolveToken(raw, { trim })` — CSV giữ `trim: true`, JSON dùng `trim: false`. Kiểm lại
   Feature A (CSV) không bị ảnh hưởng: vẫn đọc đúng 16 dòng.
3. Thêm `normalizeVi` + `expectVisibleTextVi`, unit-test với 4 thông báo thật của SUT.

**Kết quả:** 18/18 test chạy, **11 pass / 7 fail / 0 flaky** trên chromium, chạy **2 lần độc
lập cho kết quả giống hệt nhau** (đúng cùng 7 TC Fail). 11 thông báo lỗi truy về đúng **4 bug**
đã dự đoán trong `docs/04` §3:

| Bug | TC Fail | Bằng chứng máy ghi được |
|---|---|---|
| **B006** — ngưỡng dùng `>` thay vì `>=` | BV-02, BV-05 | đơn đúng bằng ngưỡng (300.000 / 500.000) bị trả 400 thay vì 200; lặp lại trên **cả hai** loại coupon ⇒ lỗi ở phép so sánh dùng chung, không phải ở nhánh tính tiền |
| **B007** — công thức percent | DT-01, DT-08, BV-03 | tiền giảm **âm** `-54.000.000 ₫`, thành tiền `60.000.000 ₫` (gấp 10 lần đơn gốc 6.000.000) |
| **B008** — khách vãng lai | DT-07 | server trả **200** cho request không có `user_id`, bỏ qua toàn bộ nhánh kiểm giới hạn lượt |
| **B013** — ô tổng tiền sửa tự do | DT-10 | ô `isEditable() === true`, và số gõ tay `999.999.999` chảy thẳng thành số tiền phải thanh toán |

**Phát hiện thêm (không có trong dự đoán ban đầu):** assertion P3 (đối chiếu số trên UI với
`body` API thật) **không Fail ở bất kỳ TC nào** — nghĩa là UI hiển thị **đúng y nguyên** con số
API trả về. Kết luận: B007 nằm ở **tầng tính toán của API**, không phải tầng hiển thị. Đây là
loại kết luận mà kiểm thử thủ công ở HW02 không tách bạch được, vì mắt người chỉ thấy con số
cuối cùng trên màn hình.

**Đối chiếu với `Bug_Report.md` của chính tôi ở HW02** (sinh viên tự làm, xem checklist cuối
mục AI-09b): cả 4 bug đều khớp đúng cơ chế đã ghi trước đó —
- B006: HW02 test cả SAVE10 (300k) lẫn BIGBUY (500k), cùng kết luận lỗi `>` thay `>=` ở
  `server.js:379` — khớp `BV-02`/`BV-05`.
- B007: HW02 dùng giỏ 350k → "-3.150.000 ₫" (= -9×350k), thành tiền 3.500.000 (=10×350k).
  Feature B dùng AirPods 6.000.000 → "-54.000.000 ₫" (= -9×6.000.000) — **cùng công thức**,
  chỉ khác giỏ hàng, càng củng cố kết luận bug nằm ở hằng số `discount_value=10` bị dùng như
  10 thay vì 0.1.
- B008: HW02 xác nhận bug chỉ ở bước `apply-coupon` (không auth), bước `checkout` cuối vẫn
  chặn đúng (401) — Feature B chỉ kiểm đúng bước `apply-coupon`, không đụng `checkout`.
- B013: HW02 đã tạo đơn hàng giả thật (350.000.000 ₫, đơn #4) để xác nhận backend không tính
  lại; Feature B dừng ở bước kiểm ô sửa được (không tạo đơn giả) vì bảng `orders` không có API
  xoá — quyết định này đã ghi trong "TC không automation được" của `docs/04`.

---

## [AI-09b] Sửa lỗi mất report HTML/JSON của Feature B (tự gây ra khi verify)

| | |
|---|---|
| Công cụ | Claude Code (Sonnet 5) |
| Thời điểm | 2026-08-16 12:27 (+07) |
| Bước trong quy trình | Kiểm lại report Feature B theo yêu cầu người dùng |

**Prompt (nguyên văn):**

> "1. recheck lại câu lệnh npx playwright show-report demo/reports/html/b-chromium do k có tệp
> này
> 2. ở mục c hãy trình bày chi tiết hơn như vào file nào đọc mục nào để recheck được tốt hơn"

**Lỗi phát hiện:** Ở 2 lần chạy Feature B trước đó, tôi tự thêm `--reporter=list` vào dòng lệnh
(chỉ để log console gọn khi tôi tự đọc). Cờ này **ghi đè toàn bộ mảng `reporter`** trong
`playwright.config.js` — kể cả `html` và `json` bị bỏ qua hoàn toàn, không file report nào được
tạo ra (không phải ở đường dẫn dự định, cũng không phải ở đường dẫn mặc định).

**Vì sao AI (ở 2 lần chạy trước) không tự bắt được:** Chính `playwright.config.js` mà AI (tôi)
đã viết ở AI-01 **đã có sẵn comment cảnh báo** đúng vấn đề này ("KHÔNG truyền `--reporter` ở
đây: cờ CLI ghi đè cả mảng reporter..."), nhưng khi tôi tự thêm `--reporter=list` vào lệnh chạy
ở bước sau, tôi không đối chiếu lại với chính comment đó — hai bước cách nhau và không có cơ
chế nào bắt được mâu thuẫn tự thân này ngoài việc người/AI đọc lại toàn bộ trước khi chạy.

**Tôi đã sửa:**
1. Viết 2 test thực nghiệm (TEST 1 có `--reporter=list`, TEST 2 không có) trên cùng một TC để
   xác nhận chính xác cơ chế trước khi kết luận, thay vì đoán.
2. Chạy lại Feature B **không** kèm `--reporter`, để config tự quyết định `[list, html, json]`.
3. Dọn thư mục `demo/reports/html/adhoc` và `demo/reports/artifacts/adhoc` — đây là rác từ
   lệnh đếm test (`--list`) chạy trước đó, không phải kết quả thật (JSON của nó ghi
   `"skipped": 34` cho toàn bộ, không phải Pass/Fail thật).

**Kết quả sau khi sửa:** `demo/reports/html/b-chromium/index.html` (600KB) và
`demo/reports/json/b-chromium.json` (113KB) tồn tại thật. Kết quả **giống hệt** 2 lần chạy
trước (7 fail / 11 pass, đúng cùng 7 TC) — xác nhận lỗi chỉ ở khâu ghi report, không ảnh hưởng
tới kết quả test hay bug đã tìm được.

---

**Xác nhận của sinh viên (2026-08-16):** Đã đọc lại `tests/data/feature-b-coupon.json` và đối
chiếu với mã nguồn thật (`ProductDetail.jsx`, `server.js` dòng 363-441) theo hướng dẫn. Kết
luận từng mục:
- **C1** (2 TC robust không kiểm số tiền) — đồng ý giữ `null`.
- **C2** (tách `DT-01`/`DT-08` theo 2 đường vào giỏ) — đồng ý, hợp lý.
- **C3** (`expectedStatus: "4xx"` cho khách vãng lai) — đối chiếu `Main_Report.md` HW02, xác
  nhận đặc tả không quy định mã lỗi cụ thể, giữ nguyên.
- **C4** (`expectedError` không dấu) — giữ nguyên.
- **C5** (đối chiếu 4 bug với `Bug_Report.md` HW02) — đã tự đọc lại, xác nhận khớp hoàn toàn,
  chốt không cần sửa.

Feature B (`docs/04`) được coi là **hoàn thiện**, không còn mục nào cần review thêm trước khi
sang `docs/05-FEATURE-C-FR15.md`.

---

*(lặp block trên cho từng lượt tương tác — AI-01..AI-09b đã đầy đủ cho setup + Feature A + B.
AI-10 trở đi dành cho Feature C, ghi khi triển khai `docs/05-FEATURE-C-FR15.md`)*
