# AI Critique — HW04 (§10)


Sai lệch tôi gặp là AI hay giả định theo "mẫu điển hình" thay vì đối chiếu đúng ý định của
test. Ở Feature B: hàm đọc dữ liệu do AI viết tự động cắt khoảng trắng thừa trước khi đưa
vào test, trong khi có một test case (FR09-BV-R03) đang kiểm CHÍNH việc hệ thống có tự cắt khoảng
trắng hay không. Test báo Pass, nhưng không kiểm được điều nó tuyên bố, vì công cắt khoảng trắng
là của hàm đọc dữ liệu, không phải của hệ thống — một Pass giả mà nếu không tự hỏi
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
