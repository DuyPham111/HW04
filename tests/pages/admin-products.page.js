// AdminProductsPage — Feature C (FR-15: Quản lý sản phẩm), frontend-admin :5174, tab "Sản phẩm"
//
// Sự thật DOM (đọc từ App.jsx, không phải suy đoán):
//   · Tab điều hướng bằng <li onClick={...}>, KHÔNG phải <button> hay <a> — activeTab là React
//     state thuần, URL không đổi khi chuyển tab.
//   · Form: input "Tên sản phẩm" CÓ `required`; input "Giá tiền" (type=number) KHÔNG có
//     required — khác biệt này quyết định TC nào bị chặn ở client, TC nào phải đi tới server.
//   · Không có id/name/data-testid nào — neo theo placeholder và vai trò.
//   · Bảng sản phẩm: cột Ảnh/Tên SP/Giá/Hành động, mỗi dòng có nút "Sửa" và "Xóa".
//   · deleteProduct() gọi thẳng axios.delete, KHÔNG có window.confirm nào — nhưng đây không
//     phải bug vì README.md không yêu cầu dialog xác nhận cho admin (chỉ yêu cầu ở giỏ hàng,
//     mục FR-07).
//
// KHÔNG có assertion trong file này.

import { ADMIN_URL } from '../utils/env.js';

export class AdminProductsPage {
  constructor(page) {
    this.page = page;

    this.productsTabLink = page.getByText('Sản phẩm', { exact: true });
    this.formHeading = page.getByRole('heading', { name: /Thêm sản phẩm mới|Sửa sản phẩm/ });

    this.nameInput = page.getByPlaceholder('Tên sản phẩm');
    this.priceInput = page.getByPlaceholder('Giá tiền');
    this.imageInput = page.getByPlaceholder('URL Ảnh');
    this.descriptionInput = page.getByPlaceholder('Mô tả');
    this.categorySelect = page.locator('form select');

    this.saveButton = page.getByRole('button', { name: 'Lưu sản phẩm' });
    this.cancelEditButton = page.getByRole('button', { name: 'Hủy sửa' });

    this.rows = page.locator('tbody tr');
  }

  /** Đăng nhập admin bằng cách nhét token vào localStorage — TRƯỚC khi trang tải lần đầu. */
  async loginViaStorage(context, token) {
    await context.addInitScript((t) => window.localStorage.setItem('adminToken', t), token);
  }

  /**
   * `page.goto('/')` sẽ dùng `baseURL` của config (trỏ vào web :5173, phục vụ Feature A/B),
   * KHÔNG phải trang admin — phải điều hướng bằng URL TUYỆT ĐỐI tới ADMIN_URL (:5174).
   */
  async gotoProductsTab() {
    await this.page.goto(ADMIN_URL);
    await this.productsTabLink.click();
    await this.saveButton.waitFor();
  }

  rowByName(name) {
    return this.rows.filter({ hasText: name });
  }

  editButtonInRow(name) {
    return this.rowByName(name).getByRole('button', { name: 'Sửa' });
  }

  deleteButtonInRow(name) {
    return this.rowByName(name).getByRole('button', { name: 'Xóa' });
  }

  /**
   * Điền form. Nhận thẳng một dòng `row` từ CSV — tên cột dữ liệu là `productName` (không
   * phải `name`, để tránh đụng với các thuộc tính "name" khác nếu có trong pipeline test).
   * `categoryName` là nhãn hiển thị trong <select>, ví dụ "Phụ kiện".
   */
  async fillProduct({ productName, price, imageUrl, description, categoryName }) {
    if (productName !== undefined) await this.nameInput.fill(productName);
    if (price !== undefined) await this.priceInput.fill(String(price));
    if (imageUrl !== undefined && imageUrl !== '-') await this.imageInput.fill(imageUrl);
    if (description !== undefined && description !== '-') await this.descriptionInput.fill(description);
    if (categoryName) await this.categorySelect.selectOption({ label: categoryName });
  }

  async save() {
    await this.saveButton.click();
  }

  /**
   * Điền + Lưu, theo dõi POST/PUT /api/products. Trả { called, method, status }.
   * `called:false` nghĩa là client đã chặn (ô "Tên sản phẩm" có `required`).
   */
  async saveAndCapture(row, { timeout = 5000 } = {}) {
    const pending = this.page
      .waitForResponse(
        (res) => res.url().includes('/api/products') && ['POST', 'PUT'].includes(res.request().method()),
        { timeout },
      )
      .catch(() => null);

    await this.fillProduct(row);
    await this.save();

    const res = await pending;
    if (!res) return { called: false, method: null, status: null };
    return { called: true, method: res.request().method(), status: res.status() };
  }

  /**
   * Bấm "Xóa" trên đúng dòng của `name`, theo dõi có dialog native nào bật lên không.
   * Đăng ký listener TRƯỚC khi click — dialog native không nằm trong DOM nên không có
   * web-first assertion nào retry hộ; đăng ký sau khi click là bắt trượt kinh điển.
   */
  async clickDeleteAndCaptureDialog(name, { accept = true } = {}) {
    let dialogSeen = false;
    let message = '';
    const handler = async (dialog) => {
      dialogSeen = true;
      message = dialog.message();
      if (accept) await dialog.accept(); else await dialog.dismiss();
    };
    this.page.on('dialog', handler);

    const pending = this.page
      .waitForResponse((res) => res.url().includes('/api/products') && res.request().method() === 'DELETE', { timeout: 5000 })
      .catch(() => null);

    await this.deleteButtonInRow(name).click();
    await pending;
    await this.page.waitForTimeout(300); // dialog (nếu có) đã kịp bật lên trong khoảng này

    this.page.off('dialog', handler);
    return { dialogSeen, message };
  }

  /** Ô giá là type="number" — gõ chữ vào để kiểm trình duyệt có chặn không, không submit. */
  async typeIntoPriceAndReadValue(text) {
    await this.priceInput.fill('');
    await this.priceInput.pressSequentially(text);
    return this.priceInput.inputValue();
  }
}
