import { Locator, Page } from '@playwright/test';
export default class NavigationMenu {
    page: Page;
    container: Locator;
    buttons: {
        trigger: Locator;
        menu: {
            privateWorkspace: Locator;
            accountSettings: Locator;
            logout: Locator;
        };
    };
    constructor(page: Page);
    open(): Promise<void>;
    close(): Promise<void>;
}
