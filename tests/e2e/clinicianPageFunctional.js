/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['clinician'],
  'Clinician User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
  },
  'Clinic workspace selection'(browser) {
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    clinicWorkspace.waitForElementVisible('@title', browser.globals.elementTimeout);
    clinicWorkspace.click('@goToWorkspace');
  },
  'Clinic workspace show all'(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@showAll', browser.globals.elementTimeout);
    clinicPatientList.click('@showAll');
    clinicPatientList.expect.element('@patientDetails').text.to.contain('Patient Details');
    clinicPatientList.expect.element('@dataRecency').text.to.contain('Data Recency');
    clinicPatientList.expect.element('@patientTags').text.to.contain('Patient Tags');
    clinicPatientList.expect.element('@GMI').text.to.contain('GMI');
    clinicPatientList.expect.element('@timeInRange').text.to.contain('% Time in Range');
    clinicPatientList.expect.element('@avgGlucose').text.to.contain('Avg. Glucose');
    clinicPatientList.expect.element('@lows').text.to.contain('Lows');
    clinicPatientList.expect.element('@highs').text.to.contain('Highs');
    clinicPatientList.waitForElementVisible('@lastUploadDesc', browser.globals.elementTimeout);
  },

};
