# 00 — Roadmap HW04: từ đề bài đến file nộp

> Sinh viên: **Phạm Vũ Ngọc Duy — 23127183** · SUT: EShop (https://github.com/ttbhanh/eshop-sut)
> Đọc file này **trước tiên**. Mỗi mục dưới đây trỏ tới một file hướng dẫn chi tiết trong `docs/`.

---

## 1. Ba feature bắt buộc (§5 của đề)

§5 nói rõ: **automation đúng 3 feature web đã chọn ở HW02**, mỗi Pool một cái. Pool D (mobile) **không dùng** ở HW04.

| | Pool | FR | Feature | App / route | Nguồn test case HW02 |
|---|---|---|---|---|---|
| **A** | A | FR-02 | Đăng nhập & Khóa tài khoản | `frontend-web` :5173 `/login` | `FR02-DT-01…10`, `FR02-BV-01…07`, `FR02-BV-R01…R04` (21 TC) |
| **B** | B | FR-09 | Mã giảm giá (Coupon) | `frontend-web` :5173 `/checkout` | `FR09-DT-01…10`, `FR09-BV-01…07`, `FR09-BV-R01…R03` (20 TC) |
| **C** | C | FR-15 | Quản lý Sản phẩm (CRUD) | `frontend-admin` :5174 tab Sản phẩm | `FR15-DT-01…08`, `FR15-BV-01…05`, `FR15-BV-R01…R02` (15 TC) |

Feature D của HW02 (FR-02 mobile) **bỏ**, và trong `report/main-report.md` phải có **một câu** giải thích là bỏ theo đúng §5.

Không phát sinh lựa chọn mới → thỏa thuận không trùng feature trong nhóm ở HW02 vẫn còn hiệu lực. Ghi câu này vào báo cáo (đề §5 có kiểm).

---

## 2. Bản đồ: yêu cầu của đề → thứ phải nộp

| Đề | Yêu cầu định lượng | Nộp bằng cái gì | Hướng dẫn |
|---|---|---|---|
| §6 Task 1 | ≥ **12 TC automation / feature** (36 TC tổng) | `tests/feature-*.spec.js` | [03](03-FEATURE-A-FR02.md) [04](04-FEATURE-B-FR09.md) [05](05-FEATURE-C-FR15.md) |
| §6 Task 1 | Test data ở **file .csv/.json ngoài script** | `tests/data/*.csv|json` | [02](02-DATA-DRIVEN-VA-ASSERTION.md) |
| §6 Task 1 | ≥ **3 assertion pattern khác bản chất** | `tests/utils/assertions.js` + bảng trong báo cáo | [02](02-DATA-DRIVEN-VA-ASSERTION.md) |
| §6 Task 1 | ≥ **9 lượt browser** (3 feature × 3 engine), mỗi lượt **1 HTML report** có `Run by: 23127183` + timestamp ISO | `reports/html/<feature>-<engine>/` | [06](06-MULTI-BROWSER-REPORT.md) |
| §6 Task 1 | **Human review + gap analysis**: AI sai gì, sót gì, **vì sao** | `report/main-report.md` §3 | [08](08-MAIN-REPORT-GAP-ANALYSIS.md) |
| §6 Task 1 | Bug do automation phát hiện → **Markdown + GitHub Issue kèm ảnh** | `bug-report/` + Issues | [07](07-BUG-REPORT-GITHUB-ISSUES.md) |
| §6 Task 1 | Ghi rõ **TC nào không automation được và vì sao** | `report/main-report.md` §4 | [08](08-MAIN-REPORT-GAP-ANALYSIS.md) |
| §Task 2 | Video YouTube **unlisted ≥ 5 phút**, tiếng Việt, có `whoami`+`hostname` hoặc face-cam, **kể 1 chỗ đã sửa script AI** | link trong README | [09](09-VIDEO-TASK2.md) |
| §7 | **Agent Skill** + video demo skill end-to-end trên 1 feature | `.claude/skills/` + link | [10](10-AGENT-SKILLS.md) |
| §9 | **AI Audit Report** (tool, ngày giờ, prompt, output) | `ai-audit/ai-audit-report.md` + PDF | [11](11-AI-AUDIT-CRITIQUE.md) |
| §10 | **AI Critique 200–300 từ** | `ai-audit/ai-critique.md` + PDF | [11](11-AI-AUDIT-CRITIQUE.md) |
| §12 | ≥ **8 commit chạm file test** (`.spec.js`…), rải nhiều ngày | `git-log/commit-log.txt` | [12](12-GIT-COMMIT-LOG.md) |
| §14 | README có **bảng tự chấm + test summary**, zip đúng tên | `README.md` | [13](13-DONG-GOI-CHECKLIST.md) |

**§17: thiếu bất kỳ tài liệu bắt buộc nào = 0 điểm.** Cuối cùng bắt buộc chạy checklist ở [13](13-DONG-GOI-CHECKLIST.md).

---

## 3. Nguyên tắc bắt buộc khi dùng AI (§2) — cái này ăn điểm hoặc mất điểm

1. **Không được ra một prompt gộp** kiểu *"viết toàn bộ automation script cho FR-02"*. Đề gọi đó là dùng AI như black box. Phải chia thành **các bước của kỹ thuật**: đọc UI → chốt test data → chốt assertion → page object → spec → chạy → sửa. Mỗi bước một lượt hỏi.
2. **Mọi output của AI phải được bạn review và sửa**, và phải **ghi lại** đã sửa cái gì. Đây chính là phần "Review and fix" của §6 và là nội dung của gap analysis.
3. **Ghi log mọi lượt dùng AI** ngay lúc dùng (tool, ngày giờ, prompt nguyên văn, output tóm tắt, bạn sửa gì). Ghi sau sẽ bịa — và bịa là rủi ro lớn nhất của bài này.
4. **Không được bịa số liệu**. Mọi con số trong README/báo cáo phải sinh ra từ `reports/json/*.json` thật.

> ⚠️ **Cảnh báo §17 — chống chép bài:** thư mục `HW04/tham_khao/HW04-Automation-Testing-main` là bài của **sinh viên khác (23127178)**. Chép file của họ (kể cả prompt) = **0 điểm cho cả hai bên**. Dùng nó để hiểu *cách tổ chức*, còn code, prompt, câu chữ báo cáo phải là của bạn — và tự nhiên nó sẽ khác, vì feature của bạn là FR-02/FR-09/FR-15 chứ không phải FR-01/FR-07/FR-15.

---

## 4. Thứ tự làm — 10 giờ theo đề, chia 5 buổi

| Buổi | Việc | Output kiểm chứng được | Guide |
|---|---|---|---|
| **1** (~1.5h) | Dựng môi trường: chạy SUT, cài Playwright, viết `playwright.config.js` + `tools/preflight.mjs` + `tools/run-all-browsers.mjs` | `npm run preflight` in ra 4 dòng `[OK]` | [01](01-SETUP.md) |
| **2** (~2.5h) | **Feature A — FR-02**: data file → page object → spec → chạy chromium → sửa | ≥12 TC chạy được, mỗi Fail đã phân loại | [03](03-FEATURE-A-FR02.md) |
| **3** (~2h) | **Feature B — FR-09** | ≥12 TC | [04](04-FEATURE-B-FR09.md) |
| **4** (~2h) | **Feature C — FR-15** | ≥12 TC | [05](05-FEATURE-C-FR15.md) |
| **5** (~2h) | Chạy 9 lượt → summary → bug report + Issues → main report + gap analysis → AI audit + critique → 2 video → git log → zip | Checklist [13] tick hết | [06](06-MULTI-BROWSER-REPORT.md) → [13](13-DONG-GOI-CHECKLIST.md) |

Mỗi buổi **commit ít nhất 2 lần chạm file test** → hết buổi 4 là đã vượt mốc 8 commit của §12 một cách tự nhiên, rải trên ≥4 ngày (đừng dồn 1 ngày — §12 nhìn được lịch sử).

---

## 5. Cây thư mục bài nộp

```
HW04-Automation-Testing/
├── README.md                     ← §14: bảng tự chấm + test summary (viết CUỐI CÙNG)
├── package.json · playwright.config.js
├── tests/
│   ├── data/                     ← .csv/.json — TOÀN BỘ test data (§6)
│   ├── pages/                    ← page object: chỉ selector + hành động, KHÔNG assertion
│   ├── utils/                    ← data-loader · assertions (≥3 pattern) · env
│   ├── fixtures/base.js          ← token admin, client REST, annotation MSSV, dọn dữ liệu
│   ├── feature-a-login.spec.js
│   ├── feature-b-coupon.spec.js
│   └── feature-c-product-admin.spec.js
├── tools/                        ← preflight · run-all-browsers · stamp-report · summarize
├── reports/  html/<feature>-<engine>/ · json/ · summary.md   ← BẰNG CHỨNG §6, §11
├── report/main-report.md (+ .pdf)          ← báo cáo chính + gap analysis
├── ai-audit/ai-audit-report.md · ai-critique.md (+ .pdf)
├── bug-report/bug-report.md + screenshots/
├── git-log/commit-log.txt
├── .claude/skills/               ← §7 Agent Skills
└── docs/                         ← CÁC FILE HƯỚNG DẪN NÀY (không cần nộp, có thể để lại cũng được)
```

---

## 6. Điểm khác biệt của bài bạn so với bài tham khảo — đừng làm mất

Ba feature của bạn khó automation hơn bộ FR-01/FR-07/FR-15, và chính chỗ khó đó là chỗ ăn điểm §6 "review and fix":

| Feature | Chỗ khó thật sự | Cách xử đã tính sẵn |
|---|---|---|
| **A — FR-02** | Bộ đếm khóa là **state trong DB**, khóa **180 giây**. Chạy 3 engine × nhiều TC mà dùng chung 1 tài khoản thì các test đạp chân nhau, kết quả vô nghĩa. | Mỗi TC khóa dùng **user riêng tạo qua `POST /api/register`**, xóa qua `DELETE /api/admin/users/:id` sau test. Xem [03](03-FEATURE-A-FR02.md) §3. |
| **A — FR-02** | TC "hết hạn khóa sau 30s" — chờ 180s trong suite là không chấp nhận được | Assert tại mốc **31s** (spec nói phải mở → Fail = bằng chứng B002), phần >180s ghi vào mục "không automation được" §6. |
| **B — FR-09** | Giỏ hàng nằm trong **React state** (`CartContext`), reload là mất; `/checkout` cần đi qua giỏ | Điều hướng SPA trong **một page session**, hoặc set tổng tiền qua ô "Tổng tiền" có thể sửa (đây cũng chính là bug B013). Xem [04](04-FEATURE-B-FR09.md) §2. |
| **C — FR-15** | Admin dùng **1 trang duy nhất, đổi tab bằng state** → không assert được URL | Feature C dùng bù pattern **backend-state (REST)** thay cho pattern URL. Xem [05](05-FEATURE-C-FR15.md) §4. |

---

## 7. Bắt đầu

→ Mở [01-SETUP.md](01-SETUP.md).
