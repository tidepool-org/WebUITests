export default class NavigationMenu {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.container = page.locator("div#navigation-menu");
    
    this.buttons = {
      trigger: this.container.locator("#navigation-menu-trigger"),
      menu: {
        privateWorkspace: this.container.getByRole("button", { name: "Private Workspace" }),
        accountSettings: this.container.getByRole("button", { name: "Account Settings" }),
        logout: this.container.getByRole("button", { name: "Logout" }),
      }
    }
  }

  async open() {
    await this.buttons.trigger.click();
  }

  async close() {
    await this.buttons.trigger.click();
  }
}
