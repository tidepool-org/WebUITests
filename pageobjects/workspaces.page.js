
export default class WorkspacesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = '/workspaces';
    this.header = page.getByRole("heading", { name: "Clinic Workspace" });
  }

  async goto() {
    await this.page.goto(this.url);
  }
}


