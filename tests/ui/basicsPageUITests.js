require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel'],
  'log in and navigate to basics page'(browser) {
    const loginPage = browser.page.loginPage();
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    const loginForm = loginPage.section.loginForm;
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.loadPage();
    loginPage.assert.screenshotIdenticalToBaseline('@loginPage', 'login page');
    loginForm.loginDsa(dsaUsername, dsaPassword);
    patientData.loadView('basics');
  },
  'verify navbar elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const navBar = common.section.navBar;
    navBar.waitForElementVisible('@logo', browser.globals.elementTimeout);
    navBar.expect.element('@patientCard').to.be.visible;
    navBar.expect.element('@patientProfile').to.be.visible;
    navBar.expect.element('@patientView').to.be.visible;
    navBar.expect.element('@patientShare').to.be.visible;
    navBar.expect.element('@patientUpload').to.be.visible;
    navBar.expect.element('@loginDropdown').to.be.visible;
    navBar.assert.screenshotIdenticalToBaseline('@navBarContainer', 'nav bar');
  },
  'verify common patient data elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    patientData.expect.element('@basics').to.be.visible;
    patientData.expect.element('@daily').to.be.visible;
    patientData.expect.element('@bgLog').to.be.visible;
    patientData.expect.element('@trends').to.be.visible;
    patientData.expect.element('@dateRange').to.be.visible;
    patientData.expect.element('@print').to.be.visible;
    patientData.expect.element('@deviceSettings').to.be.visible;
    patientData.assert.screenshotIdenticalToBaseline('@patientDataSubNav', 'patient data sub nav');
  },
  'verify date range selector elements present'(browser) {
    const basics = browser.page.basicsPage();
    const dateRangeSelector = basics.section.dateRangeSelector;
    dateRangeSelector.waitForElementVisible('@customDateIcon', browser.globals.elementTimeout);
    dateRangeSelector.click('@customDateIcon');
    dateRangeSelector.expect.element('@modalTitle').to.be.visible;
    dateRangeSelector.expect.element('@modalDismiss').to.be.visible;
    dateRangeSelector.expect.element('@daysOptions').to.be.visible;
    dateRangeSelector.expect.element('@fourteenDays').to.be.visible;
    dateRangeSelector.expect.element('@twentyOneDays').to.be.visible;
    dateRangeSelector.expect.element('@thirtyDays').to.be.visible;
    dateRangeSelector.expect.element('@dateRangeStart').to.be.visible;
    dateRangeSelector.expect.element('@dateRangeEnd').to.be.visible;
    dateRangeSelector.expect.element('@cancel').to.be.visible;
    dateRangeSelector.expect.element('@apply').to.be.visible;
    dateRangeSelector.assert.screenshotIdenticalToBaseline('@chartDateRangeModal', 'chart date range modal');
    dateRangeSelector.click('@modalDismiss');
  },
  'verify bg dashboard elements present'(browser) {
    const basics = browser.page.basicsPage();
    const bgDashboard = basics.section.bgDashboard;
    bgDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    bgDashboard.moveToElement('@bottomOfDashboard', 0, 0);
    bgDashboard.expect.element('@averagePerDay').to.be.visible;
    bgDashboard.expect.element('@meter').to.be.visible;
    bgDashboard.expect.element('@manual').to.be.visible;
    bgDashboard.expect.element('@below').to.be.visible;
    bgDashboard.expect.element('@above').to.be.visible;
    bgDashboard.expect.element('@mostRecentDay').to.be.visible;
    bgDashboard.expect.element('@bgReading').to.be.visible;
    bgDashboard.expect.element('@bgReading').to.have.css('fill').which.equals('rgb(100, 128, 251)');
    bgDashboard.resetHoverState();
    bgDashboard.assert.screenshotIdenticalToBaseline('@bgCalendar', 'bg dashboard');
  },
  'verify bolus dashboard elements present'(browser) {
    const basics = browser.page.basicsPage();
    const bolusDashboard = basics.section.bolusDashboard;
    bolusDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    bolusDashboard.moveToElement('@bottomOfDashboard', 0, 0);
    bolusDashboard.expect.element('@averagePerDay').to.be.visible;
    bolusDashboard.expect.element('@calculator').to.be.visible;
    bolusDashboard.expect.element('@correction').to.be.visible;
    bolusDashboard.expect.element('@override').to.be.visible;
    bolusDashboard.expect.element('@extended').to.be.visible;
    bolusDashboard.expect.element('@interrupted').to.be.visible;
    bolusDashboard.expect.element('@underride').to.be.visible;
    bolusDashboard.expect.element('@mostRecentDay').to.be.visible;
    bolusDashboard.expect.element('@bolusEntry').to.be.visible;
    /* bolus color is still different (old) on qa environment qa1
    bolusDashboard.expect.element('@bolusEntry')
      .to.have.css('fill').which.equals('rgb(124, 208, 242)'); */
    bolusDashboard.assert.screenshotIdenticalToBaseline('@bolusesCalendar', 'boluses dashboard');
  },
  'verify infusion site changes dashboard elements present'(browser) {
    const basics = browser.page.basicsPage();
    const infusionSiteDashboard = basics.section.infusionSiteChanges;
    infusionSiteDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    infusionSiteDashboard.moveToElement('@bottomOfDashboard', 0, 0);
    infusionSiteDashboard.expect.element('@settingsToggle').to.be.visible;
    infusionSiteDashboard.expect.element('@siteChangeDay').to.be.visible;
    infusionSiteDashboard.assert.screenshotIdenticalToBaseline('@siteChangesCalendar', 'infusion site changes dashboard');
  },
  'verify basals dashboard elements present'(browser) {
    const basics = browser.page.basicsPage();
    const basalsDashboard = basics.section.basalsDashboard;
    basalsDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    basalsDashboard.moveToElement('@bottomOfDashboard', 0, 0);
    basalsDashboard.expect.element('@basalEvents').to.be.visible;
    basalsDashboard.expect.element('@tempBasals').to.be.visible;
    basalsDashboard.expect.element('@suspends').to.be.visible;
    basalsDashboard.expect.element('@mostRecentDay').to.be.visible;
    basalsDashboard.assert.screenshotIdenticalToBaseline('@basalsCalendar', 'basals dashboard');
  },
  'verify footer elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const footer = common.section.footer;
    footer.waitForElementVisible('@twitter', browser.globals.elementTimeout);
    footer.moveToElement('@twitter', 0, 0);
    footer.expect.element('@refresh').to.be.visible;
    footer.expect.element('@facebook').to.be.visible;
    footer.expect.element('@support').to.be.visible;
    footer.expect.element('@termsOfUse').to.be.visible;
    footer.expect.element('@jdrf').to.be.visible;
  },
  'verify sidebar and BGM agg stat elements present'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    const infusionSiteDashboard = basics.section.infusionSiteChanges;
    sidebar.waitForElementVisible('@copyAsText', browser.globals.elementTimeout);
    sidebar.moveToElement('@copyAsText', 0, 0);
    sidebar.expect.element('@bgmCgmToggle').to.be.visible;
    sidebar.toggleBGM();
    sidebar.waitForElementVisible('@readingsInRange', browser.globals.elementTimeout);
    sidebar.assert.screenshotIdenticalToBaseline('@readingsInRange', 'readings in range');
    sidebar.expect.element('@timeInRange').to.not.be.present;
    sidebar.expect.element('@averageGlucose').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@averageGlucose', 'average glucose BGM');
    sidebar.moveToElement('@filterDevices', 0, 0);
    sidebar.expect.element('@totalInsulin').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@totalInsulin', 'total insulin');
    sidebar.expect.element('@averageDailyDose').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@averageDailyDose', 'average daily dose');
    sidebar.expect.element('@weight').to.be.visible;
    sidebar.expect.element('@units').to.be.visible;
    sidebar.expect.element('@averageCarbs').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@averageCarbs', 'average carbs');
    infusionSiteDashboard.moveToElement('@title', 0, 0);
    sidebar.expect.element('@gmi').to.not.be.present;
    sidebar.assert.screenshotIdenticalToBaseline('@cv', 'cv BGM');
    sidebar.expect.element('@cv').to.be.visible;
    sidebar.expect.element('@filterDevices').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@filterDevices', 'filter devices');
  },
  'verify sidebar and CGM agg stat elements present'(browser) {
    const basics = browser.page.basicsPage();
    const sidebar = basics.section.sidebar;
    const infusionSiteDashboard = basics.section.infusionSiteChanges;
    sidebar.waitForElementVisible('@copyAsText', browser.globals.elementTimeout);
    sidebar.moveToElement('@copyAsText', 0, 0);
    sidebar.expect.element('@bgmCgmToggle').to.be.visible;
    sidebar.toggleCGM();
    sidebar.waitForElementVisible('@timeInRange', browser.globals.elementTimeout);
    sidebar.assert.screenshotIdenticalToBaseline('@timeInRange', 'time in range');
    sidebar.expect.element('@readingsInRange').to.not.be.present;
    sidebar.expect.element('@averageGlucose').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@averageGlucose', 'average glucose CGM');
    sidebar.moveToElement('@filterDevices', 0, 0);
    sidebar.expect.element('@sensorUsage').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@sensorUsage', 'sensor usage');
    sidebar.expect.element('@totalInsulin').to.be.visible;
    sidebar.expect.element('@averageDailyDose').to.be.visible;
    sidebar.expect.element('@weight').to.be.visible;
    sidebar.expect.element('@units').to.be.visible;
    sidebar.expect.element('@averageCarbs').to.be.visible;
    infusionSiteDashboard.moveToElement('@title', 0, 0);
    sidebar.expect.element('@gmi').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@gmi', 'gmi');
    sidebar.expect.element('@cv').to.be.visible;
    sidebar.assert.screenshotIdenticalToBaseline('@cv', 'cv CGM');
    sidebar.expect.element('@filterDevices').to.be.visible;
  },
};
