import { Locator, Page } from "@playwright/test";

export default class WorkspacesPage {
  page: Page;
  url: string = "/workspaces";
  header: Locator;
  subHeader: Locator;
  createClinicButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: "Clinic Workspace" });
    this.subHeader = page.getByRole("paragraph", {
      name: "View, share and manage patient data",
    });

    this.createClinicButton = page.getByRole("button", {
      name: "Create a New Clinic",
    });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async visitFirstClinic(): Promise<void> {
    await this.page.getByRole("button", { name: "Go To Workspace" }).first().click();
  }

  /**
   * Visit a clinic by name
   * @param clinicName - The name of the clinic to visit
   */
  async visitClinic(clinicName: string): Promise<void> {
    // find child element with text and filter by parent element with class
    const child = this.page.getByText(clinicName);
    const parent = this.page.locator(".workspace-item-clinic").filter({ has: child });

    await parent.getByRole("button", { name: "Go To Workspace" }).first().click();
  }
}
