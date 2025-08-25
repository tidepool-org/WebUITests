import { expect } from '@fixtures/base';
import { test } from '@fixtures/clinic-helpers';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';

test.describe('Custodial patients are allowed access and modification of profile details', () => {
  // Define the workspace and patient at top level
  const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
  const currentDate = Date.now();
  const patientName = `New Patient ${currentDate}`;
  const patientBirthdate = '01/01/2000';

  test(
    'should allow navigation to profile details and edit profile fields',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN, // User Type (required)
        TEST_TAGS.API, // Test Type (required)
        TEST_TAGS.UI, // Test Type (required)
        TEST_TAGS.HIGH, // Priority (required)
      ]),
    },
    async ({ page }, testInfo) => {
      // Step 1: Log in to clinician account and setup network capture
      await test.step('Given clinician has been logged in', async () => {
        await test.clinician.setup(page);
      });

      // Step 2: Navigate to workspace
      await test.step('When user navigates to desired workspace', async () => {
        await test.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
      });

      //Create pages
      const clinicianDashboardPage = new ClinicianDashboardPage(page);

      //Step 3: Click the New Patient button and fill out the form
      await test.step('When user clicks the new patient button and fills out the form', async () => {
        await clinicianDashboardPage.openAndFillAddPatientDialog(patientName, patientBirthdate);
      });

      // Step 4: Submit the New Patient form
      await test.step('When user submits the new patient form', async () => {
        await clinicianDashboardPage.submitAddPatientDialog();
      });

      // Step 5: Close Bring Data Dialog
      await test.step('When user closes the bring data dialog', async () => {
        await clinicianDashboardPage.closeBringDataDialog();
      });

      // Step 6: Search for the newly added patient
      await test.step('When user searches for the newly added patient', async () => {
        await clinicianDashboardPage.searchForPatient(patientName);
      });

      // Step 7: Verify the new patient appears in the patient list
      await test.step('Then the new patient should appear in the patient list', async () => {
        await clinicianDashboardPage.searchForPatient(patientName);
        const patientCell = clinicianDashboardPage.getPatientCellByName(patientName);
        await expect(patientCell).toBeVisible();
      });

      // Step 8: Select '...' within the patient row
      await test.step("When user opens the options dropdown for the patient", async () => {
        await clinicianDashboardPage.openFirstPatientOptionsDropdown();
      });

      // Step 9: Click 'Remove Patient' option from the dropdown
      await test.step("When user clicks 'Remove Patient' option", async () => {
        await clinicianDashboardPage.clickRemovePatientMenuItem();
      });

      // Step 10: Click Remove button in confirmation dialog
      await test.step("When user confirms patient removal", async () => {
        await clinicianDashboardPage.confirmRemovePatient();
      });

      // Step 11: Search for the removed patient
      await test.step("When user searches for the removed patient", async () => {
        await clinicianDashboardPage.searchForPatient(patientName);
      });

      // Step 12: Verify the deleted patient does not appear in patient list
      await test.step("Then the deleted patient should not appear in the patient list", async () => {
        const patientCell = clinicianDashboardPage.getPatientCellByName(patientName);
        await expect(patientCell).not.toBeVisible();
      });
    },
  );
});
