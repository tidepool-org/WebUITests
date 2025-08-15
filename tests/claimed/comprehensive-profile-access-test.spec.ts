import { test } from '../fixtures/patient-helpers';
import { test as clinicTest } from '../fixtures/clinic-helpers';
import { test as accountTest } from '../fixtures/account-helpers';
import { createNetworkHelper } from '../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../fixtures/test-tags';
import { ProfilePage } from '../../page-objects/patient/ProfilePage';

const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
const CLAIMED_PATIENT_SEARCH = 'Claimed Patient';

test.describe('Comprehensive Profile Access Test: Edit as Claimed, View as Shared and Clinician', () => {
  test(
    'should edit claimed profile then verify view-only access for shared and clinician users',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT, // User Type (required)
        TEST_TAGS.CLINICIAN, // User Type (required)
        TEST_TAGS.API, // Test Type (required)
        TEST_TAGS.UI, // Test Type (required)
        TEST_TAGS.HIGH, // Priority (required)
        TEST_TAGS.PROFILE, // Feature (optional)
      ]),
    },
    async ({ page }) => {
      let api: ReturnType<typeof createNetworkHelper>;
      let producerPutCapture: any;

      // ========== PHASE 1: CLAIMED USER EDITS PROFILE ==========

      // Step 1: Claimed account has been logged in
      await test.step('Given claimed account has been logged in', async () => {
        api = createNetworkHelper(page);
        await api.startCapture();
        await page.goto('/data');
        await test.patient.setup(page);
      });

      // Step 2: User navigates to Profile page
      await test.step('When user navigates to Profile page', async () => {
        await test.patient.navigateTo('Profile', page);
      });

      // Step 3: GET response is pulled and validated
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
      );

      // Step 4: Confirm edit button and click it
      await test.step('When user selects Edit button', async () => {
        await test.patient.navigateTo('ProfileEdit', page);
      });

      // Initialize ProfilePage for steps 4 and 5
      const profilePage = new ProfilePage(page);

      // Step 5: Change profile fields (confirmed user access)
      await test.step('When user updates profile fields', async () => {
        const testRunId = Math.floor(Math.random() * 10000);
        const updatedName = `Claimed User Updated ${testRunId}`;
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

      // Step 7: PUT response is validated and saved for comparison
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with PUT request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-put');
          const putSchema = await import('../../endpoint-schema/profile-endpoints');
          const schema = putSchema.putProfileMetadataSchema;
          producerPutCapture = api.getLatestCaptureMatching(schema.method, schema.url as RegExp);
        },
      );

      //= ========= SHARED MEMEBER VIEWS PROFILE ==========

      // Step 8: Switch to shared user authentication
      await test.step('When shared user views claimed user profile', async () => {
        await accountTest.account.switchUser('shared', page);
        await page.goto('/data');
        await test.patient.navigateTo('ViewData', page);
      });

      // Step 9: Validate GET response and confirm view-only access
      await test.step('When user navigates to Profile page', async () => {
        await test.patient.navigateTo('Profile', page);
      });

      // Step 10: Confirm edit button is not present
      await test.step('Then Edit button should not be present for shared patients', async () => {
        await profilePage.editButtonDisplays(false);
      });

      // Step 11: Validate GET response and compare it against the
      await (test as any).stepNoScreenshot(
        'Then shared user sees view-only claimed profile data with matching data',
        async () => {
          await api.compareEndpointResponse('profile-metadata-get', producerPutCapture);
        },
      );

      // ========== CLINICIAN VIEWS PROFILE ==========

      // Step 12: Switch to clinician authentication and navigate to patient profile
      await test.step('When clinician accesses patient workspace', async () => {
        await accountTest.account.switchUser('clinician', page);
        await page.goto('/');
        await clinicTest.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
      });

      // Step 13: Access the specific claimed patient that was modified by the producer test
      await test.step('When user accesses the claimed patient modified by producer test', async () => {
        await clinicTest.clinician.findAndAccessPatientByPartialName(CLAIMED_PATIENT_SEARCH, page);
      });

      // Step 14: Navigate to profile
      await test.step('When user navigates to Profile page', async () => {
        await clinicTest.clinician.navigateTo('Profile', page);
      });

      // Step 15: Confirm edit button is not present
      await test.step('Then Edit button should not be present for claimed patients', async () => {
        await profilePage.editButtonDisplays(false);
      });

      // Step 16: Validate GET response and confirm appropriate permissions
      await (test as any).stepNoScreenshot(
        'Then clinician sees claimed profile data with matching data and no save access',
        async () => {
          await api.compareEndpointResponse('profile-metadata-get', producerPutCapture);
        },
      );
    },
  );
});
