import * as fs from 'node:fs';
import { WorkspaceKey } from '@pom/clinician/ClinicianNavigation';
import { test, ALL_WORKSPACE_KEYS } from '../../fixtures/clinic-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

ALL_WORKSPACE_KEYS.forEach((workspace: WorkspaceKey) => {
  test.describe('Custodial patients are allowed access and modification of profile details', () => {
    // Define the patient search term
    const CUSTODIAL_PATIENT_SEARCH = 'Custodial Patient';

    const updatedName = `Custodial Patient Updated ${Math.floor(
      Math.random() * 10000,
    )}-${workspace}`;
    const updateBirthYear = 1990 + Math.floor(Math.random() * 30);
    const updateBirthDate = `05/20/${updateBirthYear}`;
    const updateMRN = Array.from({ length: 15 }, () =>
      Math.floor(Math.random() * 10).toString(),
    ).join('');
    const updateEmail = `webuiautomation+updatedprofile${Math.floor(Math.random() * 10000)}@tidepool.org`; // must be lowercase to pass email validation

    // API Test cases require this to capture network activity
    let api: ReturnType<typeof createNetworkHelper>;
    let producerGetCapture: any;

    test(
      `Clinician - Edit Custodial Profile [${workspace}]`,
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
        await test.step('Given clinician has been logged in', async () => {
          api = createNetworkHelper(page);
          await api.startCapture();
          await test.clinician.setup(page);
        });

        // Step 2: Navigate to workspace
        await test.step(`When user navigates to workspace ${workspace}`, async () => {
          await test.clinician.navigateToWorkspace(workspace, page);
        });

        // Step 3: Access custodial patient
        await test.step('When user accesses a custodial patient summary', async () => {
          await test.clinician.findAndAccessPatientByPartialName(CUSTODIAL_PATIENT_SEARCH, page);
        });

        // Step 4: Navigate to profile
        await test.step('When user navigates to Profile Edit page', async () => {
          await test.clinician.navigateTo('ProfileEdit', page);
        });

        // Step 5: Capture GET response
        await test.step('Then profile endpoint responds with GET request consistent with schema [no-screenshot]', async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        });

        // Create Profile page for following steps
        const profilePage = new ProfilePage(page);

        // Step 7: Change profile fields (custodial access)
        await test.step('When user updates profile fields', async () => {
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
        });

        // Step 8: Save profile edit
        await test.step('When user saves profile changes', async () => {
          await profilePage.saveProfile();
        });

        // Step 13: Navigate to workspace
        await test.step(`When user navigates to workspace ${workspace}`, async () => {
          await test.clinician.navigateToWorkspace(workspace, page);
        });

        // Step 3: Access custodial patient
        await test.step('When user accesses a custodial patient summary', async () => {
          await test.clinician.findAndAccessPatientByPartialName(CUSTODIAL_PATIENT_SEARCH, page);
        });

        // Step 9: Validate captured response and creation values
        await (test as any).stepNoScreenshot(
          'Then profile endpoint responds with GET request consistent with schema and saved values [no-screenshot]',
          async () => {
            producerGetCapture = await api.validateEndpointResponse('profile-metadata-get');

            // Validate that creation values appear in correct GET response fields
            const expectedFieldValues = {
              fullName: updatedName,
              'patient.birthday': `${updateBirthYear}-05-20`, // API returns birthdate in YYYY-MM-DD format
              'patient.mrn': updateMRN,
              email: updateEmail,
            };

            api.validateResponseFields(producerGetCapture, expectedFieldValues);
          },
        );
        await api.stopCapture();
      },
    );
  });
});
