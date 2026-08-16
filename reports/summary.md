# Test Summary Report — HW04 Automation Testing

**Run by:** 23127183 — sinh tự động lúc 2026-08-16T12:12:36.494Z bằng `node tools/summarize.mjs`. Không sửa tay file này — sửa tay là chỗ dễ lệch nhất giữa các tài liệu.

## Tổng

| Chỉ số | Giá trị |
|---|---|
| Số feature automation | 3 |
| Số test case automation | 53 |
| Số lượt chạy browser | 9 |
| Số lần thực thi (TC × engine) | 159 |
| Pass | 76 |
| Fail | 83 |
| Flaky | 0 |
| Skipped | 0 |
| Test case Fail ở ≥1 engine | 29 |
| Tổng thời gian chạy | 881.1s |

## Theo feature

| Feature | TC | Lượt | Pass | Fail |
|---|---|---|---|---|
| A — FR-02 Đăng nhập & Khóa tài khoản | 16 | 3 | 18 | 30 |
| B — FR-09 Mã giảm giá | 18 | 3 | 31 | 23 |
| C — FR-15 Quản lý Sản phẩm | 19 | 3 | 27 | 30 |

## 9 lượt chạy — mỗi lượt một HTML report

| # | Feature | Engine | Test | Pass | Fail | Flaky | Report |
|---|---|---|---|---|---|---|---|
| 1 | A | chromium | 16 | 6 | 10 | 0 | [`a-chromium`](html/a-chromium/index.html) |
| 2 | A | firefox | 16 | 6 | 10 | 0 | [`a-firefox`](html/a-firefox/index.html) |
| 3 | A | webkit | 16 | 6 | 10 | 0 | [`a-webkit`](html/a-webkit/index.html) |
| 4 | B | chromium | 18 | 11 | 7 | 0 | [`b-chromium`](html/b-chromium/index.html) |
| 5 | B | firefox | 18 | 9 | 9 | 0 | [`b-firefox`](html/b-firefox/index.html) |
| 6 | B | webkit | 18 | 11 | 7 | 0 | [`b-webkit`](html/b-webkit/index.html) |
| 7 | C | chromium | 19 | 9 | 10 | 0 | [`c-chromium`](html/c-chromium/index.html) |
| 8 | C | firefox | 19 | 9 | 10 | 0 | [`c-firefox`](html/c-firefox/index.html) |
| 9 | C | webkit | 19 | 9 | 10 | 0 | [`c-webkit`](html/c-webkit/index.html) |

## Test case Fail ở ≥1 engine (dùng để viết bug report)

| Test case | Engine Fail | Số engine |
|---|---|---|
| FR02-BV-01 — BVA - sai mật khẩu lần thứ 1 (biên dưới) | chromium, firefox, webkit | 3/3 |
| FR02-BV-02 — BVA - sai mật khẩu lần thứ 2 (giữa vùng hợp lệ) | chromium, firefox, webkit | 3/3 |
| FR02-BV-03 — BVA - sai mật khẩu lần thứ 3 (on-point ngưỡng khóa) | chromium, firefox, webkit | 3/3 |
| FR02-BV-06 — Đợi hết hạn khóa (31s > 30s spec) rồi đăng nhập đúng | chromium, firefox, webkit | 3/3 |
| FR02-BV-R04 — Mật khẩu rất dài (500 ký tự) | chromium, firefox, webkit | 3/3 |
| FR02-DT-03 — Email sai định dạng (thiếu @) | chromium, firefox, webkit | 3/3 |
| FR02-DT-05 — Mới sai 1 lần, xác nhận chưa bị khóa | chromium, firefox, webkit | 3/3 |
| FR02-DT-07 — Nhập đúng mật khẩu khi tài khoản đang bị khóa | chromium, firefox, webkit | 3/3 |
| FR02-DT-09 — Ô mật khẩu phải che ký tự (type=password) | chromium, firefox, webkit | 3/3 |
| FR02-DT-10 — Tiêu đề/nhãn trang đăng nhập đúng tiếng Việt | chromium, firefox, webkit | 3/3 |
| FR09-BV-02 — BVA - dung bang nguong toi thieu (300.000) | chromium, firefox, webkit | 3/3 |
| FR09-BV-03 — BVA - tren nguong 1 dong (300.001) | chromium, firefox, webkit | 3/3 |
| FR09-BV-05 — BVA - dung bang nguong BIGBUY (500.000) | chromium, firefox, webkit | 3/3 |
| FR09-DT-01 — Ap ma percent hop le tren gio hang that (SAVE10) | chromium, firefox, webkit | 3/3 |
| FR09-DT-02 — Ap ma fixed hop le (BIGBUY tren don 550.000) | firefox | 1/3 |
| FR09-DT-03 — Ma khong ton tai | firefox | 1/3 |
| FR09-DT-07 — Khach chua dang nhap van ap duoc ma | chromium, firefox, webkit | 3/3 |
| FR09-DT-08 — Kiem chung cong thuc percent tren don lon (30.000.000) | chromium, firefox, webkit | 3/3 |
| FR09-DT-10 — O Tong tien thanh toan khong duoc sua tu do | chromium, firefox, webkit | 3/3 |
| FR15-BV-05 — BVA - ten dai 256 ky tu (vuot bien tren + 1) | chromium, firefox, webkit | 3/3 |
| FR15-BV-R03 — Robust - category_id khong ton tai (9999) qua API | chromium, firefox, webkit | 3/3 |
| FR15-DT-03 — Ten chi gom khoang trang | chromium, firefox, webkit | 3/3 |
| FR15-DT-05 — Gia bang 0 | chromium, firefox, webkit | 3/3 |
| FR15-DT-06 — Gia am | chromium, firefox, webkit | 3/3 |
| FR15-DT-07 — Gia rong | chromium, firefox, webkit | 3/3 |
| FR15-DT-08 — Sua 1 san pham, kiem san pham khac khong doi | chromium, firefox, webkit | 3/3 |
| FR15-SEC-01 — BUG MOI - Tao san pham KHONG kem token (vi pham FR-12) | chromium, firefox, webkit | 3/3 |
| FR15-SEC-02 — BUG MOI - Sua san pham KHONG kem token (vi pham FR-12) | chromium, firefox, webkit | 3/3 |
| FR15-SEC-03 — BUG MOI - Xoa san pham KHONG kem token (vi pham FR-12) | chromium, firefox, webkit | 3/3 |

