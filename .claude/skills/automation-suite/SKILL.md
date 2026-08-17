---
name: automation-suite
description: Dẫn AI theo từng bước biến test case thủ công của một feature web thành bộ Playwright data-driven chạy đa trình duyệt — chốt phạm vi, đọc UI thật, đưa dữ liệu ra file ngoài, chọn assertion pattern, sinh page object rồi spec, cuối cùng review và sửa. Dùng cho HW04 Task 1 và mọi feature cần automation về sau. Không bao giờ ra một prompt gộp kiểu "viết toàn bộ automation script cho feature X".
---

# Automation Suite Skill

Quy trình sinh **và duyệt lại** script automation cho MỘT feature, theo đúng cách lớp dạy: từng
bước một, mỗi bước người xem và sửa trước khi qua bước sau.

Điều tuyệt đối không làm: ra một prompt duy nhất kiểu *"viết toàn bộ automation script cho
feature X"*. §2 của đề gọi đó là dùng AI như black box và bài sẽ bị trừ điểm.

## Khi nào dùng

- Có một feature web của SUT (một FR trong Pool A/B/C) cần automation ≥12 test case.
- Đã có test case thủ công (từ HW02) hoặc cần tự khai báo test case mới.

## Đầu vào cần có

- Mã FR + đặc tả của feature (`eshop-sut/README.md` — **đặc tả gốc**, không phải suy đoán).
- Danh sách test case nguồn (HW02 `Main_Report.md`).
- SUT đang chạy + `npm run preflight` toàn `[OK]`.

---

## Quy trình — 6 bước, mỗi bước MỘT lượt hỏi AI

### Bước 1 — Chốt phạm vi và ĐỌC UI THẬT

Xác định: FR nào, app nào (`frontend-web` :5173 hay `frontend-admin` :5174), route nào. Rồi **đọc
mã nguồn màn hình đó** trước khi sinh bất cứ dòng script nào. Ghi lại 4 thứ:

1. **Selector khả dụng** — có `id`/`name`/`data-testid`/`aria-label` không? `<label>` có `htmlFor`
   không? Nếu không có gì cả (thường là vậy ở SUT này) thì neo theo cái gì?
2. **Cơ chế state** — dữ liệu nằm ở API, `localStorage`, hay React state trong bộ nhớ?
3. **Điều hướng** — có route riêng cho từng màn (assert được URL) hay chỉ đổi state?
4. **Bug đã biết chặn đường** — phải quyết định trước: đi đường vòng qua bug (để kiểm được thứ
   khác) và **giữ riêng một TC khẳng định đúng đặc tả**, để bug không bị script che mất.

> **Prompt:** *"Đọc `<file màn hình>`. Liệt kê mọi input/button kèm thuộc tính có thể dùng làm
> selector. Chỉ ra state của feature nằm ở đâu và điều gì làm mất state. Đối chiếu với đặc tả
> trong `eshop-sut/README.md`. Đừng viết test."*

**Checklist người review:**
- [ ] Đã đối chiếu **đặc tả gốc**, không chỉ đọc code? *(Ở Feature C, bước này phát hiện yêu cầu
      "dialog xác nhận khi xoá" thuộc **FR-07 giỏ hàng**, không phải FR-15 — nếu bỏ qua sẽ báo
      bug sai đặc tả.)*
- [ ] Có phát hiện chỗ nào đặc tả đòi mà code **không** làm? *(Bước này tìm ra bug FR-12
      Critical của bài.)*

### Bước 2 — Chuyển test case thành FILE DỮ LIỆU (chưa viết script)

Xem skill `data-driven-tests`. Kết quả: một `.csv`/`.json` trong `tests/data/`, mỗi dòng một test
case, cột `tcId` truy về HW02, cột `expect` là **kỳ vọng theo ĐẶC TẢ** — không theo hành vi hiện
tại của SUT.

### Bước 3 — Chốt assertion pattern TRƯỚC khi sinh code

