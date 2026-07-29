import DailyChartSection from '@components/daily-chart.js';
import PatientNav from '@pom/patient/PatientNavigation.js';
import NavigationSection from '@components/navigation.section.js';
export default class PatientDataDailyPage {
    constructor(page) {
        this.page = page;
        this.navigationBar = new NavigationSection(page);
        this.navigationSubMenu = new PatientNav(page);
        this.dailyChart = new DailyChartSection(page);
    }
}
