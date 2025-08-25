"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../../fixtures/base");
const patient_helpers_1 = require("../../fixtures/patient-helpers");
const account_helpers_1 = require("../../fixtures/account-helpers");
const clinic_helpers_1 = require("../../fixtures/clinic-helpers");
const network_helpers_1 = require("../../fixtures/network-helpers");
const test_tags_1 = require("../../fixtures/test-tags");
const AccountSettingsPage_1 = require("../../../page-objects/account/AccountSettingsPage");
const ProfilePage_1 = require("../../../page-objects/patient/ProfilePage");
const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
const CLAIMED_PATIENT_SEARCH = 'Claimed Patient';
base_1.test.describe('Claimed Account Settings edit (Full Name only) updates Profile endpoint and visually updates for user, clinic, and shared member', () => {
    base_1.test.setTimeout(120000); // 2 minute timeout for multi-phase test
    let api;
    let putCapture;
    let newName; // Declare at test level scope
    (0, base_1.test)('should allow navigation to account settings, edit full name, and verify profile update for claimed, shared, and clinician users', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.PATIENT,
            test_tags_1.TEST_TAGS.CLINICIAN, // Added clinician tag
            test_tags_1.TEST_TAGS.CLAIMED,
            test_tags_1.TEST_TAGS.SHARED_MEMBER, // Added shared member tag
            test_tags_1.TEST_TAGS.API,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.HIGH,
            test_tags_1.TEST_TAGS.API_PROFILE,
        ]),
    }, async ({ page }) => {
        // ========== PHASE 1: CLAIMED USER EDITS PROFILE ==========
        // Step 1: Log in to clinician account and setup network capture
        await base_1.test.step('Given claimed account has been logged in', async () => {
            api = (0, network_helpers_1.createNetworkHelper)(page);
            await api.startCapture();
            await page.goto('/data');
            await patient_helpers_1.test.patient.setup(page);
        });
        // Step 2: Navigate to account settings
        await base_1.test.step('When user navigates to account settings', async () => {
            await account_helpers_1.test.account.navigateTo('AccountSettings', page);
        });
        // Step 3: GET response is pulled and validated
        await base_1.test.stepNoScreenshot('Then profile endpoint responds with GET request consistent with schema', async () => {
            await api.validateEndpointResponse('profile-metadata-get');
        });
        // Create new acccount settings page for the following test
        const accountSettingsPage = new AccountSettingsPage_1.AccountSettingsPage(page);
        // Step 4: Change the Full Name field to a new value
        await base_1.test.step('When user updates the Full Name field', async () => {
            newName = `Claimed User Updated ${Math.floor(Math.random() * 10000)}`; // Remove let declaration
            const nameInput = page.getByRole('textbox', { name: /full name/i });
            await nameInput.fill(newName);
        });
        // Step 5: Tap the Save button
        await base_1.test.step('When user taps the save button', async () => {
            await accountSettingsPage.saveButton.click();
        });
        // Step 6: Confirm save changes message displays
        await base_1.test.step('Then the save changes message displays', async () => {
            await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
        });
        // Step 7: Validate PUT request and save value
        await base_1.test.stepNoScreenshot('Then PUT request is validated and name is set to new value', async () => {
            await api.validateEndpointResponse('profile-metadata-put');
            putCapture = api
                .getCaptures()
                .find((req) => req.method === 'PUT' && req.url.includes('/profile'));
            if (!putCapture)
                throw new Error('No PUT /profile request captured');
            if (!putCapture.requestBody ||
                !putCapture.requestBody.fullName ||
                putCapture.requestBody.fullName !== newName) {
                throw new Error(`PUT request did not set fullName to ${newName}`);
            }
        });
        // Step 8: Navigate to Profile page
        await base_1.test.step('When user navigates to Profile page', async () => {
            await patient_helpers_1.test.patient.navigateTo('Profile', page);
        });
        // Step 9: Confirm GET request matches the saved PUT request
        await base_1.test.stepNoScreenshot('Then GET request matches the saved PUT request', async () => {
            await api.validateEndpointResponse('profile-metadata-get');
            // Get all captures and find the LATEST GET request (after the PUT)
            const allCaptures = api.getCaptures();
            const putIndex = allCaptures.findIndex(req => req === putCapture);
            // Find GET requests that occurred AFTER the PUT request
            const laterGetCaptures = allCaptures
                .slice(putIndex + 1)
                .filter((req) => req.method === 'GET' && req.url.includes('/profile'));
            if (laterGetCaptures.length === 0) {
                throw new Error('No GET /profile request captured after the PUT request');
            }
            // Use the most recent GET request
            const getCapture = laterGetCaptures[laterGetCaptures.length - 1];
            if (!getCapture.responseBody ||
                getCapture.responseBody.fullName !== putCapture.requestBody.fullName) {
                console.log('GET response fullName:', getCapture.responseBody.fullName);
                console.log('PUT request fullName:', putCapture.requestBody.fullName);
                console.log('Total captures:', allCaptures.length);
                console.log('PUT index:', putIndex);
                console.log('Later GET captures found:', laterGetCaptures.length);
                throw new Error('GET response fullName does not match PUT request fullName');
            }
        });
        // ========== PHASE 2: SHARED USER VIEWS PROFILE ==========
        // Step 10: Switch to shared user authentication and go directly to Profile
        await base_1.test.step('When shared user views claimed user profile', async () => {
            await account_helpers_1.test.account.switchUser('shared', page);
            await page.goto('/data');
            await patient_helpers_1.test.patient.setup(page);
            // Wait a moment for the page to stabilize after user switch
            await page.waitForTimeout(500);
            // Navigate directly to Profile in the same step to avoid redundancy
            await patient_helpers_1.test.patient.navigateTo('Profile', page);
        });
        // Step 11: Verify Edit button is not present for shared users
        await base_1.test.step('Then Edit button should not be present for shared patients', async () => {
            const profilePage = new ProfilePage_1.ProfilePage(page);
            await profilePage.editButtonDisplays(false);
        });
        // Step 12: Validate shared user sees updated profile data
        await base_1.test.stepNoScreenshot('Then shared user sees view-only claimed profile data with matching data', async () => {
            await api.compareEndpointResponse('profile-metadata-get', putCapture);
        });
        // ========== PHASE 3: CLINICIAN VIEWS PROFILE ==========
        // Step 13: Switch to clinician user authentication
        await base_1.test.step('When clinician accesses patient workspace', async () => {
            await account_helpers_1.test.account.switchUser('clinician', page);
            await page.goto('/');
            await clinic_helpers_1.test.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
        });
        // Step 14: Access the specific claimed patient that was modified by the producer test
        await base_1.test.step('When user accesses the claimed patient modified by producer test', async () => {
            await clinic_helpers_1.test.clinician.findAndAccessPatientByPartialName(CLAIMED_PATIENT_SEARCH, page);
            // Navigate directly to Profile in the same step to avoid redundancy
            await clinic_helpers_1.test.clinician.navigateTo('Profile', page);
        });
        // Step 15: Verify Edit button is not present for claimed patients viewed by clinicians
        await base_1.test.step('Then Edit button should not be present for claimed patients', async () => {
            const profilePage = new ProfilePage_1.ProfilePage(page);
            await profilePage.editButtonDisplays(false);
        });
        // Step 16: Validate clinician sees updated profile data
        await base_1.test.stepNoScreenshot('Then clinician sees claimed profile data with matching data and no save access', async () => {
            await api.compareEndpointResponse('profile-metadata-get', putCapture);
        });
    });
});
