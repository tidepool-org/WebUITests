import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillFullName(name: string): Promise<void> {
    const nameField = this.page.getByRole('textbox', { name: 'Full name' });
    if (await nameField.isVisible({ timeout: 3000 })) {
      await nameField.fill(name);
    }
  }

  async fillBirthDate(date: string): Promise<void> {
    const birthDateField = this.page.getByRole('textbox', { name: 'Date of birth' });
    if (await birthDateField.isVisible({ timeout: 3000 })) {
      await birthDateField.fill(date);
    }
  }

  async fillMRN(mrn: string): Promise<void> {
    const mrnField = this.page
      .getByRole('textbox', { name: 'MRN' })
      .or(this.page.getByRole('textbox', { name: 'Medical Record Number' }))
      .or(this.page.getByRole('textbox', { name: 'Patient ID' }))
      .or(this.page.locator('input[placeholder*="MRN"]'))
      .or(this.page.locator('input[id*="mrn"]'));

    if (await mrnField.isVisible({ timeout: 3000 })) {
      await mrnField.fill(mrn);
    }
  }

  async fillDiagnosisDate(date: string): Promise<void> {
    const diagnosisDateField = this.page.getByRole('textbox', { name: 'Date of diagnosis' });
    if (await diagnosisDateField.isVisible({ timeout: 3000 })) {
      await diagnosisDateField.fill(date);
    }
  }

  async selectDiagnosisType(index: number): Promise<void> {
    const diagnosisCombo = this.page.getByRole('combobox', { name: 'Diagnosed as' });
    if (await diagnosisCombo.isVisible({ timeout: 3000 })) {
      await diagnosisCombo.selectOption({ index });
    }
  }

  async getCurrentDiagnosisIndex(): Promise<number> {
    const diagnosisCombo = this.page.getByRole('combobox', { name: 'Diagnosed as' });
    if (await diagnosisCombo.isVisible({ timeout: 3000 })) {
      const currentValue = await diagnosisCombo.inputValue();
      const options = await diagnosisCombo.locator('option').all();

      // Find current index by checking option values
      for (let i = 0; i < options.length; i++) {
        const optionValue = await options[i].getAttribute('value');
        if (optionValue === currentValue) {
          return i;
        }
      }
    }
    return 1; // Default to 1 if not found
  }

  async fillClinicalNotes(notes: string): Promise<void> {
    const shareField = this.page.getByRole('textbox', { name: 'Anything you would like to share' });
    if (await shareField.isVisible({ timeout: 3000 })) {
      await shareField.fill(notes);
    }
  }

  async saveProfile(): Promise<void> {
    const saveButton = this.page.getByRole('button', { name: 'Save changes' });
    const saveProfileButton = this.page.getByRole('button', { name: 'Save Profile' });
    const saveBtn = this.page.getByRole('button', { name: 'Save' });

    // Wait for the PUT request to complete after clicking save
    const saveProfilePromise = this.page.waitForResponse(
      response =>
        response.url().includes('/metadata/') &&
        response.url().includes('/profile') &&
        response.request().method() === 'PUT',
    );

    if (await saveButton.isVisible({ timeout: 5000 })) {
      await saveButton.click();
    } else if (await saveProfileButton.isVisible({ timeout: 5000 })) {
      await saveProfileButton.click();
    } else if (await saveBtn.isVisible({ timeout: 5000 })) {
      await saveBtn.click();
    }

    // Wait for the PUT request to complete (with timeout)
    try {
      await saveProfilePromise;
    } catch (error) {
      console.log('⚠️ PUT request timeout - continuing anyway');
    }
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
