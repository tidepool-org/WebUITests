"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@fixtures/base");
const ClinicianDashboardPage_1 = __importDefault(require("@pom/clinician/ClinicianDashboardPage"));
const WorkspacesPage_1 = __importDefault(require("@pom/clinician/WorkspacesPage"));
base_1.test.describe('Add new patient', () => {
    // Use a unique patient name for each test run to avoid collisions
    const patientName = `Test Patient Playwright ${Date.now()}`;
    const patientBirthdate = '01/01/1990';
    base_1.test.beforeEach(async () => {
        await base_1.test.step('Given user has been logged in and navigated to base URL', async () => { });
    });
    (0, base_1.test)('should successfully add a new patient', async ({ page }) => {
        const workspacesPage = new WorkspacesPage_1.default(page);
        const clinicWorkspacePage = new ClinicianDashboardPage_1.default(page);
        await base_1.test.step('Given the user is on the workspaces page', async () => {
            await workspacesPage.goto();
            await workspacesPage.header.waitFor({ state: 'visible' });
        });
        await base_1.test.step('When user selects the first workspace', async () => {
            await workspacesPage.visitFirstClinic();
            await clinicWorkspacePage.waitForLoadState(); // Wait for clinic page elements
        });
        await base_1.test.step('When user adds a new patient via dialog', async () => {
            await clinicWorkspacePage.openAndFillAddPatientDialog(patientName, patientBirthdate);
            await clinicWorkspacePage.submitAddPatientDialog();
            await clinicWorkspacePage.closeBringDataDialog();
        });
        await base_1.test.step('Then the new patient should appear in the patient list', async () => {
            await clinicWorkspacePage.searchForPatient(patientName);
            const patientCell = clinicWorkspacePage.getPatientCellByName(patientName);
            await (0, base_1.expect)(patientCell).toBeVisible();
        });
    });
});
