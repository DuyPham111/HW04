# 05 — Feature C: FR-15 Quản lý Sản phẩm CRUD trên Web Admin (25đ)

> Mục tiêu: **≥12 test case** (đề xuất 16), dữ liệu ở `tests/data/feature-c-product-admin.csv`, chạy 3 engine.
> Feature này có **cơ hội tìm bug MỚI** mà HW02 chưa ghi (xem §3, TC 15) — bug mới do automation phát hiện là thứ §6 nêu đích danh và ăn điểm cao.

---

## 1. Bước 1 — Đọc UI thật

### Prompt

> Đọc `frontend-admin\src\App.jsx` (toàn bộ, đặc biệt `handleProductSubmit`, `deleteProduct`, phần render `activeTab === "products"`) và các endpoint `/api/products` trong `backend\server.js`. Trả lời, **chưa viết test**:
> 1. Đăng nhập admin lưu token ở đâu?
> 2. Chuyển tab bằng URL hay bằng state? URL có đổi không?
> 3. Form sản phẩm gồm những ô nào, selector khả dụng là gì, ô nào có `required`?
> 4. Sau khi **thêm** thì danh sách được nạp lại thế nào; sau khi **sửa** thì danh sách được cập nhật thế nào?
> 5. `deleteProduct` có hỏi xác nhận không?
> 6. Backend có validate `name`/`price` không?

### Sự thật đã kiểm

| Thứ | Sự thật |
|---|---|
| Đăng nhập admin | form có `placeholder="Email"` / `placeholder="Password"` + nút `Login`; token lưu ở `localStorage['adminToken']` |
| Tab | `activeTab` là **React state**, URL **luôn là** `http://localhost:5174/` → **không assert được URL** |
| Form | 4 ô neo theo placeholder: `Tên sản phẩm` (có `required`), `Giá tiền` (`type="number"`, **không** `required`), `URL Ảnh`, `Mô tả` (`textarea`); một `<select>` danh mục; nút **"Lưu sản phẩm"** |
| Bảng | cột `Ảnh · Tên SP · Giá · Hành động`, mỗi dòng có nút **"Sửa"** và **"Xóa"** |
| Thêm | `POST /api/products` rồi `fetchData()` — danh sách nạp lại từ server |
| Sửa | `PUT /api/products/:id` rồi **`setProducts(products.map(p => ({...p, name: productForm.name})))`** ← đổi tên **toàn bộ** dòng trên UI, sau đó `alert("Cập nhật thành công!")` ← bug B014, và có **dialog** phải xử lý |
| Xóa | gọi thẳng `DELETE /api/products/:id`, **không hỏi xác nhận** ← ứng viên **bug mới** |
| Backend | `POST/PUT/DELETE /api/products` **không có auth và không validate gì cả** → giá 0, giá âm, giá rỗng, tên toàn khoảng trắng đều lọt (B009, B010) |

> **Hệ quả thiết kế:** feature này **không dùng được pattern P2 (URL)**. Đề chỉ đòi ≥3 pattern trên toàn suite, nhưng bạn nên nêu rõ trong báo cáo: *"Feature C bù pattern URL bằng pattern backend-state, vì admin là SPA một route."* Câu đó cho thấy bạn chọn assertion theo bản chất hệ thống chứ không theo thói quen.

---

## 2. Bước 2 — Chiến lược cô lập dữ liệu

CRUD sinh dữ liệu thật. Chạy 9 lượt mà không dọn thì đến lượt cuối bảng sản phẩm có hàng chục dòng rác, `toHaveCount()` sai, và bảng số liệu trong báo cáo không giải thích được.

| Việc | Cách làm |
|---|---|
| Tên sản phẩm test | luôn chứa `<uniq>` — `HW04-<uniq>-01`. Không bao giờ trùng giữa các lượt |
| Sản phẩm tiền đề (cho TC sửa/xóa) | tạo bằng `POST /api/products` trong phần setup của test, **không** tạo bằng UI (nhanh hơn, và tách được lỗi setup khỏi lỗi cần kiểm) |
| Dọn | `cleanup.add()` → `GET /api/products` lọc theo tiền tố `HW04-` → `DELETE /api/products/:id` |
| Bảo vệ | **không bao giờ** xóa 5 sản phẩm seed (id 1–5) — FR-09 và các HW khác đang dùng |
| Đếm dòng | so số dòng **trước/sau**, đừng bao giờ assert một con số tuyệt đối |

---

## 3. Bước 3 — Danh sách test case (16 TC)

