import { expect } from '@fixtures/base';
import { test, ALL_WORKSPACE_KEYS } from '@fixtures/clinic-helpers';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import WorkspaceSettingsPage from '@pom/clinician/WorkspaceSettingsPage';
import ClinicCreationPage from '@pom/clinician/ClinicCreationPage';

import type { WorkspaceKey } from '@pom/clinician/ClinicianNavigation';

ALL_WORKSPACE_KEYS.forEach((workspace: WorkspaceKey) => {
  test.describe('Clinic admin given edit permissions to Workspace Details. Clinic Members have view only access', () => {
    test(
      `Clinician - Edit Clinic Details [${workspace}]`,
      {
        tag: createValidatedTags([TEST_TAGS.CLINICIAN, TEST_TAGS.UI, TEST_TAGS.MEDIUM]),
      },
      async ({ page }) => {
        // Step 1: Log in to clinician account and setup network capture
        await test.step(
          'Given clinician has been logged in',
          async () => {
            await test.clinician.setup(page);
          },
          {
            detail:
              'Log in to Tidepool Web using the automated clinician account credentials stored in 1Password as "UI Auto Clinician".',
          },
        );

        // Step 2: Navigate to currently tested workspace
        await test.step(
          `When user navigates to workspace ${workspace}`,
          async () => {
            await test.clinician.navigateToWorkspace(workspace, page);
          },
          { detail: `From the workspaces list, open the ${workspace} clinic workspace.` },
        );

        // Step 3: Navigate to workspace settings
        await test.step(
          'And user navigates to workspace settings',
          async () => {
            await test.clinician.navigateTo('WorkspaceSettings', page);
          },
          {
            detail:
              "Open the workspace's Settings page, where the clinic details are shown and edited.",
          },
        );

        // Create workspace settings page
        const workspaceSettings = new WorkspaceSettingsPage(page);

        // Step 4a: Workspace details view from by a member user does not have edit button
        if (workspace.includes('Member')) {
          await test.step(
            'Then edit button is not present for Member users',
            async () => {
              await expect(workspaceSettings.editDetailsButton).toBeHidden();
            },
            {
              detail:
                'Confirm that no Edit Details button appears — member users have read-only access and cannot change clinic details.',
            },
          );
          return;
        }

        // Step 4b: Workspace details view from admin user has edit button and it is clickable
        await test.step(
          'Then edit button is present and clickable for Admin users',
          async () => {
            await expect(workspaceSettings.editDetailsButton).toBeVisible();
            await workspaceSettings.editDetailsButton.click();
            await page.waitForTimeout(500);
          },
          {
            detail:
              'Confirm the Edit Details button is visible, then click it to open the editable clinic-details form.',
          },
        );

        // Create clinic creation page
        const clinicCreation = new ClinicCreationPage(page);
        // Define clinic details for compare and reset reasons
        const currentClinicName = await clinicCreation.clinicNameInput.inputValue();
        const currentDate = Date.now();
        const newAddress = `Street # ${currentDate}`;
        const newCity = `City ${currentDate}`;
        const newZipCode = `Zip ${currentDate}`;
        const newWebsite = `https://www.clinic-${currentDate}.com`;

        // Step 5: Edit all Workspace details fields
        await test.step(
          'When user edits all workspace details fields',
          async () => {
            await clinicCreation.fillClinicForm({
              clinicName: `${currentClinicName} Edited`,
              clinicType: 'Healthcare System',
              state: 'Oregon',
              address: newAddress,
              city: newCity,
              zipCode: newZipCode,
              website: newWebsite,
            });
            await clinicCreation.mmolRadio.check({ force: true });
          },
          {
            detail:
              'Change every clinic-details field (name, type, state, address, city, ZIP, and website) to new values, and switch the preferred glucose units.',
          },
        );

        // Step 6: Save changes
        await test.step(
          'And user saves changes',
          async () => {
            await workspaceSettings.saveChangesButton.click();
            await page.waitForTimeout(500);
          },
          { detail: 'Click Save Changes to submit the clinic-details form.' },
        );

        // Step 7: Confirm changes
        await test.step(
          'Then modal is dismissed and workspace details are updated',
          async () => {
            await workspaceSettings.waitForLoadState();
            await expect(workspaceSettings.clinicName).toHaveText(`${currentClinicName} Edited`);
            await expect(workspaceSettings.clinicType).toContainText('Healthcare System');
            await expect(workspaceSettings.clinicAddress).toContainText(newAddress);
            await expect(workspaceSettings.clinicAddress).toContainText('OR');
            await expect(workspaceSettings.clinicAddress).toContainText(newCity);
            await expect(workspaceSettings.clinicAddress).toContainText(newZipCode);
            await expect(workspaceSettings.clinicWebsite).toContainText(newWebsite);
            await expect(workspaceSettings.clinicPreferredBloodGlucose).toContainText('mmol/L');
          },
          {
            detail:
              'Confirm the edit dialog closes and the workspace settings now show the updated name, type, address, website, and preferred glucose units.',
          },
        );

        // Step 8: Click edit details button
        await test.step(
          'When user clicks edit details button',
          async () => {
            await workspaceSettings.editDetailsButton.click();
            await page.waitForTimeout(500);
          },
          {
            detail: 'Click Edit Details again to re-open the form so the changes can be reverted.',
          },
        );

        // Step 9: Return clinic details to default values for navigation reasons/reset
        await test.step(
          'And user resets Workspace details fields',
          async () => {
            await clinicCreation.fillClinicForm({
              clinicName: currentClinicName,
            });
            await clinicCreation.mgdlRadio.check({ force: true });
          },
          {
            detail:
              'Change the clinic name back to its original value and switch the glucose units back, restoring the workspace baseline.',
          },
        );

        // Step 10: Save changes
        await test.step(
          'And user saves changes',
          async () => {
            await workspaceSettings.saveChangesButton.click();
            await page.waitForTimeout(500);
          },
          { detail: 'Click Save Changes to submit the clinic-details form.' },
        );

        // Step 11: Confirm reset to previous state
        await test.step(
          'Then modal is dismissed and workspace details return to default state',
          async () => {
            await workspaceSettings.waitForLoadState();
            await expect(workspaceSettings.clinicName).toHaveText(currentClinicName);
            await expect(workspaceSettings.clinicType).toContainText('Provider Practice');
            await expect(workspaceSettings.clinicAddress).toContainText('123 Test Street');
            await expect(workspaceSettings.clinicAddress).toContainText('CA');
            await expect(workspaceSettings.clinicAddress).toContainText('Test City');
            await expect(workspaceSettings.clinicAddress).toContainText('12345');
            await expect(workspaceSettings.clinicWebsite).toContainText(newWebsite);
            await expect(workspaceSettings.clinicPreferredBloodGlucose).toContainText('mg/dL');
          },
          {
            detail:
              'Confirm the dialog closes and the workspace details show their original default values again.',
          },
        );
      },
    );
  });
});
