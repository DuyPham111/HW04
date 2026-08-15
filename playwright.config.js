// playwright.config.js — HW04 Automation Testing
//
// Ba project = ba browser engine (§6: "Run on at least 3 browsers").
// Mỗi lần chạy sinh MỘT HTML report riêng, có "Run by: <StudentID>" + timestamp ISO
// trong title và trong metadata — §6 và §11 đòi thông tin này phải nhìn thấy được
// trên report thật, không phải chèn tay sau khi chạy.
//
// Thư mục report/json lấy từ env để tools/run-all-browsers.mjs tách được 9 lần chạy
// (3 feature × 3 browser) thành 9 report độc lập.

import { defineConfig, devices } from '@playwright/test';

export const STUDENT_ID = process.env.STUDENT_ID || '23127183';
export const STUDENT_NAME = process.env.STUDENT_NAME || 'Phạm Vũ Ngọc Duy';

const RUN_AT = new Date().toISOString();

const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Mặc định trỏ vào demo/ (đã .gitignore), KHÔNG phải reports/.
// Lý do: reports/ chứa 9 HTML report + 9 file JSON nộp kèm báo cáo. Một lệnh chạy lẻ kiểu
//   npx playwright test ... -g "FR02-DT-01"
// mà ghi vào đó sẽ đẻ ra reports/html/all/ và reports/json/all.json nằm ngay cạnh bằng chứng
// thật — git status bẩn, và một lệnh `git add -A` vô ý là commit rác vào bài nộp.
// Chỉ tools/run-all-browsers.mjs mới được ghi vào reports/, và nó set env tường minh cho từng lượt.
const HTML_DIR = process.env.PW_HTML_DIR || 'demo/reports/html/adhoc';
const JSON_FILE = process.env.PW_JSON || 'demo/reports/json/adhoc.json';
const RUN_LABEL = process.env.PW_RUN_LABEL || 'full suite';

export default defineConfig({
  testDir: './tests',

  // FR-02 (bộ đếm khóa tài khoản) và FR-15 (CRUD sản phẩm) đều đụng state dùng chung
  // trong SQLite. Chạy tuần tự 1 worker để kết quả Pass/Fail là do SUT, không do
  // hai test đạp chân nhau — điều kiện tối thiểu để report dùng làm bằng chứng.
  fullyParallel: false,
  workers: 1,

  // KHÔNG retry: báo cáo phải phản ánh đúng lần chạy đầu. Retry sẽ che mất test flaky,
  // mà flaky waits chính là một trong những thứ §6 yêu cầu phân tích.
  retries: 0,

  // FR-02 có TC chờ hết hạn khóa (31 giây) — timeout mặc định 30s của Playwright
  // không đủ, nên nâng lên 60s cho cả suite.
  timeout: 60_000,
  expect: { timeout: 7_000 },
  forbidOnly: !!process.env.CI,

  reporter: [
    ['list'],
    // Playwright không có option đặt tiêu đề report qua cấu hình html reporter
    // (report.json vẫn để title: null dù truyền title). Kênh chính thống để đưa MSSV
    // vào report là khối `metadata` bên dưới — Playwright render khối này ở đầu report.
    // Thẻ <title> của trang do tools/stamp-report.mjs ghi thêm sau khi chạy.
    ['html', { open: 'never', outputFolder: HTML_DIR }],
    ['json', { outputFile: JSON_FILE }],
  ],

  // Playwright render khối metadata này ngay đầu HTML report.
  metadata: {
    'Run by': `${STUDENT_ID} — ${STUDENT_NAME}`,
    'Run at (ISO 8601)': RUN_AT,
    'Run label': RUN_LABEL,
    Course: 'Kiểm thử phần mềm — HW04 Automation Testing',
    SUT: `EShop — web ${WEB_URL} · admin ${ADMIN_URL} · api ${API_URL}`,
    Features: 'A: FR-02 Đăng nhập & khóa tài khoản · B: FR-09 Mã giảm giá · C: FR-15 Quản lý sản phẩm (admin)',
  },

  use: {
    baseURL: WEB_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    // Test nào cần Web Admin thì dùng URL tuyệt đối qua hằng số ADMIN_URL (tests/utils/env.js).
    extraHTTPHeaders: { 'X-Test-Run-By': STUDENT_ID },
  },

  // Tách theo từng lượt: Playwright DỌN SẠCH outputDir ở đầu mỗi lần chạy, nên nếu 9 lượt dùng
  // chung một thư mục thì chỉ còn ảnh Fail + trace của lượt cuối. §11 cần bằng chứng của mọi
  // lượt, và bug report cần ảnh Fail của đúng lượt đã sinh ra nó.
  outputDir: process.env.PW_ARTIFACTS || 'demo/reports/artifacts/adhoc',

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

export const URLS = { WEB_URL, ADMIN_URL, API_URL };
