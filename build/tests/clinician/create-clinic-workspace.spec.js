"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("@fixtures/base");
const ClinicCreationPage_1 = __importDefault(require("@pom/clinician/ClinicCreationPage"));
const WorkspacesPage_1 = __importDefault(require("@pom/clinician/WorkspacesPage"));
const node_crypto_1 = require("node:crypto");
base_1.test.describe('Create clinic workspace', () => {
    const uniqueSuffix = (0, node_crypto_1.randomUUID)().substring(0, 8);
    const clinicName = `Test Clinic ${uniqueSuffix}`;
    let workspacesPage;
    let clinicCreationPage;
    base_1.test.beforeEach(async ({ page }) => {
        workspacesPage = new WorkspacesPage_1.default(page);
        clinicCreationPage = new ClinicCreationPage_1.default(page);
    });
    (0, base_1.test)('should successfully create a new clinic workspace', async ({ page }) => {
        await base_1.test.step('Given user is on the workspaces page', async () => {
            await workspacesPage.goto();
            await (0, base_1.expect)(workspacesPage.header).toBeVisible();
            await (0, base_1.expect)(workspacesPage.createClinicButton).toBeVisible();
        });
        await base_1.test.step("When user clicks on the 'Create a New Clinic' button", async () => {
            await workspacesPage.createClinicButton.click();
            // Wait for the clinic details page to load
            await (0, base_1.expect)(page).toHaveURL(/clinic-details\/new/);
            await (0, base_1.expect)(clinicCreationPage.pageHeader).toBeVisible();
        });
        await base_1.test.step('When user fills in all the required clinic information', async () => {
            // Fill the clinic form with test data
            await clinicCreationPage.fillClinicForm({
                clinicName,
                teamType: 'Provider Practice',
                state: 'California',
                address: '123 Test Street',
                city: 'Test City',
                zipCode: '12345',
            });
            // Verify blood glucose units (mg/dL is pre-selected)
            await (0, base_1.expect)(clinicCreationPage.mgdlRadio).toBeChecked();
            // Verify the admin acknowledgment checkbox is checked
            await (0, base_1.expect)(clinicCreationPage.adminAcknowledgeCheckbox).toBeChecked();
            // Verify Create Workspace button is enabled
            await (0, base_1.expect)(clinicCreationPage.createWorkspaceButton).toBeEnabled();
        });
        await base_1.test.step("When user clicks on the 'Create Workspace' button", async () => {
            await clinicCreationPage.createWorkspaceButton.click();
            // Wait for redirect to workspaces page
            await (0, base_1.expect)(page).toHaveURL('/workspaces');
        });
        await base_1.test.step('Then user should see the new clinic in the list and a success message', async () => {
            // Verify success message is shown
            const successMessage = page.getByText(`"${clinicName}" clinic created`);
            await (0, base_1.expect)(successMessage).toBeVisible();
            // Verify the new clinic appears in the list
            const clinicHeaderLocator = page.getByRole('heading', { name: clinicName });
            await (0, base_1.expect)(clinicHeaderLocator).toBeVisible();
            // Verify the clinic has the necessary action buttons
            const clinicContainer = page
                .locator('.workspace-item-clinic')
                .filter({ has: clinicHeaderLocator });
            await (0, base_1.expect)(clinicContainer.getByRole('button', { name: 'Leave Clinic' })).toBeVisible();
            await (0, base_1.expect)(clinicContainer.getByRole('button', { name: 'Go To Workspace' })).toBeVisible();
        });
    });
    (0, base_1.test)('should create a new clinic with the simplified createClinic method', async ({ page }) => {
        // Navigate to the workspaces page
        await page.goto('/workspaces');
        await (0, base_1.expect)(workspacesPage.header).toBeVisible();
        // Click the "Create a New Clinic" button
        await workspacesPage.createClinicButton.click();
        await (0, base_1.expect)(page).toHaveURL(/clinic-details\/new/);
        // Use the simplified method to create a clinic in one step
        await clinicCreationPage.createClinic(clinicName);
        // Verify we're back on the workspaces page
        await (0, base_1.expect)(page).toHaveURL('/workspaces');
        // Verify the clinic was created
        const successMessage = page.getByText(`"${clinicName}" clinic created`);
        await (0, base_1.expect)(successMessage).toBeVisible();
        // Verify the clinic appears in the list
        const clinicHeaderLocator = page.getByRole('heading', { name: clinicName });
        await (0, base_1.expect)(clinicHeaderLocator).toBeVisible();
    });
});
