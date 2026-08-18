# Agent Skills (§7) + Kịch bản quay video demo skill

> **Yêu cầu (§7):** nộp Agent Skill **kèm video demo** cho thấy dùng skill **end-to-end trên một
> feature hoàn chỉnh**. YouTube **Unlisted**. Bảng §15 chấm **10 điểm** cho hạng mục này.
>
> **Kịch bản dài ~7 phút 20.** Bốn skill, mỗi skill **một cảnh**, làm đúng một công thức ba nhịp —
> **đọc skill gồm bước nào → gõ prompt gọi nó → mở thành quả ra xem**. Feature xuyên suốt:
> **C — FR-15 Quản lý Sản phẩm** (feature tìm ra cả 2 bug mới của bài).

> ⚠️ **Đã sửa lỗi `Unknown command: /automation-suite`.** Claude Code **không** đăng ký Agent
> Skill thành slash-command để gõ `/tên-skill` như lệnh có sẵn — gõ vậy sẽ báo lỗi đúng như bạn
> gặp. Cách gọi đúng: viết **câu bình thường có nhắc tên skill** (ví dụ "*Dùng skill
> automation-suite để...*"), Claude tự nhận diện qua mô tả trong `SKILL.md` rồi gọi bằng công cụ
> `Skill` nội bộ — bạn sẽ thấy dòng `Skill(automation-suite)` hiện ra trong hội thoại, **đó chính
> là bằng chứng skill được gọi thật, nhớ quay lại đoạn đó**. Các prompt ở mục 4 bên dưới đã sửa
> theo cách gọi này.
>
> 📋 **Quy ước trong file này:** mọi khối có nhãn **"PROMPT [N]"** là dán **y nguyên** vào Claude
> Code — không diễn giải, không gõ lại theo ý mình.

---

## 1. Bốn skill đã xây — đều được dùng THẬT trong bài

| Skill | Việc | Dấu vết trong bài |
|---|---|---|
| [`automation-suite`](../.claude/skills/automation-suite/SKILL.md) | Quy trình **6 bước** sinh + duyệt script cho một feature (skill chính §7 gọi tên) | 3 spec file + 5 page object |
| [`data-driven-tests`](../.claude/skills/data-driven-tests/SKILL.md) | Chuyển test case → file dữ liệu ngoài + kế hoạch assertion pattern | `tests/data/` (1 `.json` + 2 `.csv`, 53 dòng) |
| [`multi-browser-report`](../.claude/skills/multi-browser-report/SKILL.md) | Chạy 9 lượt, HTML report có `Run by`, đọc khác biệt engine | `reports/html/` × 9 + `summary.md` |
| [`ai-audit-logger`](../.claude/skills/ai-audit-logger/SKILL.md) | Ghi AI Audit Report (§9) + 3 trường riêng của HW04 | `ai-audit/ai-audit-report.md` — 15 mục |

> **Điều kiện để ăn điểm:** skill phải **được dùng thật**, và phải chỉ ra được dấu vết của nó. Skill
> viết đẹp mà không dùng thì TA hỏi một câu là lộ. Cột "Dấu vết" ở trên chính là câu trả lời.

**Vì sao dùng skill thay vì một prompt gộp (§2):** mỗi skill là một **quy trình có checklist**, bắt
người dùng dừng lại kiểm ở từng bước. Ba lỗi nghiêm trọng nhất của bài đều bị bắt bởi đúng một mục
checklist trong skill — ví dụ **Bước 4 của `data-driven-tests`** (*"loader có làm hộ việc của SUT
không?"*) là mục đã phát hiện ra **Pass giả** `FR09-BV-R03`. Một prompt gộp không có chỗ nào để đặt
câu hỏi đó.

---

## 2. Chuẩn bị trước khi bấm REC

- [ ] SUT đang chạy ([09-VIDEO-TASK2.md](09-VIDEO-TASK2.md) §0.1), rồi `npm run preflight` → 6 dòng `[OK]`
- [ ] Mở **Claude Code** trong VS Code, tại thư mục `HW04-Automation-Testing`
- [ ] Mở sẵn 5 nhóm tab, đúng thứ tự sẽ dùng: (1) file này mục 1 — cảnh 1&6 · (2)
      `automation-suite/SKILL.md` + `admin-products.page.js` — cảnh 2 · (3)
      `data-driven-tests/SKILL.md` + `feature-c-product-admin.csv` — cảnh 3 · (4)
      `multi-browser-report/SKILL.md` + `reports/summary.md` — cảnh 4 · (5)
      `ai-audit-logger/SKILL.md` + `ai-audit-report.md` — cảnh 5
- [ ] Bật mic, tắt thông báo Windows, phóng to chữ terminal + VS Code

> **Skill ghi vào `demo/`, không đụng file thật** — prompt [3] và [4] đã có sẵn dòng cấm sửa
> `tests/`/`reports/`. Quay xong chạy `Remove-Item -Recurse -Force demo`.

---

## 3. Kịch bản — 6 cảnh

Cảnh 2–5 làm đúng **ba nhịp**: **(a)** mở `SKILL.md` xem bên trong · **(b)** 📋 dán PROMPT (mục 4)
· **(c)** mở thành quả.

| # | Thời gian | Làm gì | Lời nói |
|---|-----------|--------|---------|
| **1** | 0:00–0:40 | Terminal: lệnh [1].<br>Mở mục 1 file này, chỉ vào bảng 4 skill. | "Em là **Phạm Vũ Ngọc Duy, MSSV 23127183**. Em xây **bốn Agent Skill** cho HW04. Với từng skill em làm ba việc: **mở SKILL.md đọc nó gồm bước nào**, **gõ prompt gọi nó**, rồi **mở thành quả ra xem**. Cả bốn skill đều **dùng thật** — cột cuối bảng này là dấu vết.<br><br>Vì sao dùng skill thay vì một prompt gộp? Vì mỗi skill là **quy trình có checklist**, bắt em dừng lại kiểm từng bước. Ba lỗi nặng nhất bài em đều bị bắt bởi đúng một mục checklist — em sẽ chỉ ra ở cảnh ba." |
| **2** | 0:40–2:25 | **(a)** Mở `automation-suite/SKILL.md`, cuộn qua 6 bước.<br>**(b)** 📋 **PROMPT [2]**, chạy ~25s.<br>**(c)** Mở `admin-products.page.js` từ khối ghi chú đầu file xuống locator. | "**Skill 1 — `automation-suite`**, skill chính đề mục 7 gọi tên. Quy trình **sáu bước đúng thứ tự**: Bước 1 chốt phạm vi và **đọc UI thật**; Bước 2 chuyển test case thành **file dữ liệu**; Bước 3 **chọn assertion pattern trước** khi sinh code; Bước 4 sinh **page object trước, spec sau**; Bước 5 chạy một engine và phân loại Fail; Bước 6 chạy đủ ba engine rồi làm gap analysis.<br><br>Bước 1 bắt **đối chiếu đặc tả gốc**, không chỉ đọc code — mục này cứu em một lần: em định báo bug *'nút Xóa không hỏi xác nhận'*, nhưng đối chiếu đặc tả thì thấy dialog xác nhận thuộc **FR-07 giỏ hàng**, không phải FR-15. Báo sai đặc tả còn tệ hơn không báo, nên em bỏ, ghi lại thành quan sát UX.<br><br>Em gọi Bước 1 cho Quản lý sản phẩm.<br><br>**Thành quả.** Đầu file `admin-products.page.js` là khối ghi chú skill viết: trang admin **không có `id`/`data-testid` nào**, tab chuyển bằng React state nên **URL không đổi** — feature này không dùng được pattern URL, phải bù bằng đọc state thật trong database. Cả file **không một câu assertion** — chỉ bấm và đọc." |
| **3** | 2:25–4:15 | **(a)** Mở `data-driven-tests/SKILL.md`, dừng ở Bước 4.<br>**(b)** 📋 **PROMPT [3]**, chạy ~25s.<br>**(c)** Mở `demo/feature-c.demo.csv` cạnh bản gốc `tests/data/`. | "**Skill 2 — `data-driven-tests`.** Đề mục 6 bắt test data nằm file riêng. Sáu bước: chọn CSV/JSON · cột bắt buộc · token cho giá trị file phẳng không viết được · **kiểm loader có làm hộ việc của SUT không** · chọn assertion pattern · tự kiểm trước commit.<br><br>**Bước 4 là bước em nói kỹ nhất**, cũng dễ bỏ qua nhất: *'phép biến đổi nào hàm đọc dữ liệu làm, nếu có test đang kiểm CHÍNH phép biến đổi đó, thì hàm đọc có làm hộ hệ thống không?'*<br><br>Câu hỏi này tìm ra một **Pass giả** thật: `FR09-BV-R03` kiểm hệ thống có tự cắt khoảng trắng thừa trong mã giảm giá không, nhưng hàm đọc dữ liệu **đã cắt sẵn** trước khi tới tay test — công lao là của hàm đọc, không phải hệ thống. Test **không kiểm được điều nó tuyên bố** mà vẫn Pass. Em sửa bằng cách tắt trim riêng cho JSON.<br><br>**Thành quả.** Mỗi dòng 17 trường: `tcId` truy ngược HW02; `mode` là tạo/sửa/xóa/gọi API; `expect` ghi theo **đặc tả**, không theo hệ thống đang chạy; `rejectVia` ghi cơ chế chặn client hay server — cột bắt được Pass giả 'bị từ chối sai tầng'; `note` ghi lý do chọn giá trị, cứu em ở buổi vấn đáp." |
| **4** | 4:15–5:50 | **(a)** Mở `multi-browser-report/SKILL.md`, dừng ở Bước 5.<br>**(b)** 📋 **PROMPT [4]** → chạy lệnh [5] (~2p45, nói trong lúc chạy).<br>**(c)** Mở `reports/summary.md`, cuộn 4 bảng. | "**Skill 3 — `multi-browser-report`.** Sáu bước: kiểm SUT trước khi chạy · chạy đủ **chín lượt** · kiểm bằng chứng MSSV trên report thật · tổng hợp số liệu **không đếm tay** · **đọc kết quả cho đúng** · nộp kèm những gì.<br><br>Skill ghi sẵn hai bẫy em tự sa vào: cờ `--reporter` trên CLI **ghi đè cả cấu hình reporter**, làm không file report nào được tạo — em mất một lượt vì đúng lỗi này. Và đọc tên engine từ `config.projects` sẽ **luôn ra chromium**, vì đó là danh sách cấu hình chứ không phải đã chạy.<br><br>**Bước 5 dùng nhiều nhất:** Fail giống nhau cả ba engine là bug thật; Fail chỉ một engine **phải mở log xem, không đoán**; Pass mà nghi thì nghĩ tới Pass giả. Em gặp ca thứ hai: hai test chỉ Fail trên firefox. Nếu đoán, em đã viết 'hệ thống hành xử khác theo browser' — sai. Đọc log thật là lỗi hạ tầng của Firefox lúc đóng context; chạy lại riêng thì Pass.<br><br>**Thành quả.** Bốn bảng: Tổng — 53 test case, 9 lượt, 159 lần thực thi, **0 flaky**; theo feature; chín lượt chạy; và danh sách TC Fail kèm engine — dùng viết bug report. Tất cả sinh tự động, không gõ tay số nào." |
| **5** | 5:50–6:55 | **(a)** Mở `ai-audit-logger/SKILL.md`, dừng ở ba trường riêng HW04 + bảng bốn nhóm nguyên nhân.<br>**(b)** 📋 **PROMPT [6]**.<br>**(c)** Mở `ai-audit-report.md`, cuộn mục lục rồi một mục chi tiết. | "**Skill 4 — `ai-audit-logger`.** Đề mục 9 bắt nộp AI Audit Report — thiếu là **0 điểm cả bài** theo mục 17.<br><br>Ngoài bốn trường đề yêu cầu (công cụ, thời gian, **prompt nguyên văn**, kết quả), skill bắt ghi thêm ba trường riêng HW04: AI sai/bỏ sót gì, vì sao (phân vào đúng 1 trong 4 nhóm: chất lượng prompt / giới hạn mô hình / đặc thù feature / giả định môi trường), và đã sửa thành gì.<br><br>Ghi chú đúng nhất trong skill: nhóm nguy hiểm nhất **không nằm trong 4 nhóm trên** — là khoảng cách giữa **ý định viết thành lời** và **hành vi thật của code**. Em gặp đúng ca đó: comment ghi 'TC này dùng token hợp lệ, khác nhóm kia' nhưng code **không hề cài đặt** phân biệt đó — chỉ bắt được bằng chạy thật rồi đối chiếu, đọc code không thấy vì đọc riêng cái nào cũng hợp lý.<br><br>**Thành quả** — báo cáo này, giờ đã 15 mục, ba trường riêng đó **chép thẳng sang báo cáo chính**: viết một lần, dùng hai chỗ." |
| **6** | 6:55–7:20 | Mở lại mục 1 file này. | "Bốn skill, mỗi cái lo một khâu, áp lại **đúng một quy trình** cho cả ba feature. Giá trị lớn nhất không phải AI viết nhanh hơn — mà quy trình **bắt em kiểm lại chính mình**: Bước 4 skill dữ liệu nhắc câu 'loader có làm hộ hệ thống không', nhờ đó tìm ra một test xanh mà không kiểm được gì cả. Không có checklist đó em đã tin vào màu xanh. Em cảm ơn thầy/cô đã xem." |

---

## 4. Lệnh & prompt copy-paste sẵn

> **Lệnh terminal phải nằm trọn một dòng** — đứt dòng là PowerShell chạy vế đầu như lệnh riêng.
> Copy bằng nút copy của trình soạn thảo, đừng bôi đen bằng chuột.
>
> **Prompt gọi skill KHÔNG bắt đầu bằng `/`** — chỉ nhắc tên skill trong câu bình thường (xem cảnh
> báo đầu file). Cả 4 prompt dưới đây đã sửa theo cách này.

**[1] Xác thực tác giả — cảnh 1**
```powershell
whoami; hostname
```

📋 **PROMPT [2] — Skill 1, cảnh 2.** Dán vào Claude Code:
```
Dùng skill automation-suite (đọc .claude/skills/automation-suite/SKILL.md trước khi làm) để thực
hiện Bước 1 cho Feature C (FR-15 Quản lý Sản phẩm) của EShop.
Đọc mã nguồn thật: frontend-admin/src/App.jsx (phần activeTab products, handleProductSubmit, deleteProduct)
và backend/server.js các route /api/products.
Cho biết: selector nào dùng được, state của feature nằm ở đâu, URL có đổi khi chuyển tab không,
và đối chiếu với đặc tả FR-15 + FR-12 trong eshop-sut/README.md xem có chỗ nào code không làm đúng đặc tả.
Chỉ phân tích, chưa viết test, không sửa file nào.
```

📋 **PROMPT [3] — Skill 2, cảnh 3.** Dán vào Claude Code:
```
Dùng skill data-driven-tests (đọc .claude/skills/data-driven-tests/SKILL.md trước khi làm) để
chuyển test case Feature C (FR-15 Quản lý Sản phẩm) từ HW02 thành file dữ liệu .csv ngoài.
Cột expect ghi theo ĐẶC TẢ FR-15, không theo hành vi hiện tại của SUT.
Chạy Bước 4 của skill: kiểm xem hàm đọc dữ liệu có làm hộ việc của SUT ở chỗ nào không.

QUAN TRỌNG: ghi kết quả ra demo/feature-c.demo.csv.
TUYỆT ĐỐI không sửa hay ghi đè bất kỳ file nào trong tests/ — đang quay video.
```

📋 **PROMPT [4] — Skill 3, cảnh 4.** Dán vào Claude Code:
```
Dùng skill multi-browser-report (đọc .claude/skills/multi-browser-report/SKILL.md trước khi làm).
Cho tôi lệnh chạy Feature C trên cả 3 browser engine, mỗi lượt một HTML report riêng.
Report phải hiện "Run by: 23127183" kèm timestamp ISO.
Ghi kết quả vào demo/ để không đè lên 9 report đã nộp kèm báo cáo.
```

**[5] Lệnh mà skill 3 trả về — cảnh 4** (~2 phút 45)
```powershell
$env:REPORTS_ROOT="demo/reports"; node tools/run-all-browsers.mjs c; Remove-Item Env:REPORTS_ROOT
```

📋 **PROMPT [6] — Skill 4, cảnh 5.** Dán vào Claude Code:
```
Dùng skill ai-audit-logger (đọc .claude/skills/ai-audit-logger/SKILL.md trước khi làm) để ghi lại
phiên làm việc vừa rồi vào AI Audit Report: em đã gọi skill automation-suite, data-driven-tests
và multi-browser-report cho Feature C.
Điền đủ 3 trường riêng của HW04: AI sai hoặc bỏ sót gì, vì sao bỏ sót (phân loại vào 1 trong 4 nhóm),
và em đã sửa thành gì.
```

> **Nếu skill chạy lâu:** quay cảnh nó nhận lệnh và bắt đầu chạy, tạm dừng ~25 giây, rồi mở thành
> quả ra giải thích — vẫn trung thực, vì đó chính là thứ skill tạo ra thật.
>
> **Cảnh 4:** lượt firefox chậm nhất (~2 phút 15 trong 2 phút 45) — dùng đúng khoảng đó để nói
> phần "hai cái bẫy" và "Bước 5 đọc kết quả cho đúng", vừa khít, không phải chờ im lặng.

---

## 5. Sau khi quay

```powershell
Remove-Item -Recurse -Force demo -ErrorAction SilentlyContinue
git status --short
```

`git status` phải **RỖNG** — không file thật nào bị đụng.

1. Upload YouTube → **Unlisted**, kiểm bằng cửa sổ ẩn danh.
2. Dán link vào `README.md` (dòng "Video demo Agent Skill") và `report/main-report.md` §0.
3. Xuất lại PDF → commit → push.

**Tiêu đề video:**
```
23127183 - HW04 Automation Testing - Agent Skill: 4 skill dùng end-to-end cho Feature C (FR-15)
```

**Mô tả video:**
```
HW04 - Agent Skills (§7)
Sinh viên: Phạm Vũ Ngọc Duy - MSSV 23127183
Repo: https://github.com/DuyPham111/HW04

4 Agent Skill, mỗi skill 1 cảnh theo 3 nhịp: đọc SKILL.md → gọi prompt → mở thành quả.
Feature end-to-end: C - FR-15 Quản lý Sản phẩm.

0:00 Giới thiệu 4 skill + vì sao dùng skill thay vì prompt gộp
0:40 Skill 1 - automation-suite (quy trình 6 bước)
2:25 Skill 2 - data-driven-tests (Bước 4 tìm ra Pass giả)
4:15 Skill 3 - multi-browser-report (2 cái bẫy + đọc kết quả 3 engine)
5:50 Skill 4 - ai-audit-logger (3 trường riêng HW04)
6:55 Kết luận
```

---

## 6. Checklist đối chiếu §7

- [ ] Đủ **4 skill** trong `.claude/skills/`, mỗi cái có `SKILL.md` với frontmatter `name` + `description`
- [ ] Mỗi skill có **cảnh riêng** đủ 3 nhịp: mở `SKILL.md` → gõ prompt → mở thành quả
- [ ] Có cảnh **gọi skill thật** trong Claude Code, không chỉ nói suông
- [ ] Đi **end-to-end trên một feature hoàn chỉnh** (Feature C)
- [ ] Có nói rõ **vì sao dùng skill hơn là một prompt gộp** (§2) — cảnh 1
- [ ] Mỗi skill chỉ ra được **dấu vết đã dùng thật** trong bài (bảng mục 1)
- [ ] Skill ghi vào `demo/`, **không** đụng `tests/` — kiểm bằng `git status`
- [ ] Chế độ **Unlisted**

---

→ Tiếp: [11-AI-AUDIT-CRITIQUE.md](11-AI-AUDIT-CRITIQUE.md)
