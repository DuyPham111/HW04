---
name: data-driven-tests
description: Biến một danh sách test case thủ công thành file dữ liệu .csv hoặc .json ngoài script, kèm kế hoạch assertion pattern để spec file không chứa một giá trị test data nào. Dùng khi bắt đầu automation một feature mới, khi thêm test case vào suite có sẵn, hoặc khi người review phát hiện test data còn hard-code trong spec.
---

# Data-Driven Tests Skill

§6 của đề: *"The test data must be stored in a separate .csv or .json file (hardcoded inline arrays
or objects in the script are not accepted), and the scripts must use at least three distinct
assertion patterns."*

Đây là **hai yêu cầu bị trượt nhiều nhất**. Skill này lo đúng hai việc đó.

## Khi nào dùng

- Bắt đầu Bước 2 của skill `automation-suite`.
- Thêm test case vào suite đã có (chỉ thêm dòng dữ liệu, không sửa code).
- Người review phát hiện test data còn nằm trong `.spec.js`.

---

## Quy trình — 6 bước

### Bước 1 — Chọn `.csv` hay `.json`

| Chọn CSV khi | Chọn JSON khi |
|---|---|
| Mọi TC có **cùng bộ trường**, giá trị đơn giản | TC có **trường lồng nhau** hoặc số lượng trường lệch nhau |
| Muốn mở/sửa bằng Excel | Cần giữ **kiểu dữ liệu** (số, `null`, boolean) |

Nên dùng **cả hai định dạng** trong cùng một bài, để chứng minh loader xử lý được cả hai.

> **Nếu chọn CSV:** ghi file kèm **BOM UTF-8**, nếu không Excel trên Windows sẽ hiện sai toàn bộ
> dấu tiếng Việt. Và loader phải có `stripBom()` để không vỡ khi đọc lại.

### Bước 2 — Bộ cột bắt buộc

| Cột | Vì sao cần |
|---|---|
| `tcId` | Truy vết ngược về test case HW02 — TA chấm §5 nhìn cột này |
| `title` | Hiện làm tên test trong HTML report |
| `mode` | Cho phép nhiều dạng kịch bản trong **một** spec mà không hard-code rẽ nhánh |
| *(các cột input)* | dữ liệu thật |
| `expect` | `accept`/`reject` **theo ĐẶC TẢ**, không theo hành vi SUT |
| `expectedError` | chuỗi con phải có trong thông báo; để trống nếu đặc tả không quy định câu chữ |
| `rejectVia` | `client`/`server`/`any` — **cơ chế** chặn, bắt được "Pass giả sai tầng" |
| `technique` | `EP hợp lệ`/`BVA on-point`/`robust`… — đếm được positive/negative/edge cho §14 |
| `specRef` | Chỉ ra dòng đặc tả bị vi phạm khi Fail |
| `bugRef` | Nối kết quả HW04 với bug đã tìm ở HW02 |
| `note` | Vì sao chọn giá trị này — **cột cứu bạn ở buổi vấn đáp §13** |

### Bước 3 — Token cho giá trị mà file phẳng không viết được

| Token | Nghĩa | Dùng cho |
|---|---|---|
| `<empty>` | chuỗi rỗng | phân biệt "ô rỗng" với "ô thiếu" |
| `<spaces:N>` | N khoảng trắng | test "tên toàn khoảng trắng" |
| `<repeat:X:N>` | X lặp N lần | biên độ dài 255/256 ký tự |
| `<uniq>` | mã duy nhất theo lần chạy | user/sản phẩm không đụng dữ liệu lần chạy trước |

### Bước 4 — ⚠️ Kiểm loader có LÀM HỘ việc của SUT không

**Bước quan trọng nhất, và là bước dễ bỏ qua nhất.** Với **mỗi** phép biến đổi mà loader thực
hiện (trim, uppercase, parse số…), tự hỏi:

> *"Nếu có một test case đang kiểm CHÍNH phép biến đổi này, thì loader có làm hộ SUT không?"*

