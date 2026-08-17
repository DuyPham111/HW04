# Agent Skills (§7) + Kịch bản quay video demo skill

> **Yêu cầu (§7):** nộp Agent Skill **kèm video demo** cho thấy dùng skill **end-to-end trên một
> feature hoàn chỉnh**. YouTube **Unlisted**. Bảng §15 chấm **10 điểm** cho hạng mục này ⇒ không
> phải "khuyến khích", cứ coi là bắt buộc.
>
> **Kịch bản này dài ~7 phút 20.** Bốn skill, mỗi skill **một cảnh**, làm đúng một công thức ba
> nhịp — **đọc skill gồm những bước nào → gõ prompt gọi nó → mở thành quả ra xem bên trong có gì**.
> Feature dùng xuyên suốt: **C — FR-15 Quản lý Sản phẩm** (feature tìm ra cả 2 bug mới của bài).

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

- [ ] SUT đang chạy (xem [09-VIDEO-TASK2.md](09-VIDEO-TASK2.md) §0.1), rồi `npm run preflight` → 6 dòng `[OK]`
- [ ] Mở sẵn **Claude Code** trong VS Code, tại thư mục `HW04-Automation-Testing`
- [ ] Mở sẵn 5 nhóm tab, **đúng thứ tự sẽ dùng**:
      1. `docs/10-AGENT-SKILLS.md` (file này, mục 1) — cảnh 1 và 6
      2. `.claude/skills/automation-suite/SKILL.md` + `tests/pages/admin-products.page.js` — cảnh 2
      3. `.claude/skills/data-driven-tests/SKILL.md` + `tests/data/feature-c-product-admin.csv` — cảnh 3
      4. `.claude/skills/multi-browser-report/SKILL.md` + `reports/summary.md` — cảnh 4
      5. `.claude/skills/ai-audit-logger/SKILL.md` + `ai-audit/ai-audit-report.md` — cảnh 5
- [ ] Bật mic, tắt thông báo Windows
- [ ] Terminal + VS Code phóng to chữ

> **Skill ghi vào `demo/`, không đụng file thật.** Prompt [3] và [4] đã có sẵn dòng cấm sửa `tests/`
> và `reports/`. Quay xong chạy `Remove-Item -Recurse -Force demo`.

---

## 3. Kịch bản — 6 cảnh

Cảnh 2 đến 5 làm đúng **ba nhịp**: **(a)** mở `SKILL.md` xem bên trong có gì · **(b)** dán prompt ·
**(c)** mở thành quả.

