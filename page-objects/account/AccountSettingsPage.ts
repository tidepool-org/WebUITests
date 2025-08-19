import { Page, Locator } from '@playwright/test';

export class AccountSettingsPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly saveConfirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.saveConfirm = page.getByText(/All Changes Saved/i);
  }
}
export default AccountSettingsPage;
