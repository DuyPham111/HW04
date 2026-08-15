# 04 — Feature B: FR-09 Mã giảm giá / Coupon (25đ)

> Mục tiêu: **≥12 test case** (đề xuất 18), dữ liệu ở `tests/data/feature-b-coupon.json` (dùng JSON ở feature này để bài có cả `.csv` lẫn `.json`), chạy 3 engine.
> Feature này cho ra **nhiều bug nhất** ở HW02 (B006, B007, B008, B013) → đây là feature nên chọn để quay video Task 2.

---

## 1. Bước 1 — Đọc UI thật

### Prompt

> Đọc `frontend-web\src\pages\Checkout.jsx`, `src\context\CartContext.jsx`, `src\context\AuthContext.jsx`, `src\App.jsx`, và handler `POST /api/apply-coupon` trong `backend\server.js`. Trả lời, **chưa viết test**:
> 1. Ô nhập mã, nút áp dụng, chỗ hiện lỗi, chỗ hiện kết quả — selector khả dụng là gì?
> 2. Giỏ hàng lưu ở đâu? Reload trang có mất không? Vào thẳng `/checkout` thì `cartTotal` bằng bao nhiêu?
> 3. Trạng thái đăng nhập lưu ở đâu? Có set được từ ngoài không?
> 4. `total_amount` gửi lên API lấy từ đâu — từ giỏ hàng hay từ một ô người dùng sửa được?
> 5. Công thức tính giảm giá cho `type='percent'` và cho `type='fixed'`; điều kiện so sánh với `min_order_amount`; điều kiện kiểm số lượt dùng.

### Sự thật đã kiểm (đối chiếu với câu trả lời của AI)

| Thứ | Sự thật |
|---|---|
| Ô mã | `<input type="text" placeholder="Nhập mã giảm giá...">` → `getByPlaceholder('Nhập mã giảm giá...')` |
| Nút | `<button>Áp dụng</button>`, có `disabled` khi `!couponCode.trim()` |
| Lỗi | `<p class="mt-2 text-red-600 text-sm">` |
| Kết quả | khối `text-green-700` với 3 dòng: `✅ {message}`, `Tiết kiệm: <strong>…₫</strong>`, `Thành tiền: <strong>…₫</strong>` |
| Ô tổng tiền | `<input type="number">` dưới nhãn **"Tổng tiền thanh toán (VND):"** — **người dùng sửa được** ← bug B013 |
| Giỏ hàng | `CartContext` = React state thuần, **không** localStorage → reload/vào thẳng URL là giỏ rỗng, `cartTotal = 0` |
| Đăng nhập | token trong `localStorage['token']`, `user` lấy qua `GET /api/users/me` |
| `/checkout` | **không** bị chặn: vào thẳng URL cũng vào được dù chưa đăng nhập và giỏ rỗng |
| Ngưỡng | `if (total_amount > coupon.min_order_amount)` — **so sánh `>` chứ không `>=`** ← bug B006 |
| Percent | `Math.floor(total * (1 - discount_value))` với `discount_value = 10` ⇒ giảm = `-9 × total` ⇒ thành tiền = `10 × total` ← bug B007 |
| Fixed | `discount_amount = discount_value` — đúng |
| Giới hạn lượt | chỉ kiểm **khi có `user_id`**; khách chưa đăng nhập ⇒ bỏ qua toàn bộ nhánh kiểm ← bug B008 |

---

## 2. Bước 2 — Chiến lược điều khiển tiền đề (phần quan trọng nhất của feature này)

FR-09 phụ thuộc 3 tiền đề: **tổng tiền giỏ**, **trạng thái đăng nhập**, **số lượt đã dùng coupon**. Điều khiển chúng qua UI thì mỗi test case tốn 5–6 thao tác và cực kỳ dễ flaky. Cách làm:

### a) Tổng tiền — hai đường, dùng cả hai

| Đường | Cách | Dùng cho |
|---|---|---|
| **Đường thật** (qua giỏ) | `/product/1` → "Thêm vào giỏ" → `/cart` → "Thanh toán" → `/checkout`. Phải điều hướng **bằng cách bấm link trong cùng một page session** (giỏ nằm trong React state, `page.goto()` là mất sạch). | **≥2 TC** — để chứng minh suite chạy được luồng thật, không chỉ đi cửa sau |
| **Đường tắt** | Vào thẳng `/checkout`, điền ô "Tổng tiền thanh toán (VND)" bằng `row.total` | các TC biên (299.999 / 300.000 / 300.001 / 499.999 / 500.000) — không thể dựng bằng sản phẩm seed |

