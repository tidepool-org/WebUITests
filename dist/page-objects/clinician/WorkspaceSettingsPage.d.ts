import { Locator, Page } from '@playwright/test';
export default class ClinicAdminPage {
    readonly clinicDetailsHeader: Locator;
    readonly editDetailsButton: Locator;
    readonly editClinicModal: Locator;
    readonly editClinicModalTitle: Locator;
    readonly addressInput: Locator;
    readonly saveChangesButton: Locator;
    readonly clinicDetailsSection: Locator;
    url: string;
    name: string;
    page: Page;
    constructor(page: Page);
    /**
     * Waits for essential elements of the Clinic Admin page to be loaded.
     */
    waitForLoadState(): Promise<void>;
}
