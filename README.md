# HW04 — Automation Testing on EShop

> ⚠️ **ĐÂY LÀ BẢN MẪU.** Mọi chỗ `<…>` phải thay bằng số liệu **thật** lấy từ `reports/summary.md`.
> Không điền số bằng tay khi chưa chạy đủ 9 lượt. Xóa dòng cảnh báo này trước khi nộp.

- **Sinh viên:** Phạm Vũ Ngọc Duy — **MSSV:** 23127183
- **Môn:** Kiểm thử phần mềm — **Bài:** HW04-AI Automation Testing
- **SUT:** EShop — https://github.com/ttbhanh/eshop-sut

## Liên kết

| | |
|---|---|
| Repo bài làm (public) | `<link>` |
| Video demo Task 2 (unlisted, ≥5 phút) | `<link>` |
| Video demo Agent Skill (§7) | `<link>` |
| GitHub Issues (bug mới) | `<link>` |
| Báo cáo chính | [report/main-report.md](report/main-report.md) |
| Test summary sinh tự động | [reports/summary.md](reports/summary.md) |

---

## 1. Ba feature đã automation (§5)

Lấy lại đúng 3 feature web đã chọn ở HW02, mỗi Pool một feature. Pool D (mobile) không dùng ở HW04 theo §5.

| | Feature | FR | App / route | File dữ liệu | Spec file |
|---|---|---|---|---|---|
| **A** | Đăng nhập & Khóa tài khoản | FR-02 | web :5173 `/login` | `tests/data/feature-a-login.csv` — `<n>` TC | `tests/feature-a-login.spec.js` |
| **B** | Mã giảm giá (Coupon) | FR-09 | web :5173 `/checkout` | `tests/data/feature-b-coupon.json` — `<n>` TC | `tests/feature-b-coupon.spec.js` |
| **C** | Quản lý Sản phẩm (CRUD) | FR-15 | admin :5174 tab Sản phẩm | `tests/data/feature-c-product-admin.csv` — `<n>` TC | `tests/feature-c-product-admin.spec.js` |

Không trùng feature trong nhóm: ba feature không đổi so với HW02 nên thỏa thuận phân công của HW02 vẫn còn hiệu lực.

## 2. Test Summary Report (§14)

> Số liệu dưới đây **copy từ `reports/summary.md`** (sinh bằng `npm run summary` từ `reports/json/*.json`).

| Chỉ số | Giá trị |
|---|---|
| Số feature automation | `<3>` |
| Số test case automation | `<n>` (A: `<n>` · B: `<n>` · C: `<n>`) |
| Số lượt chạy browser | `<9>` (3 feature × chromium/firefox/webkit) |
| Số lần thực thi (TC × engine) | `<n>` |
| Pass | `<n>` |
| Fail | `<n>` |
| Flaky | `<n>` |
| Skipped | `<n>` |
| Test case Fail ở ≥1 engine | `<n>` |
| Số defect truy được từ các Fail | `<n>` (`<n>` mới + `<n>` đã có từ HW02) |
| Tổng thời gian chạy | `<n>`s |
| Link video demo Task 2 | `<link>` |

### Theo feature

| Feature | TC | Positive | Negative | Edge/BVA | Lượt | Pass | Fail | Defect |
|---|---|---|---|---|---|---|---|---|
| A — FR-02 | | | | | 3 | | | |
| B — FR-09 | | | | | 3 | | | |
| C — FR-15 | | | | | 3 | | | |
| **Tổng** | | | | | **9** | | | |

### 9 lượt chạy — mỗi lượt một HTML report

| # | Feature | Engine | Test | Pass | Fail | Report |
|---|---|---|---|---|---|---|
| 1 | A | chromium | | | | [`a-chromium`](reports/html/a-chromium/index.html) |
| 2 | A | firefox | | | | [`a-firefox`](reports/html/a-firefox/index.html) |
| 3 | A | webkit | | | | [`a-webkit`](reports/html/a-webkit/index.html) |
| 4 | B | chromium | | | | [`b-chromium`](reports/html/b-chromium/index.html) |
| 5 | B | firefox | | | | [`b-firefox`](reports/html/b-firefox/index.html) |
| 6 | B | webkit | | | | [`b-webkit`](reports/html/b-webkit/index.html) |
| 7 | C | chromium | | | | [`c-chromium`](reports/html/c-chromium/index.html) |
| 8 | C | firefox | | | | [`c-firefox`](reports/html/c-firefox/index.html) |
| 9 | C | webkit | | | | [`c-webkit`](reports/html/c-webkit/index.html) |

Mỗi report hiển thị `Run by: 23127183` + timestamp ISO 8601 (§6, §11).

> **Vì sao Fail nhiều lại đúng:** kỳ vọng trong mọi file dữ liệu lấy theo **đặc tả FR**, không theo hành vi hiện tại của SUT. SUT được thiết kế có bug cố ý, nên Fail = SUT lệch đặc tả. Nếu điền kỳ vọng theo hành vi hiện tại thì suite Pass 100% và không phát hiện được bug nào.
> Và **số lần Fail ≠ số bug**: một defect có thể gây nhiều Fail × nhiều engine. Bảng quy đổi ở [bug-report/bug-report.md](bug-report/bug-report.md).

## 3. Assertion pattern (§6 đòi ≥3, khác nhau về bản chất)

| Pattern | Kiểm gì | Bắt được lớp bug nào | Feature |
|---|---|---|---|
| P1 DOM / web-first | trạng thái thấy được trên UI | thiếu thông báo lỗi, sai nhãn, mật khẩu không che | A, B, C |
| P2 URL / điều hướng | có đi đúng nơi đặc tả nói | đăng nhập thành công mà không rời `/login` | A, B |
| P3 Backend state (REST) | state thật trong DB | UI báo lỗi mà DB vẫn tạo dữ liệu, và ngược lại | A, B, C |
| P4 Soft numeric | tiền, bộ đếm, thời gian | công thức % sai, bộ đếm +2, khóa 180s | A, B |
| P5 Network / dialog | request có gửi không, status gì, có hỏi xác nhận không | chặn sai tầng; 401 vs 403; xóa không xác nhận | A, B, C |

Ba biến thể cú pháp của cùng một loại kiểm (`toBeVisible`/`toContainText`/`toHaveText`) chỉ tính là **một** pattern.

## 4. Cách chạy

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\backend"; node database.js; node server.js
```

```bash
npm install; npx playwright install; npm run preflight
```

```bash
node tools/run-all-browsers.mjs
```

```bash
npm run summary
```

## 5. Agent Skills (§7)

| Skill | Việc |
|---|---|
| `automation-suite` | quy trình 6 bước sinh + duyệt script cho một feature |
| `data-driven-tests` | test case → file dữ liệu ngoài + kế hoạch assertion |
| `multi-browser-report` | 9 lượt, HTML report có Run by, đọc khác biệt engine |
| `ai-audit-logger` | ghi AI Audit Report (§9) |

## 6. Bảng tự đánh giá (§15)

| No. | Tiêu chí | Điểm tối đa | Tự chấm | Căn cứ |
|---|---|---|---|---|
| 1 | Task 1 — Feature A (FR-02) | 25 | | |
| 1 | Task 1 — Feature B (FR-09) | 25 | | |
| 1 | Task 1 — Feature C (FR-15) | 25 | | |
| 2 | Task 2 — Video demo | 15 | | |
| 3 | Agent Skills | 10 | | |
| | **Tổng** | **100** | | |

**Tên file nộp:** `23127183_HW04_AI_Automation_<điểm>.zip`