Ít nhất 3 pattern khác nhau **về bản chất** (xem `tests/utils/assertions.js`). Với mỗi TC, ghi rõ
pattern nào là **assertion quyết định**.

> Nguyên tắc: assertion trên UI một mình là **không đủ**. UI có thể báo "thành công" trong khi DB
> không đổi, và ngược lại. Ở Feature A, UI nuốt sạch khác biệt giữa 401 và 403 — chỉ pattern HTTP
> status và backend-state mới tách được.

### Bước 4 — Sinh PAGE OBJECT trước, SPEC sau

Page object: **chỉ selector + hành động, KHÔNG assertion**. Duyệt từng selector — cái nào bám
class CSS hoặc thứ tự phần tử thì bắt sửa; buộc phải giữ thì ghi lý do vào comment.

**Checklist người review:**
- [ ] Tham số của hàm có **trùng tên cột** trong file dữ liệu không? *(Feature C từng sai: hàm
      nhận `name` nhưng cột là `productName` → ô không bao giờ được điền.)*
- [ ] `page.goto('/')` có dùng đúng app không? *(Feature C ở port khác, `baseURL` không còn đúng.)*
- [ ] Có `waitForTimeout` cố định nào không? → thay bằng chờ có điều kiện.

### Bước 5 — Sinh SPEC, chạy 1 engine, phân loại TỪNG Fail

Spec chỉ được `loadCsv`/`loadJson` rồi lặp — **không chứa một giá trị test data nào**.

Chạy một engine, rồi phân loại **mỗi** Fail vào đúng một trong 5 nhóm:

| Nhóm | Dấu hiệu | Xử lý |
|---|---|---|
| **Bug thật** | Fail đúng chỗ đặc tả bị vi phạm, tái lập được | giữ, nối `bugRef`, đưa vào bug report |
| **Selector sai** | `locator resolved to 0 elements` | sửa page object, ghi vào gap analysis |
| **Hiểu sai đặc tả** | kỳ vọng không khớp câu chữ đặc tả | sửa file dữ liệu |
| **Flaky / wait sai** | chạy lại đổi kết quả | thay wait cố định bằng chờ có điều kiện |
| **Pass giả** | Pass nhưng vì lý do sai | siết assertion — **đáng viết vào báo cáo nhất** |

**Bắt buộc:** chạy **2 lần liên tiếp**. Kết quả khác nhau ⇒ còn phụ thuộc state, quay lại Bước 4.

### Bước 6 — Chạy đủ 3 engine + gap analysis

Xem skill `multi-browser-report`. Ghi vào `report/main-report.md` §3: AI sai/sót cái gì, **vì sao**
(prompt / giới hạn mô hình / đặc thù feature / giả định môi trường), đã sửa thế nào.

---

## Tiêu chí nghiệm thu

- [ ] ≥12 TC/feature · dữ liệu ở file ngoài · ≥3 assertion pattern khác bản chất
- [ ] Chạy 2 lần cho **cùng** kết quả (0 flaky)
- [ ] Mọi Fail đã phân loại vào đúng 1 trong 5 nhóm
- [ ] Dữ liệu test được dọn sạch sau khi chạy (kiểm bằng API)
- [ ] Đã ghi ≥2 chỗ AI làm sai mà mình sửa

## Lỗi thường gặp (thu từ bài thật)

| Lỗi | Cách tránh |
|---|---|
| Tham số hàm không trùng tên cột dữ liệu | Liệt kê tên cột **trước** khi viết hàm |
| `baseURL` không còn đúng khi feature ở app khác | Dùng URL tuyệt đối cho app thứ hai |
| **Comment mô tả đúng ý định nhưng code làm khác** | Chạy thật rồi đối chiếu kết quả với ý định — đọc code không bắt được loại lỗi này |
| Tự thêm cờ CLI phá cấu hình | Đọc lại comment trong file config trước khi thêm cờ |
