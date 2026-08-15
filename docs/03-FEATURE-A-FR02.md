# 03 — Feature A: FR-02 Đăng nhập & Khóa tài khoản (25đ)

> Mục tiêu: **≥12 test case** automation (đề xuất 16), dữ liệu ở `tests/data/feature-a-login.csv`, dùng 5 assertion pattern, chạy được trên 3 engine.
> Đây là feature **khó nhất** trong ba cái — làm nó đầu tiên, hai feature sau sẽ nhẹ.

---

## 1. Bước 1 — Đọc UI thật trước khi sinh script

**Không được bỏ bước này.** Sinh script từ trí tưởng tượng của AI về "trang login điển hình" là nguồn gốc của mọi selector gãy.

### Prompt

> Đọc file `D:\Nam3\HK3\Kiểm thử phần mềm\HW02-new\eshop-sut-main\frontend-web\src\pages\Login.jsx` và `src\context\AuthContext.jsx`, cùng handler `POST /api/login` trong `backend\server.js`. Liệt kê cho tôi, **chưa viết test nào**:
> 1. Mọi input/button/label kèm thuộc tính có thể dùng làm selector (`id`, `name`, `data-testid`, `aria-label`, `<label for>`). Nếu không có gì cả thì đề xuất neo theo cái gì và giải thích vì sao selector đó bền hơn.
> 2. Thông báo lỗi được render ở đâu trong DOM, class gì, nằm trên hay dưới nút submit.
> 3. Điều hướng sau khi đăng nhập thành công.
> 4. Bộ đếm khóa và thời gian khóa nằm ở đâu (biến, bảng, cột), reset khi nào.
> 5. Backend trả status code nào cho: email không tồn tại, sai mật khẩu, tài khoản đang khóa.

### Kết quả bạn phải đối chiếu (đã kiểm ở HW02 — nếu AI trả khác, AI sai)

| Thứ | Sự thật trong code |
|---|---|
| Tiêu đề trang `/login` | `<h2>` ghi **"Đăng Ký"** ← sai, bug B012 |
| Ô email | `<label>Username</label>` + `<input type="text" required>` ← `type` sai spec R5, bug B005 |
| Ô mật khẩu | `<label>Mật khẩu</label>` + `<input type="text" required>` ← **không che ký tự**, bug B004 |
| Nút submit | `<button type="submit">Sign In</button>` |
| Banner lỗi | `<div class="bg-red-100 text-red-700 …">`, render **sau** form → nằm **dưới** nút submit |
| Không có | `id`, `name`, `data-testid`, `aria-label`, `<label for>`, `role="alert"` |
| Thành công | `navigate('/')` |
| Backend | 401 `Invalid email or password` (email lạ **và** sai mật khẩu — cùng một câu) · 403 `Tài khoản đã bị khóa…` khi đang khóa |
| Bộ đếm | `login_attempts = login_attempts + 2` mỗi lần sai (spec nói +1) · khóa khi `>= 3` · `locked_until = now + 180000ms` (spec nói 30s) |
| UI nuốt lỗi | `catch` trong `Login.jsx` hiển thị **một câu duy nhất** `"Đăng nhập thất bại. Vui lòng kiểm tra lại."` cho mọi lỗi → 401 và 403 nhìn **y hệt nhau** trên UI |

> **Kết luận thiết kế quan trọng nhất của feature này:** vì UI nuốt hết sự khác biệt, assertion trên DOM một mình **không thể** phân biệt "sai mật khẩu" với "đang bị khóa". Bạn **bắt buộc** phải dùng pattern P5 (HTTP status) và P3 (đọc `login_attempts`/`locked_until` qua `GET /api/admin/users`). Câu này là lập luận trung tâm khi bạn giải thích lựa chọn assertion trong `report/main-report.md`.

---

## 2. Bước 2 — Chốt danh sách test case (map từ HW02)

16 TC dưới đây lấy nguyên từ HW02, đủ 3 loại positive / negative / edge:

