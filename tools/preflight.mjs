// preflight.mjs — kiểm SUT đã sẵn sàng trước khi chạy suite.
//
// Chạy 9 lượt browser mà backend chưa lên thì được 9 report toàn Fail vì lý do môi trường,
// không phải vì bug — vô giá trị làm bằng chứng. Kiểm vài giây ở đây rẻ hơn nhiều.

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
const API_URL = process.env.API_URL || 'http://localhost:3000';

let failed = 0;

async function check(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.log(`  [LOI]  ${name.padEnd(14)} → ${err.message}`);
    failed++;
  }
}

// 1. Backend API
await check('Backend API', async () => {
  const res = await fetch(`${API_URL}/api/products`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log(`  [OK]   Backend API     ${API_URL}/api/products`);
});

// 2. Frontend Web
await check('Frontend Web', async () => {
  const res = await fetch(`${WEB_URL}/`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log(`  [OK]   Frontend Web    ${WEB_URL}/`);
});

// 3. Web Admin
await check('Web Admin', async () => {
  const res = await fetch(`${ADMIN_URL}/`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log(`  [OK]   Web Admin       ${ADMIN_URL}/`);
});

// 4. Seed data — sản phẩm #1 (dùng cho Feature B) còn nguyên
await check('Seed data', async () => {
  const res = await fetch(`${API_URL}/api/products/1`, { signal: AbortSignal.timeout(5000) });
  const p = await res.json();
  if (!p || !p.name) throw new Error('sản phẩm #1 không tồn tại → chạy: node database.js');
  console.log(`  [OK]   Seed data       sản phẩm #1 = "${p.name}" (price kiểu ${typeof p.price})`);
});

// 5. Admin login — cần cho Feature C (quản lý sản phẩm) và fixture lấy token
await check('Admin login', async () => {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eshop.com', password: 'Admin123!' }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} → chạy: node database.js`);
  console.log('  [OK]   Admin login     admin@eshop.com');
});

// 6. Coupon seed — 4 coupon (SAVE10/BIGBUY/VIP100/EXPIRED) còn nguyên, dùng cho Feature B
await check('Coupon seed', async () => {
  const res = await fetch(`${API_URL}/api/apply-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'SAVE10', total_amount: 400000 }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} → coupon SAVE10 không hoạt động, chạy: node database.js`);
  console.log('  [OK]   Coupon seed     SAVE10 áp dụng được trên đơn 400.000');
});

if (failed > 0) {
  console.error(
    `\n${failed} kiểm tra thất bại. Khởi động SUT trước:\n` +
    `  cd backend && node database.js && node server.js\n` +
    `  cd frontend-web && npm run dev\n` +
    `  cd frontend-admin && npm run dev\n`,
  );
  process.exit(1);
}

console.log('\nSUT sẵn sàng.\n');
