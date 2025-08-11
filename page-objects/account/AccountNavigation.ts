import { Locator, Page } from '@playwright/test';

export type AccountNavVerify = {
  name: string;
  link: Locator;
  verifyURL: string;
  verifyElement: Locator;
  closeButton?: Locator;
}

export default class AccountNav {
  readonly page: Page;

  readonly pages: Record<
    | 'AccountNav'
    | 'PrivateWorkspace'
    | 'AccountSettings'
    | 'Logout',
    AccountNavVerify
  >;

  constructor(page: Page) {
    this.page = page;

    this.pages = {
      'AccountNav': {
        name: 'AccountNav',
        link: page.locator('button#navigation-menu-trigger'), // Use exact ID to identify menu trigger
        verifyURL: '',
        verifyElement: page.locator('button.navigation-menu-option').filter({ hasText: 'Private Workspace' }),
      },
      'PrivateWorkspace': {
        name: 'PrivateWorkspace',
        link: page.locator('button.navigation-menu-option').filter({ hasText: 'Private Workspace' }),
        verifyURL: 'workspaces',
        verifyElement: page.getByText('View data for:'),
      },
      'AccountSettings': {
        name: 'AccountSettings',
        link: page.locator('#navigationMenu button.navigation-menu-option').filter({ hasText: 'Account Settings' }),
        verifyURL: 'account',
        verifyElement: page.getByText('Full name'), // Use "Full name" text which is visible on the account settings page
      },
      'Logout': {
        name: 'Logout',
        link: page.locator('#navigationMenu button.navigation-menu-option').filter({ hasText: 'Logout' }),
        verifyURL: 'login',
        verifyElement: page.getByRole('heading', { name: 'Log in to Tidepool' }),
      },
    };
  }
}
