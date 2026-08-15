# 10 — Agent Skills (§7, 10đ)

> §7: *"You are encouraged to build an Agent Skill that applies this automation workflow (data-driven, multi-browser script generation and maintenance)… Submit the skill together with a demonstration video (YouTube link) that shows, end to end, how you used the skill on a complete feature."*
> Bảng §15 chấm **10 điểm** cho hạng mục này ⇒ không phải "khuyến khích", cứ coi là bắt buộc.

Ở HW02 bạn đã nộp 3 skill (`hw02-domain-testing`, `hw02-bva`, `hw02-spec-vs-code`) và được trọn điểm. Làm lại đúng công thức đó, đổi nội dung sang automation.

---

## 1. Bốn skill nên có

| Skill | Việc | Khi nào dùng thật trong bài |
|---|---|---|
| `automation-suite` | quy trình 6 bước sinh + **duyệt lại** script cho một feature (skill chính §7 gọi tên) | mỗi lần bắt đầu một feature |
| `data-driven-tests` | chuyển danh sách test case → file `.csv`/`.json` ngoài + kế hoạch assertion | bước 2 của mỗi feature |
| `multi-browser-report` | chạy 9 lượt, đóng dấu `Run by`, đọc khác biệt cross-engine | sau khi 3 feature xong |
| `ai-audit-logger` | ghi AI Audit Report (§9) sau mỗi phiên làm việc với AI | mỗi phiên |

> **Điều kiện để ăn điểm:** skill phải **được dùng thật** trong bài, và bạn phải chỉ ra được dấu vết của nó (file dữ liệu do skill sinh, mục audit do skill ghi). Skill viết đẹp mà không dùng thì TA hỏi một câu là lộ.

---

## 2. Định dạng file skill

Đặt ở `.claude/skills/<tên-skill>/SKILL.md`. Frontmatter YAML **bắt buộc** có `name` và `description`; phần mô tả nên nói rõ **khi nào dùng**, vì đó là thứ Claude Code đọc để tự kích hoạt.

```markdown
---
name: automation-suite
description: Dẫn AI theo từng bước biến test case thủ công của một feature thành bộ Playwright data-driven chạy đa trình duyệt — chốt phạm vi, đọc UI thật, đưa dữ liệu ra file ngoài, chọn assertion pattern, sinh script, rồi review và sửa. Dùng cho HW04 Task 1. Không bao giờ ra một prompt gộp kiểu "viết toàn bộ script cho feature X".
---

# Automation Suite Skill
## Khi nào dùng
## Đầu vào cần có
## Quy trình — 6 bước, mỗi bước một lượt hỏi AI
### Bước 1 — …  (kèm prompt mẫu + checklist người duyệt)
…
## Tiêu chí nghiệm thu
## Lỗi thường gặp
```

**Prompt để nhờ AI viết skill** (rồi bạn sửa lại):

> Viết `.claude/skills/automation-suite/SKILL.md` theo định dạng Agent Skill (frontmatter `name` + `description`, thân là Markdown). Nội dung: quy trình 6 bước biến test case thủ công của một feature web thành bộ Playwright data-driven chạy 3 engine — (1) chốt phạm vi + đọc UI thật, (2) chuyển test case thành file `.csv`/`.json` ngoài script, (3) chốt assertion pattern trước khi sinh code, (4) sinh page object trước rồi spec sau, (5) chạy một engine và phân loại từng Fail theo 5 nhóm, (6) chạy đủ 3 engine + gap analysis. Mỗi bước có: mục tiêu, prompt mẫu, **checklist người review phải tự kiểm**, và commit gợi ý. Nhấn mạnh nguyên tắc §2 của đề: không ra prompt gộp, mọi output AI phải được người duyệt. Viết tiếng Việt.

Làm tương tự cho 3 skill còn lại (nội dung lấy từ [02](02-DATA-DRIVEN-VA-ASSERTION.md), [06](06-MULTI-BROWSER-REPORT.md), [11](11-AI-AUDIT-CRITIQUE.md) — chính là các file hướng dẫn này, cô đọng lại).

---

## 3. Video demo skill (§7 đòi riêng, khác video Task 2)

Ngắn hơn video Task 2 — **3–5 phút là đủ**, unlisted, và phải cho thấy dùng skill **end-to-end trên một feature hoàn chỉnh**.

Kịch bản 3 nhịp cho mỗi skill:
1. **Mở `SKILL.md`** — skill này gồm những bước gì (10–15 giây).
2. **Gõ prompt gọi skill** trong Claude Code (`/automation-suite` hoặc câu lệnh tự nhiên) và để nó chạy.
3. **Mở thành quả** — file dữ liệu / spec / report vừa sinh, chỉ vào bên trong có gì.

Chọn **feature B (FR-09)** để đi trọn vòng: gọi `data-driven-tests` sinh file JSON → `automation-suite` sinh page object + spec → `multi-browser-report` chạy 3 engine + mở report → `ai-audit-logger` ghi lại phiên vừa rồi. Kết thúc bằng việc mở `ai-audit/ai-audit-report.md` cho thấy mục vừa được thêm — nó chứng minh cả 4 skill đều dùng thật.

---

## 4. Nghiệm thu

- [ ] 4 thư mục trong `.claude/skills/`, mỗi cái có `SKILL.md` với frontmatter hợp lệ
- [ ] Mỗi skill mô tả **khi nào dùng** + **checklist review**, không chỉ là danh sách prompt
- [ ] Cả 4 skill **đã được dùng thật**, chỉ ra được dấu vết
- [ ] Video demo skill unlisted, 3–5 phút, đi hết một feature
- [ ] Link video + bảng 4 skill đã có trong `README.md`

```bash
git add .claude/skills; git commit -m "docs(skills): 4 agent skill cho quy trinh automation HW04"
```

→ Tiếp: [11-AI-AUDIT-CRITIQUE.md](11-AI-AUDIT-CRITIQUE.md)
