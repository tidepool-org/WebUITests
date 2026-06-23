import { expect } from '@fixtures/base';
import { test, ALL_WORKSPACE_KEYS } from '@fixtures/clinic-helpers';
import { WorkspaceKey } from '@pom/clinician/ClinicianNavigation';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';
import { getProfileMetadataSchema } from '../../../endpoint-schema/profile-endpoints';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';
import { createNetworkHelper } from '../../fixtures/network-helpers';

ALL_WORKSPACE_KEYS.forEach((workspace: WorkspaceKey) => {
  test.describe('Custodial patients are allowed access and modification of profile details', () => {
    // Define the patient data at top level (unique per workspace)
    const currentDate = Date.now();
    const workspaceId = workspace.replace(/[^a-zA-Z0-9]/g, ''); // Clean workspace name for IDs
    const patientName = `New Patient ${currentDate}`;
    const patientBirthdate = '01/01/2000';
    const patientMRN = '123456789';
    const patientEmail = `webuiautomation+createdprofile${currentDate}@tidepool.org`; // must be lowercase to pass email validation
    const randomSeed = Math.random();
    const randomId = Math.floor(randomSeed * 10000);
    const updatedName = `New Patient Updated ${Math.floor(Math.random() * 10000)}-${workspaceId}`;
    const updateBirthDate = `05/20/1991`;
    const updateMRN = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 10).toString(),
    ).join('');
    const updateEmail = `webuiautomation+updatedprofile${randomId}@tidepool.org`; // must be lowercase to pass email validation

    // API Test cases require this to capture network activity
    let api: ReturnType<typeof createNetworkHelper>;
    let producerGetCapture: any;

    test(
      `Clinician - Add Patient->Edit->Delete [${workspace}]`,
      {
        tag: createValidatedTags([
          TEST_TAGS.CLINICIAN,
          TEST_TAGS.API,
          TEST_TAGS.UI,
          TEST_TAGS.HIGH,
          TEST_TAGS.API_PROFILE,
        ]),
      },
      async ({ page }, testInfo) => {
        // Step 1: Log in to clinician account and setup network capture
        await test.step(
          'Given clinician has been logged in',
          async () => {
            api = createNetworkHelper(page);
            await api.startCapture();
            await test.clinician.setup(page);
          },
          {
            detail:
              'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password as "UI Auto Clinician".',
          },
        );

        // Step 2: Navigate to workspace
        await test.step(
          `When user navigates to workspace ${workspace}`,
          async () => {
            await test.clinician.navigateToWorkspace(workspace, page);
          },
          {
            detail:
              'Open the workspace switcher and select the target clinic workspace for this test.',
          },
        );

        // Create pages
        const clinicianDashboardPage = new ClinicianDashboardPage(page);

        // Step 3: Click the New Patient button and fill out the form
        await test.step(
          'And user clicks the new patient button and fills out the form',
          async () => {
            await clinicianDashboardPage.openAndFillAddPatientDialog(
              patientName,
              patientBirthdate,
              patientMRN,
              patientEmail,
            );
          },
          {
            detail:
              'Click Add New Patient and enter the patient name, birthdate, MRN, and email in the dialog.',
          },
        );

        // Step 4: Submit the New Patient form
        await test.step(
          'And user submits the new patient form',
          async () => {
            await clinicianDashboardPage.submitAddPatientDialog();
          },
          { detail: 'Click the submit button to save the new patient record.' },
        );

        // Step 5: Close Bring Data Dialog
        await test.step(
          'And user closes the bring data dialog',
          async () => {
            await clinicianDashboardPage.closeBringDataDialog();
          },
          {
            detail:
              'Dismiss the bring data into Tidepool dialog that appears after adding the patient.',
          },
        );

        // Step 6: Search for the newly added patient
        await test.step(
          'And user searches for the newly added patient',
          async () => {
            await clinicianDashboardPage.searchForPatient(patientName);
          },
          { detail: 'Type the new patient name into the patient search field to filter the list.' },
        );

        // Step 7: Verify the new patient appears in the patient list
        await test.step(
          'Then the new patient should appear in the patient list',
          async () => {
            await clinicianDashboardPage.searchForPatient(patientName);
            const patientCell = clinicianDashboardPage.getPatientCellByName(patientName);
            await expect(patientCell).toBeVisible();
          },
          {
            detail:
              'Confirm the newly added patient is shown as a row in the filtered patient list.',
          },
        );

        // Step 8: Click the first patient in the list and capture profile load
        await test.step(
          'When user clicks on the patient in the list',
          async () => {
            const clickTimestamp = Date.now();
            await clinicianDashboardPage.clickPatientCell(patientName);

            // Wait for the profile GET request to complete after the click
            producerGetCapture = await api.waitForCaptureMatching(
              getProfileMetadataSchema.method,
              getProfileMetadataSchema.url as RegExp,
              clickTimestamp,
              15000, // Wait up to 15 seconds
            );
          },
          { detail: 'Click the patient row to open their profile and load the profile details.' },
        );

        // Step 9: Validate captured response and creation values
        await (test as any).stepNoScreenshot(
          'Then profile endpoint responds with GET request consistent with schema and saved values [no-screenshot]',
          async () => {
            await api.validateEndpointResponse('profile-metadata-get');

            // Validate that creation values appear in correct GET response fields
            const expectedFieldValues = {
              fullName: patientName,
              'patient.birthday': '2000-01-01', // API returns birthdate in YYYY-MM-DD format
              'patient.mrn': patientMRN,
              email: patientEmail,
            };

            api.validateResponseFields(producerGetCapture, expectedFieldValues);
          },
          {
            detail:
              'Confirm the profile-metadata-get endpoint responds and the payload matches the expected schema and the values just entered for the patient.',
          },
        );

        // Step 10: Click 'Edit Patient Details' option from the dropdown
        await test.step(
          "When user clicks 'Edit Patient Details' option",
          async () => {
            await clinicianDashboardPage.clickEditPatientDetailsMenuItem();
          },
          {
            detail:
              'Select the Edit Patient Details option from the patient menu to open the profile editor.',
          },
        );

        // Step 11: Change profile fields
        await test.step(
          'And user updates profile fields',
          async () => {
            const profilePage = new ProfilePage(page);

            // Get current diagnosis index and calculate next one (1-7, wrapping)
            const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
            let nextDiagnosisIndex = currentDiagnosisIndex + 1;
            if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
              nextDiagnosisIndex = 1;
            }

            // Update fields using ProfilePage methods
            await profilePage.fillFullName(updatedName);
            await profilePage.fillBirthDate(updateBirthDate);
            await profilePage.fillMRN(updateMRN);
            await profilePage.selectDiagnosisType(nextDiagnosisIndex);
            await profilePage.fillEmail(updateEmail);
          },
          {
            detail:
              'Change the full name, birthdate, MRN, diagnosis type, and email fields on the profile edit form to new values.',
          },
        );

        // Step 12: Save profile edit
        await test.step(
          'And user saves profile changes',
          async () => {
            const profilePage = new ProfilePage(page);
            await profilePage.saveProfile();
          },
          { detail: 'Click Save to persist the updated profile details.' },
        );

        // Step 13: Navigate to workspace
        await test.step(
          `And user navigates to workspace ${workspace}`,
          async () => {
            await test.clinician.navigateToWorkspace(workspace, page);
            // Wait for the patient list to be ready before any search interactions
            await clinicianDashboardPage.waitForLoadState();
          },
          {
            detail:
              'Return to the clinic workspace and wait for the patient list to finish loading.',
          },
        );

        // Step 14: Search for the edited patient
        await test.step(
          'And user searches for the new edited patient',
          async () => {
            await clinicianDashboardPage.searchForPatient(updatedName);
          },
          {
            detail:
              'Type the updated patient name into the patient search field to filter the list.',
          },
        );

        // Step 15: Verify the edited patient appears in the patient list
        await test.step(
          'Then the edited patient should appear in the patient list',
          async () => {
            await clinicianDashboardPage.searchForPatient(updatedName);
            const patientCell = clinicianDashboardPage.getPatientCellByName(updatedName);
            await expect(patientCell).toBeVisible();
          },
          { detail: 'Confirm the patient now appears in the list under the updated name.' },
        );

        // Step 16: Click the first patient in the list and capture profile load
        await test.step(
          'When user clicks on the patient in the list',
          async () => {
            const clickTimestamp = Date.now();
            await clinicianDashboardPage.clickPatientCell(updatedName);

            // Wait for the profile GET request to complete after the click
            producerGetCapture = await api.waitForCaptureMatching(
              getProfileMetadataSchema.method,
              getProfileMetadataSchema.url as RegExp,
              clickTimestamp,
              15000, // Wait up to 15 seconds
            );
          },
          {
            detail:
              'Click the patient row to reopen their profile and load the updated profile details.',
          },
        );

        // Step 17: Validate captured response and creation values
        await (test as any).stepNoScreenshot(
          'Then profile endpoint responds with GET request consistent with schema and saved values [no-screenshot]',
          async () => {
            await api.validateEndpointResponse('profile-metadata-get');

            // Validate that creation values appear in correct GET response fields
            const expectedFieldValues = {
              fullName: updatedName,
              'patient.birthday': '1991-05-20', // API returns birthdate in YYYY-MM-DD format
              'patient.mrn': updateMRN,
              email: updateEmail,
            };

            api.validateResponseFields(producerGetCapture, expectedFieldValues);
          },
          {
            detail:
              'Confirm the profile-metadata-get endpoint responds and the payload matches the expected schema and the updated patient values.',
          },
        );

        // Step 18: Navigate to workspace
        await test.step(
          `When user navigates to workspace ${workspace}`,
          async () => {
            await test.clinician.navigateToWorkspace(workspace, page);
            // Wait for the patient list to be ready before any search interactions
            await clinicianDashboardPage.waitForLoadState();
          },
          {
            detail:
              'Return to the clinic workspace again and wait for the patient list to finish loading.',
          },
        );

        // Step 19: Search for the edited patient
        await test.step(
          'And user searches for the new edited patient',
          async () => {
            await clinicianDashboardPage.searchForPatient(updatedName);
          },
          {
            detail:
              'Type the updated patient name into the patient search field to filter the list.',
          },
        );

        // Step 20: Verify the edited patient appears in the patient list
        await test.step(
          'Then the edited patient should appear in the patient list',
          async () => {
            await clinicianDashboardPage.searchForPatient(updatedName);
            const patientCell = clinicianDashboardPage.getPatientCellByName(updatedName);
            await expect(patientCell).toBeVisible();
          },
          { detail: 'Confirm the patient still appears in the list under the updated name.' },
        );

        // Step 21: Select '...' within the patient row
        await test.step(
          'When user opens the options dropdown for the patient',
          async () => {
            await clinicianDashboardPage.openFirstPatientOptionsDropdown();
          },
          { detail: 'Click the ... options menu on the patient row to open its dropdown.' },
        );

        // Step 21a: Member users do not have remove patient option
        if (workspace.includes('Member')) {
          await test.step(
            'Then Remove Patient option is not present for Member users',
            async () => {
              await expect(clinicianDashboardPage.removePatientButton).not.toBeVisible();
            },
            {
              detail:
                'Confirm that the Remove Patient option is absent from the dropdown for Member-role users.',
            },
          );
          return;
        }

        // Step 22: Click 'Remove Patient' option from the dropdown
        await test.step(
          "When user clicks 'Remove Patient' option",
          async () => {
            await clinicianDashboardPage.clickRemovePatientMenuItem();
          },
          { detail: 'Select the Remove Patient option from the patient options dropdown.' },
        );

        // Step 23: Click Remove button in confirmation dialog
        await test.step(
          'And user confirms patient removal',
          async () => {
            await clinicianDashboardPage.confirmRemovePatient();
          },
          { detail: 'Click the Remove button in the confirmation dialog to delete the patient.' },
        );

        // Step 24: Search for the removed patient
        await test.step(
          'And user searches for the removed patient',
          async () => {
            await clinicianDashboardPage.searchForPatient(updatedName);
          },
          {
            detail:
              'Type the removed patient name into the patient search field to filter the list.',
          },
        );

        // Step 25: Verify the deleted patient does not appear in patient list
        await test.step(
          'Then the deleted patient should not appear in the patient list',
          async () => {
            const patientCell = clinicianDashboardPage.getPatientCellByName(updatedName);
            await expect(patientCell).not.toBeVisible();
          },
          { detail: 'Confirm the deleted patient no longer appears anywhere in the patient list.' },
        );
      },
    );
  });
});
