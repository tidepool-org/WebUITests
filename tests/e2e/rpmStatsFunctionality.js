/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['rpm', 'clinician', 'parallel'],
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
  'Clinic workspace cgm filter 70% or more apply '(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@cgmUseFilterButton', browser.globals.elementTimeout);
    clinicPatientList.click('@cgmUseFilterButton');
    clinicPatientList.waitForElementVisible('@cgmUse70OrMore', browser.globals.elementTimeout);
    clinicPatientList.click('@cgmUse70OrMore');
    clinicPatientList.waitForElementVisible('@cgmUseApply', browser.globals.elementTimeout);
    clinicPatientList.click('@cgmUseApply');
  },
  'Clinic workspace cgm filter search '(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@patientsSearch', browser.globals.elementTimeout);
    clinicPatientList.setValue('@patientsSearch', 'autodex');
    clinicPatientList.waitForElementVisible('@loadIconHidden', browser.globals.elementTimeout);
  },
  'Clinic workspace rpm stats export default': async function (browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout);
    clinicPatientList.click('@rpmReportButton');
    clinicPatientList.waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout);
    clinicPatientList.click('@rpmReportConfirm');
    const res = await browser.checkFileHash('d303e74d2e6163dd3f85d811ae335f86a5a8d3616aa8b439ad87427eaa518ee5');
    browser.assert.strictEqual(res, true, 'exported rpm csv file hash are equivalent ');
  },

};
