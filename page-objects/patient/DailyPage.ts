import { Page } from '@playwright/test';
import DailyChartSection from '@components/daily-chart.js';
import PatientNav from '@pom/patient/PatientNavigation.js';
import NavigationSection from '@components/navigation.section.js';

export default class PatientDataDailyPage {
  page: Page;

  navigationBar: NavigationSection;

  navigationSubMenu: PatientNav;

  dailyChart: DailyChartSection;

  constructor(page: Page) {
    this.page = page;
    this.navigationBar = new NavigationSection(page);
    this.navigationSubMenu = new PatientNav(page);

    this.dailyChart = new DailyChartSection(page);
  }
}
