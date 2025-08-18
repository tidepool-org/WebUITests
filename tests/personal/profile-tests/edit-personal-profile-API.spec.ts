
import { test } from '../../fixtures/patient-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

test.describe('Personal Accounts allow access and modification of profile details', () => {
  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'should allow navigation to profile details and edit profile fields',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT, // User Type (required)
        TEST_TAGS.API, // Test Type (required)
        TEST_TAGS.UI, // Test Type (required)
        TEST_TAGS.HIGH, // Priority (required)
        TEST_TAGS.PROFILE, // Feature (optional)
      ]),
    },
    async ({ page }) => {
      // Step 1: Log in to personal account and setup network capture
      await test.step('Given personal account has been logged in', async () => {
        api = createNetworkHelper(page);
        await api.startCapture();
        await page.goto('/data');
        await test.patient.setup(page);

        // Step 2: Navigate to profile
        await test.step('When user navigates to Profile page', async () => {
          await test.patient.navigateTo('Profile', page);
        });

        // Step 3: Check profile GET response
        await test.step('Then profile endpoint responds with GET request consistent with schema [no-screenshot]', async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        });

        // Step 4: Open Edit Profile
        await test.step('When user selects Edit button', async () => {
          await test.patient.navigateTo('ProfileEdit', page);
        });

        // Initialize ProfilePage for steps 4 and 5
        const profilePage = new ProfilePage(page);

        // Step 5: Change profile fields (confirmed user access)
        await test.step('When user updates profile fields', async () => {
          // Generate completely unique values for this confirmed user test run
          const testRunId = Math.floor(Math.random() * 10000);
          const updatedName = `Personal Patient Updated ${testRunId}`;
          const birthYear = 1985 + (testRunId % 10);
          const diagnosisYear = birthYear + 20;
          const birthDate = `01/15/${birthYear}`;
          const diagnosisDate = `03/10/${diagnosisYear}`;

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
          await profilePage.fillBirthDate(birthDate);
          await profilePage.fillDiagnosisDate(diagnosisDate);
          await profilePage.selectDiagnosisType(nextDiagnosisIndex);
          await profilePage.fillClinicalNotes(randomString);
        });

        // Step 6: Save profile edit
        await test.step('When user saves profile changes', async () => {
          await profilePage.saveProfile();
        });

        // Step 7: Check profile PUT response
        await (test as any).stepNoScreenshot(
          'Then profile endpoint responds with PUT request consistent with schema',
          async () => {
            await api.validateEndpointResponse('profile-metadata-put');
          },
        );

        await api.stopCapture();
      });
    },
  );
});
