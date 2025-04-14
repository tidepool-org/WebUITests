import { expect, test } from "@fixtures/base";
import ClinicAdminPage from "@pom/pages/clinic-admin/page";
import WorkspacesPage from "@pom/pages/workspaces/page";

// Use clinician storage state for login
test.use({ storageState: "playwright/.auth/clinician.json" });

test.describe("Edit clinic address", () => {
  const newAddress = `123 Test Street ${Date.now()}`; // Unique address for test run
  let clinicAdminPage: ClinicAdminPage;
  let workspacesPage: WorkspacesPage;

  test.beforeEach(async ({ page }) => {
    clinicAdminPage = new ClinicAdminPage(page);
    workspacesPage = new WorkspacesPage(page);
    
    await test.step("Given user has navigated to the Clinic Admin page", async () => {
      await page.goto("/");
      await workspacesPage.visitFirstClinic();
      await page.goto("/clinic-admin");
      await clinicAdminPage.waitForLoadState(); // Wait for clinic admin page elements
      await clinicAdminPage.clinicDetailsHeader.waitFor({ state: "visible" });
    });
  });

  test("should successfully edit the clinic address", async ({ page }) => {
    await test.step('When user clicks the "Edit" button for workspace details', async () => {
      await clinicAdminPage.editDetailsButton.click();
      await clinicAdminPage.editClinicModal.waitFor({ state: "visible" });
    });

    await test.step("Then user sees the modal for Editing workspace details", async () => {
      await expect(clinicAdminPage.editClinicModalTitle).toBeVisible();
      await expect(clinicAdminPage.addressInput).toBeVisible();
    });

    await test.step("When user changes the address", async () => {
      await clinicAdminPage.addressInput.fill(newAddress);
    });

    await test.step('When user clicks on "Save changes"', async () => {
      await clinicAdminPage.saveChangesButton.click();
      await clinicAdminPage.editClinicModal.waitFor({ state: "hidden" }); // Wait for modal to close
    });

    await test.step("Then user sees the updated address on the page", async () => {
      // Wait for the details section to potentially update
      await page.waitForTimeout(1000); // Small wait for potential DOM update
      const detailsText = clinicAdminPage.clinicDetailsSection;
      await expect(detailsText).toContainText(newAddress);
    });
  });
});
