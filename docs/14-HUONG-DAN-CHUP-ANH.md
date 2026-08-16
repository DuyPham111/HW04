# 14 — Hướng dẫn chụp ảnh: cái nào AI làm được, cái nào BẠN phải tự làm

> §11 (Anti-AI-Cheat) chia bằng chứng làm hai loại. Hiểu đúng ranh giới này để không mất điểm
> oan, cũng không làm thừa.

---

## 1. Ranh giới

| Loại bằng chứng | Ai làm được | Vì sao |
|---|---|---|
| Ảnh chụp **HTML report** | ✅ AI làm được (đã làm) | Report là artifact **thật** do 9 lượt chạy thật sinh ra. Chụp lại chỉ là ghi nhận cơ học — như bạn tự mở file rồi bấm Print Screen. Không tạo ra dữ liệu mới. |
| Ảnh chụp **trang GitHub Issues** | ❌ **BẠN tự làm** | Cần tài khoản GitHub của bạn. Ảnh này chứng minh **bạn** đã tạo issue, không phải ai khác. |
| **Video demo** có `whoami`/`hostname` hoặc face-cam | ❌ **BẠN tự làm** | §11 nói thẳng: phải có giọng bạn + danh tính bạn. |
| Ảnh chụp **tab trình duyệt** (thấy `<title>`) | ⚠️ Nên bạn tự làm | Playwright chỉ chụp được nội dung trang, **không chụp được thanh tab** của trình duyệt. Muốn thấy title trên tab phải chụp màn hình thật. |

---

## 2. ✅ ĐÃ XONG — AI đã chụp (19 ảnh trong `reports/evidence/`)

Sinh lại bất cứ lúc nào bằng:

```bash
node tools/capture-report-evidence.mjs
```

| File | Nội dung | Dùng cho |
|---|---|---|
| `report-<feature>-<engine>.png` × 9 | Toàn cảnh mỗi report: số Passed/Failed/Flaky, tên Project, dải Run by ở chân trang | `main-report.md` §2.2 |
| `runby-<feature>-<engine>.png` × 9 | Cận cảnh dải Run by — đọc rõ `Run by: 23127183 — Phạm Vũ Ngọc Duy`, `Run at (ISO 8601)`, engine, số liệu | Bằng chứng §11 |
| `test-detail-FR15-SEC-01.png` | Một TC Fail mở rộng: annotation đầy đủ + lỗi + các bước + ảnh JSON đính kèm | `bug-report.md` (bug FR-12) |

---

## 3. ❌ BẠN CẦN TỰ CHỤP — danh sách đầy đủ

### 3.1. Tab trình duyệt hiện `<title>` có MSSV (1 ảnh)

**Vì sao cần:** §11 nói TA kiểm bằng mắt. Title trên tab là chỗ thứ tư mang MSSV mà ảnh
Playwright không chụp được.

**Cách chụp:**
1. Mở report: `npx playwright show-report reports/html/a-chromium`
2. Nhìn lên **thanh tab** — phải thấy: `HW04 — Run by: 23127183 — Feature A — FR-02 … · chromium — 2026-08-16T…`
3. Nhấn `Win + Shift + S` → chọn vùng gồm **cả thanh tab + phần đầu trang**
4. Lưu thành `reports/evidence/tab-title-manual.png`

**Ví dụ khung cần chụp:**
```
┌──────────────────────────────────────────────────────────────┐
│ ⬤ HW04 — Run by: 23127183 — Feature A … 2026-08-16T…  ✕     │ ← PHẢI có dòng này
├──────────────────────────────────────────────────────────────┤
│  🔍 Search tests    All 16 | ✓ Passed 6 | ✕ Failed 10        │
│  Project: chromium                                            │
└──────────────────────────────────────────────────────────────┘
```

### 3.2. Trang GitHub Issues của **2 bug mới** (2–4 ảnh) — làm ở `docs/07`

**Vì sao cần:** §14 đòi *"Bug report, with screenshots of the bugs on the GitHub Issues page"*.

**Chụp gì:**

| # | Ảnh | Nội dung phải thấy |
|---|---|---|
| 1 | `issue-fr12-broken-access-control.png` | Trang issue mở ra: tiêu đề, nhãn, **tên tài khoản `DuyPham111`**, ngày tạo, phần mô tả, ảnh đã nhúng |
| 2 | `issue-category-9999.png` | Tương tự cho bug category_id |
| 3 | `issues-list.png` | Danh sách Issues thấy cả 2 issue mới nằm cùng nhau |

**Cách chụp:** mở issue trên GitHub → `Win + Shift + S` → chọn vùng thấy rõ **URL + tên tài
khoản + tiêu đề issue** → lưu vào `bug-report/screenshots/`.

**Lưu ý:** chụp sao cho thấy **thanh địa chỉ** (URL `github.com/DuyPham111/...`) — đó là thứ
chứng minh issue thật, không phải ảnh chế.

### 3.3. Video demo (§Task 2) — làm ở `docs/09`

Không phải ảnh, nhưng cùng nhóm "danh tính thật":
- Mở đầu quay terminal chạy `whoami` và `hostname` (để kết quả hiện ≥5 giây), **hoặc** bật face-cam
- Giọng thuyết minh phải là **giọng bạn**, tiếng Việt

---

## 4. Nơi lưu — quy ước thống nhất

```
reports/evidence/          ← ảnh về REPORT (AI đã chụp 19 ảnh + ảnh tab bạn tự chụp)
bug-report/screenshots/    ← ảnh về BUG và GitHub Issues (bạn tự chụp ở docs/07)
```

Đừng trộn hai thư mục: `reports/evidence/` chứng minh **suite đã chạy thật**;
`bug-report/screenshots/` chứng minh **bug có thật và đã được báo cáo**.

---

## 5. Checklist

- [x] 19 ảnh report — AI đã chụp, đã commit
- [ ] `tab-title-manual.png` — bạn chụp (mục 3.1)
- [ ] Ảnh GitHub Issues — bạn chụp ở `docs/07` (mục 3.2)
- [ ] Video có `whoami`/`hostname` — bạn quay ở `docs/09` (mục 3.3)
