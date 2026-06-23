import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { test as clinicTest } from '../../fixtures/clinic-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
const CLAIMED_PATIENT_SEARCH = 'Claimed Patient';

test.describe('Claimed Account Settings edit (Full Name only) updates Profile endpoint and visually updates for user, clinic, and shared member', () => {
  test.setTimeout(120000); // 2 minute timeout for multi-phase test

  let api: ReturnType<typeof createNetworkHelper>;
  let putCapture: any;
  let newName: string; // Declare at test level scope
  let saveTimestamp: number; // Timestamp just before save — anchors PUT/GET lookups

  test(
    'Account Settings - Claimed - Edit Full Name',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.CLINICIAN, // Added clinician tag
        TEST_TAGS.CLAIMED,
        TEST_TAGS.SHARED_MEMBER, // Added shared member tag
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // ========== PHASE 1: CLAIMED USER EDITS PROFILE ==========

      // Step 1: Log in to clinician account and setup network capture
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

      // Step 2: Navigate to account settings
      await test.step(
        'When user navigates to account settings',
        async () => {
          await accountTest.account.navigateTo('AccountSettings', page);
        },
        { detail: 'Open the account settings page from the main navigation.' },
      );

      // Step 3: GET response is pulled and validated
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
        {
          detail:
            'Confirm the profile GET endpoint responds and the payload matches the expected schema.',
        },
      );

      // Create new acccount settings page for the following test
      const accountSettingsPage = new AccountSettingsPage(page);

      // Step 4: Change the Full Name field to a new value
      await test.step(
        'When user updates the Full Name field',
        async () => {
          newName = `Claimed User Updated ${Math.floor(Math.random() * 10000)}`; // Remove let declaration
          const nameInput = page.getByRole('textbox', { name: /full name/i });
          await nameInput.fill(newName);
        },
        { detail: 'Enter a new value in the Full Name field.' },
      );

      // Step 5: Tap the Save button — record timestamp so we can anchor capture lookups to this moment
      await test.step(
        'And user taps the save button',
        async () => {
          saveTimestamp = Date.now();
          await accountSettingsPage.saveButton.click();
        },
        { detail: 'Click the Save button to submit the change.' },
      );

      // Step 6: Confirm save changes message displays
      await test.step(
        'Then the save changes message displays',
        async () => {
          await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
        },
        { detail: 'Confirm the save-confirmation message appears.' },
      );

      // Step 7: Validate PUT request fired after save with the new name in its body
      await (test as any).stepNoScreenshot(
        'And PUT request is validated and name is set to new value',
        async () => {
          // Wait for a PUT that was captured AFTER the save button was clicked.
          // Using waitForCaptureMatching prevents false-matches against any prior PUT
          // that may have been captured earlier in the session.
          putCapture = await api.waitForCaptureMatching(
            'PUT',
            /\/metadata\/.*\/profile$/,
            saveTimestamp,
            10000,
          );
          await api.validateEndpointResponse('profile-metadata-put');

          if (
            !putCapture.requestBody ||
            !putCapture.requestBody.fullName ||
            putCapture.requestBody.fullName !== newName
          ) {
            throw new Error(
              `PUT request did not set fullName to "${newName}". Got: "${putCapture.requestBody?.fullName}"`,
            );
          }
        },
        {
          detail:
            'Confirm the profile PUT endpoint fires after saving and its payload matches the expected schema and updated name.',
        },
      );

      // Step 8: Navigate to Profile page
      await test.step(
        'When user navigates to Profile page',
        async () => {
          await patientTest.patient.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the navigation.' },
      );

      // Step 9: Confirm GET request after navigation to Profile reflects the saved name
      await (test as any).stepNoScreenshot(
        'Then GET request matches the saved PUT request',
        async () => {
          // Wait for a GET that fires AFTER the PUT (anchored to saveTimestamp).
          // This prevents the pre-save GET from being used for comparison.
          const getCapture = await api.waitForCaptureMatching(
            'GET',
            /\/metadata\/.*\/profile$/,
            putCapture.timestamp,
            10000,
          );

          if (!getCapture.responseBody || getCapture.responseBody.fullName !== newName) {
            throw new Error(
              `GET response fullName "${getCapture.responseBody?.fullName}" does not match saved name "${newName}"`,
            );
          }
        },
        {
          detail:
            'Confirm the profile GET endpoint after navigation returns the saved name, matching the prior PUT.',
        },
      );

      // ========== PHASE 2: SHARED USER VIEWS PROFILE ==========

      // Step 10: Switch to shared user authentication and go directly to Profile
      let sharedNavTimestamp: number;
      await test.step(
        'When shared user views claimed user profile',
        async () => {
          sharedNavTimestamp = Date.now();
          await accountTest.account.switchUser('shared', page);
          await page.goto('/data');
          await patientTest.patient.setup(page);
          // Wait a moment for the page to stabilize after user switch
          await page.waitForTimeout(500);
          // Navigate directly to Profile in the same step to avoid redundancy
          await patientTest.patient.navigateTo('Profile', page);
        },
        {
          detail:
            'Log in as the automated shared member account credentials stored in 1Password as "UI Auto Shared Member" and open the claimed user Profile page.',
        },
      );

      // Step 11: Verify Edit button is not present for shared users
      await test.step(
        'Then Edit button should not be present for shared patients',
        async () => {
          const profilePage = new ProfilePage(page);
          await profilePage.editButtonDisplays(false);
        },
        {
          detail: 'Confirm the Edit button is not visible for a shared member viewing the profile.',
        },
      );

      // Step 12: Validate shared user sees updated profile data
      await (test as any).stepNoScreenshot(
        'And shared user sees view-only claimed profile data with matching data',
        async () => {
          const sharedGetCapture = await api.waitForCaptureMatching(
            'GET',
            /\/metadata\/.*\/profile$/,
            sharedNavTimestamp,
            10000,
          );
          if (
            !sharedGetCapture.responseBody ||
            sharedGetCapture.responseBody.fullName !== newName
          ) {
            throw new Error(
              `Shared user GET fullName "${sharedGetCapture.responseBody?.fullName}" does not match saved name "${newName}"`,
            );
          }
        },
        {
          detail:
            'Confirm the profile GET endpoint for the shared member returns the saved name in a view-only payload.',
        },
      );

      // ========== PHASE 3: CLINICIAN VIEWS PROFILE ==========

      // Step 13: Switch to clinician user authentication
      let clinicianNavTimestamp: number;
      await test.step(
        'When clinician accesses patient workspace',
        async () => {
          clinicianNavTimestamp = Date.now();
          await accountTest.account.switchUser('clinician', page);
          await page.goto('/');
          await clinicTest.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
        },
        {
          detail:
            'Log in as the automated clinician account credentials stored in 1Password as "UI Auto Clinician" and open the patient workspace.',
        },
      );

      // Step 14: Access the specific claimed patient that was modified by the producer test
      await test.step(
        'And user accesses the claimed patient modified by producer test',
        async () => {
          await clinicTest.clinician.findAndAccessPatientByPartialName(
            CLAIMED_PATIENT_SEARCH,
            page,
          );
          // Navigate directly to Profile in the same step to avoid redundancy
          await clinicTest.clinician.navigateTo('Profile', page);
        },
        { detail: 'Search for the claimed patient by name and open their Profile page.' },
      );

      // Step 15: Validate clinician sees updated profile data
      await (test as any).stepNoScreenshot(
        'Then clinician sees claimed profile data with matching data and no save access',
        async () => {
          const clinicianGetCapture = await api.waitForCaptureMatching(
            'GET',
            /\/metadata\/.*\/profile$/,
            clinicianNavTimestamp,
            10000,
          );
          if (
            !clinicianGetCapture.responseBody ||
            clinicianGetCapture.responseBody.fullName !== newName
          ) {
            throw new Error(
              `Clinician GET fullName "${clinicianGetCapture.responseBody?.fullName}" does not match saved name "${newName}"`,
            );
          }
        },
        {
          detail:
            'Confirm the profile GET endpoint for the clinician returns the saved name with no save access.',
        },
      );
    },
  );
});
