import { Page } from '@playwright/test';
export declare class ProfilePage {
    readonly page: Page;
    private fieldLocators;
    constructor(page: Page);
    fillField(field: keyof typeof this.fieldLocators, value: string): Promise<void>;
    selectDiagnosisType(index: number): Promise<void>;
    getCurrentDiagnosisIndex(): Promise<number>;
    fillFullName(name: string): Promise<void>;
    fillBirthDate(date: string): Promise<void>;
    fillMRN(mrn: string): Promise<void>;
    fillDiagnosisDate(date: string): Promise<void>;
    fillClinicalNotes(notes: string): Promise<void>;
    fillEmail(email: string): Promise<void>;
    saveProfile(): Promise<void>;
    /**
     * Checks if the edit button is displayed and validates against expected state
     * @param shouldBeVisible - Boolean indicating whether the edit button should be visible
     * @throws Error if the actual visibility doesn't match the expected state
     */
    editButtonDisplays(shouldBeVisible: boolean): Promise<void>;
}
