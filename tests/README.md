# `tests/` — quy ước đặt file

| Thư mục / file | Chứa gì | **Không** được chứa |
|---|---|---|
| `data/` | toàn bộ test data: `feature-a-login.csv`, `feature-b-coupon.json`, `feature-c-product-admin.csv` | — |
| `pages/` | page object: `login.page.js`, `checkout.page.js`, `cart.page.js`, `admin-products.page.js` — **chỉ selector + hành động** | assertion, test data |
| `utils/` | `data-loader.js` (nạp csv/json + token), `assertions.js` (5 pattern), `env.js` (URL, tài khoản seed) | — |
| `fixtures/base.js` | token admin, client REST, annotation MSSV, hàng đợi dọn dữ liệu | assertion nghiệp vụ |
| `feature-*.spec.js` | nạp dữ liệu → vòng lặp → gọi page object → gọi assertion helper | **bất kỳ giá trị test data nào** (§6) |

Tự kiểm trước khi commit:

```bash
findstr /S /I /N "eshop.com SAVE10 BIGBUY VIP100 Test1234 Admin123" tests\*.spec.js
```

Ra kết quả (ngoài comment) ⇒ còn hard-code ⇒ chuyển vào `data/`.

Hướng dẫn chi tiết: [../docs/00-ROADMAP.md](../docs/00-ROADMAP.md)
