import { Locator, Page } from '@playwright/test';
import PatientNav from '@pom/patient/PatientNavigation';
import NavigationSection from '@components/navigation.section';
interface CalendarSection {
    container: Locator;
    firstDayOfData: Locator;
    calendarDayhover: {
        el: Locator;
        text(): Promise<string | null>;
    };
}
interface Stat {
    container: Locator;
    header: Locator;
    hoverBar: Locator;
    hoverBarLabel: Locator;
}
interface StatsSidebar {
    toggleContainer: Locator;
    toggleTo(toState: 'BGM' | 'CGM'): Promise<void>;
    timeInRange: Stat;
    readingsInRange: Stat;
    averageGlucose: Stat;
    totalInsulin: Stat;
    carbs: Stat;
    standardDev: Stat;
    coefficientOfVariation: Stat;
    sensorUsage: Stat;
    glucoseManagementIndicator: Stat;
    averageDailyDose: Stat;
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
    navigationSubMenu: PatientNav;
    headerBgReading: Locator;
    headerBolusing: Locator;
    statsSidebar: StatsSidebar;
    bgReadingsSection: CalendarSection;
    bolusingSection: CalendarSection;
    tubingPrimeSection: TubingPrimeSection;
    basalsSection: CalendarSection;
    constructor(page: Page);
    goto(): Promise<void>;
}
export {};
