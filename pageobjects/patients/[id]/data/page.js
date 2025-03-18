import NavigationSection from "../../../sections/navigation.section";
import NavigationSubMenu from "../../../sections/navigation-submenu.section";

export default class PatientDataPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.navigationBar = new NavigationSection(page);
    this.navigationSubMenu = new NavigationSubMenu(page);
    this.headerBgReading = page.getByRole("heading", { name: "BG readings" });
    this.headerBolusing = page.getByRole("heading", { name: "Bolusing" });

    this.bgReadingContainer = page.locator(".Calendar-container-fingersticks");
    this.calendarDayMostRecentBgReading = this.bgReadingContainer.locator(
      ".Calendar-day-most-recent"
    );

    this.calendarDayHover = {
      el: this.bgReadingContainer.locator(".Calendar-day--HOVER"),
      /**
       * Get the text of the weekday of the hovered day
       * @returns {Promise<string>}
       */
      text: async () => await this.calendarDayHover.el.locator(".Calendar-weekday").textContent(),
    }

    this.bolusingContainer = page.locator(".Calendar-container-boluses");
    this.calendarDayMostRecentBolusing = this.bolusingContainer.locator(
      ".Calendar-day-most-recent"
    );
  }

  async goto() {
    await this.page.goto(this.url);
  }

  /**
   * Login to the application
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.nextButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
