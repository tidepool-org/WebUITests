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

/**
 * @typedef {Object} Stat
 * @property {import('@playwright/test').Locator} container
 * @property {import('@playwright/test').Locator} header
 * @property {import('@playwright/test').Locator} hoverBar
 * @property {import('@playwright/test').Locator} hoverBarLabel
 */

/**
 * helper function to create a stat object with locators for the container, header, hoverBar, and hoverBarLabel
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @returns {Stat}
 */
function createStat(page, selector) {
  const container = page.locator(`#Stat--${selector}`);
  return {
    container,
    header: container.locator('[class^="Stat--chartTitleText"]'),
    hoverBar: container.locator(".HoverBar"),
    hoverBarLabel: container.locator(".HoverBarLabel"),
  };
}

// list of sections in the stats sidebar
const statsSideBarSection = [
  "timeInRange",
  "readingsInRange",
  "averageGlucose",
  "totalInsulin",
  "carbs",
  "standardDev",
  "coefficientOfVariation",
  "sensorUsage",
  "glucoseManagementIndicator",
];

/**
 * @typedef {Object} StatsSidebar
 * @property {import('@playwright/test').Locator} toggleContainer
 * @property {function("BGM"|"CGM"): Promise<void>} toggleTo
 * @property {Stat} timeInRange
 * @property {Stat} readingsInRange
 * @property {Stat} averageGlucose
 * @property {Stat} totalInsulin
 * @property {Stat} carbs
 * @property {Stat} standardDev
 * @property {Stat} coefficientOfVariation
 * @property {Stat} sensorUsage
 * @property {Stat} glucoseManagementIndicator
 */

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

    /** @type {StatsSidebar} */
    this.statsSidebar = {
      toggleContainer: page.locator(".toggle-container"),
      /**
       * @param {"BGM" | "CGM"} toState - "BGM" or "CGM"
       */
      toggleTo: async function (toState) {
        const activeToggleState = await page
          .locator(".toggle-container span[class*='TwoOptionToggle--active']")
          .innerText();
        if (activeToggleState === "BGM" && toState === "CGM") {
          await this.toggleContainer.click();
        } else if (activeToggleState === "CGM" && toState === "BGM") {
          await this.toggleContainer.click();
        }
      },
      ...Object.fromEntries(statsSideBarSection.map((stat) => [stat, createStat(page, stat)])),
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
