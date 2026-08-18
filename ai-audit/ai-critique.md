# AI Critique — HW04 (§10)

> ⚠️ **BẢN NHÁP DO AI VIẾT THEO YÊU CẦU CỦA BẠN — CHƯA PHẢI BẢN NỘP.** Đoạn dưới đây (299 từ,
> trong khoảng 200–300 §10 đòi) dựa trên chuyện **thật** đã xảy ra trong bài (Pass giả
> `FR09-BV-R03`, bug `document.title`), nhưng đây vẫn là **lời của AI**, không phải lời của bạn.
> §10/§17 đòi đoạn này phải là **phản tư của chính bạn** — trước khi nộp, hãy: (1) đọc lại, kiểm
> hai ví dụ có đúng như bạn đã trải qua/hiểu không, (2) **viết lại bằng câu chữ, giọng văn của
> chính bạn** — đổi cách diễn đạt, thêm/bớt chi tiết theo cách bạn nhớ, đừng chỉ đổi vài từ, (3)
> đếm lại từ bằng lệnh dưới, (4) xóa khối cảnh báo này. Nếu muốn đổi ví dụ khác (vd. lỗi
> `/automation-suite`, hay lỗi selector giả định `id` ở Feature C) cứ thay — miễn đủ 3 câu hỏi.
>
> **Lưu ý khi đếm từ:** lệnh đếm ở [docs/11](../docs/11-AI-AUDIT-CRITIQUE.md) đếm **cả file**, kể
> cả banner cảnh báo này và "Dàn ý gốc" bên dưới — nên trước khi nộp, xóa cả hai phần đó, chỉ giữ
> lại dòng "Sinh viên: ..." và 3 đoạn trả lời, rồi đếm lại cho chính xác.

**Sinh viên:** Phạm Vũ Ngọc Duy — 23127183 · **Số từ:** 299

---

**Dàn ý gốc (tham khảo, không bắt buộc theo):**

1. *AI sai / thiên lệch / thiếu sót ở đâu?* — ví dụ cụ thể có số liệu.
2. *Vì sao nó không tự bắt được?* — cơ chế, không phải cảm tính.
3. *Nguyên tắc rút ra?*

---

Sai lệch rõ nhất tôi gặp là AI hay giả định theo "mẫu điển hình" thay vì đối chiếu đúng ý định của
test. Rõ nhất ở Feature B: hàm đọc dữ liệu do AI viết tự động cắt khoảng trắng thừa trước khi đưa
vào test, trong khi có một test case (FR09-BV-R03) đang kiểm CHÍNH việc hệ thống có tự cắt khoảng
trắng hay không. Test báo Pass, nhưng không kiểm được điều nó tuyên bố, vì công cắt khoảng trắng
là của hàm đọc dữ liệu, không phải của hệ thống đang test — một Pass giả mà nếu không tự hỏi
"loader có làm hộ việc của SUT không" thì tôi đã tin vào màu xanh. Ca thứ hai: script chèn MSSV vào
tiêu đề tab report, nhưng AI không lường được report Playwright là app React tự ghi đè
`document.title` sau khi tải xong — sửa file HTML tĩnh thì đúng, hành vi thật lúc mở trình duyệt
vẫn sai, chỉ lộ ra khi tôi tự chụp ảnh gửi lại.

AI không tự bắt được hai lỗi này vì hai cơ chế khác nhau. Một, mô hình viết hàm đọc "sạch sẽ" theo
thói quen phổ biến mà không tự hỏi việc làm sạch có che mất điều cần kiểm không — nó mô tả giỏi
"nên làm gì" hơn đối chiếu "test cần gì". Hai, việc ghi đè title chỉ lộ lúc chạy thật, đọc mã nguồn
tĩnh thì thấy mọi thứ đều đúng.

Nguyên tắc rút ra: người dùng phải giữ quyền định nghĩa "đúng" — đối chiếu đặc tả gốc và ý định
test case, không tin theo màu xanh hay lời AI — và mọi kết luận AI phải được kiểm bằng chạy thật,
không chỉ đọc code.
