# Bug Report — HW04 Automation Testing

> ⚠️ **BỘ KHUNG.** Hướng dẫn ở [docs/07-BUG-REPORT-GITHUB-ISSUES.md](../docs/07-BUG-REPORT-GITHUB-ISSUES.md). Xóa dòng này trước khi nộp.

**Sinh viên:** Phạm Vũ Ngọc Duy — 23127183 · **Ngày:** `<…>` · **Nguồn số liệu:** `reports/summary.md`

## 0. Quy đổi Fail → defect

| Số lần Fail (TC × engine) | Số test case Fail ở ≥1 engine | Số defect |
|---|---|---|
| | | |

Một defect gây nhiều Fail: `<ví dụ>`.

---

## 1. Bug MỚI phát hiện nhờ automation

### BUG-`<id>` — `<tiêu đề ngắn>`

| | |
|---|---|
| Feature / FR | |
| Test case phát hiện | |
| Engine | |
| Assertion pattern bắt được | |
| Mức độ | Critical / High / Medium / Low |
| GitHub Issue | `#<số>` |

**Đặc tả nói gì:** *(trích nguyên văn)*
**Thực tế:**
**Nguyên nhân trong mã nguồn:** `<file:dòng>`
**Các bước tái lập:** 1. … 2. … 3. …
**Bằng chứng:** `![](screenshots/<tên>.png)`
**Vì sao kiểm thủ công ở HW02 không phát hiện:**

---

## 2. Defect đã ghi từ HW02, được automation tái lập

| Bug-ID | Mô tả | TC Fail ở HW04 | Engine | Issue cũ |
|---|---|---|---|---|
| B001 | Bộ đếm sai lần đăng nhập tăng +2, khóa sớm | | | |
| B002 | Thời gian khóa 180s thay vì 30s | | | |
| B003 | UI không phân biệt "bị khóa" với "sai mật khẩu" | | | |
| B004 | Ô mật khẩu không che ký tự | | | |
| B005 | Ô email `type="text"`, không validate | | | |
| B006 | Đơn đúng bằng ngưỡng tối thiểu bị từ chối (off-by-one) | | | |
| B007 | Công thức giảm giá percent sai | | | |
| B008 | Khách chưa đăng nhập vẫn áp được mã | | | |
| B009 | Giá 0 / âm / rỗng đều tạo được | | | |
| B010 | Tên sản phẩm toàn khoảng trắng vẫn tạo được | | | |
| B012 | Tiêu đề/nhãn trang đăng nhập sai | | | |
| B013 | Ô tổng tiền sửa tự do | | | |
| B014 | Sửa 1 sản phẩm làm hiển thị sai cả danh sách | | | |
| B015 | Tên 256 ký tự không bị cắt/từ chối | | | |

---

## 3. Ứng viên đã loại (Fail nhưng **không** báo là bug)

| TC | Vì sao không phải bug |
|---|---|
| | |