| # | tcId | mode | Input | expect (SPEC) | Pattern quyết định | Dự đoán |
|---|---|---|---|---|---|---|
| 1 | FR15-DT-01 | `create` | tên hợp lệ, giá 1.000.000, danh mục Phụ kiện | accept, DB có đúng 1 sản phẩm | P3 | Pass |
| 2 | FR15-DT-02 | `create` | tên `<empty>` | reject **via client** (`required`) | P5 `called === false` | Pass |
| 3 | FR15-DT-03 | `create` | tên `<spaces:3>` | reject (tên rỗng về ngữ nghĩa) | P3 (DB không phát sinh) | **Fail → B010** |
| 4 | FR15-DT-04 | `create` | tên `<b>Sony</b>` | lưu an toàn, hiển thị **nguyên văn**, không render HTML | P1 + P3 | Pass (kiểm XSS) |
| 5 | FR15-DT-05 | `create` | giá `0` | reject (giá phải > 0) | P3 | **Fail → B009** |
| 6 | FR15-DT-06 | `create` | giá `-1` | reject | P3 | **Fail → B009** |
| 7 | FR15-DT-07 | `create` | giá `<empty>` | reject (giá bắt buộc) | P3 | **Fail → B009** |
| 8 | FR15-BV-02 | `create` | giá `1` | accept (biên dưới hợp lệ) | P3 | Pass |
| 9 | FR15-BV-03 | `create` | tên `A` (1 ký tự) | accept | P3 | Pass |
| 10 | FR15-BV-04 | `create` | tên `<repeat:A:255>` | accept (đúng giới hạn) | P3 | Pass |
| 11 | FR15-BV-05 | `create` | tên `<repeat:A:256>` | reject **hoặc** cắt còn 255 | P4 (độ dài trong DB ≤ 255) | **Fail → B015** |
| 12 | FR15-BV-R01 | `create` | giá `2147483648` | accept, không tràn số | P4 (giá trong DB đúng bằng giá nhập) | Pass |
| 13 | FR15-BV-R02 | `create` | giá `abc` | ô `type="number"` không nhận chữ | P1 (giá trị ô rỗng sau khi gõ) | Pass |
| 14 | FR15-DT-08 | `edit` | tạo 2 SP tiền đề, sửa **tên** của SP thứ nhất | **chỉ** SP đó đổi, trên **cả UI lẫn DB** | P1 (dòng khác giữ tên cũ) + P3 | **Fail → B014** |
| 15 | *(mới)* FR15-DT-11 | `delete` | tạo SP tiền đề, bấm "Xóa" | phải hiện **hộp thoại xác nhận** trước khi xóa | **P5 dialog** | **Fail → bug MỚI** |
| 16 | *(mới)* FR15-DT-12 | `delete` | như trên, sau khi xóa | SP biến mất khỏi UI **và** khỏi DB | P1 + P3 | Pass |

**TC không automation được qua UI** (ghi vào báo cáo §4): `category_id = 9999` (danh mục không tồn tại) — `<select>` chỉ liệt kê 3 danh mục seed nên **không nhập được qua giao diện**. Hạ xuống tầng API: `POST /api/products` với `category_id: 9999` và assert theo spec là phải bị từ chối. Ghi rõ trong báo cáo là "chuyển tầng, không bỏ" — cách xử lý này đúng tinh thần §6 và ăn điểm hơn hẳn việc im lặng bỏ TC.

> **Về TC 15 (bug mới):** `deleteProduct` gọi thẳng API, không có `window.confirm`. Nếu FR-15 (hoặc quy ước GUI của SUT) đòi xác nhận trước hành động phá hủy thì đây là **bug mới do automation phát hiện** — HW02 của bạn không ghi bug này. Trước khi báo, **kiểm lại đặc tả** trong `eshop-sut/README.md`: nếu spec **không** đòi xác nhận, thì đừng báo là bug — hạ xuống mục "quan sát UX" trong báo cáo. Báo bug sai đặc tả bị trừ điểm nặng hơn là không báo.

---

## 4. Bước 4 — File dữ liệu

> Tạo `tests/data/feature-c-product-admin.csv` với cột:
> `tcId,title,mode,productName,price,imageUrl,description,categoryName,editTargetName,expect,expectedError,rejectVia,expectDialog,technique,specRef,bugRef,note`
> - `mode` ∈ `create` | `edit` | `delete`.
> - `productName` luôn chứa `<uniq>` và tiền tố `HW04-` để bước dọn nhận ra được.
> - `expect` theo **spec FR-15** (giá phải > 0, tên bắt buộc không rỗng sau trim, tên ≤ 255 ký tự), không theo hành vi hiện tại.
> - `expectDialog` = `true` cho TC xóa (spec đòi xác nhận), `false` cho phần còn lại.
> - Dùng `<empty>`, `<spaces:3>`, `<repeat:A:255>`, `<repeat:A:256>`.
> - `note` giải thích vì sao giá trị đó là biên.
> Nội dung 16 dòng theo bảng: *(dán bảng §3)*

**Review:** AI rất hay điền `expect=accept` cho giá 0 / giá âm / tên khoảng trắng vì "SUT chấp nhận". Đó là chép lại bug thành đặc tả — sửa hết về `reject`.

---

## 5. Bước 5 — Page object

