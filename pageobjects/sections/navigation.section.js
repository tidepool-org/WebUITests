import NavigationMenu from "./navigation-menu.section";

export default class NavigationSection {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.container = page.locator("div#navPatientHeader");

    this.menu = new NavigationMenu(page);
    this.buttons = {
      viewData: this.container.getByRole("button", { name: "View Data" }),
      patientProfile: this.container.getByRole("button", { name: "Patient Profile" }),
      share: this.container.getByRole("button", { name: "Share" }),
      uploadData: this.container.getByRole("button", { name: "Upload Data" }),
    }
  }
}
