import NavigationSubMenu from "../../../../../sections/navigation-submenu.section";
import NavigationSection from "../../../../../sections/navigation.section";

function createSection(classObj, page, selector) {
  const parsedSelector = selector === "tubing-primes" ? "siteChanges" : selector;
  const container = page.locator(`.Calendar-container-${parsedSelector}`);

  return {
    container,
    dayMostRecentBgReading: container.locator(".Calendar-day-most-recent"),
    calendarDayhover: {
      el: container.locator(".Calendar-day--HOVER"),
      async text() {
        return await container.locator(".Calendar-day--HOVER").locator(".Calendar-weekday").textContent();
      },
    },
  };
}

export default class PatientDataBasicsPage {
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

    this.stats = {
      avgDailyReadingsInRangeContainer: page.locator("#Stat--readingsInRange"),
      header: page.locator('[class^="Stat--chartTitleText"]'),
      hoverBar: page.locator(".HoverBar"),
      hoverBarLabel: page.locator(".HoverBar-label"),
    };

    // charts
    this.bgReadingsSection = createSection(this, page, "fingersticks");
    this.bolusingSection = createSection(this, page, "boluses");
    this.tubingPrimeSection = {
      ...createSection(this, page, "tubing-primes"),
      settings: page.locator(".icon-settings"),
      settingsOption: {
        fillTubing: page.getByLabel("Fill Tubing"),
        fillCannula: page.getByLabel("Fill Cannula"),
      },
      tubingIcons: page.locator(".Change--tubing").first(),
      cannulaIcons: page.locator(".Change--cannula").first(),
      filledDay: createSection(this, page, "tubing-primes")
        .container.locator(".Calendar-day")
        .filter({ has: page.locator(".Change-daysSince-text") })
        .first(),
    };
    this.basalsSection = createSection(this, page, "basals");
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
