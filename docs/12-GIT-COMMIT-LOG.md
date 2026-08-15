# 12 — Git repo & commit log (§12)

> §12: *"at least 8 commits. **Only commits that change test-script files** (`.spec.js`, `.spec.ts`, or equivalent) count toward the 8-commit minimum; commits touching only the README, PDF, or other non-test documents do not count."*
> Và: repo GitHub **public**, commit log nộp dưới dạng **file text**.

---

## 1. Commit nào được tính

| Được tính ✅ | Không được tính ❌ |
|---|---|
| `tests/*.spec.js` | `README.md` |
| `tests/pages/*.page.js`, `tests/utils/*.js`, `tests/fixtures/*.js` (mã hỗ trợ trực tiếp cho script) | `report/*.md`, `*.pdf` |
| `tests/data/*.csv|json` (dữ liệu mà script chạy trên đó) | `.claude/skills/*` |
| `playwright.config.js`, `tools/*.mjs` — **tính cho chắc thì đừng dựa vào**, hãy đảm bảo ≥8 commit chạm đúng `tests/` | ảnh, video |

**Cách chắc chắn nhất:** đảm bảo có **≥8 commit chạm thư mục `tests/`**, và trong đó ≥3 commit chạm trực tiếp file `.spec.js`. Đếm lại được bằng:

```bash
git log --oneline -- tests/ | Measure-Object -Line
```

```bash
git log --oneline -- "tests/*.spec.js"
```

---

## 2. Lịch commit gợi ý — 14 commit, rải ≥4 ngày

Đừng dồn tất cả vào đêm trước hạn nộp: §12 nhìn được lịch sử, và một repo có 14 commit trong 40 phút trông rất tệ.

| Ngày | Commit | Chạm `tests/`? |
|---|---|---|
| 1 | `chore: khoi tao repo - playwright config + preflight` | không |
| 1 | `test(utils): data-loader doc csv/json + token empty/uniq/repeat` | ✅ |
| 1 | `test(utils): 5 assertion pattern + fixture base` | ✅ |
| 2 | `test(feature-a): data file 16 TC cho FR-02 tu HW02` | ✅ |
| 2 | `test(feature-a): page object login + spec data-driven` | ✅ |
| 2 | `test(feature-a): sua selector neo theo nhan, bo waitForTimeout` | ✅ |
| 3 | `test(feature-b): data file JSON 18 TC cho FR-09` | ✅ |
| 3 | `test(feature-b): page object checkout/cart + spec` | ✅ |
| 3 | `test(feature-b): doc tien bang parseMoney thay vi so chuoi` | ✅ |
| 4 | `test(feature-c): data file 16 TC CRUD san pham` | ✅ |
| 4 | `test(feature-c): page object admin + spec, xu ly dialog truoc khi click` | ✅ |
| 4 | `test(feature-c): them TC xoa san pham phai hoi xac nhan` | ✅ |
| 5 | `test(reports): 9 luot browser + HTML report co Run by 23127183` | ✅ (kèm `tests/` nếu có sửa) |
| 5 | `docs: main report, bug report, AI audit, README self-assessment` | không |

→ **12 commit chạm `tests/`**, vượt mốc 8 một cách tự nhiên.

**Message commit:** viết bằng tiếng Việt **không dấu** hoặc tiếng Anh để tránh lỗi encoding khi xuất log trên Windows; theo dạng `type(scope): việc đã làm`.

---

## 3. Repo GitHub public

```bash
git remote add origin https://github.com/<tài-khoản>/HW04-Automation-Testing.git; git branch -M main; git push -u origin main
```

Tài khoản GitHub bạn đã dùng ở HW02: `DuyPham111`. Repo **phải để public** — §14 đòi nộp link, TA mở không được là mất bằng chứng.

**Thêm `.gitignore`** trước khi push:

```
node_modules/
demo/
reports/artifacts/
test-results/
playwright-report/
*.zip
```

`reports/html/` và `reports/json/` thì **phải commit** — đó là bằng chứng §6. (Có thể loại `reports/html/*/trace/` và các file `.zip` bên trong nếu nặng.)

---

## 4. Xuất commit log (§12 đòi file text)

```bash
git log --pretty=format:"%h %ad %an %s" --date=iso > git-log/commit-log.txt
```

Muốn giống HW02 (có `--graph --stat`) thì:

```bash
git log --graph --stat --date=iso --pretty=format:"%h %ad %an%n    %s" > git-log/commit-log.txt
```

Mở file kiểm: không lỗi font, có đủ ngày tháng, và **thời điểm cuối cùng phải trước hạn nộp**.

---

## 5. Nghiệm thu

- [ ] ≥8 commit chạm `tests/` (đếm bằng lệnh ở §1)
- [ ] Commit rải trên ≥4 ngày khác nhau
- [ ] Repo public, đã push, mở bằng cửa sổ ẩn danh xem được
- [ ] `git-log/commit-log.txt` đã xuất và đọc được
- [ ] `reports/html/` có trong repo (không bị `.gitignore` nuốt mất)

→ Tiếp: [13-DONG-GOI-CHECKLIST.md](13-DONG-GOI-CHECKLIST.md)
