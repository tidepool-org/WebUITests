import { Locator, Page } from "@playwright/test";

export default class NavigationMenu {
  page: Page;
  container: Locator;
  buttons: {
    trigger: Locator;
    menu: {
      privateWorkspace: Locator;
      accountSettings: Locator;
      logout: Locator;
    };
  };

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator("div#navigation-menu");

    this.buttons = {
      trigger: this.container.locator("#navigation-menu-trigger"),
      menu: {
        privateWorkspace: this.container.getByRole("button", {
          name: "Private Workspace",
        }),
        accountSettings: this.container.getByRole("button", {
          name: "Account Settings",
        }),
        logout: this.container.getByRole("button", { name: "Logout" }),
      },
    };
  }

  async open(): Promise<void> {
    await this.buttons.trigger.click();
  }

  async close(): Promise<void> {
    await this.buttons.trigger.click();
  }
}
