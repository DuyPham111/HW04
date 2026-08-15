# 07 — Bug report & GitHub Issues

> §6: *"wherever a failing assertion reveals a genuine defect, a bug report. Log such bugs both in the Markdown report and on your GitHub Issues page, attaching a screenshot to each issue."*
> §14 đòi trong zip: `Bug report, with screenshots of the bugs on the GitHub Issues page (if any)`.

---

## 1. Bước 1 — Từ Fail → defect (đừng đếm Fail như đếm bug)

Sau 9 lượt bạn sẽ có rất nhiều dòng Fail. **Một bug gây nhiều Fail**: bug B009 (không validate giá) làm Fail 3 TC × 3 engine = 9 lần Fail nhưng vẫn chỉ là **1 defect**. Đọc số Fail như đếm bug là sai gấp nhiều lần, và TA sẽ hỏi ngay ở buổi vấn đáp.

Lập bảng quy đổi trong `bug-report/bug-report.md`:

| Lần Fail | Test case Fail (≥1 engine) | Defect |
|---|---|---|
| *(từ `reports/summary.md`)* | *(từ `reports/summary.md`)* | *(bạn phân loại)* |

### Phân loại từng TC Fail — 5 nhóm

| Nhóm | Xử lý |
|---|---|
| **Bug thật, HW02 đã ghi** (B001…B015) | ghi vào bug report mục "defect đã có Issue từ trước", nối tới Issue cũ trong repo nhóm |
| **Bug thật, MỚI phát hiện ở HW04** | ghi đầy đủ + **tạo GitHub Issue kèm ảnh** ← đây là thứ ăn điểm |
| **Script sai** (selector, wait, hiểu sai spec) | **sửa script**, không được báo là bug; ghi vào gap analysis |
| **Pass giả** (Pass nhưng vì lý do sai) | siết assertion rồi chạy lại; ghi vào gap analysis — mục này rất đáng viết |
| **Hạn chế môi trường** (ví dụ phải chờ 180s) | ghi vào mục "TC không automation được" |

**Ứng viên bug mới của bài bạn** (HW02 chưa ghi — kiểm lại spec trước khi báo):
1. **Xóa sản phẩm không có hộp thoại xác nhận** (`App.jsx deleteProduct` gọi thẳng API) — phát hiện bởi TC `FR15-DT-11`, pattern P5 dialog.
2. Bất kỳ khác biệt **cross-engine** nào bạn tìm ra ở bước [06](06-MULTI-BROWSER-REPORT.md).
3. Bất kỳ chỗ nào **UI báo thành công mà DB không đổi** (hoặc ngược lại) mà chỉ pattern P3 mới thấy — kiểm thủ công ở HW02 không thể thấy loại này. Đây chính là điểm bán hàng của automation, hãy tìm cho ra ít nhất một cái.

---

## 2. Bước 2 — Ảnh bằng chứng

Playwright đã tự chụp ảnh khi Fail: `reports/artifacts/<lượt>/<tên test>/test-failed-1.png`.

Chọn ảnh của **đúng lượt sinh ra bug**, copy sang `bug-report/screenshots/` với tên nói lên nội dung (`bug-c1-delete-khong-xac-nhan.png`), **không** để tên mặc định.

Ảnh cần cho GitHub Issue nên là ảnh chụp màn hình có **watermark MSSV** (mở report/SUT rồi chụp cả thanh tiêu đề có `Run by: 23127183`, hoặc mở terminal cạnh bên). §11 kiểm bằng chứng thật.

> Muốn tự động: viết `tools/capture-bug-evidence.mjs` chạy một kịch bản Playwright độc lập, tái lập đúng bug rồi `page.screenshot()` vào `bug-report/screenshots/`. Prompt: *"Viết script Playwright độc lập tái lập bug X trên SUT, chụp màn hình lưu vào bug-report/screenshots/<tên>.png, có chèn overlay chữ 'Run by: 23127183 — <ISO timestamp>' vào góc trang trước khi chụp bằng `page.addStyleTag`/`page.evaluate`."*

