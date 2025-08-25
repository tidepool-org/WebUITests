import { test as base } from '@fixtures/base';
import AccountNav from '@pom/account/AccountNavigation';
import type { Page } from '@playwright/test';
/**
 * Switch user authentication context by loading different storageState
 * @param userType - The user type corresponding to the storageState file (e.g., 'shared', 'clinician', 'claimed')
 * @param page - The Playwright page instance
 */
declare function switchUser(userType: string, page: Page): Promise<void>;
/**
 * Core navigation function that handles account navigation consistently
 */
declare function navigateTo(targetPage: keyof AccountNav['pages'], page: Page): Promise<void>;
declare const test: typeof base & {
    account: {
        navigateTo: typeof navigateTo;
        switchUser: typeof switchUser;
    };
};
export { test };
