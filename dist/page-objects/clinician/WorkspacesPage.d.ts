import { Locator, Page } from '@playwright/test';
export default class WorkspacesPage {
    readonly page: Page;
    readonly url: string;
    readonly header: Locator;
    readonly subHeader: Locator;
    readonly createClinicButton: Locator;
    constructor(page: Page);
    goto(): Promise<void>;
    visitFirstClinic(): Promise<void>;
    /**
     * Visit a clinic by name
     * @param clinicName - The name of the clinic to visit
     */
    visitClinic(clinicName: string): Promise<void>;
}
