"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clinic_helpers_1 = require("../../fixtures/clinic-helpers");
const network_helpers_1 = require("../../fixtures/network-helpers");
const test_tags_1 = require("../../fixtures/test-tags");
const ProfilePage_1 = require("../../../page-objects/patient/ProfilePage");
clinic_helpers_1.test.describe('Custodial patients are allowed access and modification of profile details', () => {
    // Define the workspace and patient at top level
    const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
    const CUSTODIAL_PATIENT_SEARCH = 'Custodial Patient';
    // API Test cases require this to capture network activity
    let api;
    (0, clinic_helpers_1.test)('should allow navigation to profile details and edit profile fields', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.CLINICIAN, // User Type (required)
            test_tags_1.TEST_TAGS.API, // Test Type (required)
            test_tags_1.TEST_TAGS.UI, // Test Type (required)
            test_tags_1.TEST_TAGS.HIGH, // Priority (required)
            test_tags_1.TEST_TAGS.API_PROFILE, // Feature (optional)
        ]),
    }, async ({ page }, testInfo) => {
        // Step 1: Log in to clinician account and setup network capture
        await clinic_helpers_1.test.step('Given clinician has been logged in', async () => {
            api = (0, network_helpers_1.createNetworkHelper)(page);
            await api.startCapture();
            await clinic_helpers_1.test.clinician.setup(page);
        });
        // Step 2: Navigate to workspace
        await clinic_helpers_1.test.step('When user navigates to desired workspace', async () => {
            await clinic_helpers_1.test.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
        });
        // Step 3: Access custodial patient
        await clinic_helpers_1.test.step('When user accesses a custodial patient summary', async () => {
            await clinic_helpers_1.test.clinician.findAndAccessPatientByPartialName(CUSTODIAL_PATIENT_SEARCH, page);
        });
        // Step 4: Navigate to profile
        await clinic_helpers_1.test.step('When user navigates to Profile page', async () => {
            await clinic_helpers_1.test.clinician.navigateTo('Profile', page);
        });
        // Step 5: Capture GET response
        await clinic_helpers_1.test.step('Then profile endpoint responds with GET request consistent with schema [no-screenshot]', async () => {
            await api.validateEndpointResponse('profile-metadata-get');
        });
        // Step 6: Open Edit Profile
        await clinic_helpers_1.test.step('When user selects Edit button', async () => {
            await clinic_helpers_1.test.clinician.navigateTo('ProfileEdit', page);
        });
        // Create Profile page for following steps
        const profilePage = new ProfilePage_1.ProfilePage(page);
        // Step 7: Change profile fields (custodial access)
        await clinic_helpers_1.test.step('When user updates profile fields', async () => {
            // Generate completely unique values for this custodial test run
            const randomSeed = Math.random();
            const randomId = Math.floor(randomSeed * 10000);
            const updatedName = `Custodial Patient Updated ${Math.floor(randomId * 10000)}`;
            const birthYear = 1980 + (randomId % 15);
            const diagnosisYear = birthYear + 25;
            const birthDate = `05/20/${birthYear}`;
            const diagnosisDate = `08/15/${diagnosisYear}`;
            // Generate random 15-digit MRN
            const randomMRN = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10).toString()).join('');
            // Generate random 15-letter string for clinical notes
            const randomString = Array.from({ length: 15 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
            // Generate unique email
            const email = `webuiautomation+custodialEdit${randomId}@tidepool.org`;
            // Get current diagnosis index and calculate next one (1-7, wrapping)
            const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
            let nextDiagnosisIndex = currentDiagnosisIndex + 1;
            if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
                nextDiagnosisIndex = 1;
            }
            // Update fields using ProfilePage methods
            await profilePage.fillFullName(updatedName);
            await profilePage.fillBirthDate(birthDate);
            await profilePage.fillMRN(randomMRN);
            await profilePage.fillDiagnosisDate(diagnosisDate);
            await profilePage.selectDiagnosisType(nextDiagnosisIndex);
            await profilePage.fillEmail(email);
            await profilePage.fillClinicalNotes(randomString);
        });
        // Step 8: Save profile edit
        await clinic_helpers_1.test.step('When user saves profile changes', async () => {
            await profilePage.saveProfile();
        });
        // Step 9: Check profile PUT response
        await clinic_helpers_1.test.step('Then profile endpoint responds with PUT request consistent with schema [no-screenshot]', async () => {
            await api.validateEndpointResponse('profile-metadata-put');
        });
        await api.stopCapture();
    });
});
