import { expect, test } from '@fixtures/base';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';
import WorkspacesPage from '@pom/clinician/WorkspacesPage';

test.describe('Add new patient', () => {
  // Use a unique patient name for each test run to avoid collisions
  const patientName = `Test Patient Playwright ${Date.now()}`;
  const patientBirthdate = '01/01/1990';

  test.beforeEach(async () => {
    await test.step('Given user has been logged in and navigated to base URL', async () => {});
  });

  test('should successfully add a new patient', async ({ page }) => {
    const workspacesPage = new WorkspacesPage(page);
    const clinicWorkspacePage = new ClinicianDashboardPage(page);

    await test.step('Given the user is on the workspaces page', async () => {
      await workspacesPage.goto();
      await workspacesPage.header.waitFor({ state: 'visible' });
    });

    await test.step('When user selects the first workspace', async () => {
      await workspacesPage.visitFirstClinic();
      await clinicWorkspacePage.waitForLoadState(); // Wait for clinic page elements
    });

    await test.step('When user adds a new patient via dialog', async () => {
      await clinicWorkspacePage.openAndFillAddPatientDialog(patientName, patientBirthdate);
      await clinicWorkspacePage.submitAddPatientDialog();
      await clinicWorkspacePage.closeBringDataDialog();
    });

    await test.step('Then the new patient should appear in the patient list', async () => {
      await clinicWorkspacePage.searchForPatient(patientName);
      const patientCell = clinicWorkspacePage.getPatientCellByName(patientName);
      await expect(patientCell).toBeVisible();
    });
  });
});