| # | Thời gian | Làm gì | Lời nói |
|---|-----------|--------|---------|
| **1** | 0:00–0:40 | Terminal: **lệnh [1]**.<br>Mở `docs/10-AGENT-SKILLS.md` mục 1, chỉ vào bảng 4 skill. | "Em là **Phạm Vũ Ngọc Duy, MSSV 23127183**. Em xây **bốn Agent Skill** cho HW04. Với từng skill em làm ba việc: **mở file skill ra đọc nó gồm những bước nào**, **gõ prompt gọi nó**, rồi **mở thành quả ra xem bên trong có gì**. Cả bốn skill đều **được dùng thật** trong bài — cột cuối của bảng này là dấu vết của từng cái.<br><br>Vì sao dùng skill mà không dùng một prompt gộp? Vì mỗi skill là một **quy trình có checklist**, nó bắt em dừng lại kiểm ở từng bước. Ba lỗi nặng nhất của bài em đều bị bắt bởi đúng một mục checklist trong skill — em sẽ chỉ đúng mục đó ở cảnh ba." |
| **2** | 0:40–2:25 | **(a)** Mở `automation-suite/SKILL.md`, cuộn qua **6 bước**.<br>**(b)** Dán **prompt [2]**, chạy ~25 giây.<br>**(c)** Mở `tests/pages/admin-products.page.js` — cuộn từ **đầu file** (khối ghi chú) xuống phần locator. | "**Skill 1 — `automation-suite`**, skill chính mà đề mục 7 gọi tên. Nó là quy trình **sáu bước, làm đúng thứ tự**:<br>**Bước 1** — chốt phạm vi và **đọc UI thật**. **Bước 2** — chuyển test case thành **file dữ liệu**, chưa viết script. **Bước 3** — **chọn assertion pattern trước** khi sinh code. **Bước 4** — sinh **page object trước, spec sau**. **Bước 5** — chạy một engine và **phân loại từng Fail** vào đúng một trong năm nhóm. **Bước 6** — chạy đủ ba engine rồi làm **gap analysis**.<br><br>Điểm em muốn nhấn ở **Bước 1**: nó bắt **đối chiếu đặc tả gốc**, không chỉ đọc code. Chính mục checklist đó đã cứu em một lần — em định báo bug *'nút Xóa sản phẩm không hỏi xác nhận'*, nhưng khi đối chiếu đặc tả thì thấy yêu cầu dialog xác nhận nằm ở **mục FR-07 về giỏ hàng**, không phải FR-15. **Báo bug sai đặc tả còn tệ hơn không báo**, nên em bỏ và ghi thành quan sát UX.<br><br>Em gọi Bước 1 cho feature Quản lý sản phẩm.<br><br>**Thành quả — file `admin-products.page.js`.** Đầu file là **khối ghi chú** skill viết ra: trang admin **không có một `id` hay `data-testid` nào**, tab chuyển bằng React state nên **URL không đổi** — nghĩa là feature này **không dùng được assertion pattern URL**, phải bù bằng pattern đọc state thật trong database. Bên dưới là locator neo theo `placeholder` và theo vai trò. Cả file **không có một câu assertion nào** — nó chỉ biết bấm và đọc." |
| **3** | 2:25–4:15 | **(a)** Mở `data-driven-tests/SKILL.md`, cuộn qua 6 bước, **dừng lại ở Bước 4**.<br>**(b)** Dán **prompt [3]**, chạy ~25 giây.<br>**(c)** Mở `demo/feature-c.demo.csv` cạnh `tests/data/feature-c-product-admin.csv`. | "**Skill 2 — `data-driven-tests`.** Đề mục 6 bắt test data nằm ở file riêng. Skill này gồm **sáu bước**: chọn CSV hay JSON · các cột bắt buộc · **token** cho những giá trị mà file phẳng không viết được · **kiểm loader có làm hộ việc của SUT không** · chọn assertion pattern · tự kiểm trước khi commit.<br><br>**Bước 4 là bước em muốn nói kỹ nhất** — và là bước dễ bỏ qua nhất. Nó bắt tự hỏi: *'với mỗi phép biến đổi mà hàm đọc dữ liệu thực hiện, nếu có một test case đang kiểm CHÍNH phép biến đổi đó, thì hàm đọc dữ liệu có làm hộ hệ thống không?'*<br><br>Chính câu hỏi này đã tìm ra một **Pass giả** trong bài em. Test case `FR09-BV-R03` kiểm *hệ thống có tự cắt khoảng trắng thừa trong mã giảm giá không*. Nhưng hàm đọc dữ liệu **cắt sẵn khoảng trắng** trước khi tới tay test — nên test nhận chuỗi đã sạch, được chấp nhận, và **báo xanh**. Công lao trim là của **hàm đọc dữ liệu**, không phải của hệ thống. Test đó **không kiểm được điều nó tuyên bố** mà vẫn Pass. Em sửa bằng cách tắt trim riêng cho JSON.<br><br>**Thành quả — file dữ liệu.** Mỗi test case có **mười bảy trường**. Đáng chú ý: **`tcId`** truy ngược về test case HW02; **`mode`** cho biết kịch bản nào — tạo, sửa, xóa, hay gọi thẳng API; **`expect`** là kỳ vọng **ghi theo đặc tả** chứ không theo hệ thống đang chạy; **`rejectVia`** ghi **cơ chế** chặn là client hay server — nhờ cột này mà bắt được loại Pass giả *'bị từ chối nhưng sai tầng'*; và **`note`** ghi lý do chọn giá trị đó, đây là cột cứu em ở buổi vấn đáp." |
| **4** | 4:15–5:50 | **(a)** Mở `multi-browser-report/SKILL.md`, cuộn qua 6 bước, **dừng ở Bước 5**.<br>**(b)** Dán **prompt [4]** → chạy **lệnh [5]** (~2 phút 45, nói trong lúc chạy).<br>**(c)** Mở `reports/summary.md`, cuộn qua 4 bảng. | "**Skill 3 — `multi-browser-report`.** Gồm **sáu bước**: kiểm hệ thống trước khi chạy · **chạy đủ chín lượt** · **kiểm bằng chứng mã số sinh viên** trên report thật · **tổng hợp số liệu, không đếm tay** · **đọc kết quả cho đúng** · nộp kèm những gì.<br><br>Skill này ghi sẵn **hai cái bẫy** mà em đã tự sa vào. Bẫy thứ nhất: truyền cờ `--reporter` trên dòng lệnh sẽ **ghi đè cả cấu hình reporter**, làm **không file report nào được tạo ra** — em mất một lượt chạy vì đúng lỗi này. Bẫy thứ hai: đọc tên engine từ danh sách project trong file JSON sẽ **luôn ra `chromium`**, vì đó là danh sách **cấu hình** chứ không phải danh sách **đã chạy**.<br><br>**Bước 5 là bước em dùng nhiều nhất:** Fail giống nhau trên cả ba engine là **bug thật**; Fail chỉ một engine thì **phải mở log ra xem, không được đoán**; Pass mà thấy nghi thì nghĩ tới Pass giả. Em gặp đúng ca thứ hai: hai test chỉ Fail trên firefox. Nếu đoán, em đã viết vào báo cáo là *'hệ thống hành xử khác nhau theo browser'* — **sai**. Đọc log thật thì đó là **lỗi hạ tầng của chính Firefox** lúc đóng browser context; chạy lại riêng thì Pass.<br><br>**Thành quả — file tổng hợp.** Bốn bảng: **Tổng** — 53 test case, 9 lượt, 159 lần thực thi, **0 flaky**; **Theo feature**; **Chín lượt chạy** — mỗi dòng một HTML report riêng; và **danh sách test case Fail kèm engine nào Fail** — dùng để viết bug report. Tất cả sinh tự động, em **không gõ tay số nào**." |
| **5** | 5:50–6:55 | **(a)** Mở `ai-audit-logger/SKILL.md`, dừng ở mục **ba trường riêng của HW04** và **bảng bốn nhóm nguyên nhân**.<br>**(b)** Dán **prompt [6]**.<br>**(c)** Mở `ai-audit/ai-audit-report.md`, cuộn qua bảng mục lục rồi một mục chi tiết. | "**Skill 4 — `ai-audit-logger`.** Đề mục 9 bắt nộp AI Audit Report — thiếu là **không điểm cả bài** theo mục 17.<br><br>**Bên trong:** ngoài bốn thông tin đề yêu cầu là tên công cụ, thời gian, **prompt nguyên văn** và kết quả, skill bắt ghi thêm **ba trường riêng cho HW04** — **AI sai hoặc bỏ sót gì**, **vì sao nó bỏ sót**, và **em đã sửa thành gì**. Trường 'vì sao' phải phân loại vào **đúng một trong bốn nhóm**: do chất lượng prompt của em, do giới hạn mô hình, do đặc thù feature, hay do **giả định về môi trường vận hành**.<br><br>Skill còn ghi một ghi chú mà em thấy đúng nhất: nhóm nguy hiểm nhất **không nằm trong bốn nhóm trên**, mà là khoảng cách giữa **ý định đã viết thành lời** và **hành vi thật của code**. Em gặp đúng ca đó: comment ghi rõ *'test case này dùng token hợp lệ, khác nhóm kia'* nhưng code **không hề cài đặt** phân biệt đó. Loại lỗi này **chỉ bắt được bằng cách chạy thật rồi đối chiếu kết quả với ý định** — đọc code không thấy, vì code và comment đọc riêng thì cái nào cũng hợp lý.<br><br>**Thành quả — báo cáo này**, gồm **mười lăm mục** ghi prompt nguyên văn từng lượt, và ba trường riêng đó **chép thẳng sang báo cáo chính**: viết một lần, dùng hai chỗ." |
| **6** | 6:55–7:20 | Mở lại `docs/10-AGENT-SKILLS.md` mục 1. | "Bốn skill, mỗi cái lo một khâu, áp dụng lại **đúng một quy trình** cho cả ba feature. Giá trị lớn nhất không phải AI viết code nhanh hơn — mà là **quy trình bắt em kiểm lại chính mình**. Như Bước 4 của skill dữ liệu nhắc câu hỏi *'loader có làm hộ hệ thống không'*, nhờ đó em tìm ra một test case xanh mà **không kiểm được gì cả**. Không có checklist đó thì em đã tin vào màu xanh. Em cảm ơn thầy/cô đã xem." |

