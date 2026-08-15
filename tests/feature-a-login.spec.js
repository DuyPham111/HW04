// Feature A — FR-02 Đăng nhập & Khóa tài khoản (frontend-web /login)
//
// Data-driven: mọi test case đọc từ tests/data/feature-a-login.csv. Trong file này KHÔNG
// có một giá trị test data nào được hard-code (§6).
//
// Kỳ vọng của mỗi test là ĐẶC TẢ FR-02, không phải hành vi hiện tại của SUT. Test Fail vì
// thế là bằng chứng bug, không phải script sai — mỗi Fail đều truy được về BUG-A* /
// B001..B012 trong bug-report/bug-report.md.
//
// Assertion pattern dùng ở đây: P1 (DOM), P2 (URL), P3 (state backend qua REST API),
// P5 (HTTP status/network). Feature A không dùng P4 (không có phép tính số).
//
// Bốn `mode` trong file dữ liệu:
//   login          một lần submit trên form, kiểm accept/reject.
//   ui-check       không submit gì, chỉ kiểm thuộc tính DOM tĩnh (type, nhãn, tiêu đề).
//   lockout        đăng ký user mới, sai mật khẩu `failCount` lần, rồi theo `finalAction`.
//   lockout-wait   như lockout nhưng chờ `waitSeconds` giây trước `finalAction`.

import { test, expect, annotateTestCase } from './fixtures/base.js';
import { LoginPage } from './pages/login.page.js';
import { loadCsv } from './utils/data-loader.js';
import { expectVisibleText, expectRoute, expectBackendState } from './utils/assertions.js';

const cases = loadCsv('feature-a-login.csv');

/** Đọc { login_attempts, locked_until } thật từ DB cho một email — nền tảng của pattern P3. */
async function readAccountState(api, email) {
  const res = await api.get('/api/admin/users');
  expect(res.ok(), 'GET /api/admin/users phải thành công để kiểm được state DB').toBeTruthy();
  const users = await res.json();
  const user = users.find((u) => (u.email ?? '') === email);
  if (!user) return null;
  return { attempts: user.login_attempts, locked: !!user.locked_until, id: user.id };
}

/** Đăng ký user dùng-một-lần cho các TC lockout — cô lập khỏi tài khoản seed và khỏi nhau. */
async function registerThrowawayUser(api, { email, password }) {
  const res = await api.post('/api/register', {
    data: { name: 'HW04 Lockout Test', email, password },
  });
  expect(res.ok(), `Không đăng ký được user tạm ${email} (${res.status()})`).toBeTruthy();
}

