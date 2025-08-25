"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../../fixtures/base");
const patient_helpers_1 = require("../../fixtures/patient-helpers");
const account_helpers_1 = require("../../fixtures/account-helpers");
const network_helpers_1 = require("../../fixtures/network-helpers");
const test_tags_1 = require("../../fixtures/test-tags");
const AccountSettingsPage_1 = require("../../../page-objects/account/AccountSettingsPage");
base_1.test.describe('Clinician Account Settings Access', () => {
    // API Test cases require this to capture network activity
    let api;
    (0, base_1.test)('should allow navigation to account settings and capture GET response', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.PATIENT,
            test_tags_1.TEST_TAGS.CLAIMED,
            test_tags_1.TEST_TAGS.API,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.HIGH,
            test_tags_1.TEST_TAGS.API_USER,
        ]),
    }, async ({ page }) => {
        // Step 1: Log in to clinician account and setup network capture
        await base_1.test.step('Given clinician has been logged in', async () => {
            api = (0, network_helpers_1.createNetworkHelper)(page);
            await api.startCapture();
            await page.goto('/data');
            await patient_helpers_1.test.patient.setup(page);
        });
        // Step 2: Navigate to account settings
        await base_1.test.step('When user navigates to account settings', async () => {
            await account_helpers_1.test.account.navigateTo('AccountSettings', page);
        });
        // Step 3: Validate profile GET response
        await base_1.test.stepNoScreenshot('Then profile endpoint responds with GET request consistent with schema ', async () => {
            await api.validateEndpointResponse('profile-metadata-get');
        });
        // Setup for Account Settings page and previous email for reset
        const accountSettingsPage = new AccountSettingsPage_1.AccountSettingsPage(page);
        let originalEmail = '';
        // Step 4: Read and change email field to temporary value
        await base_1.test.step('When user updates the email field', async () => {
            originalEmail = await accountSettingsPage.emailInput.inputValue();
            await accountSettingsPage.emailInput.fill('qa+TempEdit@tidepool.org');
        });
        // Step 5: Tap the save button
        await base_1.test.step('When user taps the save button', async () => {
            await accountSettingsPage.saveButton.click();
        });
        // Step 6: Confirm save changes message displays
        await base_1.test.step('Then the save changes message displays', async () => {
            await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
        });
        // Step 7: Validate PUT request and email value
        await base_1.test.stepNoScreenshot('Then PUT request is validated and email is set to new value', async () => {
            await api.validateEndpointResponse('profile-metadata-put');
            const putCapture = api
                .getCaptures()
                .find((req) => req.method === 'PUT' && req.url.includes('/profile'));
            if (!putCapture)
                throw new Error('No PUT /profile request captured');
            if (!putCapture.requestBody ||
                !putCapture.requestBody.email ||
                putCapture.requestBody.email !== 'qa+TempEdit@tidepool.org') {
                throw new Error('PUT request did not set email to qa+TempEdit@tidepool.org');
            }
        });
        // Step 8: Change email field to temporary value
        await base_1.test.step('When user sets the email field to the previous value', async () => {
            await accountSettingsPage.emailInput.fill(originalEmail);
        });
        // Step 9: Tap the save button
        await base_1.test.step('When user taps the save button', async () => {
            await accountSettingsPage.saveButton.click();
        });
        // Step 10: Confirm save changes message displays
        await base_1.test.step('Then the save changes message displays', async () => {
            await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
        });
        // Step 7: Validate PUT request and email value
        await base_1.test.stepNoScreenshot('Then PUT request is validated and email is set to new value', async () => {
            await api.validateEndpointResponse('profile-metadata-put');
            const putCapture = api
                .getCaptures()
                .find((req) => req.method === 'PUT' && req.url.includes('/profile'));
            if (!putCapture)
                throw new Error('No PUT /profile request captured');
            if (!putCapture.requestBody ||
                !putCapture.requestBody.email ||
                putCapture.requestBody.email !== originalEmail) {
                throw new Error('PUT request did not set email to originalEmail');
            }
        });
        await api.stopCapture();
    });
});
