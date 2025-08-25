"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@fixtures/base");
const ClinicianDashboardPage_1 = __importDefault(require("@pom/clinician/ClinicianDashboardPage"));
const WorkspacesPage_1 = __importDefault(require("@pom/clinician/WorkspacesPage"));
base_1.test.describe('Filter patients in clinic', () => {
    // Use unique patient names for each test run
    const timestamp = Date.now();
    const patientName1 = `Filter Patient A ${timestamp}`;
    const patientName2 = `Filter Patient B ${timestamp}`;
    const patientBirthdate = '01/01/1995'; // Shared birthdate for simplicity
    let workspacesPage;
    let clinicWorkspacePage;
    base_1.test.beforeEach(async ({ page }) => {
        workspacesPage = new WorkspacesPage_1.default(page);
        clinicWorkspacePage = new ClinicianDashboardPage_1.default(page);
        await base_1.test.step('Given user has been logged in and navigated to base URL', async () => {
            await workspacesPage.goto();
            await page.waitForURL(workspacesPage.url);
            await workspacesPage.header.waitFor({ state: 'visible' });
        });
        await base_1.test.step('Given the user is on the first clinic workspace', async () => {
            await workspacesPage.visitFirstClinic();
            await clinicWorkspacePage.waitForLoadState(); // Wait for clinic page elements
        });
        await base_1.test.step('Given two patients exist', async () => {
            // Add first patient
            await clinicWorkspacePage.openAndFillAddPatientDialog(patientName1, patientBirthdate);
            await clinicWorkspacePage.submitAddPatientDialog();
            await clinicWorkspacePage.closeBringDataDialog();
            // Ensure the first patient is added before adding the second
            await (0, base_1.expect)(clinicWorkspacePage.getPatientCellByName(patientName1)).toBeVisible({
                timeout: 10000,
            });
            // Add second patient
            await clinicWorkspacePage.openAndFillAddPatientDialog(patientName2, patientBirthdate);
            await clinicWorkspacePage.submitAddPatientDialog();
            await clinicWorkspacePage.closeBringDataDialog();
            // Ensure the second patient is also added
            await (0, base_1.expect)(clinicWorkspacePage.getPatientCellByName(patientName2)).toBeVisible({
                timeout: 10000,
            });
        });
    });
    (0, base_1.test)('should successfully filter patients by name', async () => {
        await base_1.test.step("When user filters by the first patient's name", async () => {
            await clinicWorkspacePage.searchForPatient(patientName1);
        });
        await base_1.test.step('Then only the first patient should be visible', async () => {
            const patientCell1 = clinicWorkspacePage.getPatientCellByName(patientName1);
            const patientCell2 = clinicWorkspacePage.getPatientCellByName(patientName2);
            await (0, base_1.expect)(patientCell1).toBeVisible();
            await (0, base_1.expect)(patientCell2).not.toBeVisible();
        });
        await base_1.test.step('When user clears the filter', async () => {
            // Assuming a method like clearPatientSearch exists or searchForPatient('') clears
            await clinicWorkspacePage.searchForPatient(''); // Clear search by searching for empty string
            // Or potentially: await clinicWorkspacePage.clearPatientSearch();
        });
        await base_1.test.step('Then both patients should be visible again', async () => {
            const patientCell1 = clinicWorkspacePage.getPatientCellByName(patientName1);
            const patientCell2 = clinicWorkspacePage.getPatientCellByName(patientName2);
            await (0, base_1.expect)(patientCell1).toBeVisible();
            await (0, base_1.expect)(patientCell2).toBeVisible();
        });
    });
});
