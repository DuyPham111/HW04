// Một chỗ duy nhất khai báo môi trường SUT + danh tính người chạy.
// Test KHÔNG import playwright.config.js (tránh vòng phụ thuộc), nên hằng số nằm ở đây.

export const STUDENT_ID = process.env.STUDENT_ID || '23127183';
export const STUDENT_NAME = process.env.STUDENT_NAME || 'Phạm Vũ Ngọc Duy';

export const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
export const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
export const API_URL = process.env.API_URL || 'http://localhost:3000';

export const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@eshop.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
};

export const TEST_USER = {
  email: process.env.TEST_EMAIL || 'test@eshop.com',
  password: process.env.TEST_PASSWORD || 'Test1234!',
};

// ID sản phẩm mặc định dùng cho Feature B (giỏ hàng, mã coupon). Seed của SUT: #1 = iPhone 15 Pro Max.
export const SEED_PRODUCT_ID = Number(process.env.SEED_PRODUCT_ID || 1);

/**
 * Email của các tài khoản SEED. Không phải test data — đây là danh sách BẢO VỆ: bước dọn dữ
 * liệu sau test không được xoá các tài khoản này (xoá đi thì các test khác và cả các HW khác
 * hỏng theo). Đặt ở đây để file `.spec.js` không chứa chuỗi nào trông như test data.
 */
export const SEED_EMAILS = new Set([ADMIN_USER.email, TEST_USER.email]);
