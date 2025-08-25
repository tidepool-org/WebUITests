import { test as base } from '@fixtures/base';
import type { Page } from '@playwright/test';
import ClinicianNav from '../../page-objects/clinician/ClinicianNavigation';
import ClinicianDashboardPage from '../../page-objects/clinician/ClinicianDashboardPage';
import AccountNav from '../../page-objects/account/AccountNavigation';

// Type definitions for workspace keys (matching the page object)
export type WorkspaceKey =
  | 'AdminClinicBase'
  | 'AdminClinicEnterprise'
  | 'MemberClinicBase'
  | 'MemberClinicEnterprise'
  | 'NonMemberClinicBase'
  | 'NonMemberClinicEnterprise'
  | 'PartnerClinicBase'
  | 'PartnerClinicEnterprise';

// Type definitions for page keys (matching the page object)
export type PageKey =
  | 'PatientList'
  | 'WorkspaceSettings'
  | 'AddPatient'
  | 'Profile'
  | 'ProfileEdit';

/**
 * Initialize clinician navigation helpers after login
 */
async function setupClinicianSession(page: Page): Promise<ClinicianNav> {
  // Wait for clinician navigation to be available
  const nav = new ClinicianNav(page);

  // Navigate to login and setup clinic session if needed
  if (!page.url().includes('clinic-workspace')) {
    await page.goto('/login');
    await navigateToWorkspaceSelection(page);
  }

  console.log('🏥 Clinic session setup complete');
  return nav;
}

/**
 * Navigate to workspace selection page
 */
async function navigateToWorkspaceSelection(page: Page): Promise<void> {
  const accountNav = new AccountNav(page);

  // Open the account navigation menu first
  await accountNav.pages.AccountNav.link.click();

  // Then click the ManageWorkspaces option
  await accountNav.pages.ManageWorkspaces.link.click();

  // Verify we're on the workspace selection page using the known verification element
  await accountNav.pages.ManageWorkspaces.verifyElement.waitFor({
    state: 'visible',
    timeout: 5000,
  });

  // console.log('✅ Navigated to workspace selection page');
}

/**
 * Navigate to a specific workspace using hardcoded workspace key
 */
async function navigateToWorkspace(workspaceKey: WorkspaceKey, page: Page): Promise<void> {
  const clinicianNav = new ClinicianNav(page);

  // First navigate to workspace selection if not already there
  if (!page.url().includes('workspaces')) {
    await navigateToWorkspaceSelection(page);
  }

  // Click on the specific workspace using the page object locator
  await clinicianNav.workspaces[workspaceKey].link.click();

  // Verify we're in the correct workspace using URL verification
  await page.waitForURL(new RegExp(clinicianNav.workspaces[workspaceKey].verifyURL), {
    timeout: 5000,
  });

  // console.log(`✅ Successfully navigated to workspace: ${clinicianNav.workspaces[workspaceKey].name}`);
}

/**
 * Core navigation function that handles workspace prerequisites and page navigation
 */