> **Phải ghi vào báo cáo:** đường tắt sử dụng đúng cái ô mà spec nói **không được cho sửa** (bug B013). Vì vậy suite giữ **một TC riêng** (`FR09-DT-10`) khẳng định ô này phải ở dạng chỉ-đọc/tính-từ-giỏ. Nếu không có TC đó, bạn vừa dùng bug làm công cụ vừa che mất chính nó — đây là loại lập luận ăn điểm §6 "review and analysis".

### b) Trạng thái đăng nhập — set trước khi trang load

```
token = POST /api/login {email, password}   →   context.addInitScript(() => localStorage.setItem('token', '<token>'))
```

Đặt token **trước** khi `goto()`. Đăng nhập qua UI mỗi test vừa chậm vừa dính rủi ro khóa tài khoản của FR-02 (sai 2 lần là khóa 3 phút — đủ để phá hỏng cả lượt chạy).
TC khách vãng lai (`FR09-DT-07`) thì **không** set token.

### c) Số lượt dùng coupon — user mới cho mỗi TC liên quan

`coupon_usage` **không có API xóa** → nếu dùng `test@eshop.com` để tiêu 2 lượt VIP100, thì lượt firefox và webkit chạy sau sẽ thấy user đó đã hết lượt, và TC "còn lượt" (`FR09-BV-06`) Fail vì lý do môi trường chứ không phải bug.

Cách xử: TC nào đụng giới hạn lượt thì:
1. `POST /api/register` tạo user mới (`coupon-<uniq>@hw04.test`);
2. `POST /api/login` lấy token của user đó, set vào localStorage;
3. tiêu lượt bằng `POST /api/coupon-usage {coupon_id}` với **token của user đó**, lặp `row.seedUsage` lần (`coupon_id` lấy từ `GET /api/coupons`);
4. chạy assert trên UI;
5. `cleanup` → `DELETE /api/admin/users/:id`.

---

## 3. Bước 3 — Danh sách test case (18 TC, map từ HW02)

| # | tcId | mode | Tiền đề | Mã | expect (SPEC) | Pattern quyết định | Dự đoán |
|---|---|---|---|---|---|---|---|
| 1 | FR09-DT-01 | `cart-flow` | giỏ thật: AirPods ×1 = 6.000.000 | SAVE10 | accept, giảm **600.000**, còn 5.400.000 | P4 số học | **Fail → B007** |
| 2 | FR09-DT-02 | `total-set` | login, total 550.000 | BIGBUY | accept, giảm 50.000, còn 500.000 | P4 | Pass |
| 3 | FR09-DT-03 | `total-set` | login, 350.000 | INVALID999 | reject, "không tồn tại", HTTP 404 | P5 + P1 | Pass |
| 4 | FR09-DT-04 | `total-set` | login, 150.000 | EXPIRED | reject, "đã hết hạn", HTTP 400 | P5 + P1 | Pass |
| 5 | FR09-DT-05 | `empty-code` | login, 350.000 | *(rỗng)* | nút "Áp dụng" phải `disabled` | P1 | Pass |
| 6 | FR09-DT-06 | `total-set` | login, 250.000 | SAVE10 | reject, "tối thiểu 300.000" | P1 + P5 400 | Pass |
| 7 | FR09-DT-07 | `guest` | **không login**, 550.000 | BIGBUY | **reject** (spec C4 đòi đăng nhập) | P5 status ≠ 200 | **Fail → B008** |
| 8 | FR09-DT-08 | `total-set` | login, 30.000.000 | SAVE10 | accept, giảm 3.000.000, còn 27.000.000 | P4 | **Fail → B007** |
| 9 | FR09-DT-09 | `usage-seed` | user mới, `seedUsage=2`, 350.000 | VIP100 | reject, "đã sử dụng mã này 2 lần" | P1 + P5 400 | Pass |
| 10 | FR09-DT-10 | `ui-check` | mở `/checkout` | — | ô "Tổng tiền" **không** được sửa tự do | P1 (`readonly`/`disabled`) | **Fail → B013** |
| 11 | FR09-BV-01 | `total-set` | login, **299.999** | SAVE10 | reject (dưới ngưỡng) | P5 400 | Pass |
| 12 | FR09-BV-02 | `total-set` | login, **300.000** | SAVE10 | **accept** (spec dùng `>=`) | P5 200 | **Fail → B006** |
| 13 | FR09-BV-03 | `total-set` | login, **300.001** | SAVE10 | accept, giảm 30.000 | P5 200 + P4 | Fail phần số (B007) |
| 14 | FR09-BV-04 | `total-set` | login, **499.999** | BIGBUY | reject | P5 400 | Pass |
| 15 | FR09-BV-05 | `total-set` | login, **500.000** | BIGBUY | **accept** | P5 200 | **Fail → B006** |
| 16 | FR09-BV-06 | `usage-seed` | user mới, `seedUsage=1`, 350.000 | VIP100 | accept, giảm 100.000 | P4 | Pass |
| 17 | FR09-BV-R02 | `total-set` | login, 350.000 | `save10` (thường) | accept — client tự ép hoa | P5 200 | Pass |
| 18 | FR09-BV-R03 | `total-set` | login, 350.000 | `"  SAVE10  "` | accept — client tự trim | P5 200 | Pass |

