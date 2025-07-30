import { Locator, Page } from "@playwright/test";

/**
 * @class
 * @property {Page} page
 * @property {Locator} emailInput
 * @property {Locator} nextButton
 * @property {Locator} passwordInput
 * @property {Locator} loginButton
 */
export default class LoginPage {
  page: Page;
  emailInput: Locator;
  nextButton: Locator;
  passwordInput: Locator;
  loginButton: Locator;

  /**
   * @param {Page} page
   */
  constructor(page: Page) {
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
  async goto(): Promise<void> {
    await this.page.goto(`/`);
  }

  /**
   * Login to the application
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  // @step("When the user logs in to the application")
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}
