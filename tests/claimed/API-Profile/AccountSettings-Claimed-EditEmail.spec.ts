import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';

test.describe('Account Settings - Claimed - Edit Email', () => {
  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'Account Settings - Claimed - Edit Email',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.CLAIMED,
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // Step 1: Log in to clinician account and setup network capture
      await test.step(
        'Given clinician has been logged in',
        async () => {
          api = createNetworkHelper(page);
          await api.startCapture();
          await page.goto('/data');
          await patientTest.patient.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password.',
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

      // Step 3: Validate profile GET response
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema ',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
        {
          detail:
            'Confirm the profile metadata GET endpoint responds and the payload matches the expected schema.',
        },
      );

      // Setup for Account Settings page and previous email for reset
      const accountSettingsPage = new AccountSettingsPage(page);
      let originalEmail = '';

      // Step 4: Read and change email field to temporary value
      await test.step(
        'When user updates the email field',
        async () => {
          originalEmail = await accountSettingsPage.emailInput.inputValue();
          await accountSettingsPage.emailInput.fill('qa+TempEdit@tidepool.org');
        },
        {
          detail:
            'Enter a new temporary address into the email field, replacing the current value.',
        },
      );

      // Step 5: Tap the save button
      await test.step(
        'And user taps the save button',
        async () => {
          await accountSettingsPage.saveButton.click();
        },
        { detail: 'Click Save to submit the email change.' },
      );

      // Step 6: Confirm save changes message displays
      await test.step(
        'Then the save changes message displays',
        async () => {
          await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
        },
        { detail: 'Confirm the save confirmation message appears on screen.' },
      );

      // Step 7: Validate the PUT request and the new email value. If this fails, the fixture
      // records it FAILED; the cleanup steps below still run to revert the email.
      await (test as any).stepNoScreenshot(
        'And PUT request is validated and email is set to new value',
        async () => {
          await api.validateEndpointResponse('profile-metadata-put');
          const putCapture = api
            .getCaptures()
            .find((req: any) => req.method === 'PUT' && req.url.includes('/profile'));
          if (!putCapture) throw new Error('No PUT /profile request captured');
          if (
            !putCapture.requestBody ||
            !putCapture.requestBody.email ||
            putCapture.requestBody.email !== 'qa+TempEdit@tidepool.org'
          ) {
            throw new Error('PUT request did not set email to qa+TempEdit@tidepool.org');
          }
        },
        {
          detail:
            'Confirm the profile PUT endpoint responds and the request payload sets the email to the new value.',
        },
      );

      // Steps 8-10: revert the email to its original value. These are CLEANUP steps, so they
      // run even if step 7 (or any earlier step) failed — otherwise a failed run would leave
      // the account on the temporary email and break later runs. Guarded on originalEmail so
      // we only revert when step 4 actually captured/changed it.
      if (originalEmail) {
        await (test as any).cleanupStep(
          'When user sets the email field to the previous value',
          async () => {
            await accountSettingsPage.emailInput.fill(originalEmail);
          },
          { detail: 'Enter the original email address back into the email field.' },
        );

        await (test as any).cleanupStep(
          'And user taps the save button',
          async () => {
            await accountSettingsPage.saveButton.click();
          },
          { detail: 'Click Save to revert the email change.' },
        );

        await (test as any).cleanupStep(
          'Then the save changes message displays',
          async () => {
            await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
          },
          { detail: 'Confirm the save confirmation message appears on screen.' },
        );
      }

      await api.stopCapture();
    },
  );
});
