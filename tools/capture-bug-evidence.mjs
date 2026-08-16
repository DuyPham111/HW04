// capture-bug-evidence.mjs — tái lập 2 BUG MỚI của HW04 rồi chụp ảnh bằng chứng.
//
// Khác với capture-report-evidence.mjs (chỉ chụp lại report có sẵn), script này CHẠY THẬT
// trên SUT đang sống: gửi request vi phạm đặc tả, đọc kết quả thật trả về, rồi chụp màn hình.
// Mọi con số/nội dung trong ảnh đều là phản hồi thật của SUT tại thời điểm chạy.
//
// Ảnh có chèn dải watermark "Run by: <MSSV> — <ISO timestamp>" ở đầu trang (§11 đòi bằng
// chứng truy được về người chạy). Dải này do script chèn vào DOM TRƯỚC khi chụp — nó là nhãn
// ghi công, không che và không sửa bất kỳ dữ liệu nào của SUT.
//
//   node tools/capture-bug-evidence.mjs
//
// Kết quả: bug-report/screenshots/*.png
//
// Script tự dọn mọi dữ liệu nó tạo ra (xoá sản phẩm test qua API) trước khi kết thúc.

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'bug-report', 'screenshots');
const API_URL = process.env.API_URL || 'http://localhost:3000';
const STUDENT_ID = process.env.STUDENT_ID || '23127183';
const STUDENT_NAME = process.env.STUDENT_NAME || 'Phạm Vũ Ngọc Duy';

fs.mkdirSync(OUT_DIR, { recursive: true });

/** Chèn dải ghi công + chú thích bug lên đầu trang trước khi chụp. */
async function stampAndShoot(page, { file, title, note }) {
  const runAt = new Date().toISOString();
  await page.evaluate(
    ({ sid, sname, at, t, n }) => {
      document.querySelector('#hw04-bug-stamp')?.remove();
      const bar = document.createElement('div');
      bar.id = 'hw04-bug-stamp';
      bar.style.cssText =
        'position:relative;z-index:2147483647;font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;' +
        'background:#0f172a;color:#e2e8f0;padding:10px 14px;border-bottom:3px solid #ef4444';
      bar.innerHTML =
        `<div style="color:#fca5a5;font-weight:bold;font-size:14px">${t}</div>` +
        `<div style="margin-top:4px">${n}</div>` +
        `<div style="margin-top:6px;color:#94a3b8">Run by: <strong style="color:#e2e8f0">${sid}</strong> — ${sname} · ${at}</div>`;
      document.body.prepend(bar);
    },
    { sid: STUDENT_ID, sname: STUDENT_NAME, at: runAt, t: title, n: note },
  );
  const out = path.join(OUT_DIR, file);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`  Đã chụp ${path.relative(ROOT, out)}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const createdIds = [];

// ── BUG MỚI 1: FR-12 — POST/PUT/DELETE /api/products không cần token ──────────────────────
console.log('\n[BUG 1] FR-12 broken access control — gửi request KHÔNG kèm token');

const postRes = await fetch(`${API_URL}/api/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // KHÔNG có Authorization
  body: JSON.stringify({
    name: `HW04-BUGEVIDENCE-NoToken-${Date.now()}`,
    price: 999000,
    category_id: 1,
  }),
});
const postBody = await postRes.json();
if (postBody?.id) createdIds.push(postBody.id);
console.log(`  POST không token → HTTP ${postRes.status}, id=${postBody?.id}`);

await page.goto(`${API_URL}/api/products`);
await stampAndShoot(page, {
  file: 'bug-new-01-fr12-post-khong-token.png',
  title: 'BUG MỚI 1 — FR-12: POST /api/products KHÔNG cần token vẫn tạo được sản phẩm',
  note:
    `Đặc tả FR-12: "POST/PUT/DELETE /api/products đều phải yêu cầu Token JWT hợp lệ + role=admin". ` +
    `Thực tế: request KHÔNG có header Authorization → HTTP ${postRes.status}, sản phẩm id=${postBody?.id} ` +
    `("HW04-BUGEVIDENCE-NoToken-...") đã được tạo và hiển thị trong danh sách bên dưới. ` +
    `Phát hiện bởi TC automation FR15-SEC-01.`,
});

