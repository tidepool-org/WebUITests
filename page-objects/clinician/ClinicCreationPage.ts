import { Locator, Page } from '@playwright/test';

export default class ClinicCreationPage {
  page: Page;

  url = '/clinic-details/new';

  // Page header elements
  pageHeader: Locator;

  pageDescription: Locator;

  // Form input fields
  clinicNameInput: Locator;

  teamTypeDropdown: Locator;

  countryDropdown: Locator;

  stateDropdown: Locator;

  addressInput: Locator;

  cityInput: Locator;

  zipCodeInput: Locator;

  websiteInput: Locator;

  // Blood glucose units radio buttons
  mgdlRadio: Locator;

  mmolRadio: Locator;

  // Acknowledgement checkbox
  adminAcknowledgeCheckbox: Locator;

  // Action buttons
  backButton: Locator;

  createWorkspaceButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page header elements
    this.pageHeader = page.getByText('Create your Clinic Workspace');
    this.pageDescription = page.getByText(
      'The information below will be displayed along with your name',
    );

    // Form input fields
    this.clinicNameInput = page.getByLabel('Clinic Name');
    this.teamTypeDropdown = page.getByRole('combobox', { name: 'What best describes your team?' });
    this.countryDropdown = page.getByRole('combobox', { name: 'Country' });
    this.stateDropdown = page.getByRole('combobox', { name: 'State' });
    this.addressInput = page.getByLabel('Address');
    this.cityInput = page.getByLabel('City');
    this.zipCodeInput = page.getByLabel('Zip code');
    this.websiteInput = page.getByLabel('Website (optional)');

    // Blood glucose units radio buttons
    this.mgdlRadio = page.getByLabel('mg/dL');
    this.mmolRadio = page.getByLabel('mmol/L');

    // Acknowledgement checkbox
    this.adminAcknowledgeCheckbox = page.getByRole('checkbox', {
      name: 'By creating this clinic, your Tidepool account will become the default administrator',
    });

    // Action buttons
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.createWorkspaceButton = page.getByRole('button', { name: 'Create Workspace' });
  }

  /**
   * Navigate to the clinic creation page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

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
  async fillClinicForm({
    clinicName,
    teamType = 'Provider Practice',
    state = 'California',
    address = '123 Test Street',
    city = 'Test City',
    zipCode = '12345',
    website = '',
  }: {
    clinicName: string;
    teamType?: string;
    state?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    website?: string;
  }): Promise<void> {
    // Fill in clinic name
    await this.clinicNameInput.fill(clinicName);

    // Select team type
    await this.teamTypeDropdown.selectOption(teamType);

    // Select state (US is selected by default)
    await this.stateDropdown.selectOption(state);

    // Fill in address details
    await this.addressInput.fill(address);
    await this.cityInput.fill(city);
    await this.zipCodeInput.fill(zipCode);

    // Fill in optional website if provided
    if (website) {
      await this.websiteInput.fill(website);
    }
  }

  /**
   * Select blood glucose units
   * @param unit - "mg/dL" or "mmol/L"
   */
  async selectBloodGlucoseUnit(unit: 'mg/dL' | 'mmol/L'): Promise<void> {
    if (unit === 'mg/dL') {
      await this.mgdlRadio.check();
    } else {
      await this.mmolRadio.check();
    }
  }

  /**
   * Create a clinic by filling the form and submitting
   * @param clinicName - Name of the clinic to create (required)
   * @param formData - Optional form data (uses defaults if not provided)
   */
  async createClinic(
    clinicName: string,
    formData?: Omit<Parameters<typeof this.fillClinicForm>[0], 'clinicName'>,
  ): Promise<void> {
    await this.fillClinicForm({ clinicName, ...formData });
    await this.createWorkspaceButton.click();
  }
}
