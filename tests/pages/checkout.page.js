// CheckoutPage — Feature B (FR-09: Mã giảm giá), frontend-web /checkout
//
// Sự thật DOM của trang này (đọc từ Checkout.jsx, không phải suy đoán):
//   · Ô mã: <input type="text" placeholder="Nhập mã giảm giá...">  → neo theo placeholder.
//   · Nút: <button disabled={applyingCoupon || !couponCode.trim()}>Áp dụng</button>
//     → khi ô mã rỗng, nút BỊ disabled. Đây là cách chặn hợp lệ theo đặc tả, không phải bug.
//   · Lỗi: <p class="mt-2 text-red-600 text-sm">{couponError}</p>
//   · Kết quả: khối text-green-700 gồm 3 dòng — "✅ {message}", "Tiết kiệm: <strong>…</strong>",
//     "Thành tiền: <strong>…</strong>". Neo theo NHÃN tiếng Việt trong dòng, không neo theo
//     thứ tự <p>, để thêm/bớt dòng không làm gãy.
//   · Ô tổng tiền: <label>Tổng tiền thanh toán (VND):</label> + <input type="number">
//     → neo theo quan hệ nhãn→ô như Feature A. Ô này NGƯỜI DÙNG SỬA ĐƯỢC — chính là bug B013,
//     và cũng là công cụ để dựng các mốc biên mà không sản phẩm seed nào tạo ra được.
//
// KHÔNG có assertion trong file này.

export class CheckoutPage {
  constructor(page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Xác Nhận Đơn Hàng' });
    this.totalInput = page.locator('label:has-text("Tổng tiền thanh toán") + input');

    this.couponInput = page.getByPlaceholder('Nhập mã giảm giá...');
    this.applyButton = page.getByRole('button', { name: 'Áp dụng' });

    this.errorMessage = page.locator('p.text-red-600');
    this.successMessage = page.locator('p', { hasText: '✅' });
    this.discountValue = page.locator('p', { hasText: 'Tiết kiệm:' }).locator('strong');
    this.finalValue = page.locator('p', { hasText: 'Thành tiền:' }).locator('strong');
    this.grandTotal = page.locator('span', { hasText: 'Tổng thanh toán:' });
  }

  /** Vào thẳng /checkout (giỏ rỗng, editableTotal khởi tạo = 0). */
  async gotoDirect() {
    await this.page.goto('/checkout');
    await this.heading.waitFor();
  }

  /** Chờ trang checkout hiện ra sau khi điều hướng SPA từ giỏ hàng. */
  async waitForLoaded() {
    await this.heading.waitFor();
  }

  /**
   * Điền ô tổng tiền. Truyền số nguyên dạng chuỗi thuần — ô là type="number" nên chuỗi có
   * dấu phân cách nghìn ("300.000") sẽ bị trình duyệt từ chối và để ô rỗng.
   */
  async setTotal(value) {
    await this.totalInput.fill(String(value));
  }

  async readTotalInput() {
    return this.totalInput.inputValue();
  }

  /** Ô tổng tiền có cho sửa tự do không — dữ liệu thô cho TC ui-check (B013). */
  async isTotalEditable() {
    return this.totalInput.isEditable();
  }

  async fillCoupon(code) {
    await this.couponInput.fill(code);
  }

  /**
   * Điền mã + bấm Áp dụng, đồng thời theo dõi POST /api/apply-coupon.
   * Trả { called, status, body } — `body` dùng cho assertion P3: đối chiếu con số UI hiển thị
   * với con số API thật sự trả về. Hai nguồn lệch nhau là một lớp bug khác hẳn (bug hiển thị)
   * so với việc bản thân API tính sai.
   */
  async applyAndCapture(code, { timeout = 5000 } = {}) {
    const pending = this.page
      .waitForResponse(
        (res) => res.url().includes('/api/apply-coupon') && res.request().method() === 'POST',
        { timeout },
      )
      .catch(() => null);

    await this.fillCoupon(code);
    await this.applyButton.click();

    const res = await pending;
    if (!res) return { called: false, status: null, body: null };

    let body = null;
    try { body = await res.json(); } catch { /* không phải JSON */ }
    return { called: true, status: res.status(), body };
  }

  async errorText() {
    if ((await this.errorMessage.count()) === 0) return '';
    return (await this.errorMessage.first().textContent())?.trim() ?? '';
  }
}
