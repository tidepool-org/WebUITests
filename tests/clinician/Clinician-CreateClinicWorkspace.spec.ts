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
      await test.step(
        'Given a clinician with multiple workspaces is logged in',
        async () => {
          await test.clinician.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password, signing in to an account that already has multiple workspaces.',
        },
      );

      // Create workspace page for eidi
      const workspacesPage = new WorkspacesPage(page);

      // Step 2: User click the create new clinic button
      await test.step(
        'When the user clicks the create new clinic button',
        async () => {
          await workspacesPage.createClinicButton.click();
        },
        { detail: 'Click the button on the workspaces screen that starts creating a new clinic.' },
      );

      // Create clinic creation page instance
      const clinicCreationPage = new ClinicCreationPage(page);

      // Step 3: Confirm create page exists and is rached.
      await test.step(
        'Then the user navigates to the create patient page',
        async () => {
          await expect(page).toHaveURL(/clinic-details\/new/);
          await expect(clinicCreationPage.pageHeader).toBeVisible();
        },
        {
          detail:
            'Confirm the app moves to the new clinic-details page and its page heading is shown.',
        },
      );

      // Step 4: Fill in clinic details
      await test.step(
        'When the user fills in the clinic details',
        async () => {
          await clinicCreationPage.fillClinicForm({
            clinicName,
            clinicType: 'Healthcare System',
            state: 'California',
            address: '123 Test Street',
            city: 'Test City',
            zipCode: '12345',
          });
        },
        {
          detail:
            'Enter the clinic name, type, state, address, city, and ZIP code into the clinic-details form.',
        },
      );

      // Step 5: Confirm the form is filled out correctly
      await test.step(
        'Then the clinic details should be filled out correctly',
        async () => {
          await expect(clinicCreationPage.clinicNameInput).toHaveValue(clinicName);
          await expect(clinicCreationPage.clinicTypeDropdown).toHaveValue('healthcare_system');
          await expect(clinicCreationPage.stateDropdown).toHaveValue('CA');
          await expect(clinicCreationPage.addressInput).toHaveValue('123 Test Street');
          await expect(clinicCreationPage.cityInput).toHaveValue('Test City');
          await expect(clinicCreationPage.zipCodeInput).toHaveValue('12345');
        },
        { detail: 'Confirm every clinic-details field shows the value that was just entered.' },
      );

      // Step 6: Click a blood glucose unit button radio
      await test.step(
        'When the blood glucose unit is selected',
        async () => {
          await clinicCreationPage.mgdlRadio.scrollIntoViewIfNeeded();
          await clinicCreationPage.mgdlRadio.click({ force: true });
        },
        { detail: 'Select the blood glucose units option on the form.' },
      );

      // Step 7: Verify that the Create Workspace Button is disabled
      await test.step(
        'Then the Create Workspace Button should be disabled',
        async () => {
          await expect(clinicCreationPage.createWorkspaceButton).toBeDisabled();
        },
        {
          detail:
            'Confirm the Create Workspace button is still disabled because the acknowledgment has not been checked yet.',
        },
      );

      // Step 8: Click the admin acknowledgment checkbox
      await test.step(
        'When the admin acknowledgment checkbox is clicked',
        async () => {
          await clinicCreationPage.adminAcknowledgeCheckbox.click({ force: true });
        },
        { detail: 'Check the administrator acknowledgment checkbox on the form.' },
      );

      // Step 9: Submit the form
      await test.step(
        'And the user submits the form',
        async () => {
          await clinicCreationPage.createWorkspaceButton.click();
        },
        { detail: 'Click the Create Workspace button to submit the clinic-details form.' },
      );

      // Step 10: Confirm the clinic was created
      await test.step(
        'Then the user should see the new clinic in the workspace',
        async () => {
          await expect(workspacesPage.getClinicCard(clinicName)).toBeVisible();
        },
        { detail: 'Confirm a card for the newly created clinic appears on the workspaces screen.' },
      );
    },
  );
});
