import { Locator, Page } from '@playwright/test';
declare class ClinicianDashboardPage {
    page: Page;
    url: string;
    name: string;
    readonly addNewPatientButton: Locator;
    readonly searchInput: Locator;
    readonly patientListTable: Locator;
    readonly addPatientDialog: Locator;
    readonly addPatientDialog_fullNameInput: Locator;
    readonly addPatientDialog_birthdateInput: Locator;
    readonly addPatientDialog_addButton: Locator;
    readonly bringDataDialog: Locator;
    readonly bringDataDialog_doneButton: Locator;
    constructor(page: Page);
    /**
     * Opens the Add Patient dialog and fills in the patient details.
     * @param name - The full name of the patient.
     * @param birthdate - The birthdate of the patient (e.g., MM/DD/YYYY).
     */
    openAndFillAddPatientDialog(name: string, birthdate: string): Promise<void>;
    /**
     * Clicks the Add Patient button in the dialog to submit the new patient.
     */
    submitAddPatientDialog(): Promise<void>;
    /**
     * Closes the Bring Data into Tidepool dialog by clicking Done.
     */
    closeBringDataDialog(): Promise<void>;
    /**
     * Searches for a patient in the list.
     * @param name - The name of the patient to search for.
     */
    searchForPatient(name: string): Promise<void>;
    /**
     * Gets the locator for a patient cell in the table by name.
     * @param name - The name of the patient.
     * @returns Locator for the table cell containing the patient's name.
     */
    getPatientCellByName(name: string): Locator;
    /**
     * Waits for the main elements of the Clinic Workspace page to be visible.
     */
    waitForLoadState(): Promise<void>;
}
export default ClinicianDashboardPage;
