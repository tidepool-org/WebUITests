"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccountNav {
    constructor(page) {
        this.page = page;
        this.pages = {
            AccountNav: {
                name: 'AccountNav',
                link: page.locator('button#navigation-menu-trigger'), // Use exact ID to identify menu trigger
                verifyURL: '',
                verifyElement: page
                    .locator('button.navigation-menu-option')
                    .filter({ hasText: 'Private Workspace' }),
            },
            PrivateWorkspace: {
                name: 'PrivateWorkspace',
                link: page
                    .locator('button.navigation-menu-option')
                    .filter({ hasText: 'Private Workspace' }),
                verifyURL: 'workspaces',
                verifyElement: page.getByText('View data for:'),
            },
            AccountSettings: {
                name: 'AccountSettings',
                link: page
                    .locator('#navigationMenu button.navigation-menu-option')
                    .filter({ hasText: 'Account Settings' }),
                verifyURL: 'account',
                verifyElement: page.locator('.profile-subnav-title').getByText('Account'), // Target the specific Account title element
            },
            ManageWorkspaces: {
                name: 'ManageWorkspaces',
                link: page
                    .locator('#navigationMenu button.navigation-menu-option')
                    .filter({ hasText: 'Manage Workspaces' }),
                verifyURL: 'workspaces',
                verifyElement: page.getByText('Welcome To Tidepool'), // Should land back on the workspace selection page
            },
            Logout: {
                name: 'Logout',
                link: page
                    .locator('#navigationMenu button.navigation-menu-option')
                    .filter({ hasText: 'Logout' }),
                verifyURL: 'login',
                verifyElement: page.getByRole('heading', { name: 'Log in to Tidepool' }),
            },
        };
    }
    /**
     * Navigate to a page in the account navigation menu by key.
     * Example: await accountNav.navigateTo('AccountSettings');
     */
    async navigateTo(pageKey) {
        // Always open the navigation menu first
        await this.pages.AccountNav.link.click();
        // Then click the desired page
        await this.pages[pageKey].link.click();
        // Wait for the verification element to appear
        await this.pages[pageKey].verifyElement.waitFor({ state: 'visible', timeout: 5000 });
    }
}
exports.default = AccountNav;
