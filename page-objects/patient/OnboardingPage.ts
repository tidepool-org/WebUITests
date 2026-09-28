import { Locator, Page } from '@playwright/test';

/**
 * Patient onboarding wizard shown after a new account verifies its email (route /patients/new).
 * Three screens then the data-donation prompt:
 *   1. Name + "Who is this account for?" (account-type radios; inputs are overlay-hidden, so
 *      the visible labels are the click targets).
 *   2. Birthday + diagnosis date + diabetes type.
 *   3. Data-donation prompt (decline/accept).
 * Ends on the View Data screen.
 *
 * @class
 */
export default class OnboardingPage {
  page: Page;

  // Shared wizard nav (screens 1 & 2)
  nextButton: Locator; // #submit ("Next")

  backButton: Locator; // #back

  // Screen 1 — name + who-is-this-for
  firstNameInput: Locator;

  lastNameInput: Locator;

  accountTypeForMe: Locator; // "This is for me, I have diabetes"

  accountTypeForSomeoneElse: Locator; // "on behalf of someone I care for..."

  accountTypeViewOnly: Locator; // "view-only account..."

  // Screen 2 — birthday + diagnosis
  birthdayInput: Locator;

  diagnosisDateInput: Locator;

  diagnosisTypeSelect: Locator;

  // Screen 3 — data donation
  declineDonationButton: Locator; // #declineDataDonation ("No, Thanks")

  acceptDonationButton: Locator; // #submit ("Yes, I'm Interested")

  /**
   * @param {Page} page
   */
  constructor(page: Page) {
    this.page = page;

    this.nextButton = page.locator('#submit');
    this.backButton = page.locator('#back');

    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.accountTypeForMe = page.getByText('This is for me, I have diabetes');
    this.accountTypeForSomeoneElse = page.getByText(/on behalf of someone/i);
    this.accountTypeViewOnly = page.getByText(/view-only account/i);

    this.birthdayInput = page.locator('#birthday');
    this.diagnosisDateInput = page.locator('#diagnosisDate');
    this.diagnosisTypeSelect = page.locator('#diagnosisType');

    this.declineDonationButton = page.locator('#declineDataDonation');
    this.acceptDonationButton = page.locator('#submit');
  }

  /**
   * Screen 1: enter the account holder's name and select "This is for me, I have diabetes".
   * @param {string} firstName
   * @param {string} lastName
   * @returns {Promise<void>}
   */
  async enterNameAndSelectSelf(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    // The radio input is hidden behind styling — clicking the label toggles it.
    await this.accountTypeForMe.click();
  }

  /**
   * Screen 2: enter birthday + diagnosis date and pick a diabetes type (any but "Select one").
   * @param {string} birthday - mm/dd/yyyy
   * @param {string} diagnosisDate - mm/dd/yyyy (must be after the birthday)
   * @returns {Promise<void>}
   */
  async enterDiabetesDetails(birthday: string, diagnosisDate: string): Promise<void> {
    await this.birthdayInput.fill(birthday);
    await this.diagnosisDateInput.fill(diagnosisDate);
    await this.diagnosisTypeSelect.selectOption({ index: 1 }); // first real type (skip "Select one")
  }

  /**
   * Advance the wizard (screens 1 & 2 share the same "Next" submit button).
   * @returns {Promise<void>}
   */
  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * Screen 3: decline the data-donation prompt ("No, Thanks").
   * @returns {Promise<void>}
   */
  async declineDonation(): Promise<void> {
    await this.declineDonationButton.click();
  }
}
