import { Locator, Page } from '@playwright/test';

export default class ClinicAdminPage {
  readonly clinicDetailsHeader: Locator;

  readonly editDetailsButton: Locator;

  readonly editClinicModal: Locator;

  readonly editClinicModalTitle: Locator;

  readonly addressInput: Locator;

  readonly saveChangesButton: Locator;

  readonly clinicDetailsSection: Locator; // The section displaying clinic details on the main page

  url = '/clinic-admin';

  name = 'ClinicAdminPage'; // Added name for step decorator context

  page: Page;

  constructor(page: Page) {
    this.page = page;
    this.clinicDetailsHeader = page.getByText('Workspace Settings');
    // Assuming the edit button is specifically associated with the details section
    this.editDetailsButton = page.getByRole('button', { name: 'Edit' });
    this.editClinicModal = page.getByRole('dialog'); // General dialog selector
    this.editClinicModalTitle = this.editClinicModal.getByRole('heading', {
      name: 'Edit Workspace Details',
    });
    this.addressInput = this.editClinicModal.getByLabel('Address', { exact: true }); // Use exact label match
    this.saveChangesButton = this.editClinicModal.getByRole('button', { name: 'Save Changes' });
    // Assuming the details are within a specific container section related to the header
    this.clinicDetailsSection = page.locator('div:has(> span:text-is("Workspace Settings")) + div');
  }

  /**
   * Waits for essential elements of the Clinic Admin page to be loaded.
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState(); // Wait for base elements like header/footer
    await this.clinicDetailsHeader.waitFor({ state: 'visible', timeout: 40000 });
    await this.editDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
  }
}