---

## 3. Bước 3 — `bug-report/bug-report.md`

Cấu trúc (một block cho mỗi bug — giữ đúng format bạn đã dùng ở HW02 vì nó đã được 100đ):

```markdown
### BUG-C1 — Xóa sản phẩm không hỏi xác nhận

| | |
|---|---|
| **Feature / FR** | C — FR-15 Quản lý sản phẩm |
| **Test case phát hiện** | FR15-DT-11 (chromium, firefox, webkit) |
| **Assertion pattern** | P5 — dialog |
| **Mức độ** | Medium |
| **Trạng thái** | Mới phát hiện ở HW04 |
| **GitHub Issue** | #<số> |

**Đặc tả nói gì:** <trích nguyên văn dòng spec>
**Thực tế:** <mô tả>
**Nguyên nhân trong mã nguồn:** `frontend-admin/src/App.jsx:133` — `deleteProduct` gọi thẳng `axios.delete` …
**Các bước tái lập:** 1… 2… 3…
**Bằng chứng:** ![](screenshots/bug-c1-delete-khong-xac-nhan.png)
**Vì sao kiểm thủ công ở HW02 không phát hiện:** <câu này rất đáng viết>
```

Sau các block bug, thêm **hai mục**:
- **Defect đã có từ HW02** — bảng: `Bug-ID | mô tả | TC Fail ở HW04 | Issue cũ`. Cho thấy automation **tái lập lại được** bug thủ công là một kết quả tốt, phải ghi.
- **Ứng viên đã loại** — những Fail bạn **quyết định không** báo là bug, kèm lý do (spec không quy định / là hạn chế script). Mục này chứng minh bạn có review thật.

---

## 4. Bước 4 — GitHub Issues

Dùng repo nhóm HW02 của bạn (`https://github.com/Kurumi2324/SoftwareTestingHW2_Group10/issues`) nếu vẫn còn dùng chung, hoặc repo cá nhân HW04. Mỗi bug **mới** → 1 Issue, **kèm ảnh**.

```bash
gh issue create --repo <owner>/<repo> --title "[HW04][FR-15] Xóa sản phẩm không hỏi xác nhận" --body-file bug-report/issue-c1.md
```

Chưa có `gh` thì tạo tay trên web cũng được. Ảnh nhúng bằng cách kéo-thả vào ô soạn Issue (GitHub tự upload), hoặc push ảnh lên một branch rồi nhúng bằng raw URL.

**Nội dung Issue** (tiếng Việt được, giống HW02): mô tả · môi trường (browser + engine + ngày) · các bước tái lập · kỳ vọng theo spec · thực tế · ảnh · dòng mã nguồn nghi vấn · **test case automation nào bắt được** (`FR15-DT-11`) — chi tiết cuối này cho thấy bug đến từ automation chứ không phải mắt thường.

Sau khi tạo xong, **chụp màn hình trang Issue** (§14 đòi *screenshots of the bugs on the GitHub Issues page*) → lưu vào `bug-report/screenshots/issue-<id>.png`, và điền số Issue ngược lại vào `bug-report.md` + `README.md`.

---

## 5. Nghiệm thu

- [ ] Mỗi TC Fail đã thuộc **đúng một** trong 5 nhóm ở §1
- [ ] Mỗi bug mới có: block trong `bug-report.md` + ảnh + GitHub Issue + ảnh chụp trang Issue
- [ ] Bug cũ của HW02 được ghi ở mục riêng, không trộn lẫn với bug mới
- [ ] Có mục "ứng viên đã loại" kèm lý do
- [ ] Số defect trong `README.md` khớp với `bug-report.md`

```bash
git add bug-report; git commit -m "docs: bug report + anh bang chung + link GitHub Issues"
```

→ Tiếp: [08-MAIN-REPORT-GAP-ANALYSIS.md](08-MAIN-REPORT-GAP-ANALYSIS.md)
