import { test } from '../fixtures/base';
import { test as patientTest } from '../fixtures/patient-helpers';
import { test as accountTest} from '../fixtures/account-helpers'
import { createNetworkHelper } from '../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../fixtures/test-tags';
import { AccountSettingsPage } from '../../page-objects/account/AccountSettingsPage';



test.describe('Clinician Account Settings Access', () => {
  // API Test cases require this to capture network activity
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'should allow navigation to account settings and capture GET response',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT, 
        TEST_TAGS.CLAIMED, 
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_USER,
      ]),
    },
    async ({ page }) => {


      // Step 1: Log in to clinician account and setup network capture
      await test.step('Given clinician has been logged in', async () => {
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

      //Setup for Account Settings page and previous email for reset
      const accountSettingsPage = new AccountSettingsPage(page);
      let originalEmail = '';


      // Step 4: Read and change email field to temporary value
      await test.step('When user updates the email field', async () => {
        originalEmail = await accountSettingsPage.emailInput.inputValue();
        await accountSettingsPage.emailInput.fill('qa+TempEdit@tidepool.org');
      });

      // Step 5: Tap the save button
      await test.step('When user taps the save button', async () => {
        await accountSettingsPage.saveButton.click();
      });

      // Step 6: Confirm save changes message displays
      await test.step('Then the save changes message displays', async () => {
        await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
      });

      // Step 7: Validate PUT request and email value
      await (test as any).stepNoScreenshot('Then PUT request is validated and email is set to new value', async () => {
        await api.validateEndpointResponse('profile-metadata-put');
        const putCapture = api.getCaptures().find(
          (req: any) => req.method === 'PUT' && req.url.includes('/profile')
        );
        if (!putCapture) throw new Error('No PUT /profile request captured');
        if (!putCapture.requestBody || !putCapture.requestBody.email || putCapture.requestBody.email !== 'qa+TempEdit@tidepool.org') {
          throw new Error('PUT request did not set email to qa+TempEdit@tidepool.org');
        }
      });

      // Step 8: Change email field to temporary value
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

       // Step 7: Validate PUT request and email value
      await (test as any).stepNoScreenshot('Then PUT request is validated and email is set to new value', async () => {
        await api.validateEndpointResponse('profile-metadata-put');
        const putCapture = api.getCaptures().find(
          (req: any) => req.method === 'PUT' && req.url.includes('/profile')
        );
        if (!putCapture) throw new Error('No PUT /profile request captured');
        if (!putCapture.requestBody || !putCapture.requestBody.email || putCapture.requestBody.email !== originalEmail) {
          throw new Error('PUT request did not set email to originalEmail');
        }
      });

      await api.stopCapture();
    },
  );
});
