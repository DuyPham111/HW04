// assertions.js — NĂM assertion pattern dùng xuyên suốt suite.
//
// §6 yêu cầu "at least three distinct assertion patterns". Năm pattern dưới đây khác nhau
// về BẢN CHẤT thứ chúng kiểm, không chỉ khác cú pháp:
//
//   P1 — DOM / web-first assertion .... trạng thái nhìn thấy trên UI (text, hiện/ẩn, số dòng).
//        Tự động retry đến khi hết timeout → chịu được render bất đồng bộ của React.
//   P2 — Navigation / URL assertion ... hệ thống có điều hướng đúng nơi đặc tả nói không.
//   P3 — Backend-state assertion ...... đối chiếu UI với STATE THẬT trong DB qua REST API.
//        Đây là pattern bắt được lớp bug mà UI có thể che mất (ví dụ: form báo lỗi nhưng
//        API vẫn tạo user; hoặc UI hiện "đã đổi" nhưng DB không đổi — và ngược lại).
//   P4 — Soft numeric assertion ....... phép tính tiền / bộ đếm / thời gian. expect.soft
//        để một dòng sai không chặn việc thu thập các con số còn lại trong cùng test.
//   P5 — Network / HTTP-status assertion .. request có thật sự được gửi lên server không,
//        và server trả mã gì. Đây là pattern DUY NHẤT phân biệt được "bị chặn ở client"
//        với "bị chặn ở server" — hai cơ chế khác hẳn nhau dù UI hiển thị y hệt nhau.
//
// Mỗi helper gắn một test.step, nên HTML report hiện rõ pattern nào đã chạy cho từng test.
//
// THAM SỐ `soft`: các helper P1/P2/P3 nhận `{ soft: true }`.
//   Quy tắc dùng trong suite này: assertion **quyết định** của mỗi test để hard, các assertion
//   **bổ trợ** để soft. Lý do: nếu tất cả đều hard thì test dừng ở assertion đầu tiên sai và
//   report chỉ nói được một nửa câu chuyện — ví dụ nếu assertion URL hard fail trước, ta sẽ
//   không bao giờ thấy được dòng "DB đã phát sinh tài khoản", mà đó mới là bằng chứng cần
//   dán vào bug report.

import { expect, test } from '@playwright/test';

const E = (soft) => (soft ? expect.soft : expect);

/** P1 — DOM / web-first: locator hiện ra và chứa đoạn text mong đợi. */
export async function expectVisibleText(locator, expectedSubstring, label = 'nội dung hiển thị', { soft = false } = {}) {
  await test.step(`P1 DOM · ${label}`, async () => {
    await E(soft)(locator).toBeVisible();
    if (expectedSubstring) await E(soft)(locator).toContainText(expectedSubstring);
  });
}

/**
 * Chuẩn hoá chuỗi tiếng Việt về dạng không dấu, chữ thường — để so khớp thông báo mà không
 * phụ thuộc cách gõ dấu. Cần thiết vì file dữ liệu ghi `expectedError` ở dạng không dấu
 * ("toi thieu", "het han"): chuỗi không dấu sống sót qua mọi vòng chuyển đổi bảng mã
 * (Excel, CSV, clipboard), còn chuỗi có dấu thì không.
 */
