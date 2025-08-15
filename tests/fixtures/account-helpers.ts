import { test as base } from '@fixtures/base';
import AccountNav from '@pom/account/AccountNavigation';
import type { Page } from '@playwright/test';

/**
 * Switch user authentication context by loading different storageState
 * @param userType - The user type corresponding to the storageState file (e.g., 'shared', 'clinician', 'claimed')
 * @param page - The Playwright page instance
 */
async function switchUser(userType: string, page: Page): Promise<void> {
  try {
    // Import fs dynamically
    const fs = await import('node:fs');

    // Load the specified user's storage state
    const storageStatePath = `tests/.auth/${userType}.json`;
    const storageState = JSON.parse(fs.readFileSync(storageStatePath, 'utf-8'));

    // Clear existing cookies first
    await page.context().clearCookies();

    // Set cookies from the new user's storage state
    if (storageState.cookies) {
      await page.context().addCookies(storageState.cookies);
    }

    // Set localStorage from the new user's storage state
    if (storageState.origins) {
      for (const origin of storageState.origins) {
        await page.addInitScript(originData => {
          if (originData.localStorage) {
            for (const item of originData.localStorage) {
              localStorage.setItem(item.name, item.value);
            }
          }
        }, origin);
      }
    }

    console.log(`✅ Successfully switched to ${userType} user authentication`);
  } catch (error) {
    throw new Error(`Failed to switch to ${userType} user: ${error}`);
  }
}

/**
 * Core navigation function that handles account navigation consistently
 */
async function navigateTo(targetPage: keyof AccountNav['pages'], page: Page): Promise<void> {
  const nav = new AccountNav(page);
  const pageConfig = nav.pages[targetPage];

  try {
    // Check page is not closed before proceeding
    if (await page.isClosed()) return;

    // Wait for any loading to complete
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    if (await page.isClosed()) return;

    const loading = page.getByText('Loading...', { exact: true });
    try {
      await loading.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Loading indicator might not be present
    }

    // Open navigation menu if needed and not already visible
    if (targetPage !== 'AccountNav') {
      if (await page.isClosed()) return;
      if (!(await nav.pages.AccountNav.verifyElement.isVisible({ timeout: 5000 }))) {
        if (await page.isClosed()) return;
        await nav.pages.AccountNav.link.click();
        await nav.pages.AccountNav.verifyElement.waitFor({ state: 'visible', timeout: 10000 });
      }
    }

    // For logout, special handling
    if (targetPage === 'Logout') {
      // Ensure we're on the nav menu first
      if (await page.isClosed()) return;
      if (!(await nav.pages.AccountNav.verifyElement.isVisible({ timeout: 5000 }))) {
        if (await page.isClosed()) return;
        await nav.pages.AccountNav.link.click();
        await nav.pages.AccountNav.verifyElement.waitFor({ state: 'visible', timeout: 10000 });
      }
      if (await page.isClosed()) return;
      await pageConfig.link.click();
      // Wait for redirect to login page
      if (await page.isClosed()) return;
      await page
        .waitForURL(/.*login.*/, { waitUntil: 'networkidle', timeout: 10000 })
        .catch(() => {});
    } else {
      // For other pages, normal navigation
      if (await page.isClosed()) return;
      await pageConfig.link.click();
      if (await page.isClosed()) return;
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      if (await page.isClosed()) return;
      await pageConfig.verifyElement.waitFor({ state: 'visible', timeout: 10000 });
    }
  } catch (error) {
    if (await page.isClosed()) return;
    throw error;
  }
}

const test = base as typeof base & {
  account: {
    navigateTo: typeof navigateTo;
    switchUser: typeof switchUser;
  };
};

test.account = {
  navigateTo,
  switchUser,
};

export { test };
