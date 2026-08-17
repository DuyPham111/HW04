# Kịch bản quay video Task 2 — HW04 Automation Testing

> **Yêu cầu của đề (Task 2):** video YouTube **unlisted**, **≥5 phút**, thuyết minh **tiếng Việt**,
> demo **một** script automation chạy **end-to-end** (gồm cả **lần chạy multi-browser** và **HTML
> report sinh ra**). Phải **kể ít nhất một chỗ đã sửa** script do AI sinh. Bằng chứng tác giả:
> face-cam **hoặc** terminal chạy `whoami` và `hostname` (§11).
>
> **Kịch bản này dài ~9 phút 40** — dư an toàn so với mốc 5 phút, phòng khi nói nhanh hơn dự tính.
> Feature dùng để demo: **C — FR-15 Quản lý Sản phẩm** (chạy nhanh nhất và chứa **bug Critical mới**).

---

## Bố cục thư mục — lệnh nào chạy ở đâu

```
D:\Nam3\HK3\Kiểm thử phần mềm\HW04\
├── tham_khao\eshop-sut-main\          ← SUT. Chạy node database.js / node server.js ở ĐÂY
│   ├── backend\          :3000
│   ├── frontend-web\     :5173
│   └── frontend-admin\   :5174
└── HW04-Automation-Testing\           ← REPO BÀI LÀM. Chạy npm / npx / node tools / git ở ĐÂY
    ├── tests\  tools\  docs\  reports\  demo\
    └── package.json
```

| Lệnh | Phải đứng ở |
|---|---|
| `node database.js` · `node server.js` | `…\tham_khao\eshop-sut-main\backend` |
| `npm run dev` | `…\frontend-web` và `…\frontend-admin` (mỗi cái một cửa sổ) |
| `npm run preflight` · `npx playwright …` · `node tools\…` · `git …` | `…\HW04\HW04-Automation-Testing` |

> Đừng dùng `cd ..` để nhảy qua lại — nó phụ thuộc vào chỗ đang đứng. Dùng đường dẫn đầy đủ như
> trong mục 2 thì đứng ở đâu chạy cũng đúng.

---

## 0. Chuẩn bị trước khi bấm REC

### 0.1 Khởi động SUT — 3 cửa sổ PowerShell, để nguyên suốt lúc quay

```powershell
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04\tham_khao\eshop-sut-main\backend"; node database.js; node server.js
```
```powershell
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04\tham_khao\eshop-sut-main\frontend-web"; npm run dev
```
```powershell
cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04\tham_khao\eshop-sut-main\frontend-admin"; npm run dev
```

> `node database.js` **reset DB về seed gốc** — chạy nó trước khi quay để số liệu trong video khớp
> với báo cáo, không bị nhiễu bởi dữ liệu các lần chạy trước.

### 0.2 Checklist

- [ ] Cửa sổ thứ 4 (cửa sổ sẽ quay): `cd "D:\Nam3\HK3\Kiểm thử phần mềm\HW04\HW04-Automation-Testing"`
- [ ] `npm run preflight` → phải thấy **cả 6 dòng `[OK]`**
- [ ] Mở sẵn tab trong VS Code, **đúng thứ tự sẽ dùng ở cảnh 2 và 7**:
      1. `tests/data/feature-c-product-admin.csv` — lớp "kiểm cái gì"
      2. `tests/pages/admin-products.page.js` — lớp "thao tác thế nào"
      3. `tests/feature-c-product-admin.spec.js` — lớp "kịch bản + phán xử"
      4. `tests/utils/data-loader.js` — cuộn sẵn tới hàm `resolveToken`, dùng ở **cảnh 7**
      5. `report/main-report.md` — cuộn sẵn tới **§3.3**, dùng ở **cảnh 7**
