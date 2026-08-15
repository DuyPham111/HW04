// Feature B — FR-09 Mã giảm giá / Coupon (frontend-web /checkout)
//
// Data-driven: mọi test case đọc từ tests/data/feature-b-coupon.json. Trong file này KHÔNG
// có một giá trị test data nào được hard-code (§6).
//
// Kỳ vọng của mỗi test là ĐẶC TẢ FR-09, không phải hành vi hiện tại của SUT. Test Fail vì
// thế là bằng chứng bug, không phải script sai — mỗi Fail đều truy được về B006/B007/B008/B013.
//
// Assertion pattern: P1 (DOM), P3 (đối chiếu UI với body API thật), P4 (số học tiền),
// P5 (HTTP status). Feature B không dùng P2 vì thanh toán thành công KHÔNG đổi URL
// (Checkout.jsx chỉ đổi state `success` rồi render lại trong cùng route).
//
// Vì sao đăng nhập bằng localStorage thay vì qua form: FR-02 khoá tài khoản sau 2 lần sai và
// khoá tới 180 giây (bug B001/B002). Đăng nhập qua UI 18 lần × 3 engine vừa chậm vừa thêm
// một điểm gãy KHÔNG liên quan gì tới FR-09.

import { test, expect, annotateTestCase } from './fixtures/base.js';
import { CheckoutPage } from './pages/checkout.page.js';
import { CartPage } from './pages/cart.page.js';
import { loadJson } from './utils/data-loader.js';
import { expectVisibleTextVi, expectSoftNumber, parseMoney } from './utils/assertions.js';
import { TEST_USER } from './utils/env.js';

// Phần tử đầu file JSON là khối tài liệu (_doc/_mode/_quy_uoc), không phải test case.
const cases = loadJson('feature-b-coupon.json').filter((row) => row.tcId);

/** Lấy JWT qua API cho một tài khoản bất kỳ. */
async function loginViaApi(api, email, password) {
  const res = await api.post('/api/login', { data: { email, password } });
  expect(res.ok(), `Không đăng nhập được ${email} (HTTP ${res.status()})`).toBeTruthy();
  const { token } = await res.json();
  return token;
}

/** Nhét token vào localStorage TRƯỚC khi trang được tải — AuthContext đọc nó lúc khởi tạo. */
async function seedLoginState(page, token) {
  await page.addInitScript((value) => window.localStorage.setItem('token', value), token);
}

/**
 * Chờ AuthContext nạp xong `user` (qua GET /api/users/me). BẮT BUỘC trước khi áp mã: body gửi
 * lên có `user_id: user?.id || null`, nên nếu áp mã trước lúc user kịp nạp thì request đi với
 * user_id = null và rơi nhầm vào nhánh "khách vãng lai" — test sẽ flaky và kết luận sai.
 */
async function waitForUserLoaded(page) {
  await page.locator('header a[href="/profile"]').waitFor({ state: 'visible' });
}

async function registerUser(api, email, password) {
  const res = await api.post('/api/register', {
    data: { name: 'HW04 Coupon Test', email, password },
  });
  expect(res.ok(), `Không đăng ký được user tạm ${email} (HTTP ${res.status()})`).toBeTruthy();
}

async function findCouponId(api, code) {
  const res = await api.get('/api/coupons');
  expect(res.ok(), 'GET /api/coupons phải thành công để tra coupon_id').toBeTruthy();
  const coupon = (await res.json()).find((c) => c.code === code);
  expect(coupon, `Không thấy coupon ${code} trong dữ liệu seed`).toBeTruthy();
  return coupon.id;
}

