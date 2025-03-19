export default class WorkspacesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = "/workspaces";
    this.header = page.getByRole("heading", { name: "Clinic Workspace" });
    this.subHeader = page.getByRole("paragraph", {
      name: "View, share and manage patient data",
    });

    this.createClinicButton = page.getByRole("button", {
      name: "Create a New Clinic",
    });
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async visitFirstClinic() {
    await this.page
      .getByRole("button", { name: "Go To Workspace" })
      .first()
      .click();
  }

  /**
   * Visit a clinic by name
   * @param {string} clinicName
   */
  async visitClinic(clinicName) {
    // find child element with text and filter by parent element with class
    const child = this.page.getByText(clinicName);
    const parent = this.page
      .locator(".workspace-item-clinic")
      .filter({ has: child });

    await parent
      .getByRole("button", { name: "Go To Workspace" })
      .first()
      .click();
  }
}
