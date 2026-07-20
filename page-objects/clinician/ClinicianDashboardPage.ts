import { Locator, Page } from '@playwright/test';

class ClinicianDashboardPage {
  page: Page;

  url = '/clinic-workspace';

  name = 'ClinicianDashboardPage'; // Added name for step decorator context

  // Locators for the main page
  readonly addNewPatientButton: Locator;

  readonly searchInput: Locator;

  readonly patientListTable: Locator;

  // Locators for the Add Patient Dialog
  readonly addPatientDialog: Locator;

  readonly addPatientDialog_heading: Locator;

  readonly addPatientDialog_fullNameInput: Locator;

  readonly addPatientDialog_birthdateInput: Locator;

  readonly addPatientDialog_mrnInput: Locator;

  readonly addPatientDialog_emailInput: Locator;

  readonly addPatientDialog_addButton: Locator;

  // Locators for the Bring Data Dialog
  readonly bringDataDialog: Locator;

  readonly bringDataDialog_doneButton: Locator;

  // Locators for the Patient Options Dropdown (First find)
  readonly patientOptionsButton: Locator;

  readonly removePatientButton: Locator;

  readonly editPatientDetailsButton: Locator;

  readonly removePatientConfirm: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main page locators
    this.addNewPatientButton = page.getByRole('button', { name: 'Add New Patient' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.patientListTable = page.getByRole('table', { name: 'peopletablelabel' });

    // Add Patient Dialog locators
    this.addPatientDialog = page.getByRole('dialog');
    this.addPatientDialog_heading = this.addPatientDialog.getByRole('heading', {
      name: 'Add New Patient Account',
    });
    this.addPatientDialog_fullNameInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Full Name',
    });
    this.addPatientDialog_birthdateInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Birthdate',
    });
    this.addPatientDialog_mrnInput = this.addPatientDialog.getByRole('textbox', {
      name: 'MRN (optional)',
    });
    this.addPatientDialog_emailInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Email (optional)',
    });
    this.addPatientDialog_addButton = this.addPatientDialog.getByRole('button', {
      name: 'Add Patient',
    });

    // Bring Data Dialog locators (robust: find dialog containing heading)
    this.bringDataDialog = page
      .getByRole('dialog')
      .filter({ has: page.getByRole('heading', { name: 'Bring Data into Tidepool' }) });
    this.bringDataDialog_doneButton = this.bringDataDialog.getByRole('button', { name: 'Done' });

    // Patient Options Dropdown
    this.patientOptionsButton = this.patientListTable
      .getByRole('button', { name: /info|\.\.\./i })
      .first();
    this.removePatientButton = this.page.getByRole('button', { name: /remove patient/i }).first();
    this.editPatientDetailsButton = this.page
      .getByRole('button', { name: /edit patient details/i })
      .first();
    this.removePatientConfirm = this.page.getByRole('button', { name: /^Remove$/i });
  }

  /**
   * Opens the Add Patient dialog and fills in the patient details.
   * @param name - The full name of the patient.
   * @param birthdate - The birthdate of the patient (e.g., MM/DD/YYYY).
   * @param mrn - The medical record number of the patient.
   * @param email - The email address of the patient.
   */
  async openAndFillAddPatientDialog(
    name: string,
    birthdate: string,
    mrn: string,
    email: string,
  ): Promise<void> {
    await this.addNewPatientButton.click();
    await this.addPatientDialog.waitFor({ state: 'visible' });
    await this.addPatientDialog_fullNameInput.fill(name);
    await this.addPatientDialog_birthdateInput.fill(birthdate);
    await this.addPatientDialog_mrnInput.fill(mrn);
    await this.addPatientDialog_emailInput.fill(email);
  }

  /**
   * Clicks the Add Patient button in the dialog to submit the new patient.
   */
  async submitAddPatientDialog(): Promise<void> {
    await this.addPatientDialog_addButton.click();
    // Small wait for capture reasons
    await this.page.waitForTimeout(500);
  }

  /**
   * Closes the Bring Data into Tidepool dialog by clicking Done.
   */
  async closeBringDataDialog(): Promise<void> {
    await this.bringDataDialog.waitFor({ state: 'visible' });
    await this.bringDataDialog_doneButton.click();
    await this.bringDataDialog.waitFor({ state: 'hidden' });
  }

  /**
   * Searches for a patient in the list.
   * Uses triple-click to select existing text then pressSequentially to type,
   * which properly triggers React's onChange handler on each keystroke.
   * @param name - The name of the patient to search for.
   */
  async searchForPatient(name: string): Promise<void> {
    // Use the "Clear Search" button if visible — it reliably resets the input and React state
    const clearButton = this.page.getByRole('button', { name: 'Clear Search' });
    if (await clearButton.isVisible({ timeout: 500 })) {
      await clearButton.click();
      await this.page.waitForTimeout(500);
    }

    if (name.trim() === '') {
      // Clearing was the goal — wait for the table to reset
      await this.page.waitForTimeout(1500);
      return;
    }

    // Triple-click selects all existing text in the input (reliable cross-browser),
    // then pressSequentially replaces the selection character-by-character,
    // firing onChange on each keystroke so React state stays in sync.
    await this.searchInput.click({ clickCount: 3 });
    await this.searchInput.pressSequentially(name, { delay: 50 });

    // Verify the text was entered correctly; retry once if not
    const inputValue = await this.searchInput.inputValue();
    if (inputValue !== name) {
      await this.searchInput.click({ clickCount: 3 });
      await this.searchInput.pressSequentially(name, { delay: 50 });
    }

    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Gets the locator for a patient cell in the table by name.
   * @param name - The name of the patient.
   * @returns Locator for the table cell containing the patient's name.
   */
  getPatientCellByName(name: string): Locator {
    // Use exact match to avoid multiple matches with similar names
    return this.patientListTable.getByRole('cell', { name, exact: false });
  }

  /**
   * Waits for the main elements of the Clinic Workspace page to be visible.
   */
  async waitForLoadState(): Promise<void> {
    await this.addNewPatientButton.waitFor({ state: 'visible' });
  }

  async openFirstPatientOptionsDropdown(): Promise<void> {
    await this.patientOptionsButton.click();
    // Small wait for screenshot
    await this.page.waitForTimeout(500);
  }

  async clickPatientCell(name: string): Promise<void> {
    const patientCell = this.getPatientCellByName(name);
    await patientCell.click();
  }

  async clickRemovePatientMenuItem(): Promise<void> {
    await this.removePatientButton.click();
  }

  async clickEditPatientDetailsMenuItem(): Promise<void> {
    await this.editPatientDetailsButton.click();
  }

  async confirmRemovePatient(): Promise<void> {
    await this.removePatientConfirm.click();
  }
}

export default ClinicianDashboardPage;
