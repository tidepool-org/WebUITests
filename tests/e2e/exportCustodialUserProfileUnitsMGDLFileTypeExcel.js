/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');
const utilFile = require('../../modules/utilFile');
const utilsProfilePage = require('../../modules/utilsProfilePage');

module.exports = {
  '@tags': ['qae-223export', 'clinician', 'parallel'],
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
  'Clinic workspace selection'(browser) {
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
    clinicPatientList.waitForElementVisible('@showAll', browser.globals.elementTimeout);
    clinicPatientList.click('@showAll');
    clinicPatientList.patientFilterSearch('custodial user');
    clinicPatientList.waitForElementVisible('@row0PatientName', browser.globals.elementTimeout);
    clinicPatientList.click('@row0PatientName');
    clinicPatientList.expect.element('@uploadButton').to.be.present.before(browser.globals.elementTimeout);
    clinicPatientList.expect.element('@resendVerificationEmailButton').to.be.present.before(browser.globals.elementTimeout);
  },
  'Click custodial user profile link'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@profile', browser.globals.elementTimeout);
    userProfile.click('@profile');
    userProfile.expect.element('@edit').to.be.present.before(browser.globals.elementTimeout);
  },
  'Click export units and file type'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.export;
    userProfile.waitForElementVisible('@mgdl', browser.globals.elementTimeout);
    userProfile.click('@mgdl');
    userProfile.waitForElementVisible('@excel', browser.globals.elementTimeout);
    userProfile.click('@excel');
    userProfile.expect.element('@mgdl').to.be.selected;
    userProfile.expect.element('@excel').to.be.selected;
  },
  'Click export in custodial user profile page | date range: all data': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.export;
    userProfile.click('@allData');
    userProfile.expect.element('@startDate').to.have.css('background-color').which.equals('rgba(204, 204, 204, 1)');
    userProfile.click('@export');
    const fileName = 'TidepoolExport.xlsx';
    const attemptsCheckFileExists = 60;
    await utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
  },
  'Click export in custodial user profile page | date range: last 90 days': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.export;
    userProfile.click('@last90Days');
    userProfile.click('@export');
    const fileName = 'TidepoolExport.xlsx';
    const attemptsCheckFileExists = 30;
    await utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const daysDelta = 90;
    await utilsProfilePage.checkExportDates(browser, userProfile, daysDelta);
  },
  'Click export in custodial user profile page | date range: last 30 days': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.export;
    userProfile.click('@last30Days');
    userProfile.click('@export');
    const fileName = 'TidepoolExport.xlsx';
    const attemptsCheckFileExists = 30;
    await utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const daysDelta = 30;
    await utilsProfilePage.checkExportDates(browser, userProfile, daysDelta);
  },
  'Click export in custodial user profile page | date range: last 14 days': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.export;
    userProfile.click('@last14Days');
    userProfile.click('@export');
    const fileName = 'TidepoolExport.xlsx';
    const attemptsCheckFileExists = 30;
    await utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const daysDelta = 14;
    await utilsProfilePage.checkExportDates(browser, userProfile, daysDelta);
    const loginPage = browser.page.loginPage();
    loginPage.userLogout();
  },

};
