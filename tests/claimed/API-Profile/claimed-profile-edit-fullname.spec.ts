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

  test(
    'should allow navigation to account settings, edit full name, and verify profile update for claimed, shared, and clinician users',
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
      await test.step('Given claimed account has been logged in', async () => {
        api = createNetworkHelper(page);
        await api.startCapture();
        await page.goto('/data');
        await patientTest.patient.setup(page);
      });

      // Step 2: Navigate to account settings
      await test.step('When user navigates to account settings', async () => {
        await accountTest.account.navigateTo('AccountSettings', page);
      });

      // Step 3: GET response is pulled and validated
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
      );
      
      //Create new acccount settings page for the following test
      const accountSettingsPage = new AccountSettingsPage(page);
      
      // Step 4: Change the Full Name field to a new value
      await test.step('When user updates the Full Name field', async () => {
        newName = `Claimed User Updated ${Math.floor(Math.random() * 10000)}`; // Remove let declaration
        const nameInput = page.getByRole('textbox', { name: /full name/i });
        await nameInput.fill(newName);
      });

      // Step 5: Tap the Save button
      await test.step('When user taps the save button', async () => {
        await accountSettingsPage.saveButton.click();
      });

      // Step 6: Confirm save changes message displays
      await test.step('Then the save changes message displays', async () => {
        await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
      });

      // Step 7: Validate PUT request and save value
      await (test as any).stepNoScreenshot('Then PUT request is validated and name is set to new value', async () => {
        await api.validateEndpointResponse('profile-metadata-put');
        putCapture = api.getCaptures().find(
          (req: any) => req.method === 'PUT' && req.url.includes('/profile')
        );
        if (!putCapture) throw new Error('No PUT /profile request captured');
        if (!putCapture.requestBody || !putCapture.requestBody.fullName || putCapture.requestBody.fullName !== newName) {
          throw new Error(`PUT request did not set fullName to ${newName}`);
        }
      });

      // Step 8: Navigate to Profile page
      await test.step('When user navigates to Profile page', async () => {
        await patientTest.patient.navigateTo('Profile', page);
      });

      // Step 9: Confirm GET request matches the saved PUT request
      await (test as any).stepNoScreenshot('Then GET request matches the saved PUT request', async () => {
        await api.validateEndpointResponse('profile-metadata-get');
        
        // Get all captures and find the LATEST GET request (after the PUT)
        const allCaptures = api.getCaptures();
        const putIndex = allCaptures.findIndex(req => req === putCapture);
        
        // Find GET requests that occurred AFTER the PUT request
        const laterGetCaptures = allCaptures.slice(putIndex + 1).filter(
          (req: any) => req.method === 'GET' && req.url.includes('/profile')
        );
        
        if (laterGetCaptures.length === 0) {
          throw new Error('No GET /profile request captured after the PUT request');
        }
        
        // Use the most recent GET request
        const getCapture = laterGetCaptures[laterGetCaptures.length - 1];
        
        if (!getCapture.responseBody || getCapture.responseBody.fullName !== putCapture.requestBody.fullName) {
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
      await test.step('When shared user views claimed user profile', async () => {
        await accountTest.account.switchUser('shared', page);
        await page.goto('/data');
        await patientTest.patient.setup(page);
        // Wait a moment for the page to stabilize after user switch
        await page.waitForTimeout(500);
        // Navigate directly to Profile in the same step to avoid redundancy
        await patientTest.patient.navigateTo('Profile', page);
      });

      // Step 11: Verify Edit button is not present for shared users
      await test.step('Then Edit button should not be present for shared patients', async () => {
        const profilePage = new ProfilePage(page);
        await profilePage.editButtonDisplays(false);
      });

      // Step 12: Validate shared user sees updated profile data
      await (test as any).stepNoScreenshot(
        'Then shared user sees view-only claimed profile data with matching data',
        async () => {
          await api.compareEndpointResponse('profile-metadata-get', putCapture);
        },
      );

      // ========== PHASE 3: CLINICIAN VIEWS PROFILE ==========

      // Step 13: Switch to clinician user authentication
      await test.step('When clinician accesses patient workspace', async () => {
        await accountTest.account.switchUser('clinician', page);
        await page.goto('/');
        await clinicTest.clinician.navigateToWorkspace(CUSTODIAL_WORKSPACE, page);
      });

      // Step 14: Access the specific claimed patient that was modified by the producer test
      await test.step('When user accesses the claimed patient modified by producer test', async () => {
        await clinicTest.clinician.findAndAccessPatientByPartialName(CLAIMED_PATIENT_SEARCH, page);
        // Navigate directly to Profile in the same step to avoid redundancy
        await clinicTest.clinician.navigateTo('Profile', page);
      });

      // Step 15: Verify Edit button is not present for claimed patients viewed by clinicians
      await test.step('Then Edit button should not be present for claimed patients', async () => {
        const profilePage = new ProfilePage(page);
        await profilePage.editButtonDisplays(false);
      });

      // Step 16: Validate clinician sees updated profile data
      await (test as any).stepNoScreenshot(
        'Then clinician sees claimed profile data with matching data and no save access',
        async () => {
          await api.compareEndpointResponse('profile-metadata-get', putCapture);
        },
      );
    },
  );
});
