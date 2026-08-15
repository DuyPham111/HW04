// base.js — fixture dùng chung cho cả 3 feature.
//
// Cung cấp:
//   api        — APIRequestContext đã đăng nhập admin, để kiểm state thật trong DB (pattern P3)
//   runMeta    — MSSV + timestamp, đính vào từng test để HTML report truy được người chạy (§11)
//   cleanup    — hàng đợi dọn dữ liệu test tạo ra (user/sản phẩm), chạy sau mỗi test
//
// Mọi spec import `test`/`expect` từ đây thay vì từ @playwright/test.

import { test as base, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STUDENT_ID, STUDENT_NAME } from '../utils/env.js';

export const test = base.extend({
  /** Token admin — lấy một lần cho mỗi worker, dùng cho mọi lời gọi API cần quyền. */
  adminToken: [async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: API_URL });
    const res = await ctx.post('/api/login', { data: ADMIN_USER });
    if (!res.ok()) {
      throw new Error(
        `Không đăng nhập được admin (${res.status()}). SUT đã chạy chưa? ` +
        `Chạy: cd backend && node database.js && node server.js`,
      );
    }
    const { token } = await res.json();
    await ctx.dispose();
    await use(token);
  }, { scope: 'worker' }],

  /** Client REST kèm Bearer token — dùng cho assertion pattern P3 (backend state). */
  api: async ({ playwright, adminToken }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${adminToken}`,
        'X-Test-Run-By': STUDENT_ID,
      },
    });
    await use(ctx);
    await ctx.dispose();
  },

  /**
   * Đính MSSV + thời điểm chạy vào annotation của test → hiện trong HTML report ở từng
   * test case, không chỉ ở header report. §11 kiểm tra bằng chứng này.
   */
  runMeta: [async ({}, use, testInfo) => {
    const startedAt = new Date().toISOString();
    testInfo.annotations.push({ type: 'Run by', description: `${STUDENT_ID} — ${STUDENT_NAME}` });
    testInfo.annotations.push({ type: 'Started at (ISO)', description: startedAt });
    await use({ studentId: STUDENT_ID, studentName: STUDENT_NAME, startedAt });
  }, { auto: true }],

  /**
   * Hàng đợi dọn dẹp. Test đăng ký/tạo sản phẩm push hàm dọn vào đây; fixture chạy chúng
   * sau khi test kết thúc (kể cả khi test Fail), theo thứ tự NGƯỢC (cái tạo sau xoá trước),
   * để lần chạy browser kế tiếp bắt đầu sạch. Nuốt lỗi để việc dọn không làm đổi kết quả test.
   */
  cleanup: async ({ api }, use) => {
    const jobs = [];
    await use({ add: (fn) => jobs.push(fn) });
    for (const job of jobs.reverse()) {
      try { await job(api); } catch { /* dọn dẹp thất bại không được làm test đổi kết quả */ }
    }
  },
});

export { expect };

/** Ghi rõ TC ID + kỹ thuật + bug liên quan vào annotation, để report truy về test case HW02. */
export function annotateTestCase(testInfo, row) {
  if (row.tcId) testInfo.annotations.push({ type: 'Test case', description: row.tcId });
  if (row.technique) testInfo.annotations.push({ type: 'Technique', description: row.technique });
  if (row.bugRef && row.bugRef !== '-') {
    testInfo.annotations.push({ type: 'Bug đã biết (HW02)', description: row.bugRef });
  }
  if (row.specRef) testInfo.annotations.push({ type: 'Spec', description: row.specRef });
}
