import { expect } from '@fixtures/base';
import { test, ALL_WORKSPACE_KEYS } from '@fixtures/clinic-helpers';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';

import type { WorkspaceKey } from '@pom/clinician/ClinicianNavigation';

ALL_WORKSPACE_KEYS.forEach((workspace: WorkspaceKey) => {
  test.describe('Patient filter functionality in workspace', () => {
    test(
      `should filter patients correctly in workspace: "[${workspace}]"`,
      {
        tag: createValidatedTags([TEST_TAGS.CLINICIAN, TEST_TAGS.UI, TEST_TAGS.MEDIUM]),
      },
      async ({ page }) => {
        // Step 1: Log in to clinician account
        await test.step('Given clinician has been logged in', async () => {
          await test.clinician.setup(page);
        });

        // Step 2: Navigate to workspace
        await test.step(`When user navigates to workspace: ${workspace}`, async () => {
          await test.clinician.navigateToWorkspace(workspace, page);
        });

        // Define the dasphboard
        const dashboard = new ClinicianDashboardPage(page);

        // Step 3: Click the Show All toggle button
        await test.step('When user clicks the Show All toggle button', async () => {
          await dashboard.showAllToggle.click();
          await page.waitForTimeout(1000);
        });

        // Define patient list for filtering
        let patientNames = await dashboard.getPatientNames();

        // Step 4: Get first two patient names
        await test.step('Then at least 2 patient names display in patient list', async () => {
          expect(patientNames.length).toBeGreaterThanOrEqual(2);
        });

        // Define patients for later comparison
        const patientA = patientNames[0];
        const patientB = patientNames[1];

        // Step 5: Click the Show All toggle button
        await test.step('When user clicks the Show All toggle button', async () => {
          await dashboard.showAllToggle.click();
          await page.waitForTimeout(1000);
        });

        // Step 6: Search for patient A
        await test.step(`When user searches for patient A: ${patientA}`, async () => {
          await dashboard.searchInput.fill(patientA);
          await page.waitForTimeout(2000);
        });

        // Refresh Patient list for filtering
        patientNames = await dashboard.getPatientNames();

        // Step 7: Verify patient A displays in the list
        await test.step(`Then patient A: ${patientA} displays in the list`, async () => {
          expect(patientNames).toContain(patientA);
        });

        // Step 8: Verify patient B does not display in the list
        await test.step(`Then patient B: ${patientB} does not display in the list`, async () => {
          expect(patientNames).not.toContain(patientB);
        });

        // Step 9: Clear the search box
        await test.step('When user clears the search box', async () => {
          await dashboard.searchInput.fill('');
          await page.waitForTimeout(4000);
        });

        // Refresh Patient list for filtering
        patientNames = await dashboard.getPatientNames();

        // Step 10: Verify both patients display in the list
        await test.step('Then both patients display in the list', async () => {
          expect(patientNames).toContain(patientA);
          expect(patientNames).toContain(patientB);
        });
      },
    );
  });
});
