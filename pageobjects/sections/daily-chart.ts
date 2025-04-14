import { Locator, Page } from "@playwright/test";

export default class DailyChartSection {
  page: Page;
  container: Locator;
  dayLabel: Locator;
  newNote: Locator;
  buttons: {
    refresh: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator("div.patient-data-content");
    this.dayLabel = this.container.locator("text.d3-day-label").filter({ visible: true });
    this.newNote = this.container.locator("image.newNoteIcon");
    this.buttons = {
      refresh: this.container.getByRole("button", { name: "Refresh" }),
    };
  }
}
