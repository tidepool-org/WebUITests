import { Locator, Page } from '@playwright/test';

export interface ClinicWorkspaceDetails {
  name: string;
  clinicType: string; // "What best describes your team?" option label
  country: string;
  state: string;
  address: string;
  city: string;
  postalCode: string;
  website: string;
  bgUnits: string; // "mg/dL" | "mmol/L"
}

/**
 * The "create clinic workspace" form shown during clinician onboarding (route
 * /clinic-details/new). All fields plus the default-administrator acknowledgement must be set
 * before "Create Workspace" enables.
 *
 * @class
 */
export class ClinicWorkspacePage {
  page: Page;

  nameInput: Locator;

  clinicTypeSelect: Locator;

  countrySelect: Locator;

  stateSelect: Locator;

  addressInput: Locator;

  cityInput: Locator;

  postalCodeInput: Locator;

  websiteInput: Locator;

  adminAcknowledgeCheckbox: Locator;

  adminAcknowledgeLabel: Locator;

  createWorkspaceButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name');
    this.clinicTypeSelect = page.locator('#clinicType');
    this.countrySelect = page.locator('#country');
    this.stateSelect = page.locator('#state');
    this.addressInput = page.locator('#address');
    this.cityInput = page.locator('#city');
    this.postalCodeInput = page.locator('#postalCode');
    this.websiteInput = page.locator('#website');
    this.adminAcknowledgeCheckbox = page.locator('#adminAcknowledge');
    // The checkbox input is style-hidden; its label is the clickable target.
    this.adminAcknowledgeLabel = page.getByText(/By creating this clinic/i);
    this.createWorkspaceButton = page.locator('#submit');
  }

  /** Fill every field, pick blood-glucose units, and acknowledge default-admin. */
  async fillWorkspace(d: ClinicWorkspaceDetails): Promise<void> {
    await this.nameInput.fill(d.name);
    await this.clinicTypeSelect.selectOption({ label: d.clinicType });
    await this.countrySelect.selectOption({ label: d.country });
    await this.stateSelect.selectOption({ label: d.state });
    await this.addressInput.fill(d.address);
    await this.cityInput.fill(d.city);
    await this.postalCodeInput.fill(d.postalCode);
    await this.websiteInput.fill(d.website);
    // BG-units radio inputs and the admin-acknowledge checkbox are style-hidden; click labels.
    await this.page.getByText(d.bgUnits, { exact: true }).first().click();
    await this.adminAcknowledgeLabel.click();
  }

  async createWorkspace(): Promise<void> {
    await this.createWorkspaceButton.click();
  }
}

export default ClinicWorkspacePage;
