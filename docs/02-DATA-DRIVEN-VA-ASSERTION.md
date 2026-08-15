# 02 — Data-driven & Assertion pattern (dùng chung cho cả 3 feature)

> Đây là **hai yêu cầu bị trượt nhiều nhất** của §6:
> *"The test data must be stored in a separate .csv or .json file (hardcoded inline arrays or objects in the script are not accepted), and the scripts must use at least three distinct assertion patterns."*
>
> Làm chuẩn phần này một lần, cả 3 feature dùng lại.

---

## 1. Luật vàng: `.spec.js` không được chứa một giá trị test data nào

| Được phép nằm trong spec | Không được phép |
|---|---|
| `loadCsv('feature-a-login.csv')` | `const cases = [{email:'test@eshop.com', ...}]` |
| vòng lặp `for (const row of cases)` | `await page.fill('#email', 'test@eshop.com')` |
| logic rẽ nhánh theo `row.mode` | `expect(page).toHaveText('Giảm 35.000 ₫')` |
| import hằng số môi trường từ `utils/env.js` | mảng/`object` dữ liệu định nghĩa tại chỗ |

Tự kiểm trước khi nộp (PowerShell, chạy ở gốc repo):

```bash
findstr /S /I /N "eshop.com SAVE10 BIGBUY VIP100 Test1234 Admin123" tests\*.spec.js
```

Ra dòng nào là còn hard-code (trừ khi dòng đó chỉ là comment). Grep này cũng là thứ TA sẽ làm.

---

## 2. `tests/utils/data-loader.js` — prompt

> Viết `tests/utils/data-loader.js` (Node ESM, **không thêm dependency**) nạp test data từ `tests/data/`:
> - `loadCsv(fileName)` → mảng object theo dòng header. Parser CSV tự viết, hỗ trợ ô bọc trong dấu `"` có chứa dấu phẩy, và `""` là escape của dấu nháy kép. **Bỏ qua** dòng trống và dòng bắt đầu bằng `#` (để tôi ghi chú ngay trong file dữ liệu). Nếu số ô của một dòng khác số cột header thì `throw` kèm số dòng — sai CSV mà im lặng là kiểu bug tốn nhiều giờ nhất.
> - `loadJson(fileName)` → parse JSON và **giải token đệ quy** cho mọi chuỗi, kể cả trong object/array lồng nhau.
> - Giải các token sau trong mỗi ô: `<empty>` → `''`; `<spaces:N>` → N khoảng trắng; `<repeat:X:N>` → chuỗi X lặp N lần (dùng cho TC biên độ dài 255/256 ký tự); `<uniq>` → mã duy nhất theo lần chạy, thay được ở giữa chuỗi (ví dụ `lock-<uniq>@hw04.test`).
> - Export `RUN_ID` = `process.env.PW_RUN_ID` hoặc `Date.now().toString(36)`.
>
> Giải thích bằng comment vì sao cần token thay vì ghi thẳng giá trị: CSV không diễn tả được chuỗi rỗng, chuỗi toàn khoảng trắng và chuỗi 256 ký tự một cách đọc-được-bằng-mắt.

**Vì sao `<uniq>` là bắt buộc với bài của bạn:** FR-02 tạo user mới cho mỗi TC khóa tài khoản, FR-15 tạo sản phẩm. Chạy 9 lượt mà dùng cố định `lock01@hw04.test` thì lượt firefox sẽ đụng dữ liệu lượt chromium để lại → test "đăng ký thành công" thành flaky, và flaky là thứ §6 bắt bạn phải giải trình.

---

## 3. Bộ cột chuẩn cho file dữ liệu

Dùng chung một bộ cột cho cả 3 feature (khác nhau ở phần input):

| Cột | Ý nghĩa | Vì sao cần |
|---|---|---|
| `tcId` | ID test case HW02, ví dụ `FR02-DT-03` | Truy vết ngược về HW02 — TA chấm §5 nhìn cột này |
| `title` | mô tả ngắn, hiện làm tên test trong HTML report | Report đọc được bằng mắt |
| `mode` | nhánh xử lý trong spec (`login`, `lockout`, `ui-check`…) | Cho phép nhiều dạng kịch bản trong **một** spec mà không hard-code |
| *(các cột input)* | `email`, `password`, `couponCode`, `productName`… | dữ liệu thật |
| `expect` | `accept` / `reject` — **theo ĐẶC TẢ**, không theo hành vi hiện tại của SUT | Đây là chỗ quyết định bài có phát hiện được bug hay không |
| `expectedError` | chuỗi con phải xuất hiện trong thông báo lỗi, `<empty>` nếu spec không quy định câu chữ | Tránh assert vào câu chữ mà spec không hứa |
| `rejectVia` | `client` / `server` / `any` — **cơ chế** chặn | Bắt được "Pass giả": bị từ chối nhưng sai tầng |
| `technique` | `EP hợp lệ`, `EP không hợp lệ`, `BVA on-point`, `BVA off-point`, `robust` | Đếm được positive/negative/edge cho bảng summary §14 |
| `specRef` | `FR-02 R2a`… | Chỉ ra dòng spec bị vi phạm khi Fail |
| `bugRef` | `B001`… hoặc `-` | Nối kết quả HW04 với bug đã tìm ở HW02 |
| `note` | vì sao chọn giá trị này | Cột này cứu bạn ở buổi bảo vệ vấn đáp (§13) |

