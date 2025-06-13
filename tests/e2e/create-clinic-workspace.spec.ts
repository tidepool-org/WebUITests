import { expect, test } from "@fixtures/base";
import ClinicCreationPage from "@pom/pages/clinic-creation/page";
import LoginPage from "@pom/pages/login.page";
import WorkspacesPage from "@pom/pages/workspaces/page";
import { randomUUID } from "crypto";

// Use clinician storage state for login
test.use({ storageState: "playwright/.auth/clinician.json" });

test.describe("Create clinic workspace", () => {
  const uniqueSuffix = randomUUID().substring(0, 8);
  const clinicName = `Test Clinic ${uniqueSuffix}`;
  let loginPage: LoginPage;
  let workspacesPage: WorkspacesPage;
  let clinicCreationPage: ClinicCreationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    workspacesPage = new WorkspacesPage(page);
    clinicCreationPage = new ClinicCreationPage(page);
  });

  test("should successfully create a new clinic workspace", async ({ page }) => {
    await test.step("Given user is on the workspaces page", async () => {
      await page.goto("/workspaces");
      await expect(workspacesPage.header).toBeVisible();
      await expect(workspacesPage.createClinicButton).toBeVisible();
    });

    await test.step("When user clicks on the 'Create a New Clinic' button", async () => {
      await workspacesPage.createClinicButton.click();
      // Wait for the clinic details page to load
      await expect(page).toHaveURL(/clinic-details\/new/);
      await expect(clinicCreationPage.pageHeader).toBeVisible();
    });

    await test.step("When user fills in all the required clinic information", async () => {
      // Fill the clinic form with test data
      await clinicCreationPage.fillClinicForm({
        clinicName,
        teamType: "Provider Practice",
        state: "California",
        address: "123 Test Street",
        city: "Test City",
        zipCode: "12345",
      });

      // Verify blood glucose units (mg/dL is pre-selected)
      await expect(clinicCreationPage.mgdlRadio).toBeChecked();

      // Verify the admin acknowledgment checkbox is checked
      await expect(clinicCreationPage.adminAcknowledgeCheckbox).toBeChecked();

      // Verify Create Workspace button is enabled
      await expect(clinicCreationPage.createWorkspaceButton).toBeEnabled();
    });

    await test.step("When user clicks on the 'Create Workspace' button", async () => {
      await clinicCreationPage.createWorkspaceButton.click();
      // Wait for redirect to workspaces page
      await expect(page).toHaveURL("/workspaces");
    });

    await test.step("Then user should see the new clinic in the list and a success message", async () => {
      // Verify success message is shown
      const successMessage = page.getByText(`"${clinicName}" clinic created`);
      await expect(successMessage).toBeVisible();

      // Verify the new clinic appears in the list
      const clinicHeaderLocator = page.getByRole("heading", { name: clinicName });
      await expect(clinicHeaderLocator).toBeVisible();

      // Verify the clinic has the necessary action buttons
      const clinicContainer = page.locator(".workspace-item-clinic").filter({ has: clinicHeaderLocator });
      await expect(clinicContainer.getByRole("button", { name: "Leave Clinic" })).toBeVisible();
      await expect(clinicContainer.getByRole("button", { name: "Go To Workspace" })).toBeVisible();
    });
  });

  test("should create a new clinic with the simplified createClinic method", async ({ page }) => {
    // Navigate to the workspaces page
    await page.goto("/workspaces");
    await expect(workspacesPage.header).toBeVisible();

    // Click the "Create a New Clinic" button
    await workspacesPage.createClinicButton.click();
    await expect(page).toHaveURL(/clinic-details\/new/);

    // Use the simplified method to create a clinic in one step
    await clinicCreationPage.createClinic(clinicName);

    // Verify we're back on the workspaces page
    await expect(page).toHaveURL("/workspaces");

    // Verify the clinic was created
    const successMessage = page.getByText(`"${clinicName}" clinic created`);
    await expect(successMessage).toBeVisible();

    // Verify the clinic appears in the list
    const clinicHeaderLocator = page.getByRole("heading", { name: clinicName });
    await expect(clinicHeaderLocator).toBeVisible();
  });
});
