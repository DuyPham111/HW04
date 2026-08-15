# HW04 — Automation Testing on EShop · Báo cáo chính

> ⚠️ **BỘ KHUNG.** Hướng dẫn viết từng mục ở [docs/08-MAIN-REPORT-GAP-ANALYSIS.md](../docs/08-MAIN-REPORT-GAP-ANALYSIS.md).
> Mọi số liệu phải copy từ `reports/summary.md`. Xóa dòng này trước khi nộp.

**Sinh viên:** Phạm Vũ Ngọc Duy — **MSSV:** 23127183
**SUT:** EShop — https://github.com/ttbhanh/eshop-sut
**Công cụ:** Playwright `<phiên bản>` + Playwright HTML reporter · AI: `<tên tool>`
**Repo:** `<link>` · **Video Task 2:** `<link>` · **Video skill:** `<link>`

---

## 0. Tổng quan

| | Feature | FR | Pool | TC automation | Lượt browser | Pass | Fail | Defect |
|---|---|---|---|---|---|---|---|---|
| A | Đăng nhập & Khóa tài khoản | FR-02 | A | | 3 | | | |
| B | Mã giảm giá | FR-09 | B | | 3 | | | |
| C | Quản lý sản phẩm (CRUD) | FR-15 | C | | 3 | | | |
| | **Tổng** | | | | **9** | | | |

- Ba feature lấy lại đúng từ HW02 theo §5; Pool D (mobile) không dùng ở HW04 vì bài này automation **web frontend**.
- Không trùng feature trong nhóm: không phát sinh lựa chọn mới nên thỏa thuận phân công HW02 còn hiệu lực.

---

## 1. Chiến lược automation

### 1.1 Quy trình dùng AI theo từng bước (§2)

| Bước | Việc | Prompt (rút gọn) | Tôi đã sửa gì |
|---|---|---|---|
| 1 | Đọc UI thật (selector · state · điều hướng · bug chặn đường) | | |
| 2 | Test case → file dữ liệu ngoài | | |
| 3 | Chốt assertion pattern cho từng TC | | |
| 4 | Page object (chỉ selector + hành động) | | |
| 5 | Spec (chỉ vòng lặp + assertion) | | |
| 6 | Chạy, phân loại Fail, sửa | | |

*(Không dùng prompt gộp — §2. Log đầy đủ ở `ai-audit/ai-audit-report.md`.)*

### 1.2 Data-driven (§6)
### 1.3 Assertion pattern (§6 đòi ≥3)
### 1.4 Cô lập dữ liệu và tính lặp lại

---

## 2. Kết quả thực thi

### 2.1 Bảng 9 lượt browser
### 2.2 Bằng chứng `Run by: 23127183` (metadata · annotation từng test · dải chân trang)
### 2.3 Khác biệt giữa 3 engine · số flaky

---

## 3. Human review & Gap analysis

### 3.1 Phân loại toàn bộ Fail

| Nhóm | Số TC | Ví dụ | Xử lý |
|---|---|---|---|
| Bug thật (HW02 đã ghi) | | | |
| Bug thật (mới ở HW04) | | | |
| Script sai (selector/wait/hiểu sai spec) | | | |
| Pass giả | | | |
| Hạn chế môi trường | | | |

### 3.2 AI sai / sót cái gì và vì sao

| # | AI sai / sót | Vì sao AI sót (prompt · mô hình · đặc thù feature) | Tôi đã sửa |
|---|---|---|---|
| 1 | | | |

### 3.3 Pass giả đã tự phát hiện và siết lại
### 3.4 Cải tiến prompt rút ra

---

## 4. Test case không automation được (§6)

| TC | Vì sao | Xử lý thay thế |
|---|---|---|
| | | |

---

## 5. Bug phát hiện

Chi tiết ở [bug-report/bug-report.md](../bug-report/bug-report.md).

---

## 6. Kết luận & tự đánh giá (§15)