| # | tcId (HW02) | mode | Kịch bản | expect (theo SPEC) | Pattern quyết định | Dự đoán |
|---|---|---|---|---|---|---|
| 1 | FR02-DT-01 | `login` | `test@eshop.com` / `Test1234!` | accept | P2 URL `/` + P3 `login_attempts=0` | Pass |
| 2 | FR02-DT-02 | `login` | `ghost@eshop.com` / đúng-định-dạng | reject, 401, câu chung | P5 status 401 | Pass |
| 3 | FR02-DT-03 | `login` | email `abc-khong-phai-email` | reject **via client** (spec R5: `type="email"`) | P5 `called === false` | **Fail → B005** |
| 4 | FR02-DT-04 | `login` | email rỗng | reject via client (HTML5 `required`) | P5 `called === false` | Pass |
| 5 | FR02-DT-06 | `login` | mật khẩu rỗng | reject via client | P5 `called === false` | Pass |
| 6 | FR02-DT-09 | `ui-check` | ô mật khẩu phải là `type="password"` | — | P1 DOM | **Fail → B004** |
| 7 | FR02-DT-10 | `ui-check` | tiêu đề "Đăng Nhập", nhãn "Email", nút "Đăng Nhập" | — | P1 DOM | **Fail → B012** |
| 8 | FR02-BV-01 | `lockout` | user mới, sai **1** lần | `login_attempts === 1` (spec R1) | P3 backend state | **Fail → B001** (thật: 2) |
| 9 | FR02-BV-02 | `lockout` | user mới, sai **2** lần | `login_attempts === 2`, chưa khóa | P3 + P5 401 | **Fail → B001** (thật: 4, đã khóa) |
| 10 | FR02-BV-03 | `lockout` | user mới, sai **3** lần | vẫn 401 ở lần 3 (khóa chỉ mới được SET, enforce từ lần 4) | P5 status | **Fail → B001** (thật: 403 ngay lần 3) |
| 11 | FR02-DT-05 | `lockout` | user mới, sai 1 lần rồi kiểm chưa khóa | `locked_until === null` | P3 | **Fail → B001** |
| 12 | FR02-DT-08 | `lockout` | user mới, sai 1 lần rồi đăng nhập **đúng** | accept, `login_attempts` reset 0 | P3 + P2 | Pass hoặc Fail tùy B001 |
| 13 | FR02-DT-07 / BV-04 | `lockout` | khóa xong, nhập **đúng** mật khẩu | reject + thông báo **phải nói rõ đang bị khóa** (spec R3) | P1 (câu chữ) + P5 403 | **Fail → B003** |
| 14 | FR02-BV-06 | `lockout-wait` | khóa xong, đợi **31 giây** rồi nhập đúng | accept (spec R2b: khóa 30s) | P5 status 200 | **Fail → B002** |
| 15 | FR02-BV-R03 | `login` | email `' OR 1=1--` | reject, **không** 500 | P5 status === 401 | Pass (an toàn) |
| 16 | FR02-BV-R04 | `login` | mật khẩu 500 ký tự (`<repeat:A:500>`) | reject, không treo | P5 401 | Pass |

**TC cố tình không automation** (ghi vào `report/main-report.md` §4, đề §6 yêu cầu):
- `FR02-BV-R01` (cả hai ô rỗng) — trùng cơ chế với TC 4 và 5, không thêm thông tin.
- Đo **chính xác** thời điểm hết khóa (~180s): chờ 3 phút × 3 engine = 9 phút chỉ để xác nhận lại điều mà TC 14 đã chứng minh (31s vẫn khóa ⇒ đã vi phạm spec 30s). Ghi lý do: **chi phí thời gian không tương xứng giá trị thông tin**, và đã có bằng chứng thủ công từ HW02 (`B002-endafter3minutes.png`).
- `FR02-BV-R02` (email thừa khoảng trắng) — HW02 đã kết luận **không phải bug** (spec không đòi trim); giữ lại cũng được nếu bạn muốn tăng số TC, nhưng phải ghi `expect=reject, technique=robust`.

