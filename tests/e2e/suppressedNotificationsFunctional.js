/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['notifications'],
  'Clinician User Logs in with Existing Credentials with notification suppressed'(browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const environment = browser.launch_url;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
    browser.suppressedNotificationsTrue(clinicianUsername, clinicianPassword, environment);
    browser.suppressedNotificationsTrueCheck(clinicianUsername, clinicianPassword, environment);
  },
  'Clinic workspace selection'(browser) {
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    clinicWorkspace.waitForElementVisible('@title', browser.globals.elementTimeout);
    clinicWorkspace.click('@goToWorkspace');
  },
  'Clinic workspace settings'(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@workspaceSettings', browser.globals.elementTimeout);
    clinicPatientList.click('@workspaceSettings');
    clinicPatientList.waitForElementVisible('@edit', browser.globals.elementTimeout);
  },
  'Clinic workspace settings edit'(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@edit', browser.globals.elementTimeout);
    clinicPatientList.click('@edit');
    clinicPatientList.waitForElementVisible('@city', browser.globals.elementTimeout);
  },
  'Clinic workspace settings apply changes and check suppressed notifications status'(browser) {
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const environment = browser.launch_url;
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@city', browser.globals.elementTimeout);
    clinicPatientList.setValue('@city', 'new');
    clinicPatientList.click('@clinicProfileSubmit');
    clinicPatientList.waitForElementNotVisible('@city', browser.globals.elementTimeout);
    browser.suppressedNotificationsTrueCheck(clinicianUsername, clinicianPassword, environment);
  },

};
