import { expect } from '@fixtures/base';
import { test, ALL_WORKSPACE_KEYS } from '@fixtures/clinic-helpers';
import { WorkspaceKey } from '@pom/clinician/ClinicianNavigation';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';

ALL_WORKSPACE_KEYS.forEach((workspace: WorkspaceKey) => {
  test.describe(`Filter patients in clinic [${workspace}]`, () => {
    // Define the patient data at top level (unique per workspace)
    const currentDate = Date.now();
    const workspaceId = workspace.replace(/[^a-zA-Z0-9]/g, ''); // Clean workspace name for IDs
    const shortTimestamp = currentDate.toString().slice(-8); // Last 8 digits for uniqueness
    const shortWorkspaceId = workspaceId.substring(0, 4); // First 4 chars of workspace
    const patientName1 = `Filter Patient A`;
    const patientName2 = `Filter Patient B`;
    const patientBirthdate = '01/01/1995'; // Shared birthdate for simplicity
    const patientMRN1 = `${shortWorkspaceId}${shortTimestamp}1`; // Max 13 chars (4+8+1)
    const patientMRN2 = `${shortWorkspaceId}${shortTimestamp}2`; // Max 13 chars (4+8+1)
    const patientEmail1 = `webuiautomation+filter${shortTimestamp}1${shortWorkspaceId}@tidepool.org`;
    const patientEmail2 = `webuiautomation+filter${shortTimestamp}2${shortWorkspaceId}@tidepool.org`;

    test(
      `Clinician - Filter Patients by Name [${workspace}]`,
      {
        tag: createValidatedTags([
          TEST_TAGS.CLINICIAN,
          TEST_TAGS.UI,
          TEST_TAGS.HIGH,
          TEST_TAGS.REGRESSION,
        ]),
      },
      async ({ page }) => {
        // Step 1: Log in to clinician account
        await test.step('Given clinician has been logged in', async () => {
          await test.clinician.setup(page);
        });

        // Step 2: Navigate to specific workspace
        await test.step(`When user navigates to workspace ${workspace}`, async () => {
          await test.clinician.navigateToWorkspace(workspace, page);
        });

        // Create pages
        const clinicWorkspacePage = new ClinicianDashboardPage(page);

        // Step 3: Create Patient A
        await test.step('When Patient A has been created', async () => {
          // Check if Patient A already exists
          await clinicWorkspacePage.searchForPatient(patientName1);
          let patientAExists = false;
          try {
            await expect(clinicWorkspacePage.getPatientCellByName(patientName1)).toBeVisible({
              timeout: 3000,
            });
            patientAExists = true;
          } catch {
            patientAExists = false;
          }

          if (!patientAExists) {
            await clinicWorkspacePage.openAndFillAddPatientDialog(
              patientName1,
              patientBirthdate,
              patientMRN1,
              patientEmail1,
            );
            await clinicWorkspacePage.submitAddPatientDialog();
            await clinicWorkspacePage.closeBringDataDialog();
          }

          // Search for the patient to ensure it's visible in the list
          await clinicWorkspacePage.searchForPatient(patientName1);
          await expect(clinicWorkspacePage.getPatientCellByName(patientName1)).toBeVisible({
            timeout: 10000,
          });
        });

        // Step 4: Create Patient B
        await test.step('When Patient B has been created', async () => {
          // Check if Patient B already exists
          await clinicWorkspacePage.searchForPatient(patientName2);
          let patientBExists = false;
          try {
            await expect(clinicWorkspacePage.getPatientCellByName(patientName2)).toBeVisible({
              timeout: 3000,
            });
            patientBExists = true;
          } catch {
            patientBExists = false;
          }

          if (!patientBExists) {
            await clinicWorkspacePage.openAndFillAddPatientDialog(
              patientName2,
              patientBirthdate,
              patientMRN2,
              patientEmail2,
            );
            await clinicWorkspacePage.submitAddPatientDialog();
            await clinicWorkspacePage.closeBringDataDialog();
          }

          // Search for the patient to ensure it's visible in the list
          await clinicWorkspacePage.searchForPatient(patientName2);
          await expect(clinicWorkspacePage.getPatientCellByName(patientName2)).toBeVisible({
            timeout: 10000,
          });
        });

        // Step 5: Filter by Patient A
        await test.step("When user filters by Patient A's name", async () => {
          await clinicWorkspacePage.searchForPatient(patientName1);
        });

        // Step 6: Verify only Patient A is visible
        await test.step('Then only Patient A should be visible', async () => {
          await clinicWorkspacePage.searchForPatient(patientName1); // Search to ensure list is populated
          const patientCell1 = clinicWorkspacePage.getPatientCellByName(patientName1);
          const patientCell2 = clinicWorkspacePage.getPatientCellByName(patientName2);
          await expect(patientCell1).toBeVisible();
          await expect(patientCell2).not.toBeVisible();
        });

        // Step 7: Clear the filter
        await test.step('When user clears the filter', async () => {
          await clinicWorkspacePage.searchForPatient(''); // Clear search by searching for empty string
        });

        // Step 8: Verify both patients are visible
        await test.step('Then both patients should be visible again', async () => {
          await clinicWorkspacePage.searchForPatient(''); // Clear search to show all patients
          const patientCell1 = clinicWorkspacePage.getPatientCellByName(patientName1);
          const patientCell2 = clinicWorkspacePage.getPatientCellByName(patientName2);
          await expect(patientCell1).toBeVisible();
          await expect(patientCell2).toBeVisible();
        });
      },
    );
  });
});
