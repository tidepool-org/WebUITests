import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // Centralized field locators
  private fieldLocators: Record<string, Locator>;

  private saveButton: Locator;

  // Inline validation message shown for the diagnosis-date block (e.g. when the
  // diagnosis date is earlier than the birth date). Anchored on the .PatientInfo-blocks
  // container; the diagnosis date is the 3rd block. Update if the profile form changes.
  readonly diagnosisDateError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fieldLocators = {
      fullName: this.page.getByRole('textbox', { name: 'Full Name' }),
      birthDate: this.page.getByRole('textbox', { name: 'Birthdate' }),
      dateOfBirth: this.page.getByRole('textbox', { name: 'Date of Birth' }), // for claimed profile version
      mrn: this.page.getByRole('textbox', { name: 'MRN' }),
      diagnosisDate: this.page.getByRole('textbox', { name: 'Date of diagnosis' }),
      clinicalNotes: this.page.getByRole('textbox', { name: 'Anything you would like to share' }),
      email: this.page.getByRole('textbox', { name: /email/i }),
    };

    this.saveButton = this.page.getByRole('button', { name: 'Save Changes' });

    this.diagnosisDateError = this.page.locator(
      '.PatientInfo-blocks > div:nth-child(3) > div > div',
    );
  }

  // Generic fill method for text fields
  async fillField(field: keyof typeof this.fieldLocators, value: string): Promise<void> {
    const locator = this.fieldLocators[field];
    if (!locator) throw new Error(`No locator defined for field: ${field}`);
    if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) {
      await locator.fill(value);
    } else {
      throw new Error(`Field '${field}' not found or not visible`);
    }
  }

  // Select a diagnosis type from the dropdown
  async selectDiagnosisType(index: number): Promise<void> {
    const diagnosisCombo = this.page.getByRole('combobox', { name: 'Diagnosed as' });
    if (await diagnosisCombo.isVisible({ timeout: 3000 })) {
      await diagnosisCombo.selectOption({ index });
    }
  }

  // Get the current diagnosis index from the dropdown (needed for setting a new diagnosis)
  async getCurrentDiagnosisIndex(): Promise<number> {
    const diagnosisCombo = this.page.getByRole('combobox', { name: 'Diagnosed as' });
    if (await diagnosisCombo.isVisible({ timeout: 3000 })) {
      const currentValue = await diagnosisCombo.inputValue();
      const options = await diagnosisCombo.locator('option').all();

      // Find current index by checking option values
      for (let i = 0; i < options.length; i += 1) {
        const optionValue = await options[i].getAttribute('value');
        if (optionValue === currentValue) {
          return i;
        }
      }
    }
    return 1; // Default to 1 if not found
  }

  // For backwards compatibility, keep these as wrappers (optional)
  async fillFullName(name: string) {
    return this.fillField('fullName', name);
  }

  async fillBirthDate(date: string) {
    return this.fillField('birthDate', date);
  }

  async fillDateOfBirth(date: string) {
    return this.fillField('dateOfBirth', date); // redundant for claimed profile version
  }

  async fillMRN(mrn: string) {
    return this.fillField('mrn', mrn);
  }

  async fillDiagnosisDate(date: string) {
    return this.fillField('diagnosisDate', date);
  }

  async fillClinicalNotes(notes: string) {
    return this.fillField('clinicalNotes', notes);
  }

  async fillEmail(email: string) {
    return this.fillField('email', email);
  }

  async saveProfile() {
    await this.saveButton.click();
    // Wait for the Save Changes button to become hidden — this means the edit form
    // has either closed (dialog) or navigated away (full-page route). Both indicate
    // the save completed and the UI has fully transitioned out of edit mode.
    await this.saveButton.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Wait for the core profile edit fields to be visible — confirms the form is in
   * edit mode and rendered (used for a visual check after clicking Edit).
   */
  async waitForEditFields(): Promise<void> {
    await this.fieldLocators.fullName.waitFor({ state: 'visible' });
    await this.fieldLocators.dateOfBirth.waitFor({ state: 'visible' });
    await this.fieldLocators.diagnosisDate.waitFor({ state: 'visible' });
    await this.saveButton.waitFor({ state: 'visible' });
  }

  /**
   * Click "Save Changes" WITHOUT waiting for the form to close. Use this to trigger
   * the form's on-submit validation when the data is expected to be invalid (the
   * form stays open and surfaces inline errors, so `saveProfile()`'s wait-for-hidden
   * would hang).
   */
  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Checks if the edit button is displayed and validates against expected state
   * @param shouldBeVisible - Boolean indicating whether the edit button should be visible
   * @throws Error if the actual visibility doesn't match the expected state
   */
  async editButtonDisplays(shouldBeVisible: boolean): Promise<void> {
    const editButton = this.page.getByRole('button', { name: 'Edit' });
    const isEditButtonVisible = await editButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (shouldBeVisible && !isEditButtonVisible) {
      throw new Error('Edit button should be visible but was not found');
    } else if (!shouldBeVisible && isEditButtonVisible) {
      throw new Error('Edit button should not be visible for this user - security violation!');
    }
  }
}