---

## 4. Lệnh & prompt copy-paste sẵn

> **Lưu ý — lệnh terminal phải nằm trọn một dòng.** Đứt dòng là PowerShell chạy vế đầu như một lệnh
> riêng. Copy bằng **nút copy** của trình soạn thảo, đừng bôi đen bằng chuột.

**[1] Xác thực tác giả — cảnh 1**
```powershell
whoami; hostname
```

**[2] Skill 1 — cảnh 2.** Dán vào Claude Code:
```
/automation-suite Làm Bước 1 cho Feature C (FR-15 Quản lý Sản phẩm) của EShop.
Đọc mã nguồn thật: frontend-admin/src/App.jsx (phần activeTab products, handleProductSubmit, deleteProduct)
và backend/server.js các route /api/products.
Cho biết: selector nào dùng được, state của feature nằm ở đâu, URL có đổi khi chuyển tab không,
và đối chiếu với đặc tả FR-15 + FR-12 trong eshop-sut/README.md xem có chỗ nào code không làm đúng đặc tả.
Chỉ phân tích, chưa viết test, không sửa file nào.
```

**[3] Skill 2 — cảnh 3.** Dán vào Claude Code:
```
/data-driven-tests Chuyển test case Feature C (FR-15 Quản lý Sản phẩm) từ HW02 thành file dữ liệu .csv ngoài.
Cột expect ghi theo ĐẶC TẢ FR-15, không theo hành vi hiện tại của SUT.
Chạy Bước 4 của skill: kiểm xem hàm đọc dữ liệu có làm hộ việc của SUT ở chỗ nào không.

QUAN TRỌNG: ghi kết quả ra demo/feature-c.demo.csv.
TUYỆT ĐỐI không sửa hay ghi đè bất kỳ file nào trong tests/ — đang quay video.
```

