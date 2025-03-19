/**
 * @typedef {import('@playwright/test').Page} Page
 * @typedef {import('@playwright/test').Locator} Locator
 */

// import { step } from '../../tests/fixtures/base';

/**
 * @class
 * @property {Page} page
 * @property {Locator} emailInput
 * @property {Locator} nextButton
 * @property {Locator} passwordInput
 * @property {Locator} loginButton
 */
export default class LoginPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.nextButton = page.getByRole("button", { name: "Next" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Log In" });
  }

  /**
   * Navigate to the login page
   * @returns {Promise<void>}
   */
  async goto() {
    await this.page.goto(`/`);
  }

  /**
   * Login to the application
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  // @step("When the user logs in to the application")
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
