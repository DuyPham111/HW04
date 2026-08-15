# 08 — Báo cáo chính & Gap analysis (`report/main-report.md`)

> §14: báo cáo chính phải gồm *"the automation report and your review / gap analysis of the AI-generated scripts"*.
> §6 nói rõ phải trả lời: AI **sai/sót cái gì** (selector dễ vỡ, assertion yếu hoặc thiếu, thiếu edge case, wait gây flaky) và **vì sao** nó sót (chất lượng prompt · giới hạn mô hình · đặc thù của feature).
>
> Cấu trúc dưới đây bám theo bố cục HW02 của bạn (đã được 100đ): mỗi feature một chương, cuối cùng một chương tổng kết.

---

## Bộ khung `report/main-report.md`

```markdown
# HW04 — Automation Testing on EShop
Sinh viên: Phạm Vũ Ngọc Duy — 23127183 · Ngày: … · Repo: … · Video: …

## 0. Tổng quan
- 3 feature (§5) lấy lại từ HW02: A=FR-02, B=FR-09, C=FR-15. Pool D (mobile) không dùng theo §5.
- Không trùng feature trong nhóm: thỏa thuận phân công của HW02 còn nguyên hiệu lực vì không phát sinh lựa chọn mới.
- Công cụ: Playwright <phiên bản> + Playwright HTML reporter. AI: <tên tool + phiên bản>.
- Số liệu tổng: <copy từ reports/summary.md>

## 1. Chiến lược automation
### 1.1 Quy trình dùng AI theo từng bước (§2)
   Bảng 6 bước: đọc UI → data file → chốt assertion → page object → spec → chạy & sửa.
   Mỗi bước: prompt đã dùng (rút gọn) + tôi đã sửa gì.
### 1.2 Data-driven (§6)
   Vì sao dữ liệu ra file ngoài; bộ cột chuẩn; token <empty>/<uniq>/<repeat>;
   nguyên tắc "expect theo ĐẶC TẢ, không theo hành vi SUT" và hệ quả (Fail nhiều là đúng).
### 1.3 Assertion pattern (§6 đòi ≥3)
   Bảng 5 pattern × lớp bug bắt được × feature dùng.
   Ghi rõ: toBeVisible/toContainText/toHaveText chỉ là 1 pattern.
   Ghi rõ: Feature C không dùng được P2 (SPA một route) → bù bằng P3.
### 1.4 Cô lập dữ liệu và tính lặp lại
   user dùng-một-lần cho FR-02; addInitScript cho đăng nhập; tiền tố HW04- + dọn qua API cho FR-15.

## 2. Kết quả thực thi
### 2.1 Bảng 9 lượt browser (copy từ reports/summary.md)
### 2.2 Bằng chứng "Run by: 23127183" (3 chỗ: metadata · annotation · dải chân trang) — kèm ảnh
### 2.3 Khác biệt giữa 3 engine + số flaky

## 3. Human review & Gap analysis  ← PHẦN ĂN ĐIỂM NHẤT
### 3.1 Phân loại toàn bộ Fail (bảng 5 nhóm)
### 3.2 Bảng gap: AI sai/sót cái gì
### 3.3 Pass giả đã tự phát hiện và siết lại
### 3.4 Cải tiến prompt rút ra

## 4. Test case không automation được (§6 bắt buộc ghi)
   Bảng: TC | vì sao | cách xử thay thế.

## 5. Bug phát hiện
   Tóm tắt, trỏ sang bug-report/bug-report.md.

## 6. Kết luận + tự đánh giá theo §15
```

---

## 1. §3.2 — Bảng gap analysis (phần quan trọng nhất)

Mỗi dòng phải có **đủ 4 cột**. Đề hỏi "why did it fail to catch the issue" → cột *Vì sao AI sót* là cột bị chấm kỹ nhất; trả lời chung chung kiểu "AI chưa đủ thông minh" là mất điểm.

| # | AI sai / sót cái gì | Vì sao AI sót (prompt · giới hạn mô hình · đặc thù feature) | Tôi đã sửa thế nào |
|---|---|---|---|

Ba loại nguyên nhân, dùng đúng loại cho đúng chỗ:

- **Chất lượng prompt** — tôi không cung cấp dữ kiện đó. VD: không đưa file `Login.jsx` nên AI đoán form có `id="email"`.
- **Giới hạn mô hình** — AI suy từ mẫu phổ biến trên Internet thay vì từ hệ thống trước mặt. VD: mặc định "trang login có `input[type=password]`", trong khi SUT để `type="text"`.
- **Đặc thù feature** — thứ chỉ lộ ra khi chạy thật. VD: giỏ hàng nằm trong React state nên `page.goto()` giữa luồng làm mất giỏ; dialog `alert` sau khi sửa sản phẩm làm WebKit treo.

### Gợi ý 8 dòng có thật trong bài này (giữ dòng nào bạn thật sự gặp, **đừng chép dòng bạn không gặp**)

