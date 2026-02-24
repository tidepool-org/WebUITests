import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // Centralized field locators
  private fieldLocators: Record<string, Locator>;

  private saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fieldLocators = {
      fullName: this.page.getByRole('textbox', { name: 'Full Name' }),
      birthDate: this.page.getByRole('textbox', { name: 'Birthdate' }),
      dateOfBirth: this.page.getByRole('textbox', { name: 'Date of Birth' }), // for claimed profile version
      mrn: this.page.getByRole('textbox', { name: 'MRN' }),
      // diagnosisDate: this.page.getByRole('textbox', { name: 'Date of diagnosis' }),
      clinicalNotes: this.page.getByRole('textbox', { name: 'Anything you would like to share' }),
      email: this.page.getByRole('textbox', { name: /email/i }),
    };

    this.saveButton = this.page.getByRole('button', { name: 'Save Changes' });
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