---

## 3. Bước 3 — Chiến lược cô lập: mỗi TC khóa dùng một user riêng

**Vấn đề:** `login_attempts` và `locked_until` là state trong DB, và khóa kéo dài **180 giây**. Nếu mọi TC dùng chung `test@eshop.com`, thì TC số 8 khóa tài khoản xong, TC số 1 (đăng nhập thành công) chạy sau sẽ Fail **vì bị khóa**, không phải vì bug. Chạy tiếp firefox và webkit thì còn loạn hơn. Kết quả: 9 report không giải thích nổi → mất điểm §6.

**Cách xử:** mọi TC `mode = lockout*` dùng **user dùng-một-lần**:

1. `POST {API_URL}/api/register` với `{ name, email: 'lock-<uniq>-<tcId>@hw04.test', password: 'Test1234!' }` → user mới, `login_attempts = 0`, `locked_until = null`.
2. Chạy kịch bản trên UI với user đó.
3. `cleanup.add(...)` → `GET /api/admin/users` tìm theo email → `DELETE /api/admin/users/:id`.

Email và mật khẩu của user tạm **vẫn nằm trong file CSV** (cột `email` chứa `lock-<uniq>@hw04.test`), spec file chỉ đọc `row.email` — không vi phạm luật cấm hard-code.

> **Bảo vệ:** hàm dọn dữ liệu phải kiểm `SEED_EMAILS` và **không bao giờ** xóa `test@eshop.com` / `admin@eshop.com`. Xóa nhầm là hỏng cả 9 lượt lẫn các HW khác.

---

## 4. Bước 4 — Sinh file dữ liệu (chưa viết script)

### Prompt

> Tạo `tests/data/feature-a-login.csv` cho FR-02 với các cột:
> `tcId,title,mode,email,password,failCount,waitSeconds,expect,expectedError,rejectVia,technique,specRef,bugRef,note`
>
> Quy ước:
> - `mode`: `login` (một lần submit) · `ui-check` (chỉ kiểm giao diện tĩnh) · `lockout` (đăng ký user mới, sai mật khẩu `failCount` lần, rồi thực hiện hành động cuối theo `expect`) · `lockout-wait` (như `lockout` nhưng chờ `waitSeconds` giây trước hành động cuối).
> - `expect`: `accept` / `reject` **theo đặc tả FR-02**, không theo hành vi hiện tại của SUT.
> - `rejectVia`: `client` nếu spec đòi form/HTML5 phải chặn trước khi gọi API; `server` nếu phải để API từ chối; `any` nếu spec không quy định.
> - `expectedError`: chuỗi con phải có trong thông báo; `<empty>` nếu spec không quy định câu chữ.
> - Dùng token `<empty>`, `<repeat:A:500>`, `<uniq>` của data-loader.
> - Mỗi dòng có `note` giải thích vì sao chọn giá trị đó, và `specRef` trỏ đúng rule (R1 bộ đếm +1 · R2a khóa khi sai ≥3 · R2b khóa 30s · R3 thông báo phù hợp · R4 thành công trả JWT + reset · R5 ô email `type="email"`).
>
> Nội dung 16 dòng lấy đúng theo bảng test case tôi dán dưới đây: *(dán bảng §2 vào đây)*
>
> Thêm phần ghi chú `#` ở đầu file giải thích ý nghĩa từng cột.

### Review file CSV — 5 lỗi AI hay mắc ở feature này

1. **Điền `expect` theo hành vi thật** (ví dụ ghi `reject` cho TC email sai định dạng với `rejectVia=server` vì "SUT thực tế làm vậy"). Sai — spec R5 đòi `type="email"` nên phải là `rejectVia=client`, và Fail chính là bug B005.
2. **Ghi `expectedError` cho mọi dòng** bằng câu tiếng Việt hiện tại của SUT (`"Đăng nhập thất bại. Vui lòng kiểm tra lại."`). Đó là assert vào bug, không phải vào spec → sửa thành `<empty>`, trừ TC 13 nơi spec **có** đòi phân biệt.
3. **Quên cột `failCount`/`waitSeconds`** → không diễn tả được kịch bản nhiều bước, AI sẽ nhét vòng lặp vào spec kèm số 3 hard-code.
4. **Dùng `test@eshop.com` cho TC lockout** → đọc lại §3 ở trên.
5. **Ghi `login_attempts` kỳ vọng là 2** (theo code) thay vì **1** (theo spec R1) → mất luôn bug B001.