| AI sai/sót | Loại nguyên nhân | Sửa |
|---|---|---|
| Dùng `getByLabel('Email')` / `#email` cho form login | prompt (chưa đưa file) + mô hình (mẫu phổ biến) | neo `label:text-is("Username") + input` |
| Neo ô mật khẩu bằng `input[type="password"]` | mô hình — giả định trang login chuẩn | neo theo nhãn; chính `type` sai lại là bug B004 cần assert |
| Điền `expect` theo hành vi hiện tại của SUT (giá 0 → accept) | mô hình — AI "quan sát rồi mô tả", không phân biệt spec với hiện trạng | đổi về spec; nhờ vậy mới lộ B009/B010 |
| Chỉ assert thông báo trên UI cho FR-02 | đặc thù feature — UI nuốt lỗi, 401 và 403 hiện y hệt | thêm P5 (HTTP status) + P3 (`login_attempts`, `locked_until`) |
| Kỳ vọng `login_attempts` tăng 2 (đọc từ code) | prompt — tôi đưa code trước khi đưa spec | đổi về +1 theo R1 ⇒ lộ B001 |
| Dùng `test@eshop.com` cho mọi TC khóa tài khoản | đặc thù feature — AI không mô phỏng chuỗi request có state | user dùng-một-lần qua `POST /api/register` |
| `page.waitForTimeout(2000)` rải rác | mô hình — mẫu code cũ trên Internet | thay bằng `waitForResponse` / web-first |
| Đăng ký `page.on('dialog')` sau khi click | đặc thù feature — dialog native không nằm trong DOM | đăng ký trước hành động |
| So sánh chuỗi tiền `'5.400.000 ₫'` | đặc thù feature — `toLocaleString()` khác nhau giữa engine | `parseMoney()` rồi so số |
| `page.goto('/checkout')` giữa luồng giỏ hàng | đặc thù feature — giỏ nằm trong React state | điều hướng SPA trong cùng page session |

---

## 2. §3.3 — Pass giả

Đây là mục **tách bài khá khỏi bài giỏi**. "Pass giả" = test báo Pass nhưng không chứng minh được điều nó tuyên bố:

- TC `reject` Pass vì **bị chặn sai tầng** (spec đòi client chặn, thực tế client cho qua nhưng server từ chối) → thêm cột `rejectVia` và assert `called`.
- TC assert vào thứ **luôn đúng** (`expect(page).toBeTruthy()`, hoặc kiểm sự tồn tại của một `div` có ở mọi trang).
- TC dùng `expect.soft` **cho tất cả** → không assertion nào có thể làm test Fail.

Cách tự soát: mở 2–3 test đang Pass, **cố tình phá** (sửa dữ liệu kỳ vọng cho sai) rồi chạy lại. Không Fail ⇒ Pass giả. Viết lại thành một mục ngắn: TC nào, vì sao giả, đã siết thế nào, kết quả sau khi siết.

---

## 3. §4 — Test case không automation được

Bảng bắt buộc theo §6 (*"Document any test cases you could not automate and explain why"*). Bài này có sẵn 3 mục:

| TC | Vì sao không automation (đầy đủ) được | Xử lý thay thế |
|---|---|---|
| `FR02-BV-06/07` đo chính xác thời điểm hết khóa (~180s) | chờ 3 phút × 3 engine = 9 phút chỉ để xác nhận lại điều mà mốc 31s đã chứng minh | assert tại 31s (spec 30s) ⇒ đủ kết luận vi phạm; giữ bằng chứng thủ công HW02 cho con số 180s |
| `FR09-DT-10` phần "hoàn tất thanh toán tạo đơn 350 triệu" | đơn hàng ghi vào `orders`, **không có API xóa** ⇒ 9 lượt để lại 9 đơn rác | automation tới bước áp mã + đọc số; phần tạo đơn giữ bằng chứng thủ công |
| `FR15` `category_id = 9999` | `<select>` chỉ có 3 danh mục seed ⇒ **không nhập được qua UI** | hạ xuống tầng API: `POST /api/products` với `category_id: 9999`, assert theo spec |

---

## 4. Xuất PDF (§14 đòi Markdown **+ PDF**)

Cách nhanh nhất trên Windows: mở file `.md` trong VS Code → extension **Markdown PDF** → *Export (pdf)*. Hoặc:

```bash
npx md-to-pdf report/main-report.md ai-audit/ai-audit-report.md ai-audit/ai-critique.md bug-report/bug-report.md
```

Kiểm PDF sau khi xuất: bảng có bị vỡ không, ảnh có hiện không, tiếng Việt có dấu đủ không.

---

## 5. Nghiệm thu

- [ ] Có đủ 7 mục 0–6
- [ ] Bảng gap analysis ≥ 6 dòng, mỗi dòng có **nguyên nhân cụ thể** (không phải "AI chưa đủ tốt")
- [ ] Có mục Pass giả với ví dụ thật
- [ ] Có bảng "TC không automation được"
- [ ] Mọi số liệu copy từ `reports/summary.md`
- [ ] Đã xuất PDF và mở kiểm

```bash
git add report; git commit -m "docs: main report + gap analysis script AI sinh"
```

→ Tiếp: [09-VIDEO-TASK2.md](09-VIDEO-TASK2.md)