**TC không automation được** (ghi vào báo cáo §4): kịch bản `FR09-DT-10` phần *"hoàn tất thanh toán tạo đơn 350 triệu giả"* — đơn hàng ghi vào bảng `orders` và **không có API xóa đơn**, chạy 9 lượt sẽ để lại 9 đơn rác làm nhiễu dữ liệu của FR-18 và của các HW sau. Tự động hóa đến bước **áp mã + đọc số hiển thị**, phần tạo đơn giữ bằng chứng thủ công từ HW02 (`B013-1.png`, `B013-2.png`).

---

## 4. Bước 4 — File dữ liệu JSON

### Prompt

> Tạo `tests/data/feature-b-coupon.json`: một mảng object, mỗi object là một test case với các khóa
> `tcId, title, mode, total, couponCode, seedUsage, requireLogin, expect, expectedError, expectedDiscount, expectedFinal, expectedStatus, technique, specRef, bugRef, note`.
> - `mode` ∈ `cart-flow` | `total-set` | `guest` | `empty-code` | `usage-seed` | `ui-check`.
> - `expectedDiscount` / `expectedFinal`: số tiền **theo đặc tả FR-09** (percent: `total × value/100`, làm tròn xuống; fixed: đúng `discount_value`), `null` khi TC kỳ vọng bị từ chối.
> - `expectedStatus`: mã HTTP mà `POST /api/apply-coupon` **phải** trả theo đặc tả (200 / 400 / 404), `null` nếu TC không gửi request.
> - `requireLogin`: `true` cho mọi TC trừ `FR09-DT-07`.
> - `note`: giải thích vì sao chọn con số đó, đặc biệt các mốc biên 299.999 / 300.000 / 300.001 / 499.999 / 500.000.
> Nội dung 18 TC theo bảng tôi dán dưới đây: *(dán bảng §3)*

### Review — lỗi AI hay mắc ở feature này

1. **Điền `expectedDiscount` theo công thức trong code** (`Math.floor(total*(1-10))`) thay vì theo spec (`total*10/100`). Làm vậy là hợp thức hóa bug B007 → suite Pass và bạn mất bug lớn nhất của bài.
2. **Điền `expectedStatus: 400` cho mốc 300.000** vì "SUT trả 400". Spec dùng `>=` ⇒ phải là 200 ⇒ Fail = bằng chứng B006.
3. **Bỏ TC khách vãng lai** vì "spec không nói rõ" — HW02 đã chốt ràng buộc C4 (phải đăng nhập). Giữ, `expect: reject`.
4. **Gộp `total` vào `expectedFinal`** hoặc quên `expectedStatus` → mất pattern P5, còn đúng 2 pattern, không đạt yêu cầu ≥3.

---

## 5. Bước 5 — Page object

