# 11 — AI Audit Report (§9) & AI Critique (§10)

> Cả hai đều **bắt buộc**. §17: thiếu một tài liệu bắt buộc = **0 điểm**. Đừng để hai file này đến phút chót.

---

## 1. AI Audit Report — `ai-audit/ai-audit-report.md`

### Nội dung §9 đòi cho **mỗi** lượt tương tác

| Trường | Ghi gì |
|---|---|
| Tên công cụ AI | ví dụ `Claude Code (Opus 5)`, `ChatGPT`, `Copilot` — ghi cả phiên bản nếu biết |
| Ngày và giờ | ISO, ví dụ `2026-08-15 14:32 (+07)` |
| Prompt | **nguyên văn**, không tóm tắt lại cho đẹp |
| Output của AI | tóm tắt AI trả về cái gì (file nào, bao nhiêu dòng, kết luận gì) |

Và **thêm 3 trường riêng của HW04** (không bắt buộc theo đề nhưng là thứ chứng minh §2 "human review", nên có):

| Trường thêm | Ghi gì |
|---|---|
| Human review | tôi đã kiểm gì, phát hiện gì sai |
| Sửa gì | thay đổi cụ thể (file, dòng, lý do) |
| Kết quả sau khi sửa | test chạy ra sao |

### Khung mỗi mục

```markdown
### [AI-07] Sinh page object cho FR-09 Checkout
| | |
|---|---|
| Công cụ | Claude Code (Opus 5) |
| Thời điểm | 2026-08-15 14:32 (+07) |
| Bước trong quy trình | Bước 5 — page object (feature B) |

**Prompt (nguyên văn):**
> …

**Output của AI:** sinh `tests/pages/checkout.page.js`, 96 dòng, 4 locator + 3 method.

**Human review:** … (ví dụ: dùng `nth(1)` cho ô tổng tiền; so chuỗi tiền; thiếu `waitForResponse`)
**Tôi đã sửa:** … (neo theo nhãn; thêm `applyAndCapture`; `parseMoney`)
**Kết quả:** 18/18 test chạy, 6 Fail đều truy về B006/B007/B008/B013.
```

### Cách làm cho nhẹ nhàng: ghi ngay lúc dùng

Cuối **mỗi phiên** làm việc với AI, chạy skill `ai-audit-logger` (xem [10](10-AGENT-SKILLS.md)) hoặc tự nhắc mình 2 phút để dán prompt vào file. Ghi dồn vào cuối tuần = bịa, mà bịa prompt là rủi ro lớn nhất của bài này: §11 và §17 đều đánh vào chỗ đó.

**Số lượng hợp lý:** 12–20 mục cho toàn bài (mỗi feature ~4 mục: đọc UI · data file · page object · spec + sửa; cộng các mục cho config, tools, báo cáo). Ít hơn 8 mục thì mâu thuẫn với chính lời khai "dùng AI theo từng bước" của §2 — người chấm sẽ nghi bạn dùng một prompt gộp.

### Câu khai bắt buộc ở đầu file

> "I use AI tools for the following tasks:" — rồi liệt kê. (Nếu không dùng AI thì phải khai đúng câu *"I do not use any AI help in this exercise."*, nhưng bài này bắt buộc dùng AI theo §2 nên không áp dụng.)

Nếu môn học có phát các template `[AI-02] AI Audit Report`, `[AI-03] AI Disclosure Form`, `[AI-05] AI Privacy Checklist` (bạn đã ký ở HW01) thì đính kèm bản đã ký như HW01/HW02.

---

## 2. AI Critique — `ai-audit/ai-critique.md`

**200–300 từ**, một đoạn (hoặc 2–3 đoạn ngắn), trả lời đủ **ba câu** của §10:

1. AI **sai / thiên lệch / thiếu sót** ở đâu?
2. **Vì sao** nó không tự bắt được?
3. **Nguyên tắc** bạn rút ra khi cộng tác với AI?

### Dàn ý gợi ý (viết bằng lời của bạn, đừng để AI viết hộ rồi nộp nguyên)

- **Câu 1 — cụ thể, có số liệu.** Ví dụ: AI sinh selector theo `id`/`getByLabel` cho form mà SUT không hề có thuộc tính nào như vậy; AI điền kỳ vọng theo **hành vi hiện tại** của SUT thay vì theo đặc tả, khiến 3 test case về validate giá suýt nữa Pass và che mất bug B009.
- **Câu 2 — cơ chế, không phải cảm tính.** AI hoàn thành mẫu theo phân phối của dữ liệu huấn luyện: một trang đăng nhập "điển hình" thì ô mật khẩu là `type="password"` và có `id`. SUT này cố tình lệch chuẩn, mà AI không có cách nào biết nếu tôi không đưa mã nguồn thật. Một cơ chế thứ hai: AI **mô tả cái đang có** giỏi hơn **đối chiếu với cái phải có** — nên nó dễ biến hiện trạng thành đặc tả.
- **Câu 3 — nguyên tắc rút ra.** Ví dụ: *người phải giữ quyền định nghĩa "đúng"*; AI được giao phần cơ học (sinh locator, sinh vòng lặp, sinh file dữ liệu), còn nguồn của kỳ vọng luôn là đặc tả do người đọc và chốt. Và: chia nhỏ theo **bước của kỹ thuật kiểm thử** khiến sai sót lộ ra sớm, ở chỗ còn rẻ để sửa.

### Kiểm số từ trước khi nộp

```bash
node -e "const t=require('fs').readFileSync('ai-audit/ai-critique.md','utf8').replace(/[#*`|>-]/g,' ');console.log(t.trim().split(/\s+/).length + ' tu')"
```

Phải nằm trong khoảng **200–300**. Dưới 200 hoặc trên 300 là trừ điểm hình thức một cách lãng nhách.

---

## 3. Nghiệm thu

- [ ] `ai-audit/ai-audit-report.md` có câu khai + ≥8 mục, mỗi mục đủ 4 trường của §9
- [ ] Prompt ghi **nguyên văn**, không tô vẽ
- [ ] `ai-audit/ai-critique.md` đếm được 200–300 từ, trả lời đủ 3 câu
- [ ] Đã xuất **PDF** cho cả hai (§14 đòi Markdown + PDF)

```bash
git add ai-audit; git commit -m "docs: AI audit report + AI critique"
```

→ Tiếp: [12-GIT-COMMIT-LOG.md](12-GIT-COMMIT-LOG.md)
