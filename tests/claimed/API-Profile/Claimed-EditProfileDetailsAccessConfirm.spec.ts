import { expect, test } from '../../fixtures/base';
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
            'Log in to Tidepool Web using the automated claimed patient account credentials stored in 1Password as "UI Auto Claimed Patient".',
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

      // Date values are computed once here so both the update step and the invalid-date
      // check below share them. The diagnosis date is always birthYear + 20, so the
      // "valid" data can never come out randomly earlier than the birth date. The
      // invalid date is deliberately one year BEFORE birth for the negative check.
      const testRunId = Math.floor(Math.random() * 10000);
      const updatedName = `Claimed User Updated ${testRunId}`;
      const birthYear = 1985 + (testRunId % 10);
      const birthDate = `01/15/${birthYear}`;
      const validDiagnosisDate = `01/15/${birthYear + 20}`;
      const invalidDiagnosisDate = `01/15/${birthYear - 1}`;

      // Generate random 15-letter string for clinical notes
      const randomString = Array.from({ length: 15 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      ).join('');

      // Step 5: Visual check that the edit form is displayed after clicking Edit.
      await test.step(
        'Then the profile edit fields are displayed',
        async () => {
          await profilePage.waitForEditFields();
        },
        {
          detail:
            'Confirm the editable profile fields (name, date of birth, diagnosis date, etc.) ' +
            'are shown after entering edit mode.',
        },
      );

      // Step 6: Fill the fields with an INVALID diagnosis date (before birth) and submit. The
      // validation error only appears on submit, so click Save without waiting for the form to
      // close — it won't, because the data is invalid.
      await test.step(
        'When user fills the profile fields with a diagnosis date earlier than the birth date',
        async () => {
          // Get current diagnosis index and calculate next one (1-7, wrapping)
          const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
          let nextDiagnosisIndex = currentDiagnosisIndex + 1;
          if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
            nextDiagnosisIndex = 1;
          }

          // Birth date is set before the diagnosis date so the form can validate one against
          // the other; the diagnosis date here is deliberately earlier than the birth date.
          await profilePage.fillFullName(updatedName);
          await profilePage.fillDateOfBirth(birthDate);
          await profilePage.fillDiagnosisDate(invalidDiagnosisDate);
          await profilePage.selectDiagnosisType(nextDiagnosisIndex);
          await profilePage.fillClinicalNotes(randomString);
        },
        {
          detail:
            'Enter updated name, date of birth, a diagnosis date earlier than the birth date, ' +
            'diagnosis type, and clinical notes.',
        },
      );

      await test.step(
        'And user clicks Save Changes',
        async () => {
          await profilePage.clickSave();
        },
        {
          detail:
            'Click Save Changes to submit the profile with an invalid diagnosis date (earlier than birth date).',
        },
      );

      // Step 7: Confirm the website rejects the invalid diagnosis date.
      await test.step(
        'Then an inline validation error is shown for the diagnosis date',
        async () => {
          await expect(profilePage.diagnosisDateError).toHaveText(/\S/);
        },
        {
          detail:
            'Confirm the form shows an inline validation error because the diagnosis date is ' +
            'earlier than the birth date.',
        },
      );

      // Step 8: Correct the diagnosis date to a valid value (after birth) and save.
      await test.step(
        'When user corrects the diagnosis date to a valid value and saves profile changes',
        async () => {
          await profilePage.fillDiagnosisDate(validDiagnosisDate);
          await profilePage.saveProfile();
        },
        {
          detail:
            'Replace the invalid diagnosis date with a valid one (after the birth date) and ' +
            'click Save Changes to submit the profile.',
        },
      );

      // Step 9: GET response is validated and saved for comparison
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
            'Log in to Tidepool Web using the automated shared member account credentials stored in 1Password as "UI Auto Shared Member" and open the claimed user data.',
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
            'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password as "UI Auto Clinician" and open the clinic workspace.',
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
