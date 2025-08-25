"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../../fixtures/base");
const patient_helpers_1 = require("../../fixtures/patient-helpers");
const clinic_helpers_1 = require("../../fixtures/clinic-helpers");
const account_helpers_1 = require("../../fixtures/account-helpers");
const network_helpers_1 = require("../../fixtures/network-helpers");
const test_tags_1 = require("../../fixtures/test-tags");
const ProfilePage_1 = require("../../../page-objects/patient/ProfilePage");
const CUSTODIAL_WORKSPACE = 'AdminClinicBase';
const CLAIMED_PATIENT_SEARCH = 'Claimed Patient';
base_1.test.describe('Comprehensive Profile Access Test: Edit as Claimed, View as Shared and Clinician', () => {
    (0, base_1.test)('should edit claimed profile then verify view-only access for shared and clinician users', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.PATIENT, // User Type (required)
            test_tags_1.TEST_TAGS.CLINICIAN, // User Type (required)
            test_tags_1.TEST_TAGS.CLAIMED,
            test_tags_1.TEST_TAGS.SHARED_MEMBER,
            test_tags_1.TEST_TAGS.API, // Test Type (required)
            test_tags_1.TEST_TAGS.UI, // Test Type (required)
            test_tags_1.TEST_TAGS.HIGH, // Priority (required)
            test_tags_1.TEST_TAGS.API_PROFILE, // Feature (optional)
        ]),
    }, async ({ page }) => {
        let api;
        let producerPutCapture;
        // ========== PHASE 1: CLAIMED USER EDITS PROFILE ==========
        // Step 1: Claimed account has been logged in
        await base_1.test.step('Given claimed account has been logged in', async () => {
            api = (0, network_helpers_1.createNetworkHelper)(page);
            await api.startCapture();
            await page.goto('/data');
            await patient_helpers_1.test.patient.setup(page);
        });
        // Step 2: User navigates to Profile page
        await base_1.test.step('When user navigates to Profile page', async () => {
            await patient_helpers_1.test.patient.navigateTo('Profile', page);
        });
        // Step 3: GET response is pulled and validated
        await base_1.test.stepNoScreenshot('Then profile endpoint responds with GET request consistent with schema', async () => {
            await api.validateEndpointResponse('profile-metadata-get');
        });
        // Step 4: Confirm edit button and click it
        await base_1.test.step('When user selects Edit button', async () => {
            await patient_helpers_1.test.patient.navigateTo('ProfileEdit', page);
        });
        // Initialize ProfilePage for steps 4 and 5
        const profilePage = new ProfilePage_1.ProfilePage(page);
        // Step 5: Change profile fields (confirmed user access)
        await base_1.test.step('When user updates profile fields', async () => {
            const testRunId = Math.floor(Math.random() * 10000);
            const updatedName = `Claimed User Updated ${testRunId}`;
            const birthYear = 1985 + (testRunId % 10);
            const diagnosisYear = birthYear + 20;
            const birthDate = `01/15/${birthYear}`;
            const diagnosisDate = `03/10/${diagnosisYear}`;
            // Generate random 15-letter string for clinical notes
            const randomString = Array.from({ length: 15 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
            // Get current diagnosis index and calculate next one (1-7, wrapping)
            const currentDiagnosisIndex = await profilePage.getCurrentDiagnosisIndex();
            let nextDiagnosisIndex = currentDiagnosisIndex + 1;
            if (nextDiagnosisIndex > 7 || nextDiagnosisIndex === 0) {
                nextDiagnosisIndex = 1;
            }
            // Update fields using ProfilePage methods
            await profilePage.fillFullName(updatedName);
            await profilePage.fillBirthDate(birthDate);
            await profilePage.fillDiagnosisDate(diagnosisDate);
            await profilePage.selectDiagnosisType(nextDiagnosisIndex);
            await profilePage.fillClinicalNotes(randomString);
        });
        // Step 6: Save profile edit
        await base_1.test.step('When user saves profile changes', async () => {
            await profilePage.saveProfile();
        });
        // Step 7: PUT response is validated and saved for comparison
        await base_1.test.stepNoScreenshot('Then profile endpoint responds with PUT request consistent with schema', async () => {
            await api.validateEndpointResponse('profile-metadata-put');
            const putSchema = await Promise.resolve().then(() => __importStar(require('../../../endpoint-schema/profile-endpoints')));
            const schema = putSchema.putProfileMetadataSchema;
            producerPutCapture = api.getLatestCaptureMatching(schema.method, schema.url);
        });
        //= ========= SHARED MEMEBER VIEWS PROFILE ==========
        // Step 8: Switch to shared user authentication
        await base_1.test.step('When shared user views claimed user profile', async () => {
            await account_helpers_1.test.account.switchUser('shared', page);
            await page.goto('/data');
            await patient_helpers_1.test.patient.navigateTo('ViewData', page);
        });
        // Step 9: Navigate to profile page
        await base_1.test.step('When user navigates to Profile page', async () => {
            await patient_helpers_1.test.patient.navigateTo('Profile', page);
        });
        // Step 10: Confirm edit button is not present
        await base_1.test.step('Then Edit button should not be present for shared patients', async () => {
            await profilePage.editButtonDisplays(false);
        });
        // Step 11: Validate GET response and compare it against the
        await base_1.test.stepNoScreenshot('Then shared user sees view-only claimed profile data with matching data', async () => {
            await api.compareEndpointResponse('profile-metadata-get', producerPutCapture);
        });
        // ========== CLINICIAN VIEWS PROFILE ==========
        // Step 12: Switch to clinician authentication and navigate to patient profile
        await base_1.test.step('When clinician accesses patient workspace', async () => {
            await account_helpers_1.test.account.switchUser('clinician', page);
            await page.goto('/');
            await clinic_helpers_1.test.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
        });
        // Step 13: Access the specific claimed patient that was modified by the producer test
        await base_1.test.step('When user accesses the claimed patient modified by producer test', async () => {
            await clinic_helpers_1.test.clinician.findAndAccessPatientByPartialName(CLAIMED_PATIENT_SEARCH, page);
        });
        // Step 14: Navigate to profile
        await base_1.test.step('When user navigates to Profile page', async () => {
            await clinic_helpers_1.test.clinician.navigateTo('Profile', page);
        });
        // Step 15: Confirm edit button is not present
        await base_1.test.step('Then Edit button should not be present for claimed patients', async () => {
            await profilePage.editButtonDisplays(false);
        });
        // Step 16: Validate GET response and confirm appropriate permissions
        await base_1.test.stepNoScreenshot('Then clinician sees claimed profile data with matching data and no save access', async () => {
            await api.compareEndpointResponse('profile-metadata-get', producerPutCapture);
        });
    });
});
