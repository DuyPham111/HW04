# 01 — Dựng môi trường (Windows / PowerShell)

> Kết quả cuối buổi này: SUT chạy được, `npm run preflight` in ra toàn `[OK]`, và `npx playwright test --list` liệt kê được test.
> Thời lượng: ~1.5 giờ.

---

## 1. Khởi động SUT

SUT nằm sẵn ở `D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main`. Dùng **3 cửa sổ PowerShell**, mỗi cái một service — đừng đóng chúng khi đang chạy test.

**Cửa sổ 1 — Backend (:3000).** Lần đầu và mỗi khi cần reset dữ liệu về gốc:

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\backend"; node database.js; node server.js
```

`node database.js` **xóa và seed lại DB** (`database.sqlite`). Chạy nó **trước mỗi lượt 9 browser** để 9 report cùng xuất phát từ một trạng thái — không thì lượt sau ăn rác của lượt trước và số liệu không giải thích được.

**Cửa sổ 2 — Frontend web (:5173):**

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\frontend-web"; npm run dev
```

**Cửa sổ 3 — Frontend admin (:5174):**

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\frontend-admin"; npm run dev
```

Kiểm nhanh bằng mắt: mở `http://localhost:5173/login` và `http://localhost:5174`.

### Dữ liệu seed cần thuộc (test data của bạn dựa hết vào đây)

| Loại | Giá trị |
|---|---|
| Tài khoản | `admin@eshop.com / Admin123!` (role admin) · `test@eshop.com / Test1234!` (user) |
| Sản phẩm | #1 iPhone 15 Pro Max `30.000.000` · #2 Samsung S24 Ultra `28.000.000` · #3 MacBook Pro M3 `45.000.000` · #4 AirPods Pro 2 `6.000.000` · #5 Keychron Q1 `4.000.000` |
| Danh mục | 1 Điện thoại · 2 Laptop · 3 Phụ kiện |
| Coupon | `SAVE10` percent 10, min 300.000 · `BIGBUY` fixed 50.000, min 500.000 · `VIP100` fixed 100.000, min 300.000, max 2 lượt/người · `EXPIRED` percent 20, min 100.000, hết hạn 2020-01-01 |

### API sẽ dùng làm assertion backend (pattern P3) và làm setup/cleanup

| Endpoint | Auth | Dùng để |
|---|---|---|
| `POST /api/login` | không | lấy token admin cho fixture |
| `POST /api/register` | không | **tạo user dùng-một-lần** cho các TC khóa tài khoản của FR-02 |
| `GET /api/admin/users` | Bearer | đọc `login_attempts`, `locked_until` — **đây là thứ cho phép kiểm bộ đếm khóa bằng máy** |
| `DELETE /api/admin/users/:id` | Bearer | dọn user test |
| `GET/POST/PUT/DELETE /api/products[/:id]` | **không** | setup + kiểm state thật cho FR-15, và tạo sản phẩm giá đặc biệt cho FR-09 |
| `POST /api/apply-coupon` | không | đối chiếu kết quả UI với API cho FR-09 |

---

## 2. Cài môi trường test

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04\HW04-Automation-Testing"; npm init -y; npm i -D @playwright/test; npx playwright install
```

`npx playwright install` tải 3 engine (chromium, firefox, webkit) — vài trăm MB, chạy một lần. **WebKit chạy được trên Windows** (Playwright đóng gói sẵn), nên yêu cầu 3 browser của §6 đạt được mà không cần máy Mac.

Sau đó sửa `package.json`: thêm `"type": "module"` và khối `scripts`:

```json
"type": "module",
"scripts": {
  "preflight": "node tools/preflight.mjs",
  "test:a": "playwright test tests/feature-a-login.spec.js",
  "test:b": "playwright test tests/feature-b-coupon.spec.js",
  "test:c": "playwright test tests/feature-c-product-admin.spec.js",
  "test:all-browsers": "node tools/run-all-browsers.mjs",
  "summary": "node tools/summarize.mjs"
}
```

---

## 3. Sinh `playwright.config.js` — prompt bước 1

Mở Claude Code **tại thư mục `HW04-Automation-Testing`** rồi dán:

> Tôi làm bài automation testing với Playwright trên SUT EShop. Sinh giúp tôi `playwright.config.js` với các ràng buộc sau, **giải thích lý do bằng comment tiếng Việt cho từng lựa chọn**:
>
> 1. `testDir: './tests'`, 3 project = 3 engine: chromium, firefox, webkit.
> 2. `fullyParallel: false`, `workers: 1` — vì FR-02 (bộ đếm khóa) và FR-15 (CRUD sản phẩm) đều đụng state dùng chung trong SQLite, chạy song song sẽ làm test đạp chân nhau.
> 3. `retries: 0` — báo cáo phải phản ánh đúng lần chạy đầu; retry sẽ che test flaky mà đề yêu cầu tôi phân tích.
> 4. Reporter: `list` + `html` + `json`. Đường dẫn thư mục HTML, file JSON và `outputDir` phải **đọc từ biến môi trường** (`PW_HTML_DIR`, `PW_JSON`, `PW_ARTIFACTS`) để một script runner tách được 9 lượt chạy thành 9 report độc lập; mặc định trỏ vào `demo/` chứ không phải `reports/`, để lệnh chạy lẻ không ghi đè bằng chứng đã nộp.
> 5. Khối `metadata` chứa: `Run by: 23127183 — Phạm Vũ Ngọc Duy`, `Run at (ISO 8601)`, `Run label`, tên môn, mô tả SUT, danh sách 3 feature (A: FR-02 Đăng nhập & khóa tài khoản, B: FR-09 Mã giảm giá, C: FR-15 Quản lý sản phẩm).
> 6. `use`: `baseURL: http://localhost:5173`, `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'off'`, `actionTimeout: 10000`, `navigationTimeout: 20000`. `timeout: 60000` cho cả test (FR-02 có TC chờ hết hạn khóa).
> 7. Export thêm hằng số `WEB_URL=http://localhost:5173`, `ADMIN_URL=http://localhost:5174`, `API_URL=http://localhost:3000`, đều cho phép override bằng env.
>
> Chưa viết test nào cả. Chỉ file config.

