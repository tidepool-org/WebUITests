import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';

test.describe('Account Settings - Personal - Edit Email', () => {
  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'Account Settings - Personal - Edit Email',
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
      await test.step('Given personal account has been logged in', async () => {
        api = createNetworkHelper(page);
        await api.startCapture();
        await page.goto('/data');
        await patientTest.patient.setup(page);
      });

      // Step 2: Navigate to account settings
      await test.step('When user navigates to account settings', async () => {
        await accountTest.account.navigateTo('AccountSettings', page);
      });

      // Step 3: Validate profile GET response
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema ',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
      );

      // Setup for Account Settings page and previous email for reset
      const accountSettingsPage = new AccountSettingsPage(page);
      let originalEmail = '';

      // Step 4: Read and change email field to temporary value
      await test.step('When user updates the email field', async () => {
        originalEmail = await accountSettingsPage.emailInput.inputValue();
        await accountSettingsPage.emailInput.fill('qa+TempPersonalEdit@tidepool.org');
      });

      // Step 5: Tap the save button
      await test.step('When user taps the save button', async () => {
        await accountSettingsPage.saveButton.click();
      });

      // Step 6: Confirm save changes message displays
      await test.step('Then the save changes message displays', async () => {
        await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
      });

      // Step 7: Validate PUT request and email value (with email reversion on failure)
      let step7ValidationError = null;
      try {
        await (test as any).stepNoScreenshot(
          'Then PUT request is validated and email is set to new value',
          async () => {
            await api.validateEndpointResponse('profile-metadata-put');
            const putCapture = api
              .getCaptures()
              .find((req: any) => req.method === 'PUT' && req.url.includes('/profile'));
            if (!putCapture) throw new Error('No PUT /profile request captured');
            if (
              !putCapture.requestBody ||
              !putCapture.requestBody.email ||
              putCapture.requestBody.email !== 'qa+TempPersonalEdit@tidepool.org'
            ) {
              throw new Error('PUT request did not set email to qa+TempPersonalEdit@tidepool.org');
            }
          },
        );
      } catch (error) {
        step7ValidationError = error;
      }

      // Step 8: Change email field to temporary value (always execute to revert email)
      await test.step('When user sets the email field to the previous value', async () => {
        await accountSettingsPage.emailInput.fill(originalEmail);
      });

      // Step 9: Tap the save button
      await test.step('When user taps the save button', async () => {
        await accountSettingsPage.saveButton.click();
      });

      // Step 10: Confirm save changes message displays
      await test.step('Then the save changes message displays', async () => {
        await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
      });

      // Re-throw step 7 validation error after email reversion (if any)
      if (step7ValidationError) {
        throw step7ValidationError;
      }

      await api.stopCapture();
    },
  );
});