// PUT không token — sửa chính sản phẩm vừa tạo
const putRes = await fetch(`${API_URL}/api/products/${postBody.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'HW04-BUGEVIDENCE-DA-BI-SUA-KHONG-TOKEN', price: 1, category_id: 1 }),
});
console.log(`  PUT không token → HTTP ${putRes.status}`);

await page.goto(`${API_URL}/api/products`);
await stampAndShoot(page, {
  file: 'bug-new-01-fr12-put-khong-token.png',
  title: 'BUG MỚI 1 (tiếp) — FR-12: PUT /api/products/:id KHÔNG cần token vẫn sửa được',
  note:
    `Request PUT KHÔNG có header Authorization → HTTP ${putRes.status}. Sản phẩm id=${postBody.id} đã bị ` +
    `đổi tên thành "HW04-BUGEVIDENCE-DA-BI-SUA-KHONG-TOKEN" và giá còn 1đ (xem cuối danh sách). ` +
    `Phát hiện bởi TC automation FR15-SEC-02.`,
});

// DELETE không token
const delRes = await fetch(`${API_URL}/api/products/${postBody.id}`, { method: 'DELETE' });
console.log(`  DELETE không token → HTTP ${delRes.status}`);
if (delRes.ok) createdIds.length = 0; // đã bị xoá bởi chính bug

await page.goto(`${API_URL}/api/products`);
await stampAndShoot(page, {
  file: 'bug-new-01-fr12-delete-khong-token.png',
  title: 'BUG MỚI 1 (tiếp) — FR-12: DELETE /api/products/:id KHÔNG cần token vẫn xoá được',
  note:
    `Request DELETE KHÔNG có header Authorization → HTTP ${delRes.status}. Sản phẩm id=${postBody.id} đã ` +
    `BIẾN MẤT khỏi danh sách. Đây là hậu quả nghiêm trọng nhất: mất dữ liệu thật, không thể hoàn tác. ` +
    `Phát hiện bởi TC automation FR15-SEC-03.`,
});

// ── BUG MỚI 2: category_id không tồn tại vẫn được chấp nhận ───────────────────────────────
console.log('\n[BUG 2] category_id=9999 không tồn tại — gửi request CÓ token hợp lệ');

const loginRes = await fetch(`${API_URL}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@eshop.com', password: 'Admin123!' }),
});
const { token } = await loginRes.json();

const catRes = await fetch(`${API_URL}/api/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    name: `HW04-BUGEVIDENCE-Category9999-${Date.now()}`,
    price: 1000000,
    category_id: 9999,
  }),
});
const catBody = await catRes.json();
if (catBody?.id) createdIds.push(catBody.id);
console.log(`  POST category_id=9999 (CÓ token) → HTTP ${catRes.status}, id=${catBody?.id}`);

const catsRes = await fetch(`${API_URL}/api/categories`);
const cats = await catsRes.json();
const catList = cats.map((c) => `${c.id}=${c.name}`).join(', ');

await page.goto(`${API_URL}/api/products`);
await stampAndShoot(page, {
  file: 'bug-new-02-category-khong-ton-tai.png',
  title: 'BUG MỚI 2 — FR-15: chấp nhận category_id không tồn tại (toàn vẹn tham chiếu)',
  note:
    `Đặc tả FR-15: "Danh mục: bắt buộc, phải chọn từ danh sách có sẵn". Danh mục thật chỉ có: ${catList}. ` +
    `Thực tế: tạo sản phẩm với category_id=9999 (CÓ token hợp lệ, nên KHÔNG liên quan bug FR-12) → ` +
    `HTTP ${catRes.status}, id=${catBody?.id} được tạo với category_id:9999 mồ côi (xem cuối danh sách). ` +
    `Phát hiện bởi TC automation FR15-BV-R03.`,
});

// ── Dọn dữ liệu do script tạo ra ──────────────────────────────────────────────────────────
console.log('\n[DỌN] Xoá sản phẩm do script này tạo ra');
for (const id of createdIds) {
  const r = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`  Xoá id=${id} → HTTP ${r.status}`);
}

const finalRes = await fetch(`${API_URL}/api/products`);
const finalList = await finalRes.json();
const leftover = finalList.filter((p) => String(p.name).includes('HW04-BUGEVIDENCE'));
console.log(`  Còn sót: ${leftover.length} (phải là 0) · tổng sản phẩm: ${finalList.length}`);

await browser.close();
console.log('\nXong. Ảnh nằm trong bug-report/screenshots/');
