import NavigationSection from "../../../../sections/navigation.section";
import DailyChartSection from "../../../../sections/daily-chart.js";
import NavigationSubMenu from "../../../../sections/navigation-submenu.section";
export default class PatientDataDailyPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.navigationBar = new NavigationSection(page);
    this.navigationSubMenu = new NavigationSubMenu(page);
    
    this.dailyChart = new DailyChartSection(page);
  }
}
