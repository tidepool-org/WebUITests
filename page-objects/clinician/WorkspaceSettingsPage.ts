import { Locator, Page } from '@playwright/test';
import ClinicCreationPage from './ClinicCreationPage';

export default class WorkspaceSettingsPage {
  // Workspace Settings
  readonly workspaceSettingsHeader: Locator;

  readonly workspaceDetailsSection: Locator;

  readonly editDetailsButton: Locator;

  readonly clinicName: Locator;

  readonly clinicType: Locator;

  readonly clinicAddress: Locator;

  readonly clinicWebsite: Locator;

  readonly clinicPreferredBloodGlucose: Locator;

  // Edit Workspace Settings Modal

  readonly editWorkspaceModal: Locator;

  readonly editClinicModal: Locator;

  readonly editClinicModalTitle: Locator;

  readonly saveChangesButton: Locator;

  url = '/clinic-admin';

  name = 'ClinicAdminPage'; // Added name for step decorator context

  page: Page;

  constructor(page: Page) {
    this.page = page;
    // Workspace Settings
    this.workspaceSettingsHeader = page.getByText('Workspace Settings');
    this.workspaceDetailsSection = page.locator('#clinicWorkspaceDetails');
    this.editDetailsButton = page.locator('#clinic-profile-edit-trigger');
    this.clinicName = page.locator('#clinicName');
    this.clinicType = page.locator('#clinicType').filter({ hasText: 'Type' });
    this.clinicAddress = page.locator('#clinicAddress');
    this.clinicWebsite = page.locator('#clinicWebsite');
    this.clinicPreferredBloodGlucose = page.locator('#clinicPreferredBloodGlucoseUnits');

    this.editWorkspaceModal = page.getByRole('dialog');
    this.editClinicModal = page.getByRole('dialog'); // General dialog selector
    this.editClinicModalTitle = this.editClinicModal.getByRole('heading', {
      name: 'Edit Workspace Details',
    });
    this.saveChangesButton = this.editClinicModal.getByRole('button', { name: 'Save Changes' });
    // Assuming the details are within a specific container section related to the header
  }

  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState(); // Wait for base elements like header/footer
    await this.workspaceSettingsHeader.waitFor({ state: 'visible', timeout: 40000 });
  }
}