```bash
git add tests/data/feature-a-login.csv; git commit -m "test(feature-a): data file 16 TC cho FR-02 tu HW02"
```

---

## 5. Bước 5 — Page object (chỉ selector + hành động)

### Prompt

> Viết `tests/pages/login.page.js` — class `LoginPage`, **không chứa assertion nào**. Dựa trên sự thật DOM sau: trang `/login` của EShop không có `id`, `name`, `data-testid`, `aria-label`, `<label for>`; class Tailwind (`w-full border p-2 rounded`) giống hệt nhau ở cả hai input; thông báo lỗi là `div.bg-red-100` render sau form.
> - Neo input theo quan hệ DOM nhãn→ô: `label:text-is("Username") + input`, `label:text-is("Mật khẩu") + input`. Comment giải thích vì sao neo theo nhãn bền hơn `nth()` hay class.
> - `heading`, `submitButton` (`getByRole('button', { name: 'Sign In' })`), `errorBanner`, `passwordInput`.
> - Method: `goto()`, `fill({email, password})`, `submit()`, `errorText()`.
> - Method `submitAndCaptureLogin({email, password})`: gọi `page.waitForResponse` cho `POST /api/login` **song song** với hành động submit, timeout 3s, trả `{ called, status, body }`; hết timeout thì `called: false` (nghĩa là client đã chặn — HTML5 `required` hoặc validate form).
> - Method `passwordInputType()` trả `type` thật của ô mật khẩu, và `emailInputType()` — phục vụ TC `ui-check`.
> - Không `waitForTimeout` cố định ở bất cứ đâu trừ chỗ bắt buộc; ưu tiên web-first locator.

### Review page object — bắt 4 lỗi này

- [ ] AI dùng `page.locator('#email')` hoặc `getByLabel('Email')` → **gãy**, vì không có `id` và `<label>` không có `htmlFor`. Đây là lỗi số 1 và bạn phải ghi nó vào gap analysis.
- [ ] AI neo theo `input[type="password"]` cho ô mật khẩu → **gãy**, vì SUT để `type="text"` (chính là bug B004). Ô mật khẩu phải neo theo nhãn.
- [ ] AI dùng `page.locator('.error')` hay `role="alert"` → không tồn tại. Buộc phải bám `div.bg-red-100`; **giữ nhưng ghi vào báo cáo là selector yếu nhất của suite** và giải thích vì sao không có lựa chọn tốt hơn.
- [ ] AI chèn `await page.waitForTimeout(2000)` để "chờ cho chắc" → bỏ, thay bằng `waitForResponse`/web-first assertion. Đây đúng là mục *flaky waits* mà §6 bắt phân tích.

---

## 6. Bước 6 — Spec file

### Prompt

