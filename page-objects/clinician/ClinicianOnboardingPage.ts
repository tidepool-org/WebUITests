import { Locator, Page } from '@playwright/test';

/**
 * First clinician onboarding screen after email verification (route /clinic-details/profile):
 * the clinician's name plus a "Role or job title" dropdown, then "Next".
 *
 * @class
 */
export class ClinicianOnboardingPage {
  page: Page;

  firstNameInput: Locator;

  lastNameInput: Locator;

  roleSelect: Locator;

  nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.roleSelect = page.locator('#role');
    this.nextButton = page.locator('#submit');
  }

  /** Fill the name + role, then continue. Role defaults to "Clinic Manager". */
  async fillProfileAndContinue(firstName: string, lastName: string, role = 'Clinic Manager'): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.roleSelect.selectOption({ label: role });
    await this.nextButton.click();
  }
}

export default ClinicianOnboardingPage;
