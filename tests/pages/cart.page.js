// CartPage — luồng mua hàng thật của frontend-web: trang chủ → (chi tiết) → giỏ → checkout.
//
// RÀNG BUỘC SỐNG CÒN: giỏ hàng nằm trong `CartContext` — React state THUẦN, không localStorage.
// Mọi `page.goto()` giữa chừng đều tạo một lần tải trang mới và XOÁ SẠCH giỏ. Vì vậy mọi bước
// điều hướng trong file này đều BẤM LINK (điều hướng SPA), chỉ `gotoHome()` mới được `goto()`.
//
// Hai đường thêm vào giỏ, cố ý dùng cả hai để suite phủ hết:
//   · Trang chủ  — <a href="/product/{id}">Xem chi tiết</a> + <button>Thêm vào giỏ</button> là
//     hai phần tử LIỀN KỀ trong cùng thẻ div của sản phẩm → selector `a[href="..."] + button`
//     vừa chính xác vừa bền, không cần đếm thứ tự thẻ. Nút này chạy ngay từ click đầu.
//   · Trang chi tiết — nút "Thêm vào giỏ hàng" NUỐT CLICK ĐẦU TIÊN (`clickCount === 0 → return`
//     trong ProductDetail.jsx). Đây là bug của FR-07, không phải FR-09. `addToCartFromDetail`
//     xử lý bằng cách CHỜ XÁC NHẬN rồi mới click bù — không hard-code "click 2 lần", để khi
//     bug được sửa thì hàm vẫn đúng (không thêm nhầm 2 sản phẩm) và vẫn báo lại sự thật qua
//     giá trị trả về `neededExtraClick`.
//
// KHÔNG có assertion trong file này.

export class CartPage {
  constructor(page) {
    this.page = page;

    this.headerCartLink = page.locator('header a[href="/cart"]');
    this.headerProfileLink = page.locator('header a[href="/profile"]');

    this.cartHeading = page.getByRole('heading', { name: 'Giỏ Hàng' });
    this.emptyCartHeading = page.getByRole('heading', { name: 'Giỏ hàng của bạn đang trống' });
    this.rows = page.locator('tbody tr');
    this.subtotal = page.locator('div', { hasText: 'Tổng tạm tính:' }).locator('span').last();
    this.checkoutButton = page.getByRole('button', { name: 'Tiến hành thanh toán' });
  }

  async gotoHome() {
    await this.page.goto('/');
    await this.page.getByRole('heading', { name: 'Danh sách sản phẩm' }).waitFor();
  }

  /** Chờ AuthContext nạp xong user — header chỉ hiện link /profile khi `user` đã có. */
  async waitForLoggedIn() {
    await this.headerProfileLink.waitFor({ state: 'visible' });
  }

  /** Thêm vào giỏ từ TRANG CHỦ (1 click, không dính bug nuốt click). */
  async addToCartFromHome(productId) {
    await this.page.locator(`a[href="/product/${productId}"] + button`).click();
    return { neededExtraClick: false };
  }

  /**
   * Thêm vào giỏ từ TRANG CHI TIẾT. Điều hướng bằng cách bấm link (SPA) để không mất giỏ.
   * Trả `neededExtraClick: true` khi phải bấm bù vì click đầu bị nuốt — spec ghi giá trị này
   * vào annotation để bug FR-07 không bị page object che mất.
   */
  async addToCartFromDetail(productId) {
    await this.page.locator(`a[href="/product/${productId}"]`).first().click();

    const addButton = this.page.getByRole('button', { name: 'Thêm vào giỏ hàng' });
    const addedButton = this.page.getByRole('button', { name: 'Đã thêm' });

    await addButton.waitFor();
    await addButton.click();

    const confirmed = await addedButton
      .waitFor({ state: 'visible', timeout: 1500 })
      .then(() => true)
      .catch(() => false);

    if (!confirmed) {
      await addButton.click();
      await addedButton.waitFor({ state: 'visible', timeout: 3000 });
    }
    return { neededExtraClick: !confirmed };
  }

  /** Mở giỏ bằng link trên header (SPA — giữ nguyên state giỏ). */
  async openCartViaHeader() {
    await this.headerCartLink.click();
    await this.cartHeading.waitFor();
  }

  async readSubtotal() {
    return (await this.subtotal.textContent())?.trim() ?? '';
  }

  /** Bấm "Tiến hành thanh toán". Yêu cầu đã đăng nhập, nếu không SUT bật alert rồi về /login. */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
