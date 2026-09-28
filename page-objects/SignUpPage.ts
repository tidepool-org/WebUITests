import { Locator, Page } from '@playwright/test';

/**
 * Sign-up / registration page object.
 *
 * Registration is hosted on Keycloak (auth.<env>.tidepool.org) and spans three screens
 * reached from the login page's "Sign Up" link:
 *   1. Account-type picker — Personal vs Clinician (radios, name="role").
 *   2. Registration form — email + password + confirm.
 *   3. Age + terms confirmation — age radios (name="age") and the terms checkbox.
 *
 * @class
 */
export default class SignUpPage {
  page: Page;

  // Screen 1 — account type
  personalAccountOption: Locator;

  clinicianAccountOption: Locator;

  nextButton: Locator;

  // Screen 2 — registration form
  emailInput: Locator;

  passwordInput: Locator;

  confirmPasswordInput: Locator;

  createAccountButton: Locator;

  // Screen 3 — age + terms
  age18OrOlder: Locator;

  age13To17: Locator;

  ageUnder13: Locator;

  termsCheckbox: Locator;

  childTermsCheckbox: Locator;

  acceptButton: Locator;

  // Visible label text (the radio/checkbox inputs are style-hidden, so assert on these).
  age18OrOlderLabel: Locator;

  termsLabel: Locator;

  /**
   * @param {Page} page
   */
  constructor(page: Page) {
    this.page = page;

    this.personalAccountOption = page.getByText(/Personal Account/i);
    this.clinicianAccountOption = page.getByText(/Clinician Account/i);
    this.nextButton = page.getByRole('button', { name: /next/i });

    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#password-confirm');
    this.createAccountButton = page.getByRole('button', { name: /create account/i });

    this.age18OrOlder = page.getByRole('radio', { name: /18 years old or older/i });
    this.age13To17 = page.getByRole('radio', { name: /between 13 and 17/i });
    this.ageUnder13 = page.getByRole('radio', { name: /12 years old or younger/i });
    this.termsCheckbox = page.getByRole('checkbox', { name: /accept the terms/i });
    this.childTermsCheckbox = page.locator('#terms-child');
    this.acceptButton = page.locator('#kc-accept');

    this.age18OrOlderLabel = page.getByText('I am 18 years old or older.');
    this.termsLabel = page.getByText(/I am 18 or older and I accept the terms/i);
  }

  /**
   * Screen 1: choose "Personal Account" and continue.
   * @returns {Promise<void>}
   */
  async choosePersonalAccount(): Promise<void> {
    await this.personalAccountOption.first().click();
    await this.nextButton.click();
  }

  /**
   * Screen 1: choose "Clinician Account" and continue.
   * @returns {Promise<void>}
   */
  async chooseClinicianAccount(): Promise<void> {
    await this.clinicianAccountOption.first().click();
    await this.nextButton.click();
  }

  /**
   * Screen 2 (personal): fill the registration form (email + password, confirmed) and submit.
   * Personal accepts age/terms on a later step, so there's no terms checkbox here.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  async fillRegistration(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.createAccountButton.click();
  }

  /**
   * Screen 2 (clinician): same fields plus an inline "I accept the terms" checkbox that must
   * be checked to enable "Create Account". Clinician has no separate age/terms step.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  async fillClinicianRegistration(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.termsCheckbox.check();
    await this.createAccountButton.click();
  }

  /**
   * Screen 3: confirm the user is 18+, accept the adult terms, and continue.
   * @returns {Promise<void>}
   */
  async confirmAdultAndAcceptTerms(): Promise<void> {
    await this.age18OrOlder.check();
    await this.termsCheckbox.check();
    await this.acceptButton.click();
  }
}
