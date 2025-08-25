import { Locator, Page } from '@playwright/test';
import NavigationMenu from './navigation-menu.section';
export default class NavigationSection {
    page: Page;
    container: Locator;
    menu: NavigationMenu;
    buttons: {
        viewData: Locator;
        patientProfile: Locator;
        share: Locator;
        uploadData: Locator;
    };
    constructor(page: Page);
}