> **Quy tắc sống còn:** cột `expect` điền theo **spec FR**, không theo hành vi thật của SUT. SUT này có bug cố ý. Nếu bạn điền theo hành vi thật, suite sẽ Pass 100% và **không phát hiện được bug nào** — mất trắng phần bug report của §6. Fail ở bài này là **bằng chứng**, không phải lỗi script. Nhớ viết đúng câu giải thích này vào `README.md` và `report/main-report.md`, vì người chấm nhìn 9 report đỏ lòm sẽ hỏi ngay.

---

## 4. `tests/utils/assertions.js` — 5 pattern (đề đòi ≥3)

Khác nhau về **bản chất thứ được kiểm**, không phải khác cú pháp. `toBeVisible` / `toContainText` / `toHaveText` chỉ tính là **một** pattern — ghi rõ điều này trong báo cáo để TA thấy bạn hiểu, đừng đếm 3 biến thể cú pháp rồi bảo đủ 3 pattern.

| # | Pattern | Kiểm cái gì | Bắt được lớp bug nào | Feature dùng |
|---|---|---|---|---|
| **P1** | DOM / web-first | trạng thái nhìn thấy trên UI: text, hiện/ẩn, số dòng | thiếu thông báo lỗi, sai nhãn, mật khẩu không bị che | A, B, C |
| **P2** | Navigation / URL | có điều hướng đúng nơi spec nói không | đăng nhập thành công mà không rời `/login` | A, B |
| **P3** | Backend state (REST) | state **thật** trong DB qua API | UI báo lỗi nhưng DB vẫn tạo/đổi dữ liệu, và ngược lại | A, B, C |
| **P4** | Soft numeric | phép tính tiền, bộ đếm, thời gian | công thức % sai (B007), bộ đếm +2 (B001), khóa 180s (B002) | A, B |
| **P5** | Network / HTTP status | request có được gửi không, server trả mã gì | phân biệt chặn ở client hay ở server; 401 vs 403 | A, B |

> Bài của bạn **nên dùng cả 5**: FR-02 sống chết ở chỗ phân biệt 401 (sai mật khẩu) với 403 (bị khóa) mà **UI hiển thị y hệt nhau** (bug B003). Chỉ có P5 mới thấy được sự khác biệt đó — đây là lập luận đắt giá nhất trong báo cáo của bạn, vì nó chứng minh assertion trên UI một mình là không đủ.

### Prompt sinh file

> Viết `tests/utils/assertions.js` export 5 nhóm helper, mỗi helper bọc trong `test.step()` với nhãn tiếng Việt bắt đầu bằng mã pattern (`P1 DOM · …`) để HTML report hiện rõ pattern nào đã chạy. Mọi helper nhận option `{ soft = false }`:
> - **P1**: `expectVisibleText(locator, substring, label, opts)`, `expectHidden(locator, label, opts)`, `expectCount(locator, n, label, opts)`.
> - **P2**: `expectRoute(page, pattern, label, opts)`.
> - **P3**: `expectBackendState(api, {path, expectStatus=200, predicate, label, soft})` — gọi REST rồi kiểm status và `predicate(body)`.
> - **P4**: `expectSoftNumber(actual, expected, label)` dùng `expect.soft`.
> - **P5**: `captureResponse(page, urlPart, action)` — chạy `action()` trong lúc chờ response khớp `urlPart`, trả `{ called, status, body }`, trả `called:false` nếu hết timeout (nghĩa là client đã chặn, request không bao giờ được gửi).
> - Tiện ích `parseMoney(text)`: bỏ mọi ký tự không phải chữ số rồi `Number()`; trả `NaN` khi ô rỗng — **không được** âm thầm quy về 0, vì hiển thị `NaN ₫` chính là một dạng bug cần nhìn thấy. Comment lý do: `toLocaleString()` trong SUT không truyền locale nên dấu phân cách nghìn khác nhau giữa Chrome và Firefox/WebKit; so sánh chuỗi tiền sẽ Fail giả trên một engine.

### Quy ước soft vs hard — viết vào báo cáo

- **Assertion quyết định → hard.** Sai cái này thì feature coi như hỏng.
- **Assertion bổ trợ → soft** (`expect.soft`).

Lý do: nếu hard hết, test dừng ở chỗ sai đầu tiên và report chỉ kể được một nửa câu chuyện. Ví dụ `FR02-BV-04` (đang khóa mà nhập đúng mật khẩu): nếu assert cứng vào câu thông báo và Fail ngay, bạn sẽ **không bao giờ thấy dòng "server trả 403"** — mà đó mới là bằng chứng cần dán vào bug report cho B003.

---

## 5. Nghiệm thu phần này

- [ ] `tests/data/` có ít nhất 1 file, `loadCsv` đọc được, `<empty>` `<uniq>` `<repeat>` hoạt động
- [ ] `assertions.js` có ≥3 pattern **khác bản chất**, mỗi helper có `test.step` hiện trong report
- [ ] `.spec.js` chưa có (chưa viết) hoặc đã có nhưng grep không ra test data
- [ ] Bảng 5 pattern ở trên đã được chép (bằng lời của bạn) vào `report/main-report.md` §2

```bash
git add tests/utils tests/data; git commit -m "test(utils): data-loader doc csv/json + 5 assertion pattern"
```

→ Tiếp: [03-FEATURE-A-FR02.md](03-FEATURE-A-FR02.md)
