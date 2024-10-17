/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['qae-222', 'clinician', 'parallel'],
  'Clinician User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
    clinicWorkspace.expect.element('@title').to.be.present.before(browser.globals.elementTimeout);
  },
  'Clinician is able to select workspace'(browser) {
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicWorkspace.waitForElementVisible('@title', browser.globals.elementTimeout);
    clinicWorkspace.click('@goToWorkspace');
    clinicPatientList.expect.element('@showAll').to.be.present.before(browser.globals.elementTimeout);
  },
  'Clinic workspace search custodial user and click patient name'(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.patientFilterSearch('custodial user');
    clinicPatientList.waitForElementVisible('@row0PatientName', browser.globals.elementTimeout);
    clinicPatientList.click('@row0PatientName');
    clinicPatientList.expect.element('@uploadButton').to.be.present.before(browser.globals.elementTimeout);
    clinicPatientList.expect.element('@resendVerificationEmailButton').to.be.present.before(browser.globals.elementTimeout);
    const loginPage = browser.page.loginPage();
    loginPage.userLogout();
  },

};
