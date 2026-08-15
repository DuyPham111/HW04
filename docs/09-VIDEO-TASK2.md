# 09 — Task 2: Video demo (15đ)

> §Task 2: YouTube **unlisted**, **≥ 5 phút**, **thuyết minh tiếng Việt**, demo **một** script chạy end-to-end **bao gồm lượt multi-browser và HTML report sinh ra**, **kể ít nhất một chỗ bạn đã sửa script do AI sinh**, và **chứng minh tác giả** bằng face-cam **hoặc** terminal chạy `whoami` và `hostname`.
> §11 nói rõ video **không được AI sinh hay dựng giả** — TA kiểm.

---

## 1. Chuẩn bị trước khi bấm ghi (15 phút)

- [ ] SUT đã chạy, `npm run preflight` toàn `[OK]`, DB vừa reset (`node database.js`)
- [ ] Chọn **feature B (FR-09)** để demo — nhiều bug, số tiền hiện rõ trên màn hình, dễ kể chuyện
- [ ] Chọn sẵn **một chỗ đã sửa script AI** để kể. Đề xuất: *AI so sánh chuỗi tiền `'5.400.000 ₫'` → Fail giả trên Firefox/WebKit vì `toLocaleString()` khác locale → tôi đổi sang `parseMoney()` rồi so số.* Mở sẵn file ở tab VS Code, **đừng ứng biến**
- [ ] Đóng hết cửa sổ riêng tư, tắt thông báo, phóng to font terminal + VS Code (người chấm xem trên màn hình nhỏ)
- [ ] Phần mềm ghi: OBS Studio (miễn phí) hoặc `Win + G` (Xbox Game Bar). Kiểm mic trước bằng một đoạn 20 giây
- [ ] Mở sẵn 5 tab/cửa sổ theo thứ tự sẽ dùng: (1) PowerShell, (2) VS Code, (3) SUT trên trình duyệt, (4) HTML report, (5) GitHub Issues

---

## 2. Kịch bản 8–10 phút (bám sát, đừng nói tự do)

| # | Thời lượng | Nội dung | Thao tác trên màn hình |
|---|---|---|---|
| 1 | 0:00–0:40 | Chào, giới thiệu: *"Tôi là Phạm Vũ Ngọc Duy, MSSV 23127183, bài HW04 Automation Testing trên SUT EShop."* **Xác thực tác giả** | Terminal: gõ `whoami` rồi `hostname`, để kết quả hiện **rõ và đủ lâu** (≥5 giây) |
| 2 | 0:40–1:40 | 3 feature lấy lại từ HW02: FR-02, FR-09, FR-15; số TC mỗi feature | Mở `README.md` và `tests/data/` |
| 3 | 1:40–3:00 | **Data-driven**: mở `feature-b-coupon.json`, chỉ vào cột `expect` và giải thích *"kỳ vọng lấy theo đặc tả FR-09, không theo hành vi hiện tại của SUT — nên Fail chính là bằng chứng bug"*. Mở `.spec.js` chỉ rằng **không có dữ liệu nào hard-code** | VS Code, cuộn chậm |
| 4 | 3:00–4:30 | **Chạy một test case đơn lẻ** end-to-end, có `--headed` để thấy trình duyệt thao tác thật | `npx playwright test tests/feature-b-coupon.spec.js -g "FR09-BV-02" --project=chromium --headed` |
| 5 | 4:30–6:00 | **Chỗ đã sửa script AI** — mở đúng file, chỉ dòng cũ (so chuỗi tiền) và dòng mới (`parseMoney`), giải thích **vì sao AI sai**: nó suy từ mẫu phổ biến, không biết `toLocaleString()` khác nhau giữa engine | VS Code + `git log`/`git diff` của commit sửa |
| 6 | 6:00–7:30 | **Chạy multi-browser**: một feature × 3 engine | `node tools/run-all-browsers.mjs b` — nói trong lúc chờ: 9 lượt tổng cộng, mỗi lượt một report riêng, vì sao không gộp |
| 7 | 7:30–8:40 | **Mở HTML report vừa sinh**: chỉ vào `Run by: 23127183` ở tab trình duyệt, ở dải chân trang, và annotation trong một test case; mở một Fail chỉ vào ảnh + `test.step` hiện tên assertion pattern | `npx playwright show-report reports/html/b-chromium` |
| 8 | 8:40–9:30 | Bug tìm được → GitHub Issue kèm ảnh; kết: số TC, số lượt, số defect | Trang Issues |

**Tổng ~9 phút** — vượt mốc 5 phút một cách an toàn. Đừng cắt xuống sát 5:00; video 5:02 mà đầu cuối có khoảng lặng là rủi ro không đáng có.

---

## 3. Lệnh chứng minh tác giả

```bash
whoami; hostname
```

Quay đúng khung này ở **đầu video**, để kết quả nằm yên vài giây. Có face-cam thì càng tốt (chỉ cần **một** trong hai, có cả hai thì chắc chắn).

---

## 4. Upload

1. YouTube → Tải video lên → hiển thị: **Không công khai (Unlisted)** ← **không** phải Riêng tư (Private), vì Private thì TA không mở được → coi như thiếu tài liệu (§17: 0 điểm).
2. Tiêu đề: `HW04 Automation Testing — EShop — 23127183 Phạm Vũ Ngọc Duy`
3. Mô tả: link repo + 3 feature + mốc thời gian các phần.
4. Copy link vào `README.md` và `report/main-report.md`.
5. **Tự kiểm bằng cửa sổ ẩn danh** (chưa đăng nhập) xem link có mở được không.

---

## 5. Nghiệm thu

- [ ] ≥ 5 phút, tiếng Việt, giọng của bạn
- [ ] Có `whoami` + `hostname` (hoặc face-cam) hiện rõ
- [ ] Có: chạy 1 script end-to-end · chạy multi-browser · mở HTML report thấy `Run by: 23127183`
- [ ] Có kể **một chỗ đã sửa script AI** kèm lý do AI sai
- [ ] Chế độ **Unlisted**, đã kiểm bằng cửa sổ ẩn danh
- [ ] Link đã điền vào README + báo cáo

→ Tiếp: [10-AGENT-SKILLS.md](10-AGENT-SKILLS.md)
