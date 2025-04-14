import { step } from "@fixtures/base";
import { Locator, Page } from "@playwright/test";
import NavigationSubMenu from "@sections/navigation-submenu.section";
import NavigationSection from "@sections/navigation.section";

interface CalendarSection {
  container: Locator;
  dayMostRecentBgReading: Locator;
  calendarDayhover: {
    el: Locator;
    text(): Promise<string | null>;
  };
}

function createSection(page: Page, selector: string): CalendarSection {
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

interface Stat {
  container: Locator;
  header: Locator;
  hoverBar: Locator;
  hoverBarLabel: Locator;
}

/**
 * helper function to create a stat object with locators for the container, header, hoverBar, and hoverBarLabel
 */
function createStat(page: Page, selector: string): Stat {
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
] as const;

type StatName = (typeof statsSideBarSection)[number];

interface StatsSidebar {
  toggleContainer: Locator;
  toggleTo(toState: "BGM" | "CGM"): Promise<void>;
  timeInRange: Stat;
  readingsInRange: Stat;
  averageGlucose: Stat;
  totalInsulin: Stat;
  carbs: Stat;
  standardDev: Stat;
  coefficientOfVariation: Stat;
  sensorUsage: Stat;
  glucoseManagementIndicator: Stat;
}

interface TubingPrimeSection extends CalendarSection {
  settings: Locator;
  settingsOption: {
    fillTubing: Locator;
    fillCannula: Locator;
  };
  tubingIcons: Locator;
  cannulaIcons: Locator;
  filledDay: Locator;
}

export default class PatientDataBasicsPage {
  page: Page;
  url: string;
  emailInput: Locator;
  navigationBar: NavigationSection;
  navigationSubMenu: NavigationSubMenu;
  headerBgReading: Locator;
  headerBolusing: Locator;
  statsSidebar: StatsSidebar;
  bgReadingsSection: CalendarSection;
  bolusingSection: CalendarSection;
  tubingPrimeSection: TubingPrimeSection;
  basalsSection: CalendarSection;

  constructor(page: Page) {
    this.page = page;
    this.url = "/patients/data/basics";
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.navigationBar = new NavigationSection(page);
    this.navigationSubMenu = new NavigationSubMenu(page);
    this.headerBgReading = page.getByRole("heading", { name: "BG readings" });
    this.headerBolusing = page.getByRole("heading", { name: "Bolusing" });

    this.statsSidebar = {
      toggleContainer: page.locator(".toggle-container"),
      toggleTo: async function (toState: "BGM" | "CGM") {
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
    } as StatsSidebar;

    // charts
    this.bgReadingsSection = createSection(page, "fingersticks");
    this.bolusingSection = createSection(page, "boluses");
    this.tubingPrimeSection = {
      ...createSection(page, "tubing-primes"),
      settings: page.locator(".icon-settings"),
      settingsOption: {
        fillTubing: page.getByLabel("Fill Tubing"),
        fillCannula: page.getByLabel("Fill Cannula"),
      },
      tubingIcons: page.locator(".Change--tubing").first(),
      cannulaIcons: page.locator(".Change--cannula").first(),
      filledDay: createSection(page, "tubing-primes")
        .container.locator(".Calendar-day")
        .filter({ has: page.locator(".Change-daysSince-text") })
        .first(),
    } as TubingPrimeSection;
    this.basalsSection = createSection(page, "basals");
  }

  @step("Navigate to the basics page")
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }
}
