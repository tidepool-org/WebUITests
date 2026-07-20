import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import ClinicCreationPage from '@pom/clinician/ClinicCreationPage';
import { expect } from '../fixtures/base';
import { test } from '../fixtures/clinic-helpers';
import { createNetworkHelper } from '../fixtures/network-helpers';
import env from '../../utilities/env';

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
      // Start capturing the clinic-creation API call up front (before the form is submitted) so
      // the workspace it creates can be deleted afterwards. See the "When the workspace is
      // deleted" step below.
      const api = createNetworkHelper(page);
      api.captureClinicCreation();

      // Step 1: Login as clinician
      await test.step(
        'Given a clinician with multiple workspaces is logged in',
        async () => {
          await test.clinician.setup(page);
        },
        {
          detail:
            'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password as "UI Auto Clinician", signing in to an account that already has multiple workspaces.',
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
        'Then the user navigates to the create clinic page',
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

      // Steps 11-12: delete the workspace this test created and confirm it's gone. These run as
      // cleanup steps so they ALWAYS execute — even if an assertion above failed — keeping the
      // account free of "Test Clinic ..." bloat on re-runs, while still rendering as normal
      // When/Then steps in Xray. Deletion is done via the clinic API; the UI check in the "Then"
      // step is the source of truth — if it can't confirm the workspace is gone, the test fails
      // (see the assertion after the steps).
      let workspaceConfirmedDeleted = false;

      await test.cleanupStep(
        'When the workspace is deleted',
        async () => {
          await api.deleteCreatedClinic(env.BASE_URL);
        },
        {
          detail:
            'Delete the workspace created earlier in this test. Automated run: send an ' +
            'authenticated DELETE to /v1/clinics/{clinicId}, reusing the same ' +
            'x-tidepool-session-token the app sent when it created the clinic. While executing ' +
            'the test manually, utilize ORCA to delete the workspace.',
        },
      );

      await test.cleanupStep(
        'Then the workspace no longer displays within the workspaces page',
        async () => {
          // Reload the workspaces page and wait for it to fully render (load-state based, not a
          // fixed delay) so the step's evidence screenshot shows the loaded page minus the
          // deleted workspace. Then confirm the clinic card is gone — the authoritative
          // confirmation of deletion.
          await workspacesPage.goto();
          await workspacesPage.waitUntilLoaded();

          await expect(workspacesPage.getClinicCard(clinicName)).not.toBeVisible();
          workspaceConfirmedDeleted = true;
        },
        {
          detail:
            'Reload the Clinic Workspaces page and confirm the card for the deleted clinic no ' +
            'longer appears in the workspaces list.',
        },
      );

      // Fail the test if the UI could not confirm the workspace was deleted. The "Then" cleanup
      // step above is already recorded as FAILED for Xray on its own, but cleanupStep swallows
      // the error so sibling cleanups can still run; this assertion propagates that failure to
      // the overall test result.
      expect(
        workspaceConfirmedDeleted,
        'Workspace still appears in the workspaces list after deletion — the UI could not ' +
          'confirm the workspace was deleted.',
      ).toBe(true);
    },
  );
});