> Viết `tests/pages/admin-products.page.js` (class `AdminProductsPage`), **không assertion**:
> - `loginViaStorage(context, token)`: `addInitScript` set `localStorage['adminToken']` — **gọi trước `goto()`**. Comment: đăng nhập qua form admin mỗi test tốn ~2s × 16 TC × 3 engine ≈ 1,5 phút vô ích và thêm một điểm gãy không liên quan đến FR-15.
> - `gotoProductsTab()`: `goto(ADMIN_URL)` rồi bấm nút tab "Sản phẩm" (`getByRole('button', {name:'Sản phẩm'})`), chờ nút "Lưu sản phẩm" hiện ra.
> - Ô form neo theo placeholder: `getByPlaceholder('Tên sản phẩm')`, `'Giá tiền'`, `'URL Ảnh'`, `'Mô tả'`; `categorySelect` = `page.locator('form select')`; `saveButton` = `getByRole('button', {name:'Lưu sản phẩm'})`.
> - `rowByName(name)` → `page.locator('tbody tr').filter({ hasText: name })`; `editButtonInRow(name)`, `deleteButtonInRow(name)`.
> - `fillProduct(row)` + `save()`; `saveAndCapture(row)` trả `{ called, status }` từ `waitForResponse` khớp `/api/products`.
> - `clickDeleteAndCaptureDialog(name)`: gắn listener `page.on('dialog')` **trước** khi click, trả `{ dialogSeen, message }`, chấp nhận dialog nếu có; comment rõ dialog native không nằm trong DOM nên không có web-first assertion nào retry hộ.
> - `handleAlertOnSave()`: hàm sửa sản phẩm bật `alert("Cập nhật thành công!")` — nếu không xử lý dialog, WebKit sẽ treo cho tới khi hết timeout. Xử lý bằng `page.on('dialog', d => d.accept())` đăng ký **trước** thao tác lưu.

**Review — 3 lỗi AI hay mắc:**
- [ ] Đăng ký `page.on('dialog')` **sau** khi click → dialog đã xuất hiện, listener bắt trượt, test treo. Kinh điển, và đây là ví dụ tốt cho gap analysis.
- [ ] Neo dòng bảng bằng `nth(0)` → thứ tự sản phẩm đổi theo `fetchData()` là gãy; phải lọc theo tên.
- [ ] Quên chờ tab "Sản phẩm" render xong rồi mới `fill()` → Fail ngẫu nhiên trên firefox (chậm hơn chromium ~200ms). Đây đúng là mục *flaky waits* của §6.

---

## 6. Bước 6 — Spec file

> Viết `tests/feature-c-product-admin.spec.js`, data-driven từ `loadCsv('feature-c-product-admin.csv')`:
> - `beforeEach`: lấy token admin từ fixture, `loginViaStorage`, `gotoProductsTab()`.
> - `create`: đếm sản phẩm trùng tên trong DB trước (`GET /api/products`), điền form, `saveAndCapture`. `expect=accept` ⇒ P3 hard: DB **tăng đúng 1** và giá trong DB **bằng đúng** giá nhập (`expectSoftNumber`); P1 soft: dòng mới hiện trong bảng. `expect=reject` ⇒ P5 kiểm `rejectVia`; P3 hard: DB **không** phát sinh dòng nào.
> - `edit`: tạo **2** sản phẩm tiền đề qua API, sửa tên sản phẩm thứ nhất qua UI, rồi assert **hai tầng**: (a) P1 — dòng của sản phẩm thứ hai trên UI **vẫn giữ tên cũ**; (b) P3 — trong DB đúng 1 bản ghi đổi tên. Comment: tách hai tầng là cách chứng minh bug B014 nằm ở **client** (`App.jsx` `setProducts(...map(...))`) chứ không phải ở API — kết luận này **chặt hơn** kết luận thủ công của HW02.
> - `delete`: tạo sản phẩm tiền đề qua API, `clickDeleteAndCaptureDialog`, P5 hard: `dialogSeen === row.expectDialog`; rồi P3: sản phẩm không còn trong `GET /api/products`.
> - Mọi test: `annotateTestCase(testInfo, row)` và đăng ký dọn dữ liệu vào `cleanup` **ngay sau khi tạo**, không đợi cuối test (test Fail giữa chừng vẫn phải dọn).

```bash
npx playwright test tests/feature-c-product-admin.spec.js --project=chromium
git add tests/data/feature-c-product-admin.csv tests/pages/admin-products.page.js tests/feature-c-product-admin.spec.js
git commit -m "test(feature-c): 16 TC CRUD san pham admin (FR-15)"
```

---

## 7. Nghiệm thu Feature C

- [ ] ≥12 test; chạy 2 lần liên tiếp cùng kết quả
- [ ] Sau khi chạy, `GET /api/products` **không còn** sản phẩm nào tên bắt đầu bằng `HW04-` (dọn sạch) và **vẫn còn đủ 5 sản phẩm seed**
- [ ] TC sửa assert **cả UI lẫn DB** — thiếu một tầng là mất kết luận đắt nhất của feature
- [ ] Đã quyết định TC 15 là bug mới hay chỉ là quan sát UX, **có đối chiếu spec**
- [ ] TC `category_id=9999` đã được ghi vào mục "không automation qua UI được" kèm cách xử lý thay thế

→ Tiếp: [06-MULTI-BROWSER-REPORT.md](06-MULTI-BROWSER-REPORT.md)
