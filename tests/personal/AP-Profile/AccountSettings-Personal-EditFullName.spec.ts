import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';
import { ProfilePage } from '../../../page-objects/patient/ProfilePage';

test.describe('Personal Account Settings edit (Full Name only) updates Profile endpoint', () => {
  test.setTimeout(120000);

  let api: ReturnType<typeof createNetworkHelper>;
  let putCapture: any;
  let newName: string; // Declare at test level scope

  test(
    'Account Settings - Personal - Edit Full Name',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.PERSONAL, // Added personal tag
        TEST_TAGS.CLAIMED,
        TEST_TAGS.SHARED_MEMBER, // Added shared member tag
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // ========== PHASE 1: PERSONAL USER EDITS PROFILE ==========

      // Step 1: Log in to personal account and setup network capture
      await test.step(
        'Given Personal account has been logged in',
        async () => {
          api = createNetworkHelper(page);
          await api.startCapture();
          await page.goto('/data');
          await patientTest.patient.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated personal account credentials stored in 1Password as "UI Auto Personal Patient".',
        },
      );

      // Step 2: Navigate to account settings
      await test.step(
        'When user navigates to account settings',
        async () => {
          await accountTest.account.navigateTo('AccountSettings', page);
        },
        { detail: 'Open the Account Settings page from the navigation menu.' },
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
          newName = `Personal User Updated ${Math.floor(Math.random() * 10000)}`; // Remove let declaration
          const nameInput = page.getByRole('textbox', { name: /full name/i });
          await nameInput.fill(newName);
        },
        { detail: 'Enter a new value into the Full Name field.' },
      );

      // Step 5: Tap the Save button
      await test.step(
        'And user taps the save button',
        async () => {
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

      // Step 7: Validate PUT request and save value
      await (test as any).stepNoScreenshot(
        'And PUT request is validated and name is set to new value',
        async () => {
          await api.validateEndpointResponse('profile-metadata-put');
          putCapture = api
            .getCaptures()
            .find((req: any) => req.method === 'PUT' && req.url.includes('/profile'));
          if (!putCapture) throw new Error('No PUT /profile request captured');
          if (
            !putCapture.requestBody ||
            !putCapture.requestBody.fullName ||
            putCapture.requestBody.fullName !== newName
          ) {
            throw new Error(`PUT request did not set fullName to ${newName}`);
          }
        },
        {
          detail:
            'Confirm the profile PUT endpoint responds and the request payload sets the full name to the new value.',
        },
      );

      // Step 8: Navigate to Profile page
      await test.step(
        'When user navigates to Profile page',
        async () => {
          await patientTest.patient.navigateTo('Profile', page);
        },
        { detail: 'Open the Profile page from the navigation menu.' },
      );

      // Step 9: Confirm GET request matches the saved PUT request
      await (test as any).stepNoScreenshot(
        'Then GET request matches the saved PUT request',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');

          // Get all captures and find the LATEST GET request (after the PUT)
          const allCaptures = api.getCaptures();
          const putIndex = allCaptures.findIndex(req => req === putCapture);

          // Find GET requests that occurred AFTER the PUT request
          const laterGetCaptures = allCaptures
            .slice(putIndex + 1)
            .filter((req: any) => req.method === 'GET' && req.url.includes('/profile'));

          if (laterGetCaptures.length === 0) {
            throw new Error('No GET /profile request captured after the PUT request');
          }

          // Use the most recent GET request
          const getCapture = laterGetCaptures[laterGetCaptures.length - 1];

          if (
            !getCapture.responseBody ||
            getCapture.responseBody.fullName !== putCapture.requestBody.fullName
          ) {
            console.log('GET response fullName:', getCapture.responseBody.fullName);
            console.log('PUT request fullName:', putCapture.requestBody.fullName);
            console.log('Total captures:', allCaptures.length);
            console.log('PUT index:', putIndex);
            console.log('Later GET captures found:', laterGetCaptures.length);
            throw new Error('GET response fullName does not match PUT request fullName');
          }
        },
        {
          detail:
            'Confirm the profile GET endpoint responds and the returned full name matches the value saved by the PUT request.',
        },
      );
    },
  );
});
