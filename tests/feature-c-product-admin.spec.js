// Feature C — FR-15 Quản lý Sản phẩm (Admin CRUD), frontend-admin :5174
//
// Data-driven: mọi test case đọc từ tests/data/feature-c-product-admin.csv. Trong file này
// KHÔNG có một giá trị test data nào được hard-code (§6).
//
// Kỳ vọng của mỗi test là ĐẶC TẢ (README.md của SUT: FR-15 §CRUD sản phẩm, FR-12 §kiểm soát
// truy cập), không phải hành vi hiện tại. Test Fail vì thế là bằng chứng bug.
//
// Assertion pattern: P1 (DOM), P3 (backend-state qua REST — pattern QUYẾT ĐỊNH của feature
// này), P4 (số học — độ dài chuỗi lưu trong DB). KHÔNG dùng P2 (admin là SPA một route, tab
// không đổi URL) — bù bằng P3 cho mọi TC.
//
// mode = security là phần quan trọng nhất: gọi thẳng /api/products bằng context KHÔNG có
// Authorization header, bỏ qua hoàn toàn UI — vì bản chất của bug (thiếu authenticateToken)
// chỉ lộ ra khi bỏ qua UI, và đây chính là lý do HW02 (chỉ test qua UI) không tự động hóa
// được TC này.

import { test, expect, annotateTestCase } from './fixtures/base.js';
import { AdminProductsPage } from './pages/admin-products.page.js';
import { loadCsv } from './utils/data-loader.js';
import { expectBackendState } from './utils/assertions.js';
import { API_URL, ADMIN_USER } from './utils/env.js';

const cases = loadCsv('feature-c-product-admin.csv');

/** Đếm sản phẩm trùng tên trong DB — nền tảng của assertion P3 cho nhánh create. */
async function countProductsByName(api, name) {
  const res = await api.get('/api/products');
  expect(res.ok(), 'GET /api/products phải thành công để kiểm state DB').toBeTruthy();
  return (await res.json()).filter((p) => p.name === name).length;
}

async function findProductByName(api, name) {
  const res = await api.get('/api/products');
  expect(res.ok()).toBeTruthy();
  return (await res.json()).find((p) => p.name === name) ?? null;
}

/** Tạo sản phẩm tiền đề qua API (CÓ token) — dùng cho setup của mode edit/delete/SEC-02/03. */
async function createBaselineProduct(api, { name, price = 1000000, category_id = 3 }) {
  const res = await api.post('/api/products', { data: { name, price, category_id } });
  expect(res.ok(), `Không tạo được sản phẩm tiền đề ${name} (HTTP ${res.status()})`).toBeTruthy();
  const { id } = await res.json();
  return id;
}

async function deleteProductById(api, id) {
  if (!id) return;
  await api.delete(`/api/products/${id}`).catch(() => {});
}

