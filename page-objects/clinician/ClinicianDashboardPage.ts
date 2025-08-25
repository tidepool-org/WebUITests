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

  readonly addPatientDialog_addButton: Locator;

  // Locators for the Bring Data Dialog
  readonly bringDataDialog: Locator;

  readonly bringDataDialog_doneButton: Locator;

  //Locators for the Patient Options Dropdown (First find)
  readonly patientOptionsButton: Locator;

  readonly removePatientButton: Locator;

  readonly removePatientConfirm: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main page locators
    this.addNewPatientButton = page.getByRole('button', { name: 'Add New Patient' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.patientListTable = page.getByRole('table', { name: 'peopletablelabel' });

    // Add Patient Dialog locators
    this.addPatientDialog = page.getByRole('dialog');
    this.addPatientDialog_heading = this.addPatientDialog.getByRole('heading', { name: 'Add New Patient Account' });
    this.addPatientDialog_fullNameInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Full Name',
    });
    this.addPatientDialog_birthdateInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Birthdate',
    });
    this.addPatientDialog_addButton = this.addPatientDialog.getByRole('button', {
      name: 'Add Patient',
    });

    // Bring Data Dialog locators (robust: find dialog containing heading)
    this.bringDataDialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: 'Bring Data into Tidepool' }) });
    this.bringDataDialog_doneButton = this.bringDataDialog.getByRole('button', { name: 'Done' });

    //Patient Options Dropdown
    this.patientOptionsButton = this.patientListTable.getByRole('button', { name: /info|\.\.\./i }).first();
    this.removePatientButton = this.page.getByRole('button', { name: /remove patient/i }).first();
    this.removePatientConfirm = this.page.getByRole('button', { name: /^Remove$/i });
  }

  /**
   * Opens the Add Patient dialog and fills in the patient details.
   * @param name - The full name of the patient.
   * @param birthdate - The birthdate of the patient (e.g., MM/DD/YYYY).
   */
  async openAndFillAddPatientDialog(name: string, birthdate: string): Promise<void> {
    await this.addNewPatientButton.click();
    await this.addPatientDialog.waitFor({ state: 'visible' });
    await this.addPatientDialog_fullNameInput.fill(name);
    await this.addPatientDialog_birthdateInput.fill(birthdate);
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
   * @param name - The name of the patient to search for.
   */
  async searchForPatient(name: string): Promise<void> {
    await this.searchInput.fill(name);
    // Press Enter to trigger search
    await this.searchInput.press('Enter');
    // Wait longer for search to process and results to load
    await this.page.waitForTimeout(3000);
  }

  /**
   * Gets the locator for a patient cell in the table by name.
   * @param name - The name of the patient.
   * @returns Locator for the table cell containing the patient's name.
   */
  getPatientCellByName(name: string): Locator {
    // Use exact match to avoid multiple matches with similar names
    return this.patientListTable.getByRole('cell', { name, exact: true });
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

  async clickRemovePatientMenuItem(): Promise<void> {
    await this.removePatientButton.click();
  }

  async confirmRemovePatient(): Promise<void> {
    await this.removePatientConfirm.click();
  }
}

export default ClinicianDashboardPage;
