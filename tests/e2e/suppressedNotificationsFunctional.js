/* eslint-disable max-len */
/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['notifications'],
  'Clinician User Logs in with Existing Credentials with notification suppressed': async function (browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const environment = browser.launch_url;
    const clinicId = browser.globals.clinic_id;
    console.log(`clinicId${clinicId}`);
    const clinicianId = browser.globals.clinician_id;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
    let res = await browser.setSuppressedNotification(clinicId, clinicianUsername, clinicianPassword, environment);
    browser.assert.strictEqual(res, 200, '/suppressed_notification returns 200 ');
    res = await browser.checkSuppressedNotification(clinicId, clinicianId, clinicianUsername, clinicianPassword, environment);
    browser.assert.strictEqual(res, true, '/suppressed_notification status is true in clinic object ');
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
  'Clinic workspace settings apply changes and check suppressed notifications status': async function (browser) {
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const clinicId = browser.globals.clinic_id;
    const clinicianId = browser.globals.clinician_id;
    const environment = browser.launch_url;
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@city', browser.globals.elementTimeout);
    clinicPatientList.setValue('@city', 'new');
    clinicPatientList.click('@clinicProfileSubmit');
    clinicPatientList.waitForElementNotVisible('@city', browser.globals.elementTimeout);
    const res = await browser.checkSuppressedNotification(clinicId, clinicianId, clinicianUsername, clinicianPassword, environment);
    browser.assert.strictEqual(res, true, '/suppressed_notification status is true in clinic object ');
  },

};
