---
name: ai-audit-logger
description: Ghi lại mọi lượt tương tác với AI vào AI Audit Report bắt buộc, ngay sau mỗi phiên làm việc. Dùng bất cứ khi nào vừa nhờ AI làm gì trong HW04 — sinh script automation, file dữ liệu, page object, viết báo cáo. Nối thêm một mục có cấu trúc gồm công cụ, ngày giờ, prompt nguyên văn, output, và ba trường riêng của HW04 về việc AI sai gì và đã sửa thế nào.
---

# AI Audit Logger Skill

§9 của đề: AI Audit Report là **phụ lục bắt buộc**. §17: **thiếu một tài liệu bắt buộc = 0 điểm cả
bài**. Skill này lo việc ghi log để không bao giờ phải bịa lại về sau.

## Khi nào dùng

**Ngay sau mỗi phiên** làm việc với AI. Không để dồn — ghi dồn cuối tuần nghĩa là **bịa**, mà bịa
prompt là rủi ro lớn nhất của bài này (§11 kiểm đúng chỗ đó).

---

## Bốn trường §9 bắt buộc

| Trường | Ghi gì |
|---|---|
| Tên công cụ AI | ví dụ `Claude Code (Sonnet 5)` — ghi cả phiên bản/model nếu biết |
| Ngày và giờ | ISO + múi giờ: `2026-08-16 19:55 (+07)` |
| **Prompt** | **NGUYÊN VĂN** — không tóm tắt lại cho đẹp, không sửa câu cho gọn |
| Output của AI | AI trả về cái gì: file nào, bao nhiêu dòng, kết luận gì |

## Ba trường riêng của HW04 (bắt buộc thêm)

Đây là phần chứng minh §2 *"Every result produced by the AI must be carefully reviewed by you"* —
và **chép thẳng sang** `report/main-report.md` §3.2 được, nên **viết một lần dùng hai chỗ**.

| Trường thêm | Ghi gì |
|---|---|
| **Human review** | Tôi đã kiểm gì, phát hiện gì sai. Nêu **cách kiểm** (chạy thật? đọc log? viết script đối chứng?) |
| **Vì sao AI sót** | Phân loại vào **đúng một** nhóm — xem bảng dưới |
| **Tôi đã sửa** | Thay đổi cụ thể (file, dòng, lý do) + **kết quả sau khi sửa** |

### Bốn nhóm nguyên nhân — dùng đúng nhóm cho đúng chỗ

| Nhóm | Nghĩa là | Ví dụ thật từ bài |
|---|---|---|
| **Chất lượng prompt** | Tôi không cung cấp dữ kiện đó | Đặt quy ước "viết không dấu" cho cột ghi chú, AI áp nhầm sang **cột dữ liệu** ⇒ `selectOption({label})` không khớp nhãn UI |
| **Giới hạn mô hình** | AI suy từ mẫu phổ biến thay vì từ hệ thống trước mặt | Ghi CSV không BOM (mặc định của mọi công cụ, tối ưu cho **máy** đọc) ⇒ Excel hiện sai dấu tiếng Việt |
| **Đặc thù feature** | Thứ chỉ lộ ra khi chạy thật | `parseMoney` nuốt dấu âm — viết khi làm feature không có phép tính tiền nào |
| **Giả định môi trường** | Giả định ngầm về cách file/hệ thống được dùng | Bộ lọc comment ngầm giả định *"dòng comment không bao giờ bị CSV-quote"* — sai khi file đi qua Excel |

> **Ghi chú quan trọng:** nhóm nguy hiểm nhất **không** nằm trong 4 nhóm trên mà là khoảng cách
> giữa **ý định đã viết thành lời** (comment, tên biến, mô tả TC) và **hành vi thật của code**.
> Ví dụ thật: comment ghi rõ *"TC này dùng token hợp lệ, khác nhóm kia"* nhưng code **không hề cài
> đặt** phân biệt đó. Loại này **chỉ bắt được bằng cách chạy thật rồi đối chiếu kết quả với ý
> định** — đọc code không thấy, vì code và comment đọc riêng thì cái nào cũng "hợp lý".

---

## Template một mục

```markdown
## [AI-NN] <tiêu đề ngắn — làm gì>

| | |
|---|---|
| Công cụ | <tên + model> |
| Thời điểm | <YYYY-MM-DD HH:MM (+07)> |
| Bước trong quy trình | <bước mấy, feature nào> |

**Prompt (nguyên văn):**

> <dán nguyên văn, kể cả lỗi chính tả của mình>

**Output của AI:** <file gì, bao nhiêu dòng, kết luận gì>

**Human review:** <kiểm bằng cách nào, phát hiện gì>

**Vì sao AI sót:** <chọn 1 trong 4 nhóm + giải thích cơ chế cụ thể>

**Tôi đã sửa:** <thay đổi cụ thể>

**Kết quả sau khi sửa:** <test chạy ra sao — số liệu thật>
```

---

## Nguyên tắc — không được vi phạm

1. **Không bịa prompt.** Dán nguyên văn, kể cả khi câu mình gõ có lỗi chính tả.
2. **Không bịa số liệu chạy test.** Mọi con số phải truy được về file JSON kết quả thật.
3. **Ghi cả lỗi của chính mình.** Nếu chính mình (không phải AI) gây ra lỗi, ghi rõ — điều đó làm
   báo cáo đáng tin hơn, không kém tin hơn.
4. **Ghi cả lỗi do người dùng phát hiện, không phải AI tự tìm.** Ví dụ thật: ảnh chụp lúc Fail bị
   trắng — do người dùng phát hiện. Ghi rõ ai tìm ra.
5. **Ghi số lượng hợp lý.** 12–20 mục cho toàn bài. Dưới 8 mục thì mâu thuẫn với chính lời khai
   "dùng AI theo từng bước" của §2 — người chấm sẽ nghi dùng một prompt gộp.

## Câu khai bắt buộc ở đầu file

> "I use AI tools for the following tasks:" — rồi liệt kê.
>
> *(Nếu không dùng AI thì phải khai đúng câu: "I do not use any AI help in this exercise." — nhưng
> §2 của HW04 bắt buộc dùng AI nên không áp dụng.)*

---

## Tiêu chí nghiệm thu

- [ ] Câu khai + bảng mục lục đầu file
- [ ] ≥8 mục, mỗi mục đủ **4 trường §9** + **3 trường riêng HW04**
- [ ] Prompt **nguyên văn**, không tô vẽ
- [ ] Mỗi mục "vì sao AI sót" phân loại vào **đúng 1 trong 4 nhóm**, có giải thích **cơ chế**, không
      viết chung chung kiểu "AI chưa đủ thông minh"
- [ ] Đã xuất **PDF** (§14 đòi Markdown + PDF)
- [ ] Ba trường riêng HW04 đã chép sang `report/main-report.md` §3.2
