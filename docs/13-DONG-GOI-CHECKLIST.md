# 13 — Đóng gói & Checklist nộp bài

> §14 quy định tên file và **nội dung bắt buộc** của zip. §17: **thiếu một tài liệu bắt buộc = 0 điểm**, và **nộp trễ không được chấp nhận**.

---

## 1. Tên file nộp

```
23127183_HW04_AI_Automation_<điểm tự chấm 3 chữ số>.zip
```

Ví dụ tự chấm 100 → `23127183_HW04_AI_Automation_100.zip`. Đặt **tên thư mục = tên zip (bỏ đuôi)** để trong zip chỉ có đúng một bộ, không lẫn bản cũ — cách bạn đã làm ở HW02/HW03.

---

## 2. Nội dung zip (§14) — soát từng dòng

| # | §14 đòi | File trong bài | ✅ |
|---|---|---|---|
| 1 | Main report (Markdown **+ PDF**), có automation report + review/gap analysis | `report/main-report.md` + `.pdf` | ☐ |
| 2 | Link repo GitHub public (scripts, data files, HTML reports) | trong `README.md` | ☐ |
| 3 | HTML report multi-browser | `reports/html/` — **9 thư mục** | ☐ |
| 4 | Link video YouTube unlisted | `README.md` | ☐ |
| 5 | AI Critique + AI Audit Report (Markdown **+ PDF**) | `ai-audit/` — 4 file | ☐ |
| 6 | Git commit log (file text) | `git-log/commit-log.txt` | ☐ |
| 7 | Bug report + ảnh bug trên GitHub Issues | `bug-report/` | ☐ |
| 8 | `README.md` có **bảng tự chấm** + **test summary** (số feature; số TC automation/executed/passed/failed; số lượt browser; số bug; link video) | `README.md` | ☐ |
| 9 | Tài liệu hỗ trợ khác | `.claude/skills/`, `reports/summary.md`, `docs/` | ☐ |

---

## 3. Lệnh đóng gói (PowerShell)

```bash
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04"; $OUT="23127183_HW04_AI_Automation_100"; Remove-Item -Recurse -Force $OUT,"$OUT.zip" -ErrorAction SilentlyContinue; robocopy HW04-Automation-Testing $OUT /E /XD node_modules .git demo test-results playwright-report artifacts /XF *.zip | Out-Null; Compress-Archive -Path $OUT -DestinationPath "$OUT.zip"; (Get-Item "$OUT.zip").Length/1MB
```

Kích thước nên dưới ~20MB (hạn mức Moodle). Còn nặng thì bỏ tiếp `reports/html/*/trace/` và các `.zip` bên trong report, **giữ lại ảnh Fail** để report vẫn xem được offline.

Sau khi nén: **giải nén ra một thư mục khác và mở thử** `reports/html/a-chromium/index.html` — nếu report mở ra trắng trơn hoặc mất ảnh thì bạn vừa loại nhầm thư mục `data/`.

---

## 4. Checklist tổng — chạy hết trước khi bấm nộp

### Task 1 (75đ)
- [ ] 3 feature: FR-02 · FR-09 · FR-15, mỗi feature **≥12 TC** automation
- [ ] **Không** có test data hard-code trong `.spec.js` (đã grep kiểm)
- [ ] Test data ở `.csv` **và** `.json` ngoài script
- [ ] **≥3 assertion pattern** khác bản chất, có bảng giải thích trong báo cáo
- [ ] **9 lượt browser**, 9 HTML report, mỗi cái hiện `Run by: 23127183` + timestamp ISO
- [ ] `reports/summary.md` sinh tự động; số trong README khớp với nó
- [ ] Mọi Fail đã phân loại: bug thật (có Issue) hoặc hạn chế script (có giải trình)
- [ ] Có mục **"TC không automation được và vì sao"**
- [ ] Gap analysis: AI sai gì · **vì sao** sót · tôi sửa thế nào

### Task 2 (15đ)
- [ ] Video ≥5 phút, unlisted, tiếng Việt, giọng của bạn
- [ ] Có `whoami` + `hostname` (hoặc face-cam)
- [ ] Có chạy end-to-end + multi-browser + mở HTML report
- [ ] Có kể một chỗ đã sửa script AI

### Agent Skills (10đ)
- [ ] ≥1 skill (đề xuất 4) trong `.claude/skills/`, đã dùng thật
- [ ] Video demo skill end-to-end trên một feature, unlisted

### Tài liệu bắt buộc
- [ ] Main report `.md` + `.pdf`
- [ ] AI Audit Report `.md` + `.pdf` (≥8 mục, prompt nguyên văn)
- [ ] AI Critique `.md` + `.pdf` (**200–300 từ**, đã đếm)
- [ ] Bug report + ảnh + link Issues
- [ ] `git-log/commit-log.txt` (≥8 commit chạm `tests/`, ≥4 ngày)
- [ ] README: bảng tự chấm + test summary + mọi link

### Tính toàn vẹn (§11, §17)
- [ ] HTML report là **thật**, sinh từ lần chạy thật, không sửa tay số liệu
- [ ] Video là **thật**, có giọng bạn
- [ ] Prompt trong AI Audit là **nguyên văn**, không bịa
- [ ] **Không chép** bất kỳ file/prompt nào từ `HW04/tham_khao/HW04-Automation-Testing-main` (bài của sinh viên khác) — §17 phạt cả hai bên
- [ ] Repo public mở được bằng cửa sổ ẩn danh; video mở được khi chưa đăng nhập

---

## 5. Bảng tự chấm (§15) — điền vào README

| No. | Tiêu chí | Điểm tối đa | Tự chấm | Căn cứ |
|---|---|---|---|---|
| 1 | Task 1 — Feature A (FR-02) | 25 | | <số TC> TC so với mức ≥12 · dữ liệu ngoài · pattern nào · pass/fail · bug truy được |
| 1 | Task 1 — Feature B (FR-09) | 25 | | … |
| 1 | Task 1 — Feature C (FR-15) | 25 | | … |
| 2 | Task 2 — Video demo | 15 | | thời lượng thật · unlisted · có whoami/hostname · có kể chỗ sửa script AI |
| 3 | Agent Skills | 10 | | số skill · đã dùng thật ở đâu · link video |
| | **Tổng** | **100** | | |

> Cột **Căn cứ** là chỗ ăn điểm: đừng ghi "đã hoàn thành", hãy ghi **con số kiểm chứng được** (18 TC / 9 lượt / 5 pattern / 4 defect). Đây đúng là cách bạn viết ở HW02 và nó được 100đ.

---

## 6. Nộp

Moodle → link nộp HW04 → upload zip → **tải lại file vừa nộp về máy và mở ra kiểm**. Vài phút này đã cứu rất nhiều người.
