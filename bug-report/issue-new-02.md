## Mô tả

`POST /api/products` chấp nhận `category_id` **không tồn tại** trong bảng `categories`, tạo ra bản ghi **mồ côi** (sản phẩm trỏ tới một danh mục không có thật), vi phạm ràng buộc toàn vẹn tham chiếu mà FR-15 đặt ra.

## Đặc tả nói gì

`README.md` — mục **FR-15: Quản lý Sản phẩm (Product CRUD)**:

> **Ràng buộc đầu vào:**
> - Tên sản phẩm: bắt buộc, tối đa 255 ký tự.
> - Giá: bắt buộc, phải là số **dương** (> 0).
> - **Danh mục: bắt buộc, phải chọn từ danh sách có sẵn.**

## Thực tế

Danh mục thật trong hệ thống chỉ có 3: `1 = Điện thoại`, `2 = Laptop`, `3 = Phụ kiện`.

| Request (CÓ token admin hợp lệ) | Kỳ vọng theo FR-15 | Thực tế |
|---|---|---|
| `POST /api/products` với `category_id: 9999` | 400 — từ chối vì danh mục không tồn tại | **200** — sản phẩm được tạo với `category_id: 9999` |

## Các bước tái lập

1. Đăng nhập admin để lấy token hợp lệ:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eshop.com","password":"Admin123!"}'
```

2. Tạo sản phẩm với danh mục không tồn tại (**có** token):

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Test Category 9999","price":1000000,"category_id":9999}'
```

3. Nhận `HTTP 200 {"message":"Product created","id":<n>}`.
4. `GET /api/products` — thấy sản phẩm mới với `"category_id":9999` mồ côi.

## Nguyên nhân trong mã nguồn

`backend/server.js` dòng 167-178 — `INSERT INTO products` chạy thẳng, **không kiểm** `category_id` có tồn tại hay không:

```js
app.post("/api/products", (req, res) => {
  const { name, price, description, imageUrl, category_id } = req.body;
  db.run(
    "INSERT INTO products (name, price, description, imageUrl, category_id) VALUES (?, ?, ?, ?, ?)",
    [name, price, description, imageUrl, category_id],   // category_id không được validate
    ...
```

Ngoài ra bảng `products` trong `backend/database.js` **không khai báo `FOREIGN KEY`** ràng buộc tới `categories`, nên tầng CSDL cũng không chặn.

## Đề xuất sửa

Một trong hai (nên làm cả hai):
1. Validate ở tầng ứng dụng: truy vấn `categories` kiểm `category_id` tồn tại trước khi `INSERT`, không có thì trả `400`.
2. Khai báo `FOREIGN KEY (category_id) REFERENCES categories(id)` và bật `PRAGMA foreign_keys = ON` cho SQLite.

## Mức độ

🟠 **High** — dữ liệu mồ côi làm hỏng tính toàn vẹn của catalog: sản phẩm không thể lọc/hiển thị đúng theo danh mục, và mọi báo cáo thống kê theo danh mục đều sai lệch.

## Phát hiện bởi

Test case automation **`FR15-BV-R03`** — Fail nhất quán trên **cả 3 engine** (chromium / firefox / webkit).

Bộ test: HW04 Automation Testing — `tests/feature-c-product-admin.spec.js`, assertion pattern **P5 (HTTP status)**.

> **Ghi chú thiết kế:** test case này cố ý dùng **token hợp lệ** để tách biệt hoàn toàn khỏi lỗi thiếu xác thực ở `/api/products` (báo trong issue riêng). Nếu gọi API không token, request sẽ đi qua vì lỗi kia và không còn cô lập được đúng biến cần kiểm.
>
> Lỗi này **không thể phát hiện qua giao diện**: ô danh mục trên trang admin là thẻ `<select>` chỉ liệt kê 3 danh mục seed, nên không thể nhập `category_id = 9999` bằng thao tác người dùng thông thường.

## Môi trường

- Ngày: 2026-08-16
- Playwright 1.62.1 · chromium / firefox / webkit
- Windows 11 · Node v22.16.0
- Run by: **23127183 — Phạm Vũ Ngọc Duy**