async function navigateTo(
  targetPage: PageKey,
  page: Page,
  workspaceKey?: WorkspaceKey,
): Promise<void> {
  const clinicianNav = new ClinicianNav(page);
  const pageConfig = clinicianNav.pages[targetPage];

  // Ensure we're in a workspace context (but don't auto-switch if already in one)
  const isInWorkspaceContext =
    page.url().includes('clinic-workspace') ||
    page.url().includes('/patients/') ||
    page.url().includes('/profile');

  if (!isInWorkspaceContext) {
    const defaultWorkspace = workspaceKey || 'AdminClinicBase';
    await navigateToWorkspace(defaultWorkspace, page);
  } else if (workspaceKey) {
    // Only switch if specifically requested and we can verify we're in wrong workspace
    const currentUrl = page.url();
    const targetWorkspacePattern = clinicianNav.workspaces[workspaceKey].verifyURL;
    if (!currentUrl.includes(targetWorkspacePattern)) {
      await navigateToWorkspace(workspaceKey, page);
    }
  }

  // Handle page-specific prerequisites
  if (targetPage === 'AddPatient') {
    // AddPatient might need to be on PatientList first
    if (!page.url().includes('patients')) {
      await clinicianNav.pages.PatientList.link.click();
      await clinicianNav.pages.PatientList.verifyElement.waitFor({
        state: 'visible',
        timeout: 5000,
      });
    }
  }

  // Perform the actual navigation
  try {
    await pageConfig.link.click();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`Failed to click ${targetPage}: ${errorMessage}`);
    throw error;
  }

  // Verify navigation succeeded
  try {
    if (pageConfig.verifyURL) {
      await page.waitForURL(`**/*${pageConfig.verifyURL}*`, { timeout: 5000 });
    }

    if (pageConfig.verifyElement) {
      await pageConfig.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }

    // console.log(`✅ Navigated to page: ${targetPage}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // console.log(`Navigation verification failed for ${targetPage}: ${errorMessage}`);
  }
}

/**
 * Execute test logic across multiple workspaces
 */
async function executeAcrossWorkspaces(
  workspaceConfigs: { workspaceKey: WorkspaceKey }[],
  action: (config: { workspaceKey: WorkspaceKey }) => Promise<void>,
  page: Page,
): Promise<void> {
  for (const config of workspaceConfigs) {
    console.log(`🔄 Executing across workspace: ${config.workspaceKey}`);

    // Navigate to the workspace
    await navigateToWorkspace(config.workspaceKey, page);

    // Execute the action
    await action(config);

    // Navigate back to workspace selection for next iteration
    if (workspaceConfigs.indexOf(config) < workspaceConfigs.length - 1) {
      await navigateToWorkspaceSelection(page);
    }
  }
}

/**
 * Find and access any patient whose name contains the search term (optimized version)
 * @param searchTerm - Partial name to search for (e.g., "Custodial")
 * @param page - The Playwright page object
 * @returns The full name of the patient that was accessed
 */
async function findAndAccessPatientByPartialName(searchTerm: string, page: Page): Promise<string> {
  const dashboard = new ClinicianDashboardPage(page);

  // If empty search term, find any available patient
  if (!searchTerm || searchTerm.trim() === '') {
    return findAndAccessAnyPatient(page);
  }

  // Strategy 1: Fill search field THEN click Show All (proven fastest method)
  try {
    await dashboard.searchInput.fill(searchTerm);
    await page.waitForTimeout(500);

    const showAllButton = page
      .getByRole('button', { name: 'Show All' })
      .or(page.getByRole('button', { name: 'Show all' }))
      .or(page.getByText('Show All'))
      .or(page.getByText('Show all'));

    if (await showAllButton.isVisible({ timeout: 1000 })) {
      await showAllButton.click();
      await page.waitForTimeout(1000);

      const searchResultCells = await dashboard.patientListTable.getByRole('cell').all();

      if (searchResultCells.length > 0) {
        for (const cell of searchResultCells) {
          const cellText = await cell.textContent();
          if (cellText && cellText.toLowerCase().includes(searchTerm.toLowerCase())) {
            await cell.click();
            await page.waitForTimeout(600);
            return cellText.trim();
          }
        }
      }
    } else {
      await dashboard.searchInput.press('Enter');
      await page.waitForTimeout(1000);

      const searchResultCells = await dashboard.patientListTable.getByRole('cell').all();

      if (searchResultCells.length > 0) {
        for (const cell of searchResultCells) {
          const cellText = await cell.textContent();
          if (cellText && cellText.toLowerCase().includes(searchTerm.toLowerCase())) {
            await cell.click();
            await page.waitForTimeout(600);
            return cellText.trim();
          }
        }
      }
    }
  } catch (error) {
    // Silent fallback to any patient
  }

  // Strategy 2: Fallback to any available patient if specific search fails
  try {
    return await findAndAccessAnyPatient(page);
  } catch (fallbackError) {
    throw new Error(
      `No patient found containing "${searchTerm}" and no fallback patients available`,
    );
  }
}