test.describe('Feature A — FR-02 Đăng nhập & Khóa tài khoản', () => {
  for (const row of cases) {
    test(`${row.tcId} — ${row.title}`, async ({ page, api, cleanup }, testInfo) => {
      annotateTestCase(testInfo, row);
      if (row.note) testInfo.annotations.push({ type: 'Ghi chú thiết kế', description: row.note });

      const login = new LoginPage(page);

      // ── mode = ui-check: không submit, chỉ đọc thuộc tính DOM tĩnh ──────────────────
      if (row.mode === 'ui-check') {
        await login.goto();

        if (row.tcId === 'FR02-DT-09') {
          const pwType = await login.passwordInputType();
          expect.soft(pwType, 'P1 DOM · ô mật khẩu phải type="password" (spec FR-22)').toBe('password');
        }

        if (row.tcId === 'FR02-DT-10') {
          await expectVisibleText(login.heading, 'Đăng Nhập', 'tiêu đề trang phải là "Đăng Nhập"', { soft: true });
          const label = page.locator('label', { hasText: 'Email' });
          expect.soft(await label.count(), 'P1 DOM · nhãn ô đăng nhập phải là "Email", không phải "Username"').toBeGreaterThan(0);
          await expectVisibleText(login.submitButton, 'Đăng Nhập', 'nút submit phải ghi "Đăng Nhập", không phải "Sign In"', { soft: true });
        }
        return;
      }

      // ── mode = login: một lần submit, kiểm accept/reject ────────────────────────────
      if (row.mode === 'login') {
        await login.goto();
        const { called, status } = await login.submitAndCaptureLogin({ email: row.email, password: row.password });

        if (row.rejectVia === 'client') {
          expect.soft(called, `${row.tcId}: form phải chặn ngay ở client, không được gọi API`).toBe(false);
        } else if (row.rejectVia === 'server') {
          expect.soft(called, `${row.tcId}: dữ liệu này phải đi tới server để server từ chối`).toBe(true);
          expect.soft(status, `${row.tcId}: server phải trả mã lỗi (4xx), không phải 2xx/5xx`).toBeGreaterThanOrEqual(400);
        }

        if (row.expect === 'accept') {
          // P2 (quyết định) — đăng nhập thành công phải rời khỏi /login.
          await expectRoute(page, /\/(?!login)/, 'rời trang đăng nhập sau khi đăng nhập thành công');
          // P1 (bổ trợ) — không còn banner lỗi nào.
          expect.soft(await login.errorBanner.count(), 'P1 DOM · không được hiển thị lỗi khi đăng nhập đúng').toBe(0);
        } else {
          // P2 (bổ trợ) — bị từ chối thì phải còn ở lại trang đăng nhập.
          await expectRoute(page, /\/login$/, 'ở lại trang đăng nhập khi bị từ chối', { soft: true });
          if (row.expectedError) {
            await expectVisibleText(login.errorBanner, row.expectedError, 'thông báo lỗi đúng nội dung', { soft: true });
          }
        }

        // P3 (quyết định khi có khai báo) — đối chiếu bộ đếm/khóa thật trong DB.
        if (row.expectedAttempts !== '-') {
          const state = await readAccountState(api, row.email);
          expect(state, `Không tìm thấy user ${row.email} trong DB để kiểm state`).not.toBeNull();
          expectBackendStateSync(state, row, testInfo);
        }
        return;
      }

      // ── mode = lockout / lockout-wait ────────────────────────────────────────────────
      if (row.mode === 'lockout' || row.mode === 'lockout-wait') {
        if (row.mode === 'lockout-wait') test.setTimeout(90_000);

        await registerThrowawayUser(api, { email: row.email, password: row.password });
        cleanup.add(async (client) => {
          const res = await client.get('/api/admin/users');
          if (!res.ok()) return;
          const user = (await res.json()).find((u) => u.email === row.email);
          if (user) await client.delete(`/api/admin/users/${user.id}`);
        });

        await login.goto();

        // Sai mật khẩu row.failCount lần liên tiếp, ghi lại status của LẦN SAI CUỐI CÙNG —
        // đây chính là bằng chứng cho B001 (khóa sớm hơn 1 lần so với thiết kế).
        const failCount = Number(row.failCount);
        let lastFailStatus = null;
        for (let i = 0; i < failCount; i++) {
          const { status } = await login.submitAndCaptureLogin({ email: row.email, password: row.wrongPassword });
          lastFailStatus = status;
        }

        if (row.expectedLastFailStatus !== '-') {
          expect.soft(
            lastFailStatus,
            `${row.tcId}: P5 status · lần sai cuối cùng (thứ ${failCount}) phải trả ${row.expectedLastFailStatus} theo đúng thứ tự xử lý của spec`,
          ).toBe(Number(row.expectedLastFailStatus));
        }

        if (row.mode === 'lockout-wait') {
          await test.step(`Chờ ${row.waitSeconds}s (spec khóa 30s, mốc này phải đã hết hạn)`, async () => {
            await page.waitForTimeout(Number(row.waitSeconds) * 1000);
          });
        }

        if (row.finalAction === 'login-correct') {
          const { status: finalStatus } = await login.submitAndCaptureLogin({ email: row.email, password: row.password });
          const expectedFinalStatus = row.expect === 'accept' ? 200 : 403;
          expect.soft(
            finalStatus,
            `${row.tcId}: P5 status · hành động cuối phải trả ${expectedFinalStatus}`,
          ).toBe(expectedFinalStatus);

          if (row.expect === 'accept') {
            await expectRoute(page, /\/(?!login)/, 'đăng nhập đúng sau khi hết khóa/sau khi sửa sai phải rời trang login');
          } else {
            if (row.expectedError) {
              await expectVisibleText(login.errorBanner, row.expectedError, 'thông báo phải nói rõ lý do (đang khóa), khác câu sai mật khẩu', { soft: true });
            }
            await expectRoute(page, /\/login$/, 'vẫn bị khóa thì phải còn ở lại trang đăng nhập', { soft: true });
          }
        }

        // P3 (quyết định) — đọc state SAU CÙNG (sau toàn bộ chuỗi sai + finalAction nếu có).
        if (row.expectedAttempts !== '-' || row.expectedLocked !== '-') {
          const state = await readAccountState(api, row.email);
          expect(state, `Không tìm thấy user ${row.email} trong DB để kiểm state`).not.toBeNull();
          expectBackendStateSync(state, row, testInfo);
        }
        return;
      }

      throw new Error(`Không nhận diện được mode "${row.mode}" của ${row.tcId}`);
    });
  }
});

/**
 * So state thật { attempts, locked } với kỳ vọng theo spec trong `row`. Tách riêng vì được
 * gọi ở cả nhánh `login` (TC-01, BV-R04 trên tài khoản seed) lẫn nhánh `lockout`.
 */
function expectBackendStateSync(state, row, testInfo) {
  if (row.expectedAttempts !== '-') {
    testInfo.annotations.push({ type: 'DB login_attempts thật', description: String(state.attempts) });
    expect.soft(state.attempts, `${row.tcId}: P3 · login_attempts phải = ${row.expectedAttempts} theo spec R1 (+1/lần)`).toBe(Number(row.expectedAttempts));
  }
  if (row.expectedLocked !== '-') {
    const expectedLocked = row.expectedLocked === 'TRUE';
    testInfo.annotations.push({ type: 'DB locked_until thật', description: state.locked ? 'đã set' : 'null' });
    expect.soft(state.locked, `${row.tcId}: P3 · locked_until ${expectedLocked ? 'phải được SET' : 'phải còn null'} theo spec R2a`).toBe(expectedLocked);
  }
}
