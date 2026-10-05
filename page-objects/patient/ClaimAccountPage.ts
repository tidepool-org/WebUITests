import { Locator, Page } from '@playwright/test';

/**
 * Custodial-claim flow — the two screens a prospective "claimed" patient walks through after
 * opening the clinic invitation link (`/verification-with-c2c?signupKey=…`):
 *   1. Device selector ("Welcome! Choose how you manage your diabetes") — we take
 *      "I have a different device", which routes to the account-setup screen.
 *   2. "Optional: Setup Your Account" (`/verification-with-password`) — set the password and
 *      confirm the birthday the clinic recorded, then Confirm.
 * After Confirm the app routes to the Keycloak login screen (drive it with LoginPage), followed by
 * a one-time age/terms required-action (SignUpPage.confirmAdultAndAcceptTerms). The account then
 * lands on its patient data view.
 *
 * Flow verified on qa2 (2026-10-05).
 *
 * @class
 */
export default class ClaimAccountPage {
  page: Page;

  // Screen 1 — device selector
  differentDeviceButton: Locator; // "I have a different device"

  // Screen 2 — "Optional: Setup Your Account"
  passwordInput: Locator;

  passwordConfirmInput: Locator;

  birthdayInput: Locator;

  confirmButton: Locator;

  /**
   * @param {Page} page
   */
  constructor(page: Page) {
    this.page = page;

    this.differentDeviceButton = page.getByRole('button', { name: 'I have a different device' });

    this.passwordInput = page.locator('#password');
    this.passwordConfirmInput = page.locator('#passwordConfirm');
    this.birthdayInput = page.locator('#birthday');
    this.confirmButton = page.locator('#verificationWithPasswordConfirm');
  }

  /** Screen 1: choose "I have a different device" (routes to the setup screen). */
  async chooseDifferentDevice(): Promise<void> {
    await this.differentDeviceButton.click();
  }

  /**
   * Screen 2: set the account password and confirm the birthday the clinic recorded, then submit.
   * @param {string} password - account password (used for both password + confirmation)
   * @param {string} birthday - mm/dd/yyyy; must match the DOB entered when the patient was added
   * @returns {Promise<void>}
   */
  async setupAccount(password: string, birthday: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.passwordConfirmInput.fill(password);
    await this.birthdayInput.fill(birthday);
    await this.confirmButton.click();
  }
}