> Viết `tests/feature-a-login.spec.js`:
> - Import `test`, `expect`, `annotateTestCase` từ `./fixtures/base.js`; `LoginPage`; `loadCsv`; các helper assertion.
> - `const cases = loadCsv('feature-a-login.csv')` rồi `for (const row of cases) test(\`${row.tcId} — ${row.title}\`, …)`. **Không được có bất kỳ giá trị test data nào trong file này.**
> - Rẽ nhánh theo `row.mode`:
>   - `ui-check`: mở `/login`, kiểm bằng P1 — ô mật khẩu phải `type="password"`, ô email phải `type="email"`, tiêu đề/nhãn/nút phải đúng tiếng Việt theo spec FR-21. Dùng `expect.soft` cho từng mục để một test báo được **tất cả** các vi phạm cùng lúc.
>   - `login`: `submitAndCaptureLogin(row)`. Nếu `row.expect === 'accept'`: P2 URL về `/` (hard) + P3 `login_attempts === 0` (hard) + P1 không có banner lỗi (soft). Nếu `reject`: kiểm `rejectVia` (`client` ⇒ `called === false`; `server` ⇒ `called === true`), P5 status khớp kỳ vọng, P1 `expectedError` nếu có, P2 vẫn ở `/login`.
>   - `lockout` / `lockout-wait`: đăng ký user mới qua API bằng `row.email`, đăng ký hàm dọn vào `cleanup`, sai mật khẩu `row.failCount` lần qua UI, ghi lại status từng lần; với `lockout-wait` thì `page.waitForTimeout(row.waitSeconds * 1000)`; rồi thực hiện hành động cuối và assert theo `row.expect`. Sau mỗi lần sai, đọc `GET /api/admin/users` và assert `login_attempts` **đúng bằng số lần sai** (spec R1: +1 mỗi lần) bằng `expectSoftNumber`, và `locked_until` phải `null` khi số lần sai < 3.
>   - Với `lockout-wait`, gọi `test.setTimeout(120000)` ngay đầu test và `test.info().annotations.push({type:'Chậm', description:'chờ hết hạn khóa theo spec 30s'})`.
> - Mọi test gọi `annotateTestCase(testInfo, row)` để report truy được về test case HW02.
> - Comment đầu file: kỳ vọng lấy theo **đặc tả FR-02**, nên Fail là bằng chứng bug chứ không phải script sai.

### Chạy lần đầu và đọc kết quả

```bash
npx playwright test tests/feature-a-login.spec.js --project=chromium
```

Với **mỗi** Fail, phân loại vào **một trong năm** nhóm — đây chính là nội dung mà §6 đòi ở phần "review and fix":

| Nhóm | Dấu hiệu | Xử lý |
|---|---|---|
| **Bug thật của SUT** | Fail đúng chỗ spec bị vi phạm, tái lập được | giữ nguyên, nối vào `bugRef`, đưa vào bug report |
| **Selector sai** | `TimeoutError: locator resolved to 0 elements` | sửa page object, ghi vào gap analysis |
| **Hiểu sai đặc tả** | kỳ vọng trong CSV không khớp câu chữ spec | sửa CSV, ghi lại đã sửa gì |
| **Flaky / wait sai** | chạy lại đổi kết quả | thay `waitForTimeout` bằng chờ có điều kiện |
| **Pass giả** | test Pass nhưng vì lý do sai (bị chặn sai tầng, assert vào cái luôn đúng) | siết assertion; **đây là loại đáng viết nhất vào báo cáo** |

Bảng này lặp lại ở cả 3 feature — copy sang `report/main-report.md` §3 và điền số thật.

```bash
git add tests/pages/login.page.js tests/feature-a-login.spec.js; git commit -m "test(feature-a): page object + spec FR-02"
git commit -am "test(feature-a): sua selector neo theo nhan, bo waitForTimeout"
```

---

## 7. Nghiệm thu Feature A

- [ ] ≥12 test (đếm bằng `npx playwright test tests/feature-a-login.spec.js --list`)
- [ ] `findstr` không ra test data trong `.spec.js`
- [ ] Đã dùng ≥3 pattern; feature này nên có P1, P2, P3, P5 (P4 ở bộ đếm)
- [ ] Chạy 2 lần liên tiếp cho **cùng kết quả** (không flaky). Không giống nhau ⇒ còn phụ thuộc state, quay lại §3.
- [ ] Mọi Fail đã phân loại và mọi Fail "bug thật" đã có `bugRef`
- [ ] Đã ghi ra giấy 2–3 chỗ **AI làm sai mà bạn sửa** → nguyên liệu cho [08](08-MAIN-REPORT-GAP-ANALYSIS.md) và cho video Task 2

→ Tiếp: [04-FEATURE-B-FR09.md](04-FEATURE-B-FR09.md)
