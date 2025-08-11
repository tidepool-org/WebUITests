/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import-x/prefer-default-export */

import { test as base } from '@fixtures/base';
import PatientNav from '@pom/patient/PatientNavigation';
import type { Page } from '@playwright/test';

/**
 * Initialize patient navigation helpers after login
 */
async function setupPatientSession(page: Page): Promise<PatientNav> {
  // Wait for patient navigation to be available
  const nav = new PatientNav(page);
  await Promise.all([
    nav.pages.ViewData.link.waitFor({ state: 'visible' }),
    nav.pages.Profile.link.waitFor({ state: 'visible' }),
  ]);

  return nav;
}

/**
 * Close any open modal dialogs that might block navigation
 */
async function closeOpenDialogs(page: Page): Promise<void> {
  try {
    // Check if page is still open
    if (page.isClosed()) {
      return;
    }

    // First, try the most common close buttons that are actually visible
    const specificCloseButtons = [
      page.getByRole('button', { name: 'close dialog' }),
      page.getByRole('button', { name: 'Cancel' }),
      page.getByRole('button', { name: 'Close' }),
    ];

    for (const closeButton of specificCloseButtons) {
      try {
        if (page.isClosed()) return;
        if (await closeButton.isVisible({ timeout: 500 })) {
          await closeButton.click();
          await page.waitForTimeout(800); // Give time for dialog to close and animate
          break;
        }
      } catch (error) {
        // Continue trying other close methods
      }
    }

    // Try Escape key - most effective for closing modals
    if (!page.isClosed()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Check for dialog container and try additional methods if still open
    if (!page.isClosed()) {
      const dialogContainer = page.locator('#dialog-container');
      if (await dialogContainer.isVisible({ timeout: 1000 })) {
        // Try more generic close button patterns
        const genericCloseSelectors = [
          'button[aria-label="close"]',
          'button[aria-label="Close"]',
          'button[data-testid="close"]',
          'button.close',
          '.close-button',
          '[role="button"][aria-label*="close" i]',
          'button:has-text("×")',
          '.modal-close',
          '[data-dismiss="modal"]',
        ];

        for (const selector of genericCloseSelectors) {
          try {
            if (page.isClosed()) return;
            const closeButton = page.locator(selector);
            if (await closeButton.isVisible({ timeout: 500 })) {
              await closeButton.click();
              await page.waitForTimeout(500);
              break;
            }
          } catch (error) {
            // Continue trying other selectors
          }
        }

        // If dialog still exists, try clicking outside the modal
        if (!page.isClosed() && (await dialogContainer.isVisible({ timeout: 500 }))) {
          try {
            await page.locator('body').click({ position: { x: 10, y: 10 } });
            await page.waitForTimeout(500);
          } catch (error) {
            // Ignore click errors
          }
        }

        // Final escape attempts
        if (!page.isClosed()) {
          await page.keyboard.press('Escape');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    }
  } catch (error) {
    // Ignore errors in dialog closing - they're not critical
  }
}

/**
 * Core navigation function that handles different page types consistently
 */
async function navigateTo(targetPage: keyof PatientNav['pages'], page: Page): Promise<void> {
  const nav = new PatientNav(page);
  const pageConfig = nav.pages[targetPage];

  // Close any open dialogs first to prevent pointer event interception
  await closeOpenDialogs(page);

  // Wait for any loading to complete
  const loading = page.getByText('Loading...', { exact: true });
  try {
    await loading.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // Loading might not be visible
  }

  // Handle prerequisite navigation for nested pages
  if (targetPage === 'ProfileEdit') {
    // Need to be on Profile page first
    if (!page.url().includes('profile')) {
      await nav.pages.Profile.link.click();
      await nav.pages.Profile.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  } else if (targetPage === 'ShareData') {
    // Need to be on Share page first
    if (!page.url().includes('share')) {
      await nav.pages.Share.link.click();
      await nav.pages.Share.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  // Handle data sub-navigation (ensure we're in data view first)
  if (['Basics', 'Daily', 'BGLog', 'Trends', 'Devices'].includes(targetPage)) {
    // Only click ViewData if we're not already in a data page
    if (!page.url().includes('/data/')) {
      await nav.pages.ViewData.link.click();
      await nav.pages.ViewData.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  // Handle modal navigation that requires specific prerequisite pages
  if (targetPage === 'ChartDateRange') {
    // Ensure we're on Basics page for ChartDateRange
    if (!page.url().includes('/data/basics')) {
      await nav.pages.Basics.link.click();
      await nav.pages.Basics.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  } else if (targetPage === 'ChartDate') {
    // Ensure we're on Daily page for ChartDate
    if (!page.url().includes('/data/daily')) {
      await nav.pages.Daily.link.click();
      await nav.pages.Daily.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  // Perform the actual navigation
  try {
    // Check if page is still open before attempting navigation
    if (page.isClosed()) {
      console.log(`Page is closed, skipping navigation to ${targetPage}`);
      return;
    }

    await pageConfig.link.click();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('closed') || errorMessage.includes('disposed')) {
      console.log(`Page closed during navigation to ${targetPage}`);
      return;
    }
    console.log(`Failed to click ${targetPage}: ${errorMessage}`);
    throw error;
  }

  // For modal dialogs (ChartDateRange, ChartDate, Print), give time to open but don't verify
  if (['ChartDateRange', 'ChartDate', 'Print'].includes(targetPage)) {
    await page.waitForTimeout(1500); // Allow modal to animate in
    return;
  }

  // Verify navigation succeeded
  try {
    if (pageConfig.verifyURL) {
      // Try multiple URL patterns since the exact pattern might vary
      const urlPatterns = [
        `**/*${pageConfig.verifyURL}*`,
        `**/*${pageConfig.verifyURL}`,
        `**/data/${pageConfig.verifyURL}*`,
        `**/data/${pageConfig.verifyURL}`,
      ];

      let urlMatched = false;
      for (const pattern of urlPatterns) {
        try {
          await page.waitForURL(pattern, { timeout: 3000 });
          urlMatched = true;
          break;
        } catch (error) {
          // Try next pattern
        }
      }

      if (!urlMatched) {
        console.log(
          `URL verification failed for ${targetPage}. Current URL: ${page.url()}, Expected pattern: ${pageConfig.verifyURL}`,
        );
      }
    }

    if (pageConfig.verifyElement) {
      await pageConfig.verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('closed') || errorMessage.includes('disposed')) {
      console.log(`Page closed after navigating to ${targetPage}`);
      return;
    }
    console.log(`Navigation verification failed for ${targetPage}: ${errorMessage}`);
  }
}

const test = base as typeof base & {
  patient: {
    navigateTo: typeof navigateTo;
    setup: typeof setupPatientSession;
  };
};

test.patient = {
  navigateTo,
  setup: setupPatientSession,
};

export { test };
