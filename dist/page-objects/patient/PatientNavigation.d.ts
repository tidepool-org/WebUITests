import { Locator, Page } from '@playwright/test';
export interface PageNavVerify {
    name: string;
    link: Locator;
    verifyURL: string;
    verifyElement: Locator;
    closeButton?: Locator;
}
export default class PatientNav {
    readonly page: Page;
    readonly pages: Record<'ViewData' | 'Basics' | 'ChartDateRange' | 'Daily' | 'ChartDate' | 'BGLog' | 'Trends' | 'Devices' | 'Print' | 'Profile' | 'ProfileEdit' | 'Share' | 'ShareData' | 'UploadData', PageNavVerify>;
    constructor(page: Page);
}
