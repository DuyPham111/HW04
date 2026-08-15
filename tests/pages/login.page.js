// LoginPage — Feature A (FR-02: Đăng nhập & Khóa tài khoản), frontend-web /login
//
// Vì sao selector viết như dưới đây:
//   · Form của SUT không có `id`, `name`, `aria-label` hay `data-testid` nào, và <label>
//     KHÔNG có `htmlFor` → `getByLabel()` không dùng được.
//   · Class Tailwind (`w-full border p-2 rounded`) giống nhau ở cả hai input → chọn theo
//     class là selector dễ vỡ nhất.
//   · Không có `role="alert"` hay aria-live nào để bám cho banner lỗi.
// → Neo theo quan hệ DOM label→input: `label:text-is("...") + input`. Selector này bám vào
//   nhãn NGƯỜI DÙNG đọc được, nên vẫn đúng khi lập trình viên đổi class hay đổi thứ tự trường.
//   Nhãn hiện tại của SUT là "Username" (sai theo spec R21 đòi "Email") — banner lỗi B012 —
//   nên chính selector này vừa hoạt động vừa LÀ bằng chứng cho TC ui-check FR02-DT-10.

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h2');

    this.emailInput = page.locator('label:text-is("Username") + input');
    this.passwordInput = page.locator('label:text-is("Mật khẩu") + input');

    this.submitButton = page.getByRole('button', { name: 'Sign In' });

    // Banner lỗi: <div class="bg-red-100 ..."> render SAU form, tức là nằm DƯỚI nút submit —
    // ngược với FR-22 (lỗi phải nằm TRÊN nút submit). Không có role="alert" để bám, nên đây
    // là selector yếu nhất của suite — nêu rõ trong gap analysis.
    this.errorBanner = page.locator('div.bg-red-100');
  }

  async goto() {
    await this.page.goto('/login');
    await this.heading.waitFor();
  }

  async fill({ email, password }) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async errorText() {
    if ((await this.errorBanner.count()) === 0) return '';
    return (await this.errorBanner.first().textContent())?.trim() ?? '';
  }

  /** Sự thật DOM cho TC ui-check FR02-DT-09 (spec đòi type="password"). */
  async passwordInputType() {
    return this.passwordInput.getAttribute('type');
  }

  /** Sự thật DOM cho phần "email type" của spec R5. */
  async emailInputType() {
    return this.emailInput.getAttribute('type');
  }

  /**
   * Điền + submit, đồng thời theo dõi POST /api/login. Trả { called, status, body }.
   * Dùng để phân biệt hai cơ chế chặn hoàn toàn khác nhau: client (HTML5 required/validate,
   * request KHÔNG BAO GIỜ được gửi) và server (request được gửi, server trả 4xx). Ranh giới
   * này quyết định bug thuộc frontend hay backend, nên phải ĐO bằng network, không suy từ UI.
   */
  async submitAndCaptureLogin({ email, password }, { timeout = 5000 } = {}) {
    const pending = this.page
      .waitForResponse(
        (res) => res.url().includes('/api/login') && res.request().method() === 'POST',
        { timeout },
      )
      .catch(() => null);

    await this.fill({ email, password });
    await this.submit();

    const res = await pending;
    if (!res) return { called: false, status: null, body: null };

    let body = null;
    try { body = await res.json(); } catch { /* không phải JSON */ }
    return { called: true, status: res.status(), body };
  }
}
