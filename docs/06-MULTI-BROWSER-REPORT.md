# 06 — Chạy 9 lượt multi-browser & HTML report có "Run by: 23127183"

> §6: *"Each feature must run on all three browsers — at least 9 browser runs in total. Each run must produce an HTML report that visibly displays 'Run by: {StudentID}'."*
> §11 (chống gian lận): report **phải** chứa `Run by: 23127183` **kèm timestamp ISO**, và TA sẽ mở ra xem. Đây là bằng chứng không được bịa.

---

## 1. Vì sao phải là 9 lượt riêng, không phải 1 lượt gộp

Chạy `npx playwright test` một phát sẽ ra **một** report gộp cả 3 project. Đề đòi **mỗi lượt một HTML report** → phải chạy **9 lệnh riêng**, mỗi lệnh ghi vào một thư mục riêng:

```
reports/html/a-chromium/index.html   reports/json/a-chromium.json
reports/html/a-firefox/…             reports/html/a-webkit/…
reports/html/b-chromium/…            …                       …
reports/html/c-chromium/…            …                       reports/html/c-webkit/…
```

Thêm một lý do kỹ thuật: Playwright **xóa sạch `outputDir`** ở đầu mỗi lần chạy. Nếu 9 lượt dùng chung một thư mục thì ảnh Fail và trace của 8 lượt đầu bị xóa, chỉ còn lượt cuối — mà bug report cần **đúng ảnh của lượt đã sinh ra bug**.

---

## 2. `tools/run-all-browsers.mjs` — prompt

> Viết `tools/run-all-browsers.mjs` (Node ESM, chạy được trên **Windows PowerShell**, dùng `child_process.spawnSync` với `shell: true`, **không dùng bash**):
> - 3 feature (`a` → `tests/feature-a-login.spec.js`, `b` → `tests/feature-b-coupon.spec.js`, `c` → `tests/feature-c-product-admin.spec.js`) × 3 engine (chromium, firefox, webkit) = 9 lượt.
> - Nhận tham số dòng lệnh: `node tools/run-all-browsers.mjs` chạy đủ 9; `… a` chạy feature A trên cả 3 engine; `… a chromium` chạy đúng 1 lượt.
> - Trước khi chạy: gọi `tools/preflight.mjs`, thất bại thì dừng (trừ khi có env `SKIP_PREFLIGHT=1`).
> - Sinh **một** `PW_RUN_ID` dùng chung cho cả 9 lượt (dạng `yymmddHHMMSS`) để dữ liệu `<uniq>` truy vết được.
> - Mỗi lượt set env: `PW_HTML_DIR=reports/html/<f>-<b>`, `PW_JSON=reports/json/<f>-<b>.json`, `PW_ARTIFACTS=reports/artifacts/<f>-<b>`, `PW_RUN_LABEL="<tên feature> · <engine>"`, `STUDENT_ID=23127183`, rồi gọi `npx playwright test <spec> --project=<engine>`. **Không truyền `--reporter` trên CLI** — cờ này ghi đè cả mảng reporter trong config và làm html/json mất đường dẫn theo lượt.
> - Test Fail ⇒ Playwright trả exit code ≠ 0. Ở bài này Fail là **bằng chứng bug**, không phải lỗi hạ tầng ⇒ ghi lại rồi **chạy tiếp**, không dừng cả 9 lượt.
> - Sau mỗi lượt gọi `node tools/stamp-report.mjs <htmlDir> <jsonFile> "<label>"`.
> - Cuối cùng gọi `node tools/summarize.mjs` và in bảng 9 lượt kèm exit code.

---

## 3. `tools/stamp-report.mjs` — chèn "Run by" vào report

Playwright 1.6x **không có option đặt tiêu đề** cho HTML reporter; khối `metadata` trong config có hiện ở đầu report nhưng có thể phải bấm mở. §11 nói TA kiểm bằng mắt ⇒ thêm một dải luôn hiển thị.

> Viết `tools/stamp-report.mjs` nhận `<htmlDir> <jsonFile> [label]`:
> - Đọc `index.html`; nếu không có thì cảnh báo và thoát 0 (không làm hỏng cả lượt chạy).
> - Đọc **file JSON kết quả thật** của đúng lượt đó, đếm đệ quy qua `suites` → `total / passed / failed / flaky / skipped`, lấy `stats.startTime` và `stats.duration`. **Tuyệt đối không tự chế số** — script chỉ trình bày lại số có sẵn.
> - Chèn trước `</body>` một dải cố định ở chân trang (`position: fixed; bottom: 0`) gồm: `Run by: 23127183 — Phạm Vũ Ngọc Duy`, `Run at (ISO 8601): <startTime>`, nhãn lượt chạy, tên engine, và dòng `N test · N pass · N fail · Xs`.
> - Đặt lại thẻ `<title>` thành `HW04 — Run by: 23127183 — <label> — <ISO>` để tab trình duyệt cũng hiện MSSV.
> - Chạy lại lần hai thì **thay thế** dải cũ, không nhân bản.

