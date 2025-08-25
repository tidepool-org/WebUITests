import { Locator, Page } from '@playwright/test';
export default class DailyChartSection {
    page: Page;
    container: Locator;
    dayLabel: Locator;
    newNote: Locator;
    buttons: {
        refresh: Locator;
    };
    constructor(page: Page);
}