export function normalizeVi(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/** P1 — DOM: text của locator chứa chuỗi con, so khớp KHÔNG phụ thuộc dấu tiếng Việt. */
export async function expectVisibleTextVi(locator, expectedSubstring, label = 'nội dung hiển thị', { soft = false } = {}) {
  await test.step(`P1 DOM · ${label}`, async () => {
    await E(soft)(locator).toBeVisible();
    if (expectedSubstring) {
      const actual = await locator.textContent();
      E(soft)(
        normalizeVi(actual).includes(normalizeVi(expectedSubstring)),
        `Thông báo phải chứa "${expectedSubstring}" (bỏ dấu) — thực tế: "${(actual ?? '').trim()}"`,
      ).toBe(true);
    }
  });
}

/** P1 — DOM: locator KHÔNG hiển thị (dùng cho "không được báo lỗi khi dữ liệu hợp lệ"). */
export async function expectHidden(locator, label = 'phần tử không hiển thị', { soft = false } = {}) {
  await test.step(`P1 DOM · ${label}`, async () => {
    await E(soft)(locator).toBeHidden();
  });
}

/** P1 — DOM: số dòng của một danh sách/bảng. */
export async function expectCount(locator, expected, label = 'số dòng', { soft = false } = {}) {
  await test.step(`P1 DOM · ${label} = ${expected}`, async () => {
    await E(soft)(locator).toHaveCount(expected);
  });
}

/** P2 — Navigation: URL hiện tại khớp pattern (string, RegExp, hoặc glob). */
export async function expectRoute(page, pattern, label = 'điều hướng', { soft = false } = {}) {
  await test.step(`P2 URL · ${label} → ${pattern}`, async () => {
    await E(soft)(page).toHaveURL(pattern);
  });
}

/**
 * P3 — Backend state: gọi REST API và kiểm state thật.
 * @param {import('@playwright/test').APIRequestContext} api
 * @param {{ path: string, expectStatus?: number, predicate?: (body:any)=>boolean, label: string, soft?: boolean }} opts
 */
export async function expectBackendState(api, { path, expectStatus = 200, predicate, label, soft = false }) {
  await test.step(`P3 API · ${label}`, async () => {
    const res = await api.get(path);
    E(soft)(res.status(), `GET ${path} phải trả ${expectStatus}`).toBe(expectStatus);
    if (predicate) {
      const body = await res.json();
      E(soft)(predicate(body), `State backend không khớp: ${label}`).toBe(true);
    }
  });
}

/** P4 — Soft numeric: so số tiền/số lượng/thời gian, không chặn assertion sau trong cùng test. */
export function expectSoftNumber(actual, expected, label = 'giá trị số') {
  expect.soft(actual, `P4 số học · ${label}`).toBe(expected);
}

/**
 * P5 — Network / HTTP-status: chạy `action()` trong lúc theo dõi request khớp `urlPart`.
 * Trả { called, status, body }. Hết timeout mà chưa thấy request nào ⇒ called:false, nghĩa
 * là client đã chặn trước khi gọi API (validate form / HTML5 required) — khác hẳn với việc
 * server nhận request rồi mới từ chối. Phân biệt đúng hai cơ chế này là điều kiện để không
 * biến một test "reject" thành Pass giả (bị chặn nhưng sai tầng).
 */
export async function captureResponse(page, urlPart, action, { method, timeout = 5000 } = {}) {
  const pending = page
    .waitForResponse(
      (res) => res.url().includes(urlPart) && (!method || res.request().method() === method),
      { timeout },
    )
    .catch(() => null);

  await action();
  const res = await pending;

  if (!res) return { called: false, status: null, body: null };

  let body = null;
  try { body = await res.json(); } catch { /* response không phải JSON — bỏ qua */ }
  return { called: true, status: res.status(), body };
}

/**
 * Đọc số tiền hiển thị → số nguyên (CÓ DẤU). Bỏ mọi ký tự không phải chữ số để lấy phần trị
 * tuyệt đối, vì dấu phân cách nghìn khác nhau giữa các browser (`toLocaleString()` không
 * truyền locale trong SUT: Chrome cho "1,234,567", Firefox/WebKit có thể cho "1.234.567").
 *
 * PHẢI giữ dấu âm: bug công thức percent của FR-09 (`Math.floor(total * (1 - discount_value))`
 * với `discount_value = 10`) sinh ra số tiền giảm ÂM, hiển thị "-54.000.000 ₫". Nếu hàm này
 * nuốt dấu trừ thì bug report sẽ ghi sai trị số thực tế (dương thay vì âm) — vẫn Fail nhưng
 * bằng chứng bị bóp méo. Số âm chính là dấu hiệu đặc trưng nhất của bug này.
 *
 * Trả NaN khi ô hiển thị "NaN ₫" — một dạng bug kiểu dữ liệu khác của SUT, phải nhìn thấy
 * chứ không được im lặng quy về 0.
 */
export function parseMoney(text) {
  const s = String(text ?? '');
  const firstDigit = s.search(/\d/);
  if (firstDigit === -1) return NaN;

  const value = Number(s.replace(/\D/g, ''));
  // Dấu trừ phải nằm ngay trước cụm chữ số (cho phép khoảng trắng ở giữa), để không nhầm
  // với dấu gạch ngang dùng làm ký tự trang trí ở chỗ khác trong chuỗi.
  const negative = /-\s*$/.test(s.slice(0, firstDigit));
  return negative ? -value : value;
}