> Viết `tests/pages/checkout.page.js` (class `CheckoutPage`) và `tests/pages/cart.page.js` (class `CartPage`), **không assertion**:
> - `CheckoutPage`: `gotoDirect()`; `totalInput` (neo theo nhãn `label:has-text("Tổng tiền thanh toán")` rồi lấy `input[type="number"]` cùng khối, **không** dùng `nth()`); `couponInput` = `getByPlaceholder('Nhập mã giảm giá...')`; `applyButton` = `getByRole('button', {name:'Áp dụng'})`; `errorText`; `discountText`; `finalText`; `setTotal(v)`; `applyCoupon(code)`.
> - `applyAndCapture(code)`: chạy `page.waitForResponse(r => r.url().includes('/api/apply-coupon'))` song song với click, timeout 5s, trả `{ called, status, body }`, `called:false` khi nút bị `disabled` hoặc client chặn.
> - `CartPage`: `addProductFlow(page, productId, quantity)` — vào `/product/:id` **bằng điều hướng SPA**, bấm "Thêm vào giỏ", rồi bấm link "Giỏ hàng" trên header, rồi bấm "Thanh toán". Comment rõ: **không được** dùng `page.goto()` giữa các bước vì giỏ nằm trong React state và sẽ mất.
> - Thêm helper `readMoney(locator)` dùng `parseMoney` để đọc số tiền hiển thị.

**Review:**
- [ ] AI có dùng `page.reload()` hoặc `goto()` giữa luồng giỏ hàng không → xóa, đây là lỗi *"AI không biết state nằm ở đâu"* đáng viết vào gap analysis.
- [ ] AI có so sánh **chuỗi** tiền (`toContainText('5.400.000 ₫')`) không → sửa sang `parseMoney` + so số. Chrome in `5,400,000`, Firefox/WebKit có thể in `5.400.000`; so chuỗi sẽ Fail giả trên một engine và bạn sẽ tưởng là bug cross-browser.
- [ ] Ô tổng tiền là `type="number"`: `fill()` với chuỗi có dấu chấm sẽ ra rỗng → luôn truyền số nguyên dạng chuỗi thuần (`'300000'`).

---

## 6. Bước 6 — Spec file

> Viết `tests/feature-b-coupon.spec.js`, data-driven từ `loadJson('feature-b-coupon.json')`, rẽ nhánh theo `mode`. Yêu cầu:
> - Helper `loginAs(context, email, password)`: gọi API lấy token rồi `context.addInitScript` set `localStorage.token`; gọi **trước** mọi `goto`.
> - `usage-seed`: đăng ký user mới theo `row` (email đã chứa `<uniq>`), login lấy token, `GET /api/coupons` tìm `coupon_id` của `row.couponCode`, `POST /api/coupon-usage` lặp `row.seedUsage` lần, đăng ký hàm dọn xóa user vào `cleanup`.
> - Assertion: P5 so `status` với `row.expectedStatus` (hard) · P1 kiểm `expectedError` trong khối lỗi (soft) · P4 so `readMoney(discountText)` với `row.expectedDiscount` và `readMoney(finalText)` với `row.expectedFinal` bằng `expectSoftNumber` · P3 với TC `cart-flow`: đối chiếu `body.final_amount` của API với số hiện trên UI, **hai nguồn phải khớp** (nếu lệch là bug hiển thị, một lớp bug khác hẳn).
> - `ui-check` (`FR09-DT-10`): assert ô tổng tiền phải có `readonly` hoặc `disabled`; dùng `expect.soft` rồi assert tiếp là gõ số khác vào **không** được làm đổi giá trị gửi lên API.
> - `empty-code`: assert nút "Áp dụng" `toBeDisabled()`.
> - Comment đầu file nêu rõ vì sao dùng `addInitScript` thay vì đăng nhập qua UI (tránh dính cơ chế khóa tài khoản của FR-02 — 2 lần sai là khóa 180 giây, đủ phá cả lượt chạy).

```bash
npx playwright test tests/feature-b-coupon.spec.js --project=chromium
git add tests/data/feature-b-coupon.json tests/pages/checkout.page.js tests/pages/cart.page.js tests/feature-b-coupon.spec.js
git commit -m "test(feature-b): 18 TC data-driven cho FR-09 coupon"
```

---

## 7. Nghiệm thu Feature B

- [ ] ≥12 test, trong đó **≥2 TC đi luồng giỏ hàng thật**
- [ ] Chạy 2 lần liên tiếp cùng kết quả (TC `usage-seed` dùng user mới mỗi lần ⇒ phải ổn định)
- [ ] Số tiền được so bằng **số**, không so chuỗi
- [ ] TC `FR09-DT-10` tồn tại — không được vừa dùng ô tổng tiền sửa được vừa im lặng về nó
- [ ] Ghi lại 2–3 chỗ AI sai đã sửa

→ Tiếp: [05-FEATURE-C-FR15.md](05-FEATURE-C-FR15.md)
