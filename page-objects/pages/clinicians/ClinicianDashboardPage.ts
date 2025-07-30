import { Locator, Page } from '@playwright/test';
import { step } from '../../../tests/fixtures/base';

class ClinicWorkspacePage {
  page: Page;

  url = '/clinic-workspace';

  name = 'ClinicWorkspacePage'; // Added name for step decorator context

  // Locators for the main page
  readonly addNewPatientButton: Locator;

  readonly searchInput: Locator;

  readonly patientListTable: Locator;

  // Locators for the Add Patient Dialog
  readonly addPatientDialog: Locator;

  readonly addPatientDialog_fullNameInput: Locator;

  readonly addPatientDialog_birthdateInput: Locator;

  readonly addPatientDialog_addButton: Locator;

  // Locators for the Bring Data Dialog
  readonly bringDataDialog: Locator;

  readonly bringDataDialog_doneButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main page locators
    this.addNewPatientButton = page.getByRole('button', { name: 'Add New Patient' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.patientListTable = page.getByRole('table', { name: 'peopletablelabel' });

    // Add Patient Dialog locators
    this.addPatientDialog = page.getByRole('dialog', { name: /Add New Patient Account/i });
    this.addPatientDialog_fullNameInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Full Name',
    });
    this.addPatientDialog_birthdateInput = this.addPatientDialog.getByRole('textbox', {
      name: 'Birthdate',
    });
    this.addPatientDialog_addButton = this.addPatientDialog.getByRole('button', {
      name: 'Add Patient',
    });

    // Bring Data Dialog locators
    this.bringDataDialog = page.getByRole('dialog', { name: /Bring Data into Tidepool/i });
    this.bringDataDialog_doneButton = this.bringDataDialog.getByRole('button', { name: 'Done' });
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
    await this.patientListTable.waitFor({ state: 'visible' }); // Wait for search results
  }

  /**
   * Gets the locator for a patient cell in the table by name.
   * @param name - The name of the patient.
   * @returns Locator for the table cell containing the patient's name.
   */
  getPatientCellByName(name: string): Locator {
    // Use a regex to be more flexible with how the name appears in the cell
    return this.patientListTable.getByRole('cell', { name: new RegExp(name, 'i') });
  }

  /**
   * Waits for the main elements of the Clinic Workspace page to be visible.
   */
  async waitForLoadState(): Promise<void> {
    await this.addNewPatientButton.waitFor({ state: 'visible' });
  }
}

export default ClinicWorkspacePage;
