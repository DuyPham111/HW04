# HW04 — Automation Testing on EShop

- **Sinh viên:** Phạm Vũ Ngọc Duy — **MSSV:** 23127183
- **Môn:** Kiểm thử phần mềm — **Bài:** HW04-AI Automation Testing
- **SUT:** EShop — https://github.com/ttbhanh/eshop-sut

## Liên kết

| | |
|---|---|
| Repo bài làm (public) | https://github.com/DuyPham111/HW04 |
| Video demo Task 2 (unlisted, ≥5 phút) | https://youtu.be/YoSvR0AmFMs (18:01) |
| Video demo Agent Skill (§7) | https://youtu.be/0fjWAO-hutc (15:26) |
| GitHub Issues (bug mới) | https://github.com/DuyPham111/HW04/issues |
| Báo cáo chính | [report/main-report.md](report/main-report.md) |
| Test summary sinh tự động | [reports/summary.md](reports/summary.md) |

---

## 1. Ba feature đã automation (§5)

Lấy lại đúng 3 feature web đã chọn ở HW02, mỗi Pool một feature. Pool D (mobile) không dùng ở HW04 theo §5.

| | Feature | FR | App / route | File dữ liệu | Spec file |
|---|---|---|---|---|---|
| **A** | Đăng nhập & Khóa tài khoản | FR-02 | web :5173 `/login` | `tests/data/feature-a-login.csv` — 16 TC | `tests/feature-a-login.spec.js` |
| **B** | Mã giảm giá (Coupon) | FR-09 | web :5173 `/checkout` | `tests/data/feature-b-coupon.json` — 18 TC | `tests/feature-b-coupon.spec.js` |
| **C** | Quản lý Sản phẩm (CRUD) | FR-15 | admin :5174 tab Sản phẩm | `tests/data/feature-c-product-admin.csv` — 19 TC | `tests/feature-c-product-admin.spec.js` |

Không trùng feature trong nhóm: ba feature không đổi so với HW02 nên thỏa thuận phân công của HW02 vẫn còn hiệu lực.

## 2. Test Summary Report (§14)

> Số liệu dưới đây **copy từ `reports/summary.md`** (sinh bằng `npm run summary` từ `reports/json/*.json`).

| Chỉ số | Giá trị |
|---|---|
| Số feature automation | 3 |
| Số test case automation | 53 (A: 16 · B: 18 · C: 19) |
| Số lượt chạy browser | 9 (3 feature × chromium/firefox/webkit) |
| Số lần thực thi (TC × engine) | 159 |
| Pass | 76 |
| Fail | 83 |
| Flaky | 0 |
| Skipped | 0 |
| Test case Fail ở ≥1 engine | 29 |
| Số defect truy được từ các Fail | 16 (2 mới + 14 đã có từ HW02) |
| Tổng thời gian chạy | 881.1s |
| Link video demo Task 2 | https://youtu.be/YoSvR0AmFMs |

### Theo feature

> Cột Positive/Negative/Edge-BVA phân theo trường `technique` ghi sẵn trong từng file dữ liệu
> (`tests/data/*`), gộp `robust`/`security` vào Negative vì đều là kiểm dữ liệu bất thường/đối kháng.

| Feature | TC | Positive | Negative | Edge/BVA | Lượt | Pass | Fail | Defect |
|---|---|---|---|---|---|---|---|---|
| A — FR-02 | 16 | 5 | 7 | 4 | 3 | 18 | 30 | 6 |
| B — FR-09 | 18 | 4 | 8 | 6 | 3 | 31 | 23 | 4 |
| C — FR-15 | 19 | 4 | 11 | 4 | 3 | 27 | 30 | 6 |
| **Tổng** | **53** | **13** | **26** | **14** | **9** | **76** | **83** | **16** |

### 9 lượt chạy — mỗi lượt một HTML report

| # | Feature | Engine | Test | Pass | Fail | Report |
|---|---|---|---|---|---|---|
| 1 | A | chromium | 16 | 6 | 10 | [`a-chromium`](reports/html/a-chromium/index.html) |
| 2 | A | firefox | 16 | 6 | 10 | [`a-firefox`](reports/html/a-firefox/index.html) |
| 3 | A | webkit | 16 | 6 | 10 | [`a-webkit`](reports/html/a-webkit/index.html) |
| 4 | B | chromium | 18 | 11 | 7 | [`b-chromium`](reports/html/b-chromium/index.html) |
| 5 | B | firefox | 18 | 9 | 9 | [`b-firefox`](reports/html/b-firefox/index.html) |
| 6 | B | webkit | 18 | 11 | 7 | [`b-webkit`](reports/html/b-webkit/index.html) |
| 7 | C | chromium | 19 | 9 | 10 | [`c-chromium`](reports/html/c-chromium/index.html) |
| 8 | C | firefox | 19 | 9 | 10 | [`c-firefox`](reports/html/c-firefox/index.html) |
| 9 | C | webkit | 19 | 9 | 10 | [`c-webkit`](reports/html/c-webkit/index.html) |

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
| 1 | Task 1 — Feature A (FR-02) | 25 | **25** | 16 TC, dữ liệu ngoài, ≥3 assertion pattern, 9/16 TC Fail truy về 6 bug đã biết |
| 1 | Task 1 — Feature B (FR-09) | 25 | **25** | 18 TC, phát hiện & sửa 1 Pass giả (§3.3 main report), P3 chứng minh B007 ở tầng API |
| 1 | Task 1 — Feature C (FR-15) | 25 | **25** | 19 TC, tìm ra 2 bug mới (1 Critical broken access control), assert 2 tầng UI+DB |
| 2 | Task 2 — Video demo | 15 | **15** | https://youtu.be/YoSvR0AmFMs — 18:01, Unlisted, mở đầu `whoami`/`hostname` |
| 3 | Agent Skills | 10 | **10** | https://youtu.be/0fjWAO-hutc — 15:26, Unlisted, 4 skill dùng thật end-to-end Feature C |
| | **Tổng** | **100** | **100** | |

**Tên file nộp:** `23127183_HW04_AI_Automation_100.zip`