**Bạn phải review cái gì** (đừng dán xong là xong):

- [ ] `workers: 1` có thật không? Nếu AI để mặc định (đa worker) → sửa, và ghi vào gap analysis là AI bỏ sót ràng buộc state dùng chung.
- [ ] `retries` có bị đặt thành 1–2 không? Playwright hay được cấu hình vậy → phải về 0.
- [ ] Thư mục report mặc định có trỏ vào `reports/` không? Nếu có → đổi sang `demo/`, vì `reports/` là bằng chứng nộp bài.
- [ ] `timeout` 30s mặc định có đủ cho TC chờ khóa 31 giây không? Không → 60s.

---

## 4. `tools/preflight.mjs` — prompt bước 2

> Viết `tools/preflight.mjs` (Node ESM, không thêm dependency) kiểm tra SUT đã sẵn sàng trước khi chạy suite, in kết quả dạng `[OK]` / `[LOI]` và `process.exit(1)` nếu có lỗi. Kiểm 6 thứ:
> 1. `GET http://localhost:3000/api/products` trả 200;
> 2. `GET http://localhost:5173/` trả 200;
> 3. `GET http://localhost:5174/` trả 200;
> 4. `GET /api/products/1` có `name` (seed data còn nguyên);
> 5. `POST /api/login` với `admin@eshop.com/Admin123!` trả 200 (lấy được token admin);
> 6. `POST /api/apply-coupon` với `{code:"SAVE10", total_amount: 400000}` trả 200 — xác nhận 4 coupon seed còn nguyên.
>
> Nếu lỗi, in hướng dẫn: chạy lại `node database.js` rồi `node server.js` trong thư mục backend.

Chạy thử: `npm run preflight`. Chưa toàn `[OK]` thì **dừng lại sửa**, đừng viết test — chạy 9 lượt trên SUT chưa lên chỉ cho ra 9 report Fail vì môi trường, vô giá trị làm bằng chứng.

---

## 5. `tests/utils/env.js` — prompt bước 3

> Viết `tests/utils/env.js` export: `STUDENT_ID = '23127183'`, `STUDENT_NAME = 'Phạm Vũ Ngọc Duy'`, `WEB_URL`, `ADMIN_URL`, `API_URL` (đều cho override bằng `process.env`), `ADMIN_USER = {email:'admin@eshop.com', password:'Admin123!'}`, `TEST_USER = {email:'test@eshop.com', password:'Test1234!'}`, và `SEED_EMAILS` là `Set` chứa 2 email seed.
> Comment rõ: `SEED_EMAILS` **không phải test data** mà là **danh sách bảo vệ** — bước dọn dữ liệu sau test tuyệt đối không được xóa 2 tài khoản này, xóa là hỏng toàn bộ các lượt chạy sau và cả các HW khác.

> **Vì sao tách file này:** §6 cấm hard-code *test data* trong spec. Email admin dùng để lấy token không phải test data, nhưng để nó nằm lẫn trong `.spec.js` thì lúc TA grep tìm dữ liệu hard-code sẽ rất khó phân biệt. Tách ra là tự bảo vệ mình.

---

## 6. `tests/fixtures/base.js` — prompt bước 4

> Viết `tests/fixtures/base.js` mở rộng `test` của Playwright, export `test`, `expect` và một hàm `annotateTestCase`. Bốn fixture:
> 1. `adminToken` (scope `worker`): `POST {API_URL}/api/login` với `ADMIN_USER`, trả `token`. Nếu fail thì `throw` với thông báo tiếng Việt bảo tôi khởi động SUT.
> 2. `api`: `APIRequestContext` với `baseURL = API_URL` và header `Authorization: Bearer <adminToken>` — dùng cho assertion backend-state.
> 3. `runMeta` (`auto: true`): đẩy vào `testInfo.annotations` hai dòng `Run by: 23127183 — Phạm Vũ Ngọc Duy` và `Started at (ISO)` — để HTML report hiện MSSV ở **từng test case**, không chỉ ở header (đề §11 kiểm bằng mắt).
> 4. `cleanup`: hàng đợi hàm dọn dữ liệu, chạy **sau test kể cả khi test Fail**, nuốt lỗi để việc dọn không làm đổi kết quả test.
>
> `annotateTestCase(testInfo, row)` đẩy annotation: `Test case` = `row.tcId`, `Technique` = `row.technique`, `Spec` = `row.specRef`, `Bug đã biết (HW02)` = `row.bugRef` khi khác `-`.

**Review:** fixture `cleanup` phải chạy job theo **thứ tự ngược** (cái tạo sau xóa trước) và phải nằm trong `try/catch`. AI hay quên `catch` → một lỗi dọn dẹp sẽ làm test đang Pass chuyển thành Fail và bạn mất cả buổi đi tìm.

---

## 7. Commit đầu tiên

```bash
git init; git add .; git commit -m "chore: khoi tao repo HW04 - playwright config, preflight, fixtures"
```

> Commit này **không** tính vào mốc 8 commit của §12 (chưa chạm file `.spec.js`). Đọc [12-GIT-COMMIT-LOG.md](12-GIT-COMMIT-LOG.md) để biết commit nào mới được tính.

---

→ Tiếp: [02-DATA-DRIVEN-VA-ASSERTION.md](02-DATA-DRIVEN-VA-ASSERTION.md)
