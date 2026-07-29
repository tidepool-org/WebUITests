import { Locator, Page } from '@playwright/test';
export interface AccountNavVerify {
    name: string;
    link: Locator;
    verifyURL: string;
    verifyElement: Locator;
    closeButton?: Locator;
}
export default class AccountNav {
    readonly page: Page;
    readonly pages: Record<'AccountNav' | 'PrivateWorkspace' | 'AccountSettings' | 'ManageWorkspaces' | 'Logout', AccountNavVerify>;
    constructor(page: Page);
    /**
     * Navigate to a page in the account navigation menu by key.
     * Example: await accountNav.navigateTo('AccountSettings');
     */
    navigateTo(pageKey: keyof AccountNav['pages']): Promise<void>;
}
