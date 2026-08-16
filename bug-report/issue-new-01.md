## Mô tả

Ba route `POST`, `PUT`, `DELETE /api/products` **không có middleware xác thực**, trái với đặc tả FR-12. Bất kỳ ai biết địa chỉ API đều có toàn quyền **tạo / sửa / xoá** catalog sản phẩm mà **không cần đăng nhập**.

## Đặc tả nói gì

`README.md` — mục **FR-12: Kiểm soát truy cập (Access Control)**:

> **Tất cả** các API Admin (`/api/admin/*`) và các API có tính ảnh hưởng dữ liệu (`POST/PUT/DELETE /api/products`, `/api/categories`, `/api/coupons`) đều phải yêu cầu:
> 1. Token JWT hợp lệ.
> 2. `role = 'admin'` trong Token.

## Thực tế

| Request (KHÔNG có header `Authorization`) | Kỳ vọng theo FR-12 | Thực tế |
|---|---|---|
| `POST /api/products` | 401 / 403 | **200** — sản phẩm được tạo |
| `PUT /api/products/:id` | 401 / 403 | **200** — sản phẩm bị sửa |
| `DELETE /api/products/:id` | 401 / 403 | **200** — sản phẩm bị xoá vĩnh viễn |

## Các bước tái lập

1. Khởi động SUT: `cd backend && node database.js && node server.js`
2. Gửi request **không kèm token**:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test No Auth","price":1,"category_id":1}'
```

3. Nhận về `HTTP 200 {"message":"Product created","id":<n>}` — sản phẩm đã được tạo.
4. Lặp lại với `PUT /api/products/<n>` và `DELETE /api/products/<n>` — đều trả `200`.

## Nguyên nhân trong mã nguồn

`backend/server.js` — cả ba route đều **thiếu** `authenticateToken`:

```js
app.post("/api/products", (req, res) => {          // dòng 167
app.put("/api/products/:id", (req, res) => {       // dòng 179
app.delete("/api/products/:id", (req, res) => {    // dòng 191
```

Đối chiếu `/api/categories` (cùng thuộc FR-12) thì **có** middleware:

```js
app.post("/api/categories", authenticateToken, (req, res) => {   // dòng 249 — ĐÚNG
```

⇒ Lỗi **cục bộ ở nhóm route `/api/products`**, không phải hệ thống auth hỏng toàn cục.

## Đề xuất sửa

Thêm `authenticateToken` (và kiểm `role === 'admin'`) vào cả ba route, giống cách `/api/categories` đang làm.

## Mức độ

🔴 **Critical** — lỗi kiểm soát truy cập (broken access control). Hậu quả không giới hạn ở một request mà là **toàn bộ catalog sản phẩm** bị phơi ra cho người dùng ẩn danh; riêng `DELETE` gây **mất dữ liệu thật, không thể hoàn tác**.

## Phát hiện bởi

Test case automation **`FR15-SEC-01`** (POST), **`FR15-SEC-02`** (PUT), **`FR15-SEC-03`** (DELETE) — Fail nhất quán trên **cả 3 engine** (chromium / firefox / webkit).

Bộ test: HW04 Automation Testing — `tests/feature-c-product-admin.spec.js`, assertion pattern **P5 (HTTP status)**, dùng `playwright.request.newContext()` **không** có `Authorization` header để bỏ qua hoàn toàn tầng UI.

> **Ghi chú:** lỗi này **không thể phát hiện bằng kiểm thử thủ công qua giao diện**, vì admin UI đã chặn user thường ngay tại màn đăng nhập (`frontend-admin/src/App.jsx:65`). Chỉ khi gọi thẳng API mới chạm tới được.

## Môi trường

- Ngày: 2026-08-16
- Playwright 1.62.1 · chromium / firefox / webkit
- Windows 11 · Node v22.16.0
- Run by: **23127183 — Phạm Vũ Ngọc Duy**
