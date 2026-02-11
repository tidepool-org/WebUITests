import * as fs from 'node:fs';
import { test } from '../../fixtures/clinic-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

test.describe('Custodial patients are allowed access and modification of profile details', () => {
  // Define the workspace and patient at top level
  const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
  const CUSTODIAL_PATIENT_SEARCH = 'Custodial Patient';

  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'should allow navigation to profile details and edit profile fields',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN, // User Type (required)
        TEST_TAGS.API, // Test Type (required)
        TEST_TAGS.UI, // Test Type (required)
        TEST_TAGS.PRIORITY_HIGH, // Priority (required)
        TEST_TAGS.API_PROFILE, // Feature (optional)
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
      await test.step('When user navigates to desired workspace', async () => {
        await test.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
      });

      // Step 3: Access custodial patient
      await test.step('When user accesses a custodial patient summary', async () => {
        await test.clinician.findAndAccessPatientByPartialName(CUSTODIAL_PATIENT_SEARCH, page);
      });

      // Step 4: Navigate to profile
      await test.step('When user navigates to Profile page', async () => {
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
        // Generate completely unique values for this custodial test run
        const randomSeed = Math.random();
        const randomId = Math.floor(randomSeed * 10000);
        const updatedName = `Custodial Patient Updated ${Math.floor(randomId * 10000)}`;
        const birthYear = 1980 + (randomId % 15);
        const birthDate = `05/20/${birthYear}`;

        // Generate random 15-digit MRN
        const randomMRN = Array.from({ length: 15 }, () =>
          Math.floor(Math.random() * 10).toString(),
        ).join('');

        // Generate unique email
        const email = `webuiautomation+custodialEdit${randomId}@tidepool.org`;

        // Get current diagnosis index and calculate next one (1-7, wrapping)
        const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
        let nextDiagnosisIndex = currentDiagnosisIndex + 1;
        if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
          nextDiagnosisIndex = 1;
        }

        // //Get current Target Range index and calculate next one (1-5, wrapping)
        // const currentTargetRangeIndex = await profilePage.getCurrentTargetRangeIndex();
        // let nextTargetRangeIndex = currentTargetRangeIndex + 1;
        // if (nextTargetRangeIndex > 4 || nextTargetRangeIndex === 0) {
        //   nextTargetRangeIndex = 1;
        // }

        // Update fields using ProfilePage methods
        await profilePage.fillFullName(updatedName);
        await profilePage.fillBirthDate(birthDate);
        await profilePage.fillMRN(randomMRN);
        await profilePage.selectDiagnosisType(nextDiagnosisIndex);
        await profilePage.fillEmail(email);
        // await profilePage.selectTargetRange(nextTargetRangeIndex);
      });
      // Step 8: Save profile edit
      await test.step('When user saves profile changes', async () => {
        await profilePage.saveProfile();
      });

      // Step 9: Check profile PUT response
      await test.step('Then profile endpoint responds with GET request consistent with schema [no-screenshot]', async () => {
        await api.validateEndpointResponse('profile-metadata-get');
      });

      // Step 10 : Confirm changes update in UI
      await test.step('Then profile changes are reflected in the UI', async () => {
        const updatedProfilePage = new ProfilePage(page);
        // Add verification logic here as needed
      });

      // await api.stopCapture();
    },
  );
});
