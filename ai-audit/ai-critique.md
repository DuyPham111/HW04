# AI Critique — HW04 (§10)

> ⚠️ **BỘ KHUNG.** 200–300 từ, một đoạn liền mạch, trả lời đủ 3 câu của §10.
> Viết bằng lời của bạn, dựa trên chuyện **thật** đã xảy ra trong bài. Đếm từ bằng lệnh trong
> [docs/11-AI-AUDIT-CRITIQUE.md](../docs/11-AI-AUDIT-CRITIQUE.md). Xóa dòng này trước khi nộp.

**Sinh viên:** Phạm Vũ Ngọc Duy — 23127183 · **Số từ:** `<đếm lại>`

---

**Dàn ý (xóa sau khi viết xong):**

1. *AI sai / thiên lệch / thiếu sót ở đâu?* — nêu 2–3 ví dụ cụ thể có số liệu (selector giả định `id`/`getByLabel` trên form không hề có thuộc tính đó; kỳ vọng điền theo hành vi hiện tại của SUT thay vì theo đặc tả, suýt che mất bug validate giá; assertion chỉ nhìn UI trong khi UI của FR-02 nuốt sạch khác biệt giữa 401 và 403).
2. *Vì sao nó không tự bắt được?* — cơ chế, không phải cảm tính: mô hình hoàn thành theo mẫu phổ biến; nó **mô tả hiện trạng** giỏi hơn **đối chiếu với cái phải có**; và những ràng buộc chỉ lộ ra khi chạy thật (state trong React, dialog native, khác biệt locale giữa engine) thì không nằm trong văn bản tôi đưa cho nó.
3. *Nguyên tắc rút ra* — người giữ quyền định nghĩa "đúng"; AI làm phần cơ học; chia nhỏ theo bước của kỹ thuật kiểm thử để sai sót lộ ra sớm, khi còn rẻ để sửa.

---

`<viết đoạn 200–300 từ tại đây>`
