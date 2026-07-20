import { Locator, Page } from '@playwright/test';
import env from '../../utilities/env';

export default class WorkspacesPage {
  readonly page: Page;

  readonly url: string = `${env.BASE_URL}/workspaces`;

  readonly header: Locator;

  readonly subHeader: Locator;

  readonly createClinicButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('heading', { name: 'Clinic Workspace' });
    this.subHeader = page.getByRole('paragraph', {
      name: 'View, share and manage patient data',
    });

    this.createClinicButton = page.getByRole('button', {
      name: 'Create a New Clinic',
    });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Wait until the workspaces list has fully rendered: the heading is present, at least one
   * workspace card has painted, and the network has settled. Load-state based (no fixed delay) —
   * useful before asserting on the list or capturing an evidence screenshot so the screen is
   * fully loaded. Assumes the account has at least one workspace.
   */
  async waitUntilLoaded(): Promise<void> {
    await this.header.waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Go To Workspace' }).first().waitFor({
      state: 'visible',
    });
    await this.page.waitForLoadState('networkidle');
  }

  async visitFirstClinic(): Promise<void> {
    await this.page.getByRole('button', { name: 'Go To Workspace' }).first().click();
  }

  /**
   * Visit a clinic by name
   * @param clinicName - The name of the clinic to visit
   */
  async visitClinic(clinicName: string): Promise<void> {
    // find child element with text and filter by parent element with class
    const child = this.page.getByText(clinicName);
    const parent = this.page.locator('.workspace-item-clinic').filter({ has: child });

    await parent.getByRole('button', { name: 'Go To Workspace' }).first().click();
  }

  getClinicCard(clinicName: string): Locator {
    // Update selector as needed to match your UI
    // Try common patterns: data-testid, class, or role
    return this.page
      .locator('[data-testid="clinic-card"], .workspace-item-clinic, .clinic-card, [role="region"]')
      .filter({ hasText: clinicName });
  }
}
