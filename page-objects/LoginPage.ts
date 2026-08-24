import { Locator, Page } from '@playwright/test';

/**
 * Login page object.
 *
 * Authentication is hosted on Keycloak (auth.qa.tidepool.org). Visiting the app
 * (blip) redirects to a Keycloak-themed "Log in to Tidepool" flow that is
 * IDENTITY-FIRST and spans two pages:
 *   1. Username page: `#username` (email) → submit `#kc-login` ("Next")
 *   2. Password page: `#password` → submit `#kc-login` ("Next")
 * The same submit button id (`#kc-login`) is reused on both pages; they are
 * separate navigations, so it resolves to the correct one each time.
 *
 * @class
 * @property {Page} page
 * @property {Locator} usernameInput  Keycloak email field (page 1)
 * @property {Locator} passwordInput  Keycloak password field (page 2)
 * @property {Locator} submitButton   Keycloak submit ("Next"), both pages
 */
export default class LoginPage {
  page: Page;

  usernameInput: Locator;

  passwordInput: Locator;

  submitButton: Locator;

  /**
   * @param {Page} page
   */
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#kc-login');
  }

  /**
   * Navigate to the app; blip redirects to the Keycloak login page.
   * @returns {Promise<void>}
   */
  async goto(): Promise<void> {
    await this.page.goto(`/`);
  }

  /**
   * Log in through the Keycloak identity-first flow (username page → password page).
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<void>}
   */
  async login(email: string, password: string): Promise<void> {
    // Page 1 — username. Wait for the Keycloak form (blip redirects here).
    await this.usernameInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.usernameInput.fill(email);
    await this.submitButton.click();

    // Page 2 — password. Waiting for #password confirms the page transitioned.
    await this.passwordInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    // NOTE: accounts with 2FA enabled (clinic accounts, once enrolled) will show a
    // TOTP prompt here — that step is handled separately when 2FA support lands.

    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}