**Ca thật đã xảy ra trong bài:** loader gọi `.trim()` trên mọi giá trị (hợp lý cho CSV — khoảng
trắng quanh ô là nhiễu định dạng). Nhưng TC `FR09-BV-R03` kiểm *"SUT có tự cắt khoảng trắng thừa
trong mã giảm giá không"*. Chuỗi `"  SAVE10  "` bị **loader cắt sạch trước khi tới tay test** ⇒
test nhận `"SAVE10"` đã sạch, được chấp nhận, **báo Pass** — nhưng công lao trim là của **loader**,
không phải của SUT. **Pass giả đúng nghĩa.**

Cách sửa: cho phép **tắt** phép biến đổi theo ngữ cảnh (`resolveToken(raw, { trim })` — CSV giữ
`true`, JSON dùng `false`, vì khoảng trắng trong JSON là **cố ý**).

### Bước 5 — Chốt assertion pattern (≥3, khác nhau về BẢN CHẤT)

| # | Pattern | Kiểm gì | Bắt được lớp bug nào |
|---|---|---|---|
| **P1** | DOM / web-first | trạng thái thấy được trên UI | thiếu thông báo lỗi, sai nhãn |
| **P2** | Navigation / URL | có đi đúng nơi đặc tả nói | không chuyển trang sau submit |
| **P3** | Backend state (REST) | state **thật** trong DB | UI báo lỗi mà DB vẫn đổi, và ngược lại |
| **P4** | Soft numeric | tiền, bộ đếm, độ dài | công thức sai, tràn số, `NaN` |
| **P5** | Network / HTTP status | request có gửi không, server trả mã gì | chặn sai tầng; 401 vs 403; **thiếu xác thực** |

**Ba điều phải ghi rõ trong báo cáo:**
1. `toBeVisible`/`toContainText`/`toHaveText` là 3 biến thể cú pháp của **cùng một** pattern (P1) —
   chỉ tính là **một**.
2. Feature nào **không dùng được** pattern nào, và **bù bằng gì**. *(SPA một route ⇒ không dùng
   được P2 ⇒ bù bằng P3.)*
3. Quy ước soft/hard: **assertion quyết định để hard, bổ trợ để soft** — nếu hard hết, test dừng ở
   chỗ sai đầu tiên và report chỉ kể được một nửa câu chuyện.

### Bước 6 — Tự kiểm trước khi commit

```
findstr /S /I /N "eshop.com SAVE10 Test1234 Admin123" tests\*.spec.js
```

Ra dòng nào (ngoài comment) ⇒ còn hard-code. Rồi kiểm bằng script:

```
node -e "import('./tests/utils/data-loader.js').then(({loadCsv})=>{const r=loadCsv('<file>');console.log(r.length,'dòng');console.log(Object.keys(r[0])[0]==='tcId'?'header sạch':'HEADER DÍNH BOM');})"
```

---

## Tiêu chí nghiệm thu

- [ ] Spec file **không chứa** một giá trị test data nào (grep xác nhận)
- [ ] Số dòng dữ liệu = số test case Playwright liệt kê (`--list`)
- [ ] Token giải đúng — đặc biệt `<uniq>` phải khác nhau giữa 2 lần chạy
- [ ] **Đã chạy Bước 4** — trả lời được: loader có làm hộ SUT chỗ nào không?
- [ ] Cột `expect` điền theo đặc tả, **không** theo hành vi SUT

## Lỗi thường gặp (thu từ bài thật)

| Lỗi | Hậu quả |
|---|---|
| Điền `expect` theo hành vi hiện tại của SUT | Suite Pass 100%, **không phát hiện bug nào** |
| CSV thiếu BOM UTF-8 | Excel hiện sai toàn bộ dấu tiếng Việt |
| Loader trim luôn cả JSON | **Pass giả** ở TC kiểm việc chuẩn hoá |
| Lẫn quy ước "viết không dấu" từ cột ghi chú sang **cột dữ liệu** | `selectOption({label})` không khớp được nhãn UI |
| Dòng comment `#` chứa dấu `"` bị Excel bọc quote khi lưu lại | Loader hiểu nhầm comment thành header, lệch toàn bộ file |