**Vì sao có ba chỗ mang MSSV** (metadata trong config · annotation từng test qua fixture `runMeta` · dải chân trang): TA có thể kiểm ở bất kỳ chỗ nào trong ba chỗ đó. Ghi câu này vào báo cáo §2.

---

## 4. `tools/summarize.mjs` — bảng số liệu tự sinh

> Viết `tools/summarize.mjs`: đọc **tất cả** `reports/json/*.json`, sinh `reports/summary.md` gồm:
> - Bảng 9 lượt: `# | feature | engine | test | pass | fail | flaky | skipped | thời lượng | đường dẫn report`.
> - Bảng theo feature: số TC, tổng lượt, pass, fail.
> - Tổng: số feature, số TC automation, số lượt browser, số lần thực thi (TC × engine), pass, fail, flaky, tổng thời gian.
> - Danh sách **test case Fail ở ≥1 engine** kèm tên engine — dùng để viết bug report.
> - Dòng đầu ghi `Run by: 23127183` và thời điểm sinh file.
> Không nhận tham số nào cho phép nhập số bằng tay.

> **Luật:** mọi con số trong `README.md` và `report/main-report.md` phải **copy từ `reports/summary.md`**. Đếm tay là chỗ dễ lệch nhất, và số liệu lệch nhau giữa README và report là thứ TA phát hiện trong 30 giây.

---

## 5. Quy trình chạy chính thức (làm đúng thứ tự)

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\backend"; node database.js
```

Rồi khởi động lại 3 service (xem [01](01-SETUP.md)), sau đó ở repo bài làm:

```bash
npm run preflight
```

```bash
node tools/run-all-browsers.mjs
```

Mất khoảng 10–20 phút (FR-02 có TC chờ 31 giây × 3 engine). Xong:

```bash
npx playwright show-report reports/html/a-chromium
```

### Kiểm bằng mắt — bắt buộc, và nên chụp lại một ảnh làm bằng chứng

- [ ] Tab trình duyệt hiện `HW04 — Run by: 23127183 …`
- [ ] Dải chân trang hiện `Run by: 23127183` + `Run at (ISO 8601): 2026-…T…Z`
- [ ] Bấm vào một test bất kỳ → thấy annotation `Run by`, `Test case`, `Technique`
- [ ] Làm lại với **cả 9** thư mục (mở nhanh: `reports/html/<x>/index.html`)

```bash
git add reports tools; git commit -m "test(reports): 9 luot browser + HTML report co Run by 23127183"
```

---

## 6. Đọc kết quả cross-browser

| Quan sát | Nghĩa là | Viết gì vào báo cáo |
|---|---|---|
| 3 engine cho **cùng** kết quả | suite không phụ thuộc timing, kết quả là do SUT | "0 flaky, không có khác biệt engine → Fail phản ánh SUT" |
| 1 engine lệch | **phải điều tra**: selector phụ thuộc render, so chuỗi tiền theo locale, hoặc dialog xử lý khác nhau | mô tả lệch ở TC nào, nguyên nhân, đã sửa hay giữ nguyên kèm lý do |
| Flaky (chạy lại đổi kết quả) | wait sai — §6 yêu cầu phân tích đúng mục này | nêu TC, nguyên nhân, cách sửa |

Khác biệt hay gặp nhất với bài này: **WebKit** chậm hơn ở lần render đầu (Feature C), và **Firefox/WebKit** định dạng số của `toLocaleString()` khác Chrome (Feature B) — nếu bạn đã dùng `parseMoney` thì không dính.

---

## 7. Nghiệm thu

- [ ] Đủ **9** thư mục trong `reports/html/` và **9** file trong `reports/json/`
- [ ] Cả 9 report đều hiện `Run by: 23127183` + timestamp ISO
- [ ] `reports/summary.md` sinh tự động, số khớp với report
- [ ] Tổng số test ≥ 36 (3 feature × ≥12)

→ Tiếp: [07-BUG-REPORT-GITHUB-ISSUES.md](07-BUG-REPORT-GITHUB-ISSUES.md)