/**
 * Find and access any available patient (fastest option)
 * @param page - The Playwright page object
 * @returns The full name of the first patient that was accessed
 */
async function findAndAccessAnyPatient(page: Page): Promise<string> {
  const dashboard = new ClinicianDashboardPage(page);

  try {
    // Clear search to show all patients
    await dashboard.searchInput.click();
    await dashboard.searchInput.fill(' ');
    await page.waitForTimeout(500);
    await dashboard.searchInput.fill('');
    await page.waitForTimeout(1500);

    let allCells = await dashboard.patientListTable.getByRole('cell').all();

    // If no cells, try pressing Enter on empty search
    if (allCells.length === 0) {
      await dashboard.searchInput.press('Enter');
      await page.waitForTimeout(1500);
      allCells = await dashboard.patientListTable.getByRole('cell').all();
    }

    // Find the first cell that looks like a patient name
    for (const cell of allCells) {
      const cellText = await cell.textContent();
      if (cellText && cellText.trim().length > 3 && cellText.includes(' ')) {
        await cell.click();
        await page.waitForTimeout(800);
        return cellText.trim();
      }
    }

    throw new Error('No patient names found in table');
  } catch (error) {
    throw new Error(`Failed to find any patient: ${error}`);
  }
}

/**
 * Access a specific patient by name and navigate to their summary page
 * @param patientName - The name of the patient to access
 * @param page - The Playwright page object
 */
async function accessPatient(patientName: string, page: Page): Promise<void> {
  const dashboard = new ClinicianDashboardPage(page);

  console.log(`🔍 Searching for patient: ${patientName}`);

  // Try optimized search first
  await dashboard.searchForPatient(patientName);
  await page.waitForTimeout(1000); // Reduced wait time

  // Check if search worked
  const patientCell = dashboard.getPatientCellByName(patientName);
  const isVisible = await patientCell.isVisible({ timeout: 2000 });

  if (isVisible) {
    console.log(`👤 Found patient via search: ${patientName}`);
    await patientCell.click();
    await page.waitForTimeout(1000);
    console.log(`✅ Successfully accessed patient summary for: ${patientName}`);
    return;
  }

  // If search failed, fall back to show all + find
  console.log(`🔄 Search failed, trying show all approach...`);
  const showAllButton = page.getByRole('button', { name: 'Show All' });
  if (await showAllButton.isVisible({ timeout: 1000 })) {
    await showAllButton.click();
    await page.waitForTimeout(1500);
  }

  // Try again after showing all
  const isVisibleAfterShowAll = await patientCell.isVisible({ timeout: 2000 });
  if (isVisibleAfterShowAll) {
    await patientCell.click();
    await page.waitForTimeout(1000);
    // console.log(`✅ Successfully accessed patient summary for: ${patientName}`);
    return;
  }

  // If still not found, throw error
  throw new Error(`Patient "${patientName}" not found in current workspace`);
}

const test = base as typeof base & {
  clinician: {
    navigateTo: typeof navigateTo;
    navigateToWorkspace: typeof navigateToWorkspace;
    navigateToWorkspaceSelection: typeof navigateToWorkspaceSelection;
    executeAcrossWorkspaces: typeof executeAcrossWorkspaces;
    accessPatient: typeof accessPatient;
    findAndAccessPatientByPartialName: typeof findAndAccessPatientByPartialName;
    findAndAccessAnyPatient: typeof findAndAccessAnyPatient;
    setup: typeof setupClinicianSession;
  };
};

test.clinician = {
  navigateTo,
  navigateToWorkspace,
  navigateToWorkspaceSelection,
  executeAcrossWorkspaces,
  accessPatient,
  findAndAccessPatientByPartialName,
  findAndAccessAnyPatient,
  setup: setupClinicianSession,
};

export { test };
