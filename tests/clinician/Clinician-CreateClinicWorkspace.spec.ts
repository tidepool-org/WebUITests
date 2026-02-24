import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import ClinicCreationPage from '@pom/clinician/ClinicCreationPage';
import { expect } from '../fixtures/base';
import { test } from '../fixtures/clinic-helpers';

import { TEST_TAGS, createValidatedTags } from '../fixtures/test-tags';

test.describe('Clinic Account may create a new workspace', () => {
  const uniqueSuffix = `${Date.now()}`;
  const clinicName = `Test Clinic ${uniqueSuffix}`;

  test(
    'Clinician - Create Clinic Workspace',
    {
      tag: createValidatedTags([TEST_TAGS.CLINICIAN, TEST_TAGS.UI, TEST_TAGS.HIGH]),
    },
    async ({ page }) => {
      // Step 1: Login as clinician
      await test.step('Given a clinician with multiple workspaces is logged in', async () => {
        await test.clinician.setup(page);
      });

      // Create workspace page for eidi
      const workspacesPage = new WorkspacesPage(page);

      // Step 2: User click the create new clinic button
      await test.step('When the user clicks the create new clinic button', async () => {
        await workspacesPage.createClinicButton.click();
      });

      // Create clinic creation page instance
      const clinicCreationPage = new ClinicCreationPage(page);

      // Step 3: Confirm create page exists and is rached.
      await test.step('Then the user navigates to the create patient page', async () => {
        await expect(page).toHaveURL(/clinic-details\/new/);
        await expect(clinicCreationPage.pageHeader).toBeVisible();
      });

      // Step 4: Fill in clinic details
      await test.step('When the user fills in the clinic details', async () => {
        await clinicCreationPage.fillClinicForm({
          clinicName,
          clinicType: 'Healthcare System',
          state: 'California',
          address: '123 Test Street',
          city: 'Test City',
          zipCode: '12345',
        });
      });

      // Step 5: Confirm the form is filled out correctly
      await test.step('Then the clinic details should be filled out correctly', async () => {
        await expect(clinicCreationPage.clinicNameInput).toHaveValue(clinicName);
        await expect(clinicCreationPage.clinicTypeDropdown).toHaveValue('healthcare_system');
        await expect(clinicCreationPage.stateDropdown).toHaveValue('CA');
        await expect(clinicCreationPage.addressInput).toHaveValue('123 Test Street');
        await expect(clinicCreationPage.cityInput).toHaveValue('Test City');
        await expect(clinicCreationPage.zipCodeInput).toHaveValue('12345');
      });

      // Step 6: Click a blood glucose unit button radio
      await test.step('When the blood glucose unit is selected', async () => {
        await clinicCreationPage.mgdlRadio.scrollIntoViewIfNeeded();
        await clinicCreationPage.mgdlRadio.click({ force: true });
      });

      // Step 7: Verify that the Create Workspace Button is disabled
      await test.step('Then the Create Workspace Button should be disabled', async () => {
        await expect(clinicCreationPage.createWorkspaceButton).toBeDisabled();
      });

      // Step 8: Click the admin acknowledgment checkbox
      await test.step('When the admin acknowledgment checkbox is clicked', async () => {
        await clinicCreationPage.adminAcknowledgeCheckbox.click({ force: true });
      });

      // Step 9: Submit the form
      await test.step('When the user submits the form', async () => {
        await clinicCreationPage.createWorkspaceButton.click();
      });

      // Step 10: Confirm the clinic was created
      await test.step('Then the user should see the new clinic in the workspace', async () => {
        await expect(workspacesPage.getClinicCard(clinicName)).toBeVisible();
      });
    },
  );
});
