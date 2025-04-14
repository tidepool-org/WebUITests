import { Locator, Page } from "@playwright/test";

export default class NavigationSubMenu {
  page: Page;
  container: Locator;
  links: {
    basics: Locator;
    daily: Locator;
    bgLog: Locator;
    trends: Locator;
    devices: Locator;
    print: Locator;
    calendarButton: Locator;
  };
  currentDate: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator("div.patient-data-subnav-inner");

    this.links = {
      basics: this.container.getByRole("link", { name: "Basics" }),
      daily: this.container.getByRole("link", { name: "Daily" }),
      bgLog: this.container.getByRole("link", { name: "BG Log" }),
      trends: this.container.getByRole("link", { name: "Trends" }),
      devices: this.container.getByRole("link", { name: "Devices" }),
      print: this.container.getByRole("link", { name: "Print" }),
      calendarButton: this.container.getByLabel("Choose custom date range"),
    };

    this.currentDate = this.container
      .locator(".js-date.patient-data-subnav-text.patient-data-subnav-dates-daily > span")
      .first();
  }

  // async open(): Promise<void> {
  //   await this.buttons.trigger.click();
  // }

  // async close(): Promise<void> {
  //   await this.buttons.trigger.click();
  // }
}
