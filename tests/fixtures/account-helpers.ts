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
    // Single page check at start
    if (page.isClosed()) return;

    // Quick DOM ready check only
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

    // Open navigation menu if needed (only for non-AccountNav targets)
    if (targetPage !== 'AccountNav') {
      const menuVisible = await nav.pages.AccountNav.verifyElement.isVisible({ timeout: 1000 }).catch(() => false);
      if (!menuVisible) {
        await nav.pages.AccountNav.link.click();
        await nav.pages.AccountNav.verifyElement.waitFor({ state: 'visible', timeout: 3000 });
      }
    }

    // Handle logout specially
    if (targetPage === 'Logout') {
      await pageConfig.link.click();
      await page.waitForURL(/.*login.*/, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
    } else {
      // Standard navigation - click and verify
      await pageConfig.link.click();
      await pageConfig.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  } catch (error) {
    if (!page.isClosed()) throw error;
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
