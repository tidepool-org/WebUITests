import { test } from '../../fixtures/patient-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { getProfileMetadataSchema } from '../../../endpoint-schema/profile-endpoints';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

test.describe('Personal Accounts allow access and modification of profile details', () => {
  const updatedName = `Personal Patient Updated ${Math.floor(Math.random() * 10000)}`;
  const updateBirthYear = 1990 + Math.floor(Math.random() * 30);
  const updateBirthDate = `06/21/${updateBirthYear}`;

  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;
  let producerGetCapture: any;

  test(
    'Personal - Edit Profile Details',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.PERSONAL,
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // Step 1: Log in to personal account and setup network capture
      await test.step(
        'Given personal account has been logged in',
        async () => {
          api = createNetworkHelper(page);
          await api.startCapture();
          await page.goto('/data');
          await test.patient.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated personal account credentials stored in 1Password as "UI Auto Personal Patient".',
        },
      );

      // Step 2: User navigates to Profile page
      await test.step(
        'When user navigates to Profile page',
        async () => {
          await test.patient.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the account navigation menu.' },
      );

      // Step 3: GET response is pulled and validated
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
        {
          detail:
            'Confirm the profile-metadata GET endpoint responds and the payload matches the expected schema.',
        },
      );

      // Step 4: Confirm edit button and click it
      await test.step(
        'When user selects Edit button',
        async () => {
          await test.patient.navigateTo('ProfileEdit', page);
        },
        { detail: 'Click the Edit button to open the profile in editable mode.' },
      );

      // Initialize ProfilePage for steps 4 and 5
      const profilePage = new ProfilePage(page);

      // Step 5: Change profile fields (confirmed user access)
      await test.step(
        'And user updates profile fields',
        async () => {
          // Generate random 15-letter string for clinical notes
          const randomString = Array.from({ length: 15 }, () =>
            String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          ).join('');

          // Get current diagnosis index and calculate next one (1-7, wrapping)
          const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
          let nextDiagnosisIndex = currentDiagnosisIndex + 1;
          if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
            nextDiagnosisIndex = 1;
          }

          // Update fields using ProfilePage methods
          await profilePage.fillFullName(updatedName);
          await profilePage.fillDateOfBirth(updateBirthDate);
          await profilePage.selectDiagnosisType(nextDiagnosisIndex);
          await profilePage.fillClinicalNotes(randomString);
        },
        {
          detail:
            'Change the full name, date of birth, diagnosis type, and clinical notes fields to new values.',
        },
      );

      // Step 6: Save profile edit
      await test.step(
        'And user saves profile changes',
        async () => {
          await profilePage.saveProfile();
        },
        { detail: 'Click Save to submit the updated profile.' },
      );

      // Step 7: GET response is validated and saved for comparison
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema and saved values',
        async () => {
          const clickTimestamp = Date.now();
          await api.reloadPage('load');
          producerGetCapture = await api.waitForCaptureMatching(
            getProfileMetadataSchema.method,
            getProfileMetadataSchema.url as RegExp,
            clickTimestamp,
            15000,
          );
          const expectedFieldValues = {
            fullName: updatedName,
            'patient.birthday': `${updateBirthYear}-06-21`, // API returns birthdate in YYYY-MM-DD format
          };
          api.validateResponseFields(producerGetCapture, expectedFieldValues);
        },
        {
          detail:
            'Confirm the profile-metadata GET endpoint responds and the payload matches the expected schema and the saved profile values.',
        },
      );

      await api.stopCapture();
    },
  );
});
