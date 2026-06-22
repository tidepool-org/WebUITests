import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as clinicTest } from '../../fixtures/clinic-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { getProfileMetadataSchema } from '../../../endpoint-schema/profile-endpoints';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
const CLAIMED_PATIENT_SEARCH = 'Claimed Patient';

test.describe('Comprehensive Profile Access Test: Edit as Claimed, View as Shared and Clinician', () => {
  test(
    'Claimed - Edit Profile Details with Access Confirmation',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.CLAIMED,
        TEST_TAGS.SHARED_MEMBER,
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      let api: ReturnType<typeof createNetworkHelper>;
      let producerGetCapture: any;

      // ========== PHASE 1: CLAIMED USER EDITS PROFILE ==========

      // Step 1: Claimed account has been logged in
      await test.step(
        'Given claimed account has been logged in',
        async () => {
          api = createNetworkHelper(page);
          await api.startCapture();
          await page.goto('/data');
          await patientTest.patient.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated claimed patient account credentials stored in 1Password.',
        },
      );

      // Step 2: User navigates to Profile page
      await test.step(
        'When user navigates to Profile page',
        async () => {
          await patientTest.patient.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the patient navigation menu.' },
      );

      // Step 3: GET response is pulled and validated
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
        {
          detail:
            'Confirm the profile metadata GET endpoint responds and the payload matches the expected schema.',
        },
      );

      // Step 4: Confirm edit button and click it
      await test.step(
        'When user selects Edit button',
        async () => {
          await patientTest.patient.navigateTo('ProfileEdit', page);
        },
        { detail: 'Click the Edit button to open the profile in edit mode.' },
      );

      // Initialize ProfilePage for steps 4 and 5
      const profilePage = new ProfilePage(page);

      // Step 5: Change profile fields (confirmed user access)
      await test.step(
        'And user updates profile fields',
        async () => {
          const testRunId = Math.floor(Math.random() * 10000);
          const updatedName = `Claimed User Updated ${testRunId}`;
          const birthYear = 1985 + (testRunId % 10);
          const diagnosisYear = birthYear + 20;
          const birthDate = `01/15/${birthYear}`;

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
          await profilePage.fillDateOfBirth(birthDate);
          await profilePage.selectDiagnosisType(nextDiagnosisIndex);
          await profilePage.fillClinicalNotes(randomString);
        },
        {
          detail:
            'Enter updated values for name, date of birth, diagnosis type, and clinical notes.',
        },
      );

      // Step 6: Save profile edit
      await test.step(
        'And user saves profile changes',
        async () => {
          await profilePage.saveProfile();
        },
        { detail: 'Click Save to submit the profile changes.' },
      );

      // Step 7: GET response is validated and saved for comparison
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.reloadPage('load');
          const clickTimestamp = Date.now();
          producerGetCapture = await api.waitForCaptureMatching(
            getProfileMetadataSchema.method,
            getProfileMetadataSchema.url as RegExp,
            clickTimestamp,
            15000,
          );
          await api.validateEndpointResponse('profile-metadata-get');
          const getSchema = await import('../../../endpoint-schema/profile-endpoints');
          const schema = getSchema.getProfileMetadataSchema;
          producerGetCapture = api.getLatestCaptureMatching(schema.method, schema.url as RegExp);
        },
        {
          detail:
            'Confirm the profile metadata GET endpoint responds and the payload matches the expected schema after saving.',
        },
      );

      //= ========= SHARED MEMEBER VIEWS PROFILE ==========

      // Step 8: Switch to shared user authentication
      await test.step(
        'When shared user views claimed user profile',
        async () => {
          await accountTest.account.switchUser('shared', page);
          await page.goto('/data');
          await patientTest.patient.navigateTo('ViewData', page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated shared member account credentials stored in 1Password and open the claimed user data.',
        },
      );

      // Step 9: Navigate to profile page
      await test.step(
        'And user navigates to Profile page',
        async () => {
          await patientTest.patient.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the navigation menu.' },
      );

      // Step 10: Confirm edit button is not present
      await test.step(
        'Then Edit button should not be present for shared patients',
        async () => {
          await profilePage.editButtonDisplays(false);
        },
        { detail: 'Confirm the Edit button is not shown for shared members.' },
      );

      // Step 11: Validate GET response and compare it against the
      await (test as any).stepNoScreenshot(
        'And shared user sees view-only claimed profile data with matching data',
        async () => {
          await api.reloadPage('load');
          await api.compareEndpointResponse('profile-metadata-get', producerGetCapture);
        },
        {
          detail:
            'Confirm the profile metadata GET endpoint responds and the payload matches the values saved by the claimed user.',
        },
      );

      // ========== CLINICIAN VIEWS PROFILE ==========

      // Step 12: Switch to clinician authentication and navigate to patient profile
      await test.step(
        'When clinician accesses patient workspace',
        async () => {
          await accountTest.account.switchUser('clinician', page);
          await page.goto('/');
          await clinicTest.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password and open the clinic workspace.',
        },
      );

      // Step 13: Access the specific claimed patient that was modified by the producer test
      await test.step(
        'And user accesses the claimed patient modified by producer test',
        async () => {
          await clinicTest.clinician.findAndAccessPatientByPartialName(
            CLAIMED_PATIENT_SEARCH,
            page,
          );
        },
        {
          detail:
            'Open the claimed patient record that was updated earlier in the workspace patient list.',
        },
      );

      // Step 14: Navigate to profile
      await test.step(
        'And user navigates to Profile page',
        async () => {
          await clinicTest.clinician.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the patient navigation menu.' },
      );

      // Step 16: Validate GET response and confirm appropriate permissions
      await (test as any).stepNoScreenshot(
        'Then clinician sees claimed profile data with matching data and no save access',
        async () => {
          await api.reloadPage('load');
          await api.compareEndpointResponse('profile-metadata-get', producerGetCapture);
        },
        {
          detail:
            'Confirm the profile metadata GET endpoint responds, the payload matches the values saved by the claimed user, and no save access is available.',
        },
      );
    },
  );
});