- [ ] Mở sẵn tab trình duyệt: GitHub Issue [#1](https://github.com/DuyPham111/HW04/issues/1)
- [ ] Terminal **phóng to chữ** (`Ctrl` + `+` vài lần) để người xem đọc được
- [ ] Quay: **OBS Studio** hoặc `Win + G`. **Bật mic**, nói chậm và rõ
- [ ] Tắt thông báo Windows (Focus assist) — tránh popup nhảy vào giữa video

> **Không lo hỏng bằng chứng thật.** Lệnh multi-browser ở **cảnh 5** đặt
> `$env:REPORTS_ROOT="demo/reports"`, nên nó ghi vào **`demo/`** chứ không đụng `reports/` — nơi
> chứa 9 HTML report đã nộp kèm báo cáo. Lệnh chạy test lẻ ở **cảnh 4** cũng mặc định ghi vào
> `demo/` theo cấu hình. Quay xong chỉ cần `Remove-Item -Recurse -Force demo`.

---

## 1. Kịch bản chi tiết (đọc cột "Lời nói" gần như nguyên văn)

| # | Thời gian | Màn hình / Thao tác | Lời nói |
|---|-----------|---------------------|---------|
| **1** | 0:00–0:45 | Terminal: **lệnh [1]**. Để kết quả hiện vài giây, đọc to tên máy. | "Xin chào thầy/cô. Em là **Phạm Vũ Ngọc Duy, MSSV 23127183**. Đây là terminal trên máy em, em chạy `whoami` và `hostname` để xác thực tác giả theo mục 11 của đề. Video này em demo bộ automation test HW04 cho hệ thống EShop — chạy thật trên ba browser engine và mở HTML report sinh ra từ chính lần chạy đó. Bài của em automation ba feature lấy lại từ HW02: **FR-02 đăng nhập và khóa tài khoản, FR-09 mã giảm giá, và FR-15 quản lý sản phẩm** — tổng **năm mươi ba test case**." |
| **2** | 0:45–2:10 | Mở lần lượt 3 file, mỗi file cuộn nhanh ~25 giây:<br>**(a)** `tests/data/feature-c-product-admin.csv`<br>**(b)** `tests/pages/admin-products.page.js`<br>**(c)** `tests/feature-c-product-admin.spec.js` | "Bộ test của em chia làm **ba lớp, mỗi lớp một nhiệm vụ**.<br><br>**File CSV** này trả lời câu hỏi **kiểm cái gì** — mỗi dòng là một test case. Cột `tcId` truy ngược về đúng test case của HW02. Cột `expect` là **kỳ vọng theo đặc tả**, không phải theo hệ thống đang chạy — đây là điểm quan trọng nhất, em sẽ nói lại ở cảnh sau. Mười chín test case cho feature Quản lý sản phẩm, tất cả nằm ở đây.<br><br>**File page object** trả lời **thao tác thế nào** — toàn bộ locator nằm trong file này: ô Tên sản phẩm ở đâu, ô Giá ở đâu, nút Sửa và Xóa của một dòng bảng thì tìm thế nào. Đầu file là khối ghi chú về sự thật DOM: trang admin **không có một thuộc tính `id` hay `data-testid` nào**, nên em neo theo `placeholder` và theo vai trò của phần tử. File này chỉ biết bấm và đọc, **không phán xử đúng sai**.<br><br>**File spec** là **kịch bản chạy test** — nó đọc dữ liệu từ file CSV, sai page object đi thao tác, rồi **so kết quả thật với kỳ vọng để kết luận Pass hay Fail**. Cái hay là spec **không chứa một dữ liệu nào**: mười chín dòng CSV tự động thành mười chín test case. Muốn thêm test case thì **thêm một dòng vào file CSV, không đụng vào code**." |
| **3** | 2:10–2:50 | Terminal: **lệnh [2]**. Chỉ vào kết quả rỗng, rồi vào dòng `exit=1`. | "Đề mục 6 bắt buộc test data phải nằm ở file riêng, **không được hard-code trong script** — nếu không thì phần đó bị loại thẳng. Em chứng minh bằng lệnh này: tìm mọi email, mật khẩu, mã giảm giá trong tất cả file spec. **Không ra dòng nào**, `findstr` trả về mã lỗi 1 nghĩa là không tìm thấy gì. Toàn bộ dữ liệu đều ở ngoài file script." |
| **4** | 2:50–3:55 | Terminal: **lệnh [3]**. Đợi chạy ~5 giây. Chỉ vào dòng `Error:` và dòng `Received: 200`. | "Chạy thử **một** test case để thấy tác dụng thật của bộ test. Test case `FR15-SEC-01` kiểm đúng điều đặc tả **FR-12** nói: *tất cả các API có tính ảnh hưởng dữ liệu, gồm cả POST, PUT, DELETE trên `/api/products`, đều phải yêu cầu token JWT hợp lệ và quyền admin*.<br><br>Kết quả **Fail**. Thông báo ghi rõ: đặc tả đòi trả về bốn-lẻ-một hoặc bốn-lẻ-ba, nhưng **thực tế server trả về hai trăm** — nghĩa là **thành công**. Em gửi một request tạo sản phẩm **hoàn toàn không kèm token**, và hệ thống vẫn tạo sản phẩm.<br><br>Đây là **bug mới, mức Critical**, và là phát hiện quan trọng nhất của cả bài. Điều đáng nói: ở HW02 em **đã nghi ngờ** lỗi này khi đọc mã nguồn, nhưng lúc đó em ghi vào báo cáo là *không test được từ giao diện* — vì trang admin đã chặn người dùng thường ngay tại màn đăng nhập, không cách nào chạm tới API. Automation gọi thẳng API thì **bỏ qua hoàn toàn rào cản giao diện đó**." |
| **5** | 3:55–6:40 | Terminal: **lệnh [4]**. Vừa chạy vừa nói (~2 phút 45). Chỉ vào từng lượt khi nó bắt đầu. | "Đây là phần đề yêu cầu: chạy **multi-browser**. Mỗi feature phải chạy trên cả ba browser engine, tối thiểu **chín lượt** cho ba feature, và **mỗi lượt phải sinh một HTML report riêng**. Em đang chạy feature Quản lý sản phẩm lần lượt trên **chromium, firefox và webkit**.<br><br>Vì sao phải là chín lệnh riêng chứ không phải một lệnh gộp? Hai lý do. Thứ nhất, đề đòi mỗi lượt một report — một lệnh gộp chỉ ra một report. Thứ hai là lý do kỹ thuật: Playwright **xóa sạch thư mục output ở đầu mỗi lần chạy**, nên nếu chín lượt dùng chung một thư mục thì ảnh chụp lỗi của tám lượt đầu bị mất — mà bug report cần **đúng ảnh của lượt sinh ra bug đó**.<br><br>Tác dụng của việc chạy ba engine: nếu cùng một test Fail **giống nhau trên cả ba** thì đó là **bug logic thật của hệ thống**; còn nếu **chỉ Fail trên một engine** thì phải mở log ra điều tra — có thể hệ thống hành xử khác nhau theo browser, có thể **script của em có vấn đề**, mà cũng có thể là lỗi hạ tầng của chính browser đó. Em gặp đúng trường hợp thứ ba và sẽ nói ở cảnh cuối.<br><br>Em cho report của lần chạy này ghi vào thư mục `demo`, để **không đè lên chín report đã nộp kèm báo cáo** — chúng phải giữ nguyên đúng timestamp đã ghi trong bài." |
| **6** | 6:40–7:45 | Terminal: **lệnh [5]**.<br>Trên report chỉ lần lượt: **(a)** dải chân trang, **(b)** thanh tab trình duyệt, **(c)** mở khối **Metadata**, **(d)** mở test `FR15-SEC-01` → chỉ khối **Annotations** rồi cuộn xuống **Screenshots**. | "Và đây là HTML report sinh ra từ chính lần chạy vừa rồi. Đề mục 6 và mục 11 đòi report phải **hiển thị thấy được** dòng `Run by` kèm mã số sinh viên và timestamp. Em đưa nó vào **ba chỗ độc lập**.<br><br>Thứ nhất: **dải cố định ở chân trang** — `Run by: 23127183`, timestamp chuẩn ISO, tên engine, và số liệu của lượt này. Mọi con số trong dải này **đọc từ file JSON kết quả của chính lượt đó**, script chỉ trình bày lại chứ không tạo ra kết quả nào.<br><br>Thứ hai: **thẻ tiêu đề trên thanh tab** trình duyệt cũng mang mã số sinh viên.<br><br>Thứ ba: **annotation trong từng test case**. Em mở test `FR15-SEC-01` — thấy ngay `Run by`, mã test case, kỹ thuật kiểm thử, điều khoản đặc tả bị vi phạm, **mức độ nghiêm trọng Critical**, và mã HTTP thật server trả về là hai trăm. Cuộn xuống dưới là **ảnh Playwright tự chụp lúc test Fail** — thấy rõ sản phẩm vừa bị tạo trái phép nằm trong danh sách JSON thật của API." |
| **7** | 7:45–9:10 | **(a)** Mở `report/main-report.md` §3.3, cuộn chậm.<br>**(b)** Mở `tests/utils/data-loader.js`, chỉ vào hàm `resolveToken` và tham số `trim`.<br>**(c)** Mở `tests/data/feature-b-coupon.json`, tìm `FR09-BV-R03`. | "Phần này là chỗ em muốn nói kỹ nhất — **một chỗ em đã sửa script do AI sinh ra**. Và nó không phải lỗi Fail, mà là lỗi **Pass**.<br><br>Test case `FR09-BV-R03` của feature Mã giảm giá kiểm một việc: **hệ thống có tự cắt khoảng trắng thừa trong mã giảm giá không**. Dữ liệu em đưa vào là chuỗi `SAVE10` có **hai khoảng trắng ở mỗi đầu**.<br><br>AI viết hàm đọc dữ liệu có gọi `trim` trên **mọi** giá trị. Với file CSV thì điều đó hợp lý — khoảng trắng quanh ô là nhiễu định dạng. **Nhưng test case này lại đang kiểm chính việc trim đó.** Chuỗi bị **hàm đọc dữ liệu cắt sạch trước khi tới tay test**. Test nhận vào `SAVE10` đã sạch, gửi lên, được chấp nhận, và **báo xanh**.<br><br>Đây mới là chỗ nguy hiểm: **công lao trim là của hàm đọc dữ liệu, không phải của hệ thống được kiểm thử**. Test case đó **không hề kiểm được điều nó tuyên bố**, mà vẫn Pass. Nếu em tin vào màu xanh thì đã kết luận sai là hệ thống xử lý đúng.<br><br>Em phát hiện ra không phải bằng cách chạy test — vì test vẫn xanh — mà bằng cách **đọc lại đường đi của dữ liệu** khi soạn file JSON: nhận ra có một hàm nằm giữa file dữ liệu và test.<br><br>Em sửa bằng cách cho phép **tắt phép biến đổi theo ngữ cảnh**: CSV vẫn trim, còn **JSON thì không** — vì khoảng trắng trong JSON là do người viết đặt vào **cố ý**. Sau khi sửa, chuỗi vào test dài đúng **mười ký tự** thay vì sáu. Test vẫn Pass, nhưng **giờ Pass vì lý do đúng**: client của hệ thống thật sự có gọi `trim` trước khi gửi.<br><br>Bài học em rút ra: **một test xanh chưa chứng minh được gì cho tới khi biết nó xanh vì lý do gì**. Và loại Pass giả khó thấy nhất là khi **chính hạ tầng test đã âm thầm làm hộ việc mà hệ thống đáng lẽ phải làm**." |
| **8** | 9:10–9:40 | **(a)** Mở `reports/summary.md`, chỉ bảng tổng và mục cuối.<br>**(b)** Chuyển sang tab GitHub Issue #1. | "Tổng kết bằng số liệu. File này **sinh tự động** từ chín file JSON kết quả, em **không đếm tay** một con số nào: năm mươi ba test case, chín lượt browser, một trăm năm mươi chín lần thực thi, **không có test flaky nào**. Tám mươi ba lần Fail, nhưng quy về chỉ **hai mươi chín test case** và **mười sáu lỗi** — vì một lỗi gây nhiều lần Fail, đọc số Fail như đếm bug là sai gần sáu lần.<br><br>Trong mười sáu lỗi đó có **hai lỗi mới** mà HW02 chưa ghi, và **mười bốn lỗi cũ được automation tái lập lại được**, không sót cái nào.<br><br>Còn hai test case chỉ Fail riêng trên firefox — em đã mở log ra đọc thì đó là **lỗi hạ tầng của chính Firefox** lúc đóng browser context, chạy lại riêng thì Pass. Em xếp nó vào *hạn chế môi trường*, **không báo là bug** — vì báo bug sai còn tệ hơn không báo.<br><br>Và đây là bug Critical em đã báo lên GitHub Issue, có đủ các bước tái lập, dòng mã nguồn nghi vấn, và ảnh bằng chứng. Em cảm ơn thầy/cô đã xem." |

---

## 2. Lệnh copy-paste sẵn (dán vào PowerShell khi quay)

> **Lưu ý — mỗi lệnh phải nằm TRỌN MỘT DÒNG khi dán.** Nếu bị đứt dòng, PowerShell chạy vế đầu như
> một lệnh riêng — `npx playwright test` đứng một mình nghĩa là **chạy sạch 159 lần thực thi của cả
> ba feature**, mất khoảng 15 phút. Copy bằng **nút copy** của trình soạn thảo, đừng bôi đen bằng
> chuột.
>
> Lỡ chạy nhầm thì `Ctrl + C`. Bằng chứng trong `reports/` **không hề hấn gì** — mọi lệnh chạy lẻ
> đều được cấu hình ghi vào `demo/`.

**[1] Xác thực tác giả (§11) — cảnh 1**
```powershell
whoami; hostname; Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
```

**[2] Chứng minh không hard-code test data (§6) — cảnh 3**
```powershell
findstr /S /I /N "eshop.com SAVE10 BIGBUY VIP100 Test1234 Admin123" tests\*.spec.js; "exit=$LASTEXITCODE"
```

**[3] Một test đơn lẻ — bug Critical FR-12 (~5 giây) — cảnh 4**
```powershell
npx playwright test tests/feature-c-product-admin.spec.js -g "FR15-SEC-01" --project=chromium
```

**[4] Multi-browser: 1 feature × 3 engine (~2 phút 45) — cảnh 5**
```powershell
$env:REPORTS_ROOT="demo/reports"; node tools/run-all-browsers.mjs c; Remove-Item Env:REPORTS_ROOT
```

**[5] Mở HTML report vừa sinh — cảnh 6**
```powershell
npx playwright show-report demo/reports/html/c-chromium
```

> **Mẹo cho cảnh 5:** lượt **firefox chậm nhất** (~2 phút 15 trong 2 phút 45 tổng). Dùng đúng
> khoảng đó để nói phần "vì sao chín lệnh riêng" và "cách đọc kết quả ba engine" — vừa khít thời
> gian, không phải chờ im lặng.

---

## 3. Sau khi quay

```powershell
Remove-Item -Recurse -Force demo -ErrorAction SilentlyContinue
git status --short
```

`git status` phải **RỖNG** — không bằng chứng thật nào bị đụng.

1. Upload YouTube → đặt **Unlisted (Không công khai)**, **không phải Private**.
2. **Kiểm bằng cửa sổ ẩn danh** (chưa đăng nhập) xem link có mở được không.
3. Dán link vào:
   - `README.md` (dòng "Video demo Task 2")
   - `report/main-report.md` — dòng **"Video demo Task 2"** ở đầu file
4. Xuất lại PDF → commit → push.

**Tiêu đề video:**
```
23127183 - HW04 Automation Testing - Task 2: 53 test case, 9 lượt multi-browser, 2 bug mới
```

**Mô tả video (dán vào phần Description):**
```
HW04 - Automation Testing on EShop
Sinh viên: Phạm Vũ Ngọc Duy - MSSV 23127183
Repo: https://github.com/DuyPham111/HW04

3 feature: FR-02 Đăng nhập & Khóa tài khoản · FR-09 Mã giảm giá · FR-15 Quản lý Sản phẩm
53 test case · 9 lượt browser (chromium/firefox/webkit) · 0 flaky · 16 defect (2 bug mới)

Mốc thời gian:
0:00 Xác thực tác giả (whoami / hostname)
0:45 Kiến trúc 3 lớp: file dữ liệu - page object - spec
2:10 Chứng minh không hard-code test data
2:50 Chạy 1 test case: bug Critical FR-12 (broken access control)
3:55 Chạy multi-browser 3 engine
6:40 HTML report: Run by 23127183 ở 3 chỗ
7:45 Một chỗ đã sửa script AI sinh: Pass giả FR09-BV-R03
9:10 Tổng kết số liệu + GitHub Issue
```

---

## 4. Checklist đối chiếu đề trước khi upload

- [ ] Video **≥5 phút** (kịch bản này ~9:40)
- [ ] Thuyết minh **tiếng Việt**, **giọng của chính mình** (§11 cấm giọng AI)
- [ ] Có **`whoami`** và **`hostname`** hiện rõ trên màn hình (hoặc face-cam)
- [ ] Có cảnh **chạy một script end-to-end** thật (cảnh 4)
- [ ] Có cảnh **chạy multi-browser** thật, không phải ảnh tĩnh (cảnh 5)
- [ ] Có mở **HTML report sinh ra từ chính lần chạy đó**, thấy rõ `Run by: 23127183` (cảnh 6)
- [ ] Có **kể ít nhất một chỗ đã sửa** script AI — cảnh 7, Pass giả `FR09-BV-R03`
- [ ] Chế độ **Unlisted**, đã kiểm bằng cửa sổ ẩn danh
- [ ] `git status` rỗng sau khi dọn `demo/`

---

## 5. Nếu bị hỏi thêm ở buổi vấn đáp (§13)

Ba câu dễ bị hỏi nhất về video này, và câu trả lời ngắn:

| Câu hỏi | Trả lời |
|---|---|
| *"Vì sao suite Fail tới 83 lần? Script sai à?"* | Kỳ vọng điền theo **đặc tả**, không theo hành vi hiện tại của SUT. SUT có bug cố ý ⇒ Fail = SUT lệch đặc tả. Nếu điền theo hành vi thật thì Pass 100% và **không phát hiện được bug nào**. |
| *"Sao biết bug FR-12 là mới, không phải HW02 đã tìm?"* | HW02 `Main_Report.md` dòng 468 ghi rõ đã **nghi ngờ** khi đọc code nhưng *"KHÔNG test được từ UI → không tạo TC"*. HW04 là lần đầu **thực sự gọi API để xác nhận**. |
| *"2 test Fail riêng trên firefox — sao không sửa?"* | Đã điều tra bằng log thật: lỗi `browserContext.close` là **hạ tầng Firefox**, assertion nghiệp vụ đã Pass xong trước đó. Chạy riêng 2 TC trên firefox thì Pass. Sửa ở tầng script không giải quyết được nguyên nhân. |

---

→ Tiếp: [10-AGENT-SKILLS.md](10-AGENT-SKILLS.md)
