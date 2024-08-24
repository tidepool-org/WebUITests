/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');
const moment = require('moment');
const utilFile = require('../../modules/utilFile');

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

  'Clinic workspace rpm stats export | lastUploadFilterLast14days | patientFilterSearch:autodex | rpmExportStartDateSelected:40 days from today ': async (browser) => {
    // setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    const daysFromToday = 40;
    const start = moment().subtract(daysFromToday, 'days');
    const end = moment(start).add(29, 'days');
    let startDate; let endDate; let startDateFile; let endDatefile; let
      fileName;
    ({
      startDate, endDate, startDateFile, endDatefile, fileName,
    } = await browser.createDatesLong(start, end));
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv';

    // filter criteria and rpm report submit

    clinicPatientList.lastUploadFilterLast14days();
    clinicPatientList.patientFilterSearch('autodex');
    const startDateObj = moment(startDate, 'MMMM D, YYYY');
    if (moment().startOf('month').diff(startDateObj.startOf('month'), 'months') === 2) {
      clinicPatientList.rpmExportClickCalendarStartDatePreviousMonth(startDate);
    } else {
      clinicPatientList.rpmExportClickCalendarStartDate(startDate);
    }

    // validate file export results
    utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const written = await browser.checkFileContents(fileName);
    console.log(`write${written}`);
    utilFile.checkFileExistence(browser, filePath, attemptsCheckFileExists);
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    console.log(`suff${sufficient}`);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid ');
  },
  'Clinic workspace rpm stats export | lastUploadFilterLast14days | patientFilterSearch:autodex | rpmExportEndDateSelected:10 days from today  ': async (browser) => {
    // setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    const daysFromToday = 10;
    const end = moment().subtract(daysFromToday, 'days');
    const start = moment(end).subtract(29, 'days');
    let startDate; let endDate; let startDateFile; let endDatefile; let
      fileName;
    ({
      startDate, endDate, startDateFile, endDatefile, fileName,
    } = await browser.createDatesLong(start, end));
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv';

    // filter criteria and rpm report submit

    clinicPatientList.lastUploadFilterLast14days();
    clinicPatientList.patientFilterSearch('autodex');

    const endDateObj = moment(endDate, 'MMMM D, YYYY');
    if (moment().startOf('month').diff(endDateObj.startOf('month'), 'months') === 2) {
      clinicPatientList.rpmExportClickCalendarEndDatePreviousMonth(endDate);
    } else {
      clinicPatientList.rpmExportClickCalendarEndDate(endDate);
    }
    // validate file export results
    utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');
  },
  'Clinic workspace rpm stats export | lastUploadFilterLast14days | patientFilterSearch:autodex | rpmExportStartDateSelected:57 days from today | rpmExportEndDateSelected:start date + 15 days ': async (browser) => {
    // setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    const daysFromToday = 57;
    const dateRange = 15;
    const start = moment().subtract(daysFromToday, 'days');
    const end = moment(start).add(dateRange, 'days');
    let startDate; let endDate; let startDateFile; let endDatefile; let
      fileName;
    ({
      startDate, endDate, startDateFile, endDatefile, fileName,
    } = await browser.createDatesShort(start, end));
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv';

    // filter criteria and rpm report submit

    clinicPatientList.lastUploadFilterLast14days();
    clinicPatientList.patientFilterSearch('autodex');

    clinicPatientList.rpmExportTypeInputStartAndEndDate(startDate, endDate);
    // validate file export results
    utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');
  },
  'Clinic workspace rpm stats export | lastUploadFilterLast14days | patientFilterSearch:autodex | rpmExportDefaultDate ': async (browser) => {
    // setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    const today = moment();
    const start = moment().subtract(29, 'days');
    const end = today;
    let startDate; let endDate; let startDateFile; let endDatefile; let
      fileName;
    ({
      startDate, endDate, startDateFile, endDatefile, fileName,
    } = await browser.createDatesLong(start, end));
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv';

    // filter criteria and rpm report submit

    clinicPatientList.lastUploadFilterLast14days();
    clinicPatientList.patientFilterSearch('autodex');

    clinicPatientList.rpmExportDefaultDate();
    // validate file export results
    utilFile.checkFileExistence(browser, fileName, attemptsCheckFileExists);
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');
  },

};
