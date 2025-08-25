import { Locator, Page } from '@playwright/test';
export default class ClinicCreationPage {
    page: Page;
    url: string;
    pageHeader: Locator;
    pageDescription: Locator;
    clinicNameInput: Locator;
    teamTypeDropdown: Locator;
    countryDropdown: Locator;
    stateDropdown: Locator;
    addressInput: Locator;
    cityInput: Locator;
    zipCodeInput: Locator;
    websiteInput: Locator;
    mgdlRadio: Locator;
    mmolRadio: Locator;
    adminAcknowledgeCheckbox: Locator;
    backButton: Locator;
    createWorkspaceButton: Locator;
    constructor(page: Page);
    /**
     * Navigate to the clinic creation page
     */
    goto(): Promise<void>;
    /**
     * Fill the clinic creation form with required information
     * @param clinicName - Name of the clinic
     * @param teamType - Type of the team
     * @param state - State (for US clinics)
     * @param address - Street address
     * @param city - City name
     * @param zipCode - Zip/Postal code
     * @param website - Optional website URL
     */
    fillClinicForm({ clinicName, teamType, state, address, city, zipCode, website, }: {
        clinicName: string;
        teamType?: string;
        state?: string;
        address?: string;
        city?: string;
        zipCode?: string;
        website?: string;
    }): Promise<void>;
    /**
     * Select blood glucose units
     * @param unit - "mg/dL" or "mmol/L"
     */
    selectBloodGlucoseUnit(unit: 'mg/dL' | 'mmol/L'): Promise<void>;
    /**
     * Create a clinic by filling the form and submitting
     * @param clinicName - Name of the clinic to create (required)
     * @param formData - Optional form data (uses defaults if not provided)
     */
    createClinic(clinicName: string, formData?: Omit<Parameters<typeof this.fillClinicForm>[0], 'clinicName'>): Promise<void>;
}