test.describe('Feature C — FR-15 Quản lý Sản phẩm (admin)', () => {
  for (const row of cases) {
    test(`${row.tcId} — ${row.title}`, async ({ page, api, cleanup, playwright }, testInfo) => {
      annotateTestCase(testInfo, row);
      if (row.note) testInfo.annotations.push({ type: 'Ghi chú thiết kế', description: row.note });

      // ── mode = security: bỏ qua UI, gọi thẳng API ────────────────────────────────────
      if (row.mode === 'security') {
        // Hai nhóm KHÁC NHAU về biến đang kiểm, dù cùng mode:
        //   · SEC-01/02/03: kiểm FR-12 (kiểm soát truy cập) — request KHÔNG token.
        //   · BV-R03: kiểm ràng buộc category_id (FK) — PHẢI dùng token HỢP LỆ, nếu không
        //     cũng sẽ bị chặn bởi chính bug FR-12 và không còn cô lập được biến cần kiểm
        //     (single-fault: chỉ category_id sai, mọi thứ khác phải đúng).
        const isAuthBypassTest = row.tcId.startsWith('FR15-SEC-');

        if (isAuthBypassTest) {
          // Hậu quả không giới hạn ở 1 request mà là toàn bộ catalog sản phẩm bị phơi ra cho
          // bất kỳ ai, không cần đăng nhập — đánh giá Critical, không cùng mức với các bug
          // nghiệp vụ B009/B010/B014/B015. Sinh viên đã xác nhận mức độ này (§AI-12b) trước
          // khi đưa vào bug-report.md ở docs/07.
          testInfo.annotations.push({
            type: 'Mức độ nghiêm trọng',
            description: 'Critical — broken access control, ảnh hưởng toàn bộ catalog sản phẩm, không cần đăng nhập',
          });
        }

        const noAuthApi = isAuthBypassTest
          ? await playwright.request.newContext({ baseURL: API_URL })
          : null;
        const client = noAuthApi ?? api; // BV-R03 dùng `api` — context ĐÃ có Bearer token admin.

        let targetId = null;
        if (row.method === 'PUT' || row.method === 'DELETE') {
          targetId = await createBaselineProduct(api, { name: `HW04-SecTarget-${Date.now()}` });
          if (row.method !== 'DELETE') cleanup.add((c) => deleteProductById(c, targetId));
        }

        let res;
        if (row.method === 'POST') {
          res = await client.post('/api/products', {
            data: { name: row.productName, price: Number(row.price), category_id: 9999 },
          });
          if (res.status() >= 200 && res.status() < 300) {
            // Bug xác nhận: sản phẩm bị tạo dù dữ liệu sai. Phải dọn để không để lại rác.
            const body = await res.json();
            cleanup.add((c) => deleteProductById(c, body.id));
          }
        } else if (row.method === 'PUT') {
          res = await client.put(`/api/products/${targetId}`, {
            data: { name: 'HACKED-NO-TOKEN', price: 1, category_id: 3 },
          });
        } else if (row.method === 'DELETE') {
          res = await client.delete(`/api/products/${targetId}`);
          if (!(res.status() >= 200 && res.status() < 300)) {
            // Nếu server ĐÚNG đặc tả (từ chối), sản phẩm vẫn còn — phải tự dọn.
            cleanup.add((c) => deleteProductById(c, targetId));
          }
        }

        if (noAuthApi) await noAuthApi.dispose();

        testInfo.annotations.push({ type: 'HTTP status thật', description: String(res.status()) });

        // Bằng chứng hình ảnh: nhánh này là test THUẦN API, `page` chưa từng điều hướng đi
        // đâu — ảnh chụp lúc Fail mặc định là trang trắng (about:blank), vô nghĩa làm bằng
        // chứng. Điều hướng `page` tới đúng dữ liệu vừa bị tác động để ảnh chụp cho THẤY
        // hậu quả thật (sản phẩm mới/đã sửa/đã xoá) — không ảnh hưởng tới assertion vì việc
        // điều hướng xảy ra SAU khi đã đọc xong `res.status()`.
        await page.goto(`${API_URL}/api/products`).catch(() => {});

        if (isAuthBypassTest) {
          // P5 (quyết định) — theo FR-12, request KHÔNG token phải bị từ chối (401/403).
          expect(
            res.status(),
            `${row.tcId}: FR-12 đòi ${row.method} /api/products không token phải trả 401/403, thực tế ${res.status()}`,
          ).toBeGreaterThanOrEqual(400);
          expect(res.status(), `${row.tcId}: phải là lỗi xác thực (4xx), không phải lỗi server (5xx)`).toBeLessThan(500);
        } else {
          // P5 (quyết định) — category_id không tồn tại, spec đòi "phải chọn từ danh sách có
          // sẵn" nên server phải từ chối vì vi phạm ràng buộc FK, bất kể token hợp lệ hay không.
          expect(
            res.status(),
            `${row.tcId}: category_id=9999 không tồn tại, spec đòi từ chối (4xx), thực tế ${res.status()}`,
          ).toBeGreaterThanOrEqual(400);
          expect(res.status(), `${row.tcId}: phải là lỗi client (4xx), không phải lỗi server (5xx)`).toBeLessThan(500);
        }
        return;
      }

      // ── Các mode còn lại đều cần đăng nhập admin qua UI ──────────────────────────────
      const adminPage = new AdminProductsPage(page);
      const adminToken = await test.step('Lấy token admin', async () => {
        const res = await api.post('/api/login', { data: ADMIN_USER });
        return (await res.json()).token;
      });
      await adminPage.loginViaStorage(page.context(), adminToken);
      await adminPage.gotoProductsTab();

      // ── mode = create ─────────────────────────────────────────────────────────────
      if (row.mode === 'create') {
        // BV-R02: kiểm trình duyệt chặn ký tự chữ trong ô số — không submit, không có tên SP.
        if (row.tcId === 'FR15-BV-R02') {
          const value = await adminPage.typeIntoPriceAndReadValue(String(row.price));
          expect.soft(value, 'P1 DOM · ô giá type="number" không được nhận ký tự chữ').toBe('');
          return;
        }

        const before = await countProductsByName(api, row.productName);
        cleanup.add(async (client) => {
          const p = await findProductByName(client, row.productName);
          if (p) await deleteProductById(client, p.id);
        });

        const { called, status } = await adminPage.saveAndCapture(row);

        if (row.rejectVia === 'client') {
          expect.soft(called, `${row.tcId}: form phải chặn ngay ở client (thuộc tính required), không được gọi API`).toBe(false);
        } else if (row.expect === 'reject' && row.rejectVia === 'server') {
          expect.soft(called, `${row.tcId}: dữ liệu này phải đi tới server để server từ chối`).toBe(true);
        }

        // P3 (quyết định) — đối chiếu DB thật.
        if (row.expect === 'accept') {
          await expectBackendState(api, {
            path: '/api/products',
            label: `DB có đúng 1 sản phẩm tên "${row.productName.slice(0, 30)}…"`,
            predicate: (products) => products.filter((p) => p.name === row.productName).length === before + 1,
          });
          // P4 — độ dài tên lưu trong DB, TC biên 255/256 quyết định ở đây.
          if (row.tcId === 'FR15-BV-04' || row.tcId === 'FR15-BV-05') {
            const saved = await findProductByName(api, row.productName);
            expect.soft(saved?.name?.length, `${row.tcId}: độ dài tên lưu trong DB`).toBe(row.productName.length);
          }
        } else {
          await expectBackendState(api, {
            path: '/api/products',
            label: `DB không phát sinh sản phẩm tên "${row.productName || '(rỗng)'}"`,
            predicate: (products) => products.filter((p) => p.name === row.productName).length === before,
          });
        }
        return;
      }

      // ── mode = edit: sửa 1 sản phẩm, kiểm sản phẩm KHÁC không bị đụng ────────────────
      if (row.mode === 'edit') {
        const targetName = row.productName;
        const otherName = `${row.productName}-KHONGDOI`;
        const targetId = await createBaselineProduct(api, { name: targetName });
        const otherId = await createBaselineProduct(api, { name: otherName });
        cleanup.add((client) => deleteProductById(client, targetId));
        cleanup.add((client) => deleteProductById(client, otherId));

        await adminPage.gotoProductsTab(); // nạp lại danh sách để thấy 2 sản phẩm vừa tạo
        await adminPage.editButtonInRow(targetName).click();
        await adminPage.nameInput.fill(row.editNewName);
        await adminPage.save();
        await page.waitForTimeout(500); // chờ setProducts(...) chạy xong (không có response để chờ — đây là bug B014: PUT xong không fetchData lại)

        // P1 (quyết định) — sản phẩm KHÁC trên UI phải giữ nguyên tên cũ.
        expect.soft(
          await adminPage.rowByName(otherName).count(),
          `${row.tcId}: P1 DOM · sản phẩm "${otherName.slice(0, 30)}…" trên UI phải KHÔNG đổi tên`,
        ).toBeGreaterThan(0);

        // P3 (quyết định) — trong DB, đúng 1 bản ghi đổi tên, sản phẩm kia giữ nguyên.
        await expectBackendState(api, {
          path: '/api/products',
          label: 'DB: sản phẩm kia giữ nguyên tên',
          predicate: (products) => products.some((p) => p.id === otherId && p.name === otherName),
        });
        await expectBackendState(api, {
          path: '/api/products',
          label: 'DB: sản phẩm mục tiêu đã đổi tên',
          predicate: (products) => products.some((p) => p.id === targetId && p.name === row.editNewName),
        });
        return;
      }

      // ── mode = delete: xóa hợp lệ (có token) làm đối chứng với 3 TC SEC ─────────────
      if (row.mode === 'delete') {
        const id = await createBaselineProduct(api, { name: row.productName });
        cleanup.add((client) => deleteProductById(client, id)); // idempotent nếu đã xóa

        await adminPage.gotoProductsTab();
        const { dialogSeen } = await adminPage.clickDeleteAndCaptureDialog(row.productName);
        testInfo.annotations.push({
          type: 'Quan sát UX (không phải bug)',
          description: `dialogSeen=${dialogSeen} — README.md không yêu cầu xác nhận cho admin (chỉ yêu cầu ở giỏ hàng FR-07)`,
        });

        await expectBackendState(api, {
          path: '/api/products',
          label: `DB không còn sản phẩm "${row.productName.slice(0, 30)}…"`,
          predicate: (products) => !products.some((p) => p.id === id),
        });
        return;
      }

      throw new Error(`Không nhận diện được mode "${row.mode}" của ${row.tcId}`);
    });
  }
});
