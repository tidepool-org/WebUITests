import { test as base } from '@fixtures/base';
import AccountNav from '@pom/account/AccountNavigation';
import type { Page } from '@playwright/test';

/**
 * Core navigation function that handles account navigation consistently
 */
async function navigateTo(
  targetPage: keyof AccountNav['pages'],
  page: Page
): Promise<void> {
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
      if (!await nav.pages.AccountNav.verifyElement.isVisible({ timeout: 5000 })) {
        if (await page.isClosed()) return;
        await nav.pages.AccountNav.link.click();
        await nav.pages.AccountNav.verifyElement.waitFor({ state: 'visible', timeout: 10000 });
      }
      if (await page.isClosed()) return;
      await pageConfig.link.click();
      // Wait for redirect to login page
      if (await page.isClosed()) return;
      await page.waitForURL(/.*login.*/, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
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
  };
};

test.account = {
  navigateTo,
};

export { test };
