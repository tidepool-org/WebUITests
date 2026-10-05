import { Locator, Page, Response } from '@playwright/test';

/**
 * Account settings profile page (route /profile). Personal details — full name, email,
 * password — are edited from the "Edit Personal Details" dialog:
 *   • Full name is a field in the dialog, saved with "Save Changes" (in-app → PUT /profile).
 *   • Email is changed via "Update Email", which hands off to the Keycloak UPDATE_EMAIL flow
 *     (#email + #kc-submit) and sends a verification email.
 *
 * @class
 */
export class AccountProfilePage {
  page: Page;

  editPersonalDetailsButton: Locator;

  fullNameInput: Locator;

  saveChangesButton: Locator;

  updateEmailButton: Locator;

  // Keycloak update-email form (after "Update Email").
  keycloakEmailInput: Locator;

  keycloakSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editPersonalDetailsButton = page.getByRole('button', { name: 'Edit Personal Details' });
    // The account-settings dialog labels this field "Name"; target the stable id instead.
    this.fullNameInput = page.locator('#fullName');
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.updateEmailButton = page.getByRole('button', { name: 'Update Email' });
    this.keycloakEmailInput = page.locator('#email');
    this.keycloakSubmitButton = page.locator('#kc-submit');
  }

  /** Open the "Edit Personal Details" dialog. */
  async openEditDialog(): Promise<void> {
    await this.editPersonalDetailsButton.click();
  }

  /**
   * In the open dialog, set the full name and save. Returns the profile PUT response so the
   * caller can validate its body without racing the async request.
   */
  async setFullNameAndSave(fullName: string): Promise<Response> {
    await this.fullNameInput.fill(fullName);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (r) => r.request().method() === 'PUT' && r.url().includes('/profile'),
        { timeout: 15_000 },
      ),
      this.saveChangesButton.click(),
    ]);
    return response;
  }

  /** In the open dialog, start the Keycloak email-change flow. */
  async startEmailUpdate(): Promise<void> {
    await this.updateEmailButton.click();
  }

  /** On the Keycloak update-email screen, submit the new address. */
  async submitNewEmail(email: string): Promise<void> {
    await this.keycloakEmailInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.keycloakEmailInput.fill(email);
    await this.keycloakSubmitButton.click();
  }
}

export default AccountProfilePage;