**[4] Skill 3 — cảnh 4.** Dán vào Claude Code:
```
/multi-browser-report Cho tôi lệnh chạy Feature C trên cả 3 browser engine, mỗi lượt một HTML report riêng.
Report phải hiện "Run by: 23127183" kèm timestamp ISO.
Ghi kết quả vào demo/ để không đè lên 9 report đã nộp kèm báo cáo.
```

**[5] Lệnh mà skill 3 trả về — cảnh 4** (~2 phút 45)
```powershell
$env:REPORTS_ROOT="demo/reports"; node tools/run-all-browsers.mjs c; Remove-Item Env:REPORTS_ROOT
```

**[6] Skill 4 — cảnh 5.** Dán vào Claude Code:
```
/ai-audit-logger Ghi lại phiên làm việc vừa rồi vào AI Audit Report: em đã gọi skill automation-suite,
data-driven-tests và multi-browser-report cho Feature C.
Điền đủ 3 trường riêng của HW04: AI sai hoặc bỏ sót gì, vì sao bỏ sót (phân loại vào 1 trong 4 nhóm),
và em đã sửa thành gì.
```

> **Mẹo — nếu skill chạy lâu:** quay cảnh nó **nhận lệnh và bắt đầu chạy**, tạm dừng ~25 giây, rồi
> mở thành quả ra giải thích. Vẫn trung thực — đó chính là thứ skill tạo ra thật.
>
> **Mẹo cho cảnh 4:** lượt **firefox chậm nhất** (~2 phút 15 trong 2 phút 45). Dùng đúng khoảng đó
> để nói phần "hai cái bẫy" và "Bước 5 đọc kết quả cho đúng" — vừa khít, không phải chờ im lặng.

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
