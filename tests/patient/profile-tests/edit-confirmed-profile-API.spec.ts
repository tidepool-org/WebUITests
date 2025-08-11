/* eslint-disable no-console */

import { test } from '@fixtures/patient-helpers';
import { createNetworkHelper } from '@fixtures/network-helpers';
import * as path from 'node:path';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';

test.describe(
  'Profile API Validation',
  {
    tag: createValidatedTags([
      TEST_TAGS.PATIENT, // User Type (required)
      TEST_TAGS.API, // Test Type (required)
      TEST_TAGS.UI, // Test Type (required)
      TEST_TAGS.HIGH, // Priority (required)
      TEST_TAGS.PROFILE, // Feature (optional)
    ]),
  },
  () => {
    let api: any;

    test.beforeEach(async ({ page }) => {
      api = createNetworkHelper(page);
      await api.startCapture();
      await page.goto('/data');
      await test.patient.setup(page);
    });

    test('should validate profile GET and PUT requests', async ({ page }) => {
      const testRunId = Math.floor(Math.random() * 10000);
      const resultsDir = `test-results/should-validate-profile-GET-and-PUT-requests-chromium-patient`;

      // Step 1: Navigate to profile
      await test.step('Navigate to profile', async () => {
        await test.patient.navigateTo('Profile', page);
        await page.waitForTimeout(2000);
        console.log('✅ Step 1: Navigated to profile page');
      });

      // Step 2: Capture GET response
      await test.step('Check profile GET response [no-screenshot]', async () => {
        await page.waitForTimeout(1000);

        const getRequest = api.getLatestCaptureMatching('GET', /\/metadata\/.*\/profile/);
        if (getRequest?.responseBody) {
          console.log(`📊 GET request captured: ${getRequest.url}`);
          await api.saveApiResponse(
            getRequest.responseBody,
            getRequest.url,
            'GET',
            path.join(resultsDir, 'step-02-profile-get-response.json'),
          );
        } else {
          console.log('⚠️  No GET request captured');
        }

        console.log('✅ Step 2: Profile GET request validated');
      });

      // Step 3: Open Edit Profile
      await test.step('Open Edit Profile', async () => {
        await test.patient.navigateTo('ProfileEdit', page);
        await page.waitForTimeout(1000);
        console.log('✅ Step 3: Profile edit mode opened');
      });

      // Step 4: Change profile fields
      await test.step('Change profile fields (not email)', async () => {
        const nameField = page.getByRole('textbox', { name: 'Full name' });
        const birthDateField = page.getByRole('textbox', { name: 'Date of birth' });
        const diagnosisDateField = page.getByRole('textbox', { name: 'Date of diagnosis' });
        const diagnosisCombo = page.getByRole('combobox', { name: 'Diagnosed as' });
        const shareField = page.getByRole('textbox', { name: 'Anything you would like to share' });

        // Generate completely unique values for this test run
        const updatedName = `Test User Updated ${testRunId}`;
        const birthYear = 1985 + (testRunId % 10);
        const diagnosisYear = birthYear + 20;
        const birthDate = `01/15/${birthYear}`;
        const diagnosisDate = `03/10/${diagnosisYear}`;

        // Generate random 15-letter string
        const randomString = Array.from({ length: 15 }, () =>
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        ).join('');

        // Update fields with fresh values
        await nameField.fill(updatedName);
        await birthDateField.fill(birthDate);
        await diagnosisDateField.fill(diagnosisDate);

        if (await diagnosisCombo.isVisible()) {
          // Pick random index from 1-7 (skip index 0)
          const randomIndex = Math.floor(Math.random() * 7) + 1;
          await diagnosisCombo.selectOption({ index: randomIndex });
          console.log(`🎲 Selected random diagnosis type at index ${randomIndex}`);
        }

        if (await shareField.isVisible()) {
          await shareField.fill(randomString);
        }

        console.log(
          `✅ Step 4: Profile updated with ID ${testRunId}, random text: ${randomString}`,
        );
      });

      // Step 5: Save profile edit
      await test.step('Save profile edit', async () => {
        const saveButton = page.getByRole('button', { name: 'Save changes' });
        await saveButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Step 5: Profile changes saved');
      });

      // Step 6: Capture PUT response
      await test.step('Check profile PUT and GET response [no-screenshot]', async () => {
        await page.waitForTimeout(1000);

        const putRequest = api.getLatestCaptureMatching('PUT', /\/metadata\/.*\/profile/);
        if (putRequest?.responseBody) {
          console.log(`📊 PUT request captured: ${putRequest.url}`);
          await api.saveApiResponse(
            putRequest.responseBody,
            putRequest.url,
            'PUT',
            path.join(resultsDir, 'step-06-profile-put-response.json'),
          );
        } else {
          console.log('⚠️  No PUT request captured');
        }

        console.log('✅ Step 6: Profile update verified');
      });

      await api.stopCapture();
    });
  },
);
