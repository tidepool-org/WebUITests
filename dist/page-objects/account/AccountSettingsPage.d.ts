import { Page, Locator } from '@playwright/test';
export declare class AccountSettingsPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly saveButton: Locator;
    readonly saveConfirm: Locator;
    constructor(page: Page);
}
export default AccountSettingsPage;