/** Tiêu trước N lượt dùng coupon, bằng token của CHÍNH user đó (API lấy user_id từ token). */
async function seedCouponUsage(api, couponId, userToken, times) {
  for (let i = 0; i < times; i++) {
    const res = await api.post('/api/coupon-usage', {
      data: { coupon_id: couponId },
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.ok(), `Không seed được lượt dùng coupon thứ ${i + 1}`).toBeTruthy();
  }
}

async function deleteUserByEmail(api, email) {
  const res = await api.get('/api/admin/users');
  if (!res.ok()) return;
  const user = (await res.json()).find((u) => u.email === email);
  if (user) await api.delete(`/api/admin/users/${user.id}`);
}

/**
 * P5 — status. Hỗ trợ số cụ thể, chuỗi '4xx' (đặc tả chỉ đòi "bị từ chối"), hoặc null.
 * Đây là assertion QUYẾT ĐỊNH của feature này nên để hard.
 */
function assertStatus(actual, expected, tcId) {
  if (expected === null || expected === undefined) return;
  if (expected === '4xx') {
    expect(
      actual,
      `${tcId}: P5 · đặc tả đòi request bị TỪ CHỐI (4xx), thực tế server trả ${actual}`,
    ).toBeGreaterThanOrEqual(400);
    expect(actual, `${tcId}: P5 · phải là lỗi phía client (4xx), không phải lỗi server`).toBeLessThan(500);
  } else {
    expect(actual, `${tcId}: P5 · status phải là ${expected} theo đặc tả FR-09`).toBe(expected);
  }
}

test.describe('Feature B — FR-09 Mã giảm giá', () => {
  for (const row of cases) {
    test(`${row.tcId} — ${row.title}`, async ({ page, api, cleanup }, testInfo) => {
      annotateTestCase(testInfo, row);
      if (row.note) testInfo.annotations.push({ type: 'Ghi chú thiết kế', description: row.note });

      const checkout = new CheckoutPage(page);

      // ── Dựng trạng thái đăng nhập ────────────────────────────────────────────────────
      let activeUser = TEST_USER;

      if (row.mode === 'usage-seed') {
        activeUser = { email: row.userEmail, password: row.userPassword };
        await registerUser(api, activeUser.email, activeUser.password);
        cleanup.add((client) => deleteUserByEmail(client, activeUser.email));

        const userToken = await loginViaApi(api, activeUser.email, activeUser.password);
        const couponId = await findCouponId(api, row.couponCode);
        await seedCouponUsage(api, couponId, userToken, row.seedUsage);
        testInfo.annotations.push({
          type: 'Tiền đề đã dựng',
          description: `user mới ${activeUser.email} đã tiêu ${row.seedUsage}/N lượt mã ${row.couponCode}`,
        });
        await seedLoginState(page, userToken);
      } else if (row.requireLogin) {
        const token = await loginViaApi(api, activeUser.email, activeUser.password);
        await seedLoginState(page, token);
      }

      // ── mode = cart-flow: đi luồng mua hàng THẬT ─────────────────────────────────────
      if (row.mode === 'cart-flow') {
        const cart = new CartPage(page);
        await cart.gotoHome();
        await cart.waitForLoggedIn();

        const added = row.entry === 'home'
          ? await cart.addToCartFromHome(row.productId)
          : await cart.addToCartFromDetail(row.productId);

        if (added.neededExtraClick) {
          testInfo.annotations.push({
            type: 'Quan sát bug FR-07',
            description: 'Trang chi tiết nuốt click đầu tiên vào "Thêm vào giỏ hàng" — page object đã bấm bù',
          });
        }

        await cart.openCartViaHeader();
        // P4 — giỏ phải cộng đúng tiền trước khi bàn tới coupon.
        expectSoftNumber(parseMoney(await cart.readSubtotal()), row.expectedCartTotal, `${row.tcId}: tổng tạm tính ở giỏ`);

        await cart.proceedToCheckout();
        await checkout.waitForLoaded();
        // P4 — tổng tiền phải được mang nguyên vẹn sang trang checkout.
        expectSoftNumber(Number(await checkout.readTotalInput()), row.expectedCartTotal, `${row.tcId}: tổng tiền mang sang checkout`);
      } else {
        await checkout.gotoDirect();
        if (row.requireLogin) await waitForUserLoaded(page);
      }

      // ── mode = ui-check: ô tổng tiền không được cho sửa tự do (B013) ─────────────────
      if (row.mode === 'ui-check') {
        const editable = await checkout.isTotalEditable();
        expect.soft(
          editable,
          'P1 DOM · Tổng tiền phải do hệ thống tính từ giỏ hàng, người dùng KHÔNG được sửa (spec FR-09)',
        ).toBe(false);

        if (editable) {
          // Bằng chứng thứ hai: số sửa tay chảy thẳng vào số tiền phải trả, không chỉ là hiển thị.
          const injected = 999999999;
          await checkout.setTotal(injected);
          expect.soft(
            parseMoney(await checkout.grandTotal.textContent()),
            'P1 DOM · số nhập tay không được trở thành số tiền phải thanh toán',
          ).not.toBe(injected);
        }
        return;
      }

      // ── mode = empty-code: nút Áp dụng phải bị vô hiệu hoá ───────────────────────────
      if (row.mode === 'empty-code') {
        await checkout.setTotal(row.total);
        await expect(
          checkout.applyButton,
          `${row.tcId}: mã rỗng thì nút "Áp dụng" phải bị vô hiệu hoá`,
        ).toBeDisabled();
        return;
      }

      // ── Các mode còn lại: đặt tổng tiền (nếu cần) rồi áp mã ──────────────────────────
      if (row.total !== null && row.total !== undefined) {
        await checkout.setTotal(row.total);
      }

      const { called, status, body } = await checkout.applyAndCapture(row.couponCode);

      expect(called, `${row.tcId}: phải có request POST /api/apply-coupon được gửi đi`).toBe(true);
      assertStatus(status, row.expectedStatus, row.tcId);

      // ── Nhánh bị từ chối: kiểm nội dung thông báo ────────────────────────────────────
      if (row.expect === 'reject') {
        if (row.expectedError) {
          await expectVisibleTextVi(
            checkout.errorMessage,
            row.expectedError,
            `${row.tcId}: thông báo lỗi đúng nội dung đặc tả`,
            { soft: true },
          );
        }
        return;
      }

      // ── Nhánh chấp nhận: kiểm số tiền ───────────────────────────────────────────────
      if (row.expectedDiscount !== null && row.expectedDiscount !== undefined) {
        expectSoftNumber(
          parseMoney(await checkout.discountValue.textContent()),
          row.expectedDiscount,
          `${row.tcId}: số tiền được giảm (công thức đặc tả)`,
        );
      }
      if (row.expectedFinal !== null && row.expectedFinal !== undefined) {
        expectSoftNumber(
          parseMoney(await checkout.finalValue.textContent()),
          row.expectedFinal,
          `${row.tcId}: thành tiền sau giảm`,
        );
      }

      // P3 — đối chiếu UI với body API THẬT. Lệch nhau ⇒ bug HIỂN THỊ, khác hẳn với việc
      // bản thân API tính sai. Tách được hai lớp này mới kết luận đúng nguyên nhân.
      if (body && typeof body.discount_amount === 'number') {
        expect.soft(
          parseMoney(await checkout.discountValue.textContent()),
          `${row.tcId}: P3 API · số tiền giảm trên UI phải khớp discount_amount API trả về`,
        ).toBe(body.discount_amount);
        expect.soft(
          parseMoney(await checkout.finalValue.textContent()),
          `${row.tcId}: P3 API · thành tiền trên UI phải khớp final_amount API trả về`,
        ).toBe(body.final_amount);
      }
    });
  }
});
