require('../../../utilities/nightwatch/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel', 'only'],
  'User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.loadPage();
    loginPage.userLogin(dsaUsername, dsaPassword);
  },
  'BG readings dashboard functionality'(browser) {
    const basics = browser.page.basicsPage();
    const daily = browser.page.dailyPage();
    const dailyViewDay = daily.section.dailyViewDay;
    const bgDashboard = basics.section.bgDashboard;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    bgDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    bgDashboard.getLocationInView('@bottomOfDashboard');
    bgDashboard.moveToElement('@mostRecentDay', 0, 0);
    bgDashboard.waitForElementVisible('@dayHover', browser.globals.elementTimeout);
    bgDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
      bgDashboard.click('@dayHover');
      dailyViewDay.waitForElementVisible('@chartsContainer', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@allCharts', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@bgChart', browser.globals.elementTimeout);
      patientData.getLocationInView('@date');
      patientData.expect.element('@date').text.to.contain(day);
    }));
    patientData.click('@basics');
    bgDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
  },
  'Bolus dashboard functionality'(browser) {
    const basics = browser.page.basicsPage();
    const daily = browser.page.dailyPage();
    const dailyViewDay = daily.section.dailyViewDay;
    const bolusDashboard = basics.section.bolusDashboard;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    bolusDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    bolusDashboard.getLocationInView('@bottomOfDashboard');
    bolusDashboard.moveToElement('@mostRecentDay', 0, 0);
    bolusDashboard.waitForElementVisible('@dayHover', browser.globals.elementTimeout);
    bolusDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
      bolusDashboard.click('@dayHover');
      dailyViewDay.waitForElementVisible('@chartsContainer', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@allCharts', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@bgChart', browser.globals.elementTimeout);
      patientData.getLocationInView('@date');
      patientData.expect.element('@date').text.to.contain(day);
    }));
    patientData.click('@basics');
    bolusDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
  },
  'Infusion Site Changes dashboard functionality'(browser) {
    const basics = browser.page.basicsPage();
    const daily = browser.page.dailyPage();
    const dailyViewDay = daily.section.dailyViewDay;
    const infusionSiteDashboard = basics.section.infusionSiteChanges;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    infusionSiteDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    infusionSiteDashboard.click('@settingsToggle');
    infusionSiteDashboard.click('@fillCannulaOption');
    infusionSiteDashboard.getLocationInView('@bottomOfDashboard');
    infusionSiteDashboard.expect.element('@filledCannulaDay').to.be.visible;
    infusionSiteDashboard.expect.element('@filledTubingDay').to.not.be.present;
    infusionSiteDashboard.moveToElement('@filledCannulaDay', 0, 0);
    infusionSiteDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
      infusionSiteDashboard.click('@dayHover');
      dailyViewDay.waitForElementVisible('@chartsContainer', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@allCharts', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@bgChart', browser.globals.elementTimeout);
      patientData.getLocationInView('@date');
      patientData.expect.element('@date').text.to.contain(day);
    }));
    patientData.click('@basics');
    infusionSiteDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    infusionSiteDashboard.getLocationInView('@bottomOfDashboard');
    infusionSiteDashboard.click('@settingsToggle');
    infusionSiteDashboard.click('@fillTubingOption');
    infusionSiteDashboard.expect.element('@filledTubingDay').to.be.visible;
    infusionSiteDashboard.expect.element('@filledCannulaDay').to.not.be.present;
    infusionSiteDashboard.moveToElement('@filledTubingDay', 0, 0);
    infusionSiteDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
      infusionSiteDashboard.click('@dayHover');
      dailyViewDay.waitForElementVisible('@chartsContainer', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@allCharts', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@bgChart', browser.globals.elementTimeout);
      patientData.getLocationInView('@date');
      patientData.expect.element('@date').text.to.contain(day);
    }));
    patientData.click('@basics');
    infusionSiteDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
  },
  'Basals dashboard functionality'(browser) {
    const basics = browser.page.basicsPage();
    const daily = browser.page.dailyPage();
    const dailyViewDay = daily.section.dailyViewDay;
    const basalsDashboard = basics.section.basalsDashboard;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    basalsDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    basalsDashboard.getLocationInView('@bottomOfDashboard');
    basalsDashboard.moveToElement('@mostRecentDay', 0, 0);
    basalsDashboard.waitForElementVisible('@dayHover', browser.globals.elementTimeout);
    basalsDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
      basalsDashboard.click('@dayHover');
      dailyViewDay.waitForElementVisible('@chartsContainer', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@allCharts', browser.globals.elementTimeout);
      dailyViewDay.waitForElementVisible('@bgChart', browser.globals.elementTimeout);
      patientData.getLocationInView('@date');
      patientData.expect.element('@date').text.to.contain(day);
    }));
    patientData.click('@basics');
    basalsDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
  },
  'Readings in range functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    sidebar.waitForElementVisible('@copyAsText', browser.globals.elementTimeout);
    sidebar.moveToElement('@copyAsText', 0, 0);
    sidebar.toggleBGM();
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Avg. Daily Readings In Range');
    sidebar.moveToElement('@readingsVeryAboveRangeBar', 0, 0);
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Readings Above Range');
    sidebar.moveToElement('@readingsAboveRangeBar', 0, 0);
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Readings Above Range');
    sidebar.moveToElement('@readingsInRangeBar', 0, 0);
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Readings In Range');
    sidebar.moveToElement('@readingsBelowRangeBar', 0, 0);
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Readings Below Range');
    sidebar.moveToElement('@readingsVeryBelowRangeBar', 0, 0);
    sidebar.expect.element('@readingsInRangeTitle').text.to.contain('Readings Below Range');
    sidebar.moveToElement('@readingsInRangeTitle', 0, 0);
    sidebar.moveToElement('@readingsInRangeTooltip', 0, 0);
    sidebar.expect.element('@readingsInRangeTooltipMessage').text.to.contain('Readings In Range');
  },
  'Other BGM tooltip functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    sidebar.waitForElementVisible('@bgmCgmToggle', browser.globals.elementTimeout);
    sidebar.toggleBGM();
    sidebar.moveToElement('@averageGlucoseTooltip', 0, 0);
    sidebar.expect.element('@averageGlucoseTooltipMessage').text.to.contain('Avg. Glucose (BGM)');
    sidebar.moveToElement('@averageCarbsTooltip', 0, 0);
    sidebar.expect.element('@averageCarbsTooltipMessage').text.to.contain('Avg. Daily Carbs');
    sidebar.moveToElement('@cvTooltip', 0, 0);
    sidebar.expect.element('@cvTooltipMessage').text.to.contain('CV (Coefficient of Variation)');
  },
  'Time in range functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    sidebar.waitForElementVisible('@copyAsText', browser.globals.elementTimeout);
    sidebar.moveToElement('@copyAsText', 0, 0);
    sidebar.toggleCGM();
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Avg. Daily Time In Range');
    sidebar.moveToElement('@timeVeryAboveRangeBar', 0, 0);
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Time Above Range');
    sidebar.moveToElement('@timeAboveRangeBar', 0, 0);
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Time Above Range');
    sidebar.moveToElement('@timeInRangeBar', 0, 0);
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Time In Range');
    sidebar.moveToElement('@timeBelowRangeBar', 0, 0);
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Time Below Range');
    sidebar.moveToElement('@timeVeryBelowRangeBar', 0, 0);
    sidebar.expect.element('@timeInRangeTitle').text.to.contain('Time Below Range');
    sidebar.moveToElement('@timeInRangeTitle', 0, 0);
    sidebar.moveToElement('@timeInRangeTooltip', 0, 0);
    sidebar.expect.element('@timeInRangeTooltipMessage').text.to.contain('Time In Range');
  },
  'Other CGM tooltip functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    sidebar.waitForElementVisible('@bgmCgmToggle', browser.globals.elementTimeout);
    sidebar.toggleCGM();
    sidebar.moveToElement('@averageGlucoseTooltip', 0, 0);
    sidebar.expect.element('@averageGlucoseTooltipMessage').text.to.contain('Avg. Glucose (CGM)');
    sidebar.moveToElement('@sensorUsageTooltip', 0, 0);
    sidebar.expect.element('@sensorUsageTooltipMessage').text.to.contain('Sensor Usage');
    sidebar.moveToElement('@averageCarbsTooltip', 0, 0);
    sidebar.expect.element('@averageCarbsTooltipMessage').text.to.contain('Avg. Daily Carbs');
    sidebar.moveToElement('@gmiTooltip', 0, 0);
    sidebar.expect.element('@gmiTooltipMessage').text.to.contain('GMI (Glucose Management Indicator)');
    sidebar.moveToElement('@cvTooltip', 0, 0);
    sidebar.expect.element('@cvTooltipMessage').text.to.contain('CV (Coefficient of Variation)');
  },
  'Avg daily insulin functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    sidebar.waitForElementVisible('@copyAsText', browser.globals.elementTimeout);
    sidebar.moveToElement('@filterDevices', 0, 0);
    sidebar.expect.element('@totalInsulinTitle').text.to.contain('Avg. Daily Insulin Ratio');
    sidebar.moveToElement('@basalInsulinBar', 0, 0);
    sidebar.expect.element('@totalInsulinTitle').text.to.contain('Basal Insulin');
    sidebar.moveToElement('@bolusInsulinBar', 0, 0);
    sidebar.expect.element('@totalInsulinTitle').text.to.contain('Bolus Insulin');
    sidebar.moveToElement('@totalInsulinTitle', 0, 0);
    sidebar.moveToElement('@totalInsulinTooltip', 0, 0);
    sidebar.expect.element('@totalInsulinTooltipMessage').text.to.contain('Total Insulin');
    sidebar.moveToElement('@averageDailyDoseTooltip', 0, 0);
    sidebar.expect.element('@averageDailyDoseTooltipMessage').text.to.contain('Avg. Daily Insulin');
  },
  'Filter devices functionality'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    const bolusDashboard = basics.section.bolusDashboard;
    sidebar.waitForElementVisible('@filterDevices', browser.globals.elementTimeout);
    sidebar.moveToElement('@filterDevices', 0, 0);
    sidebar.click('@filterDevices');
    sidebar.moveToElement('@deviceCheckbox', 0, 0);
    sidebar.click('@deviceCheckbox');
    bolusDashboard.expect.element('@bolusEntry').to.not.be.present;
    sidebar.click('@deviceCheckbox');
    bolusDashboard.expect.element('@bolusEntry').to.be.visible;
  },
  'Date range selector functionality'(browser) {
    const basics = browser.page.basicsPage();
    const dateRangeSelector = basics.section.dateRangeSelector;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    dateRangeSelector.waitForElementVisible('@customDateIcon', browser.globals.elementTimeout);
    dateRangeSelector.click('@customDateIcon');
    dateRangeSelector.waitForElementVisible('@dateRangeStart', browser.globals.elementTimeout);
    dateRangeSelector.click('@fourteenDays');
    dateRangeSelector.getAttribute('@dateRangeStart', 'value', (result) => {
      const fourteenDayStartDate = result.value;
      dateRangeSelector.click('@apply');
      patientData.expect.element('@date').text.to.contain(fourteenDayStartDate);
    });
    dateRangeSelector.click('@customDateIcon');
    dateRangeSelector.waitForElementVisible('@dateRangeStart', browser.globals.elementTimeout);
    dateRangeSelector.click('@twentyOneDays');
    dateRangeSelector.getAttribute('@dateRangeStart', 'value', (result) => {
      const twentyOneDayStartDate = result.value;
      dateRangeSelector.click('@apply');
      patientData.expect.element('@date').text.to.contain(twentyOneDayStartDate);
    });
    dateRangeSelector.click('@customDateIcon');
    dateRangeSelector.waitForElementVisible('@dateRangeStart', browser.globals.elementTimeout);
    dateRangeSelector.click('@thirtyDays');
    dateRangeSelector.getAttribute('@dateRangeStart', 'value', (result) => {
      const thirtyDayStartDate = result.value;
      dateRangeSelector.click('@apply');
      patientData.expect.element('@date').text.to.contain(thirtyDayStartDate);
    });
    dateRangeSelector.click('@customDateIcon');
    dateRangeSelector.waitForElementVisible('@dateRangeStart', browser.globals.elementTimeout);
    dateRangeSelector.click('@dateRangeStart');
    dateRangeSelector.expect.element('@datePicker').to.be.visible;
    dateRangeSelector.click('@fourteenDays');
    dateRangeSelector.expect.element('@datePicker').to.not.be.present;
    dateRangeSelector.click('@modalDismiss');
  },
};
