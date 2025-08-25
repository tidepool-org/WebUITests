"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@fixtures/base");
const WorkspaceSettingsPage_1 = __importDefault(require("@pom/clinician/WorkspaceSettingsPage"));
const WorkspacesPage_1 = __importDefault(require("@pom/clinician/WorkspacesPage"));
base_1.test.describe('Edit clinic address', () => {
    const newAddress = `123 Test Street ${Date.now()}`; // Unique address for test run
    let clinicAdminPage;
    let workspacesPage;
    base_1.test.beforeEach(async ({ page }) => {
        clinicAdminPage = new WorkspaceSettingsPage_1.default(page);
        workspacesPage = new WorkspacesPage_1.default(page);
        await base_1.test.step('Given user has navigated to the Clinic Admin page', async () => {
            await workspacesPage.goto();
            await workspacesPage.visitFirstClinic();
            await page.goto('/clinic-admin');
            await clinicAdminPage.waitForLoadState(); // Wait for clinic admin page elements
            await clinicAdminPage.clinicDetailsHeader.waitFor({ state: 'visible' });
        });
    });
    (0, base_1.test)('should successfully edit the clinic address', async ({ page }) => {
        await base_1.test.step('When user clicks the "Edit" button for workspace details', async () => {
            await clinicAdminPage.editDetailsButton.click();
            await clinicAdminPage.editClinicModal.waitFor({ state: 'visible' });
        });
        await base_1.test.step('Then user sees the modal for Editing workspace details', async () => {
            await (0, base_1.expect)(clinicAdminPage.editClinicModalTitle).toBeVisible();
            await (0, base_1.expect)(clinicAdminPage.addressInput).toBeVisible();
        });
        await base_1.test.step('When user changes the address', async () => {
            await clinicAdminPage.addressInput.fill(newAddress);
        });
        await base_1.test.step('When user clicks on "Save changes"', async () => {
            await clinicAdminPage.saveChangesButton.click();
            await clinicAdminPage.editClinicModal.waitFor({ state: 'hidden' }); // Wait for modal to close
        });
        await base_1.test.step('Then user sees the updated address on the page', async () => {
            // Wait for the details section to potentially update
            await page.waitForTimeout(1000); // Small wait for potential DOM update
            const detailsText = clinicAdminPage.clinicDetailsSection;
            await (0, base_1.expect)(detailsText).toContainText(newAddress);
        });
    });
});
