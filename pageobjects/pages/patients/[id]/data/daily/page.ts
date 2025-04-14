import { Page } from "@playwright/test";
import DailyChartSection from "@sections/daily-chart.js";
import NavigationSubMenu from "@sections/navigation-submenu.section.js";
import NavigationSection from "@sections/navigation.section.js";

export default class PatientDataDailyPage {
  page: Page;
  navigationBar: NavigationSection;
  navigationSubMenu: NavigationSubMenu;
  dailyChart: DailyChartSection;

  constructor(page: Page) {
    this.page = page;
    this.navigationBar = new NavigationSection(page);
    this.navigationSubMenu = new NavigationSubMenu(page);

    this.dailyChart = new DailyChartSection(page);
  }
}
