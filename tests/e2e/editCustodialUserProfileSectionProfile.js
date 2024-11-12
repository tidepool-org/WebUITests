/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['qae-223', 'clinician', 'parallel'],
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
  'Click edit in custodial user profile page'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.click('@edit');
    userProfile.expect.element('@fullName').to.be.present.before(browser.globals.elementTimeout);
  },
  'Edit and save full name in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;

    userProfile.waitForElementVisible('@fullName', browser.globals.elementTimeout);
    userProfile.setValue('@fullName', 'new1');
    userProfile.click('@save');
    userProfile.waitForElementVisible('xpath', "//div[contains(text(),'new1')]", browser.globals.elementTimeout);
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.waitForElementVisible('@fullName', browser.globals.elementTimeout);
    userProfile.assert.valueEquals('@fullName', 'new1', 'full name equals new1');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save dob in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.setValue('@dob', '04/04/2000');
    userProfile.setValue('@fullName', 'new2');
    userProfile.click('@save');
    userProfile.waitForElementVisible('xpath', "//div[contains(text(),'new2')]", browser.globals.elementTimeout);
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.assert.valueEquals('@dob', '04/04/2000', 'dob date equals 04/04/2000');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis date in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.setValue('@diagnosisDate', '03/03/2000');
    userProfile.setValue('@fullName', 'new3');
    userProfile.click('@save');
    userProfile.waitForElementVisible('xpath', "//div[contains(text(),'new3')]", browser.globals.elementTimeout);
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.assert.valueEquals('@diagnosisDate', '03/03/2000', 'diagnosis date equals 03/03/2000');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to type 1 in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOptionType1', 'Type 1');
    userProfile.isSelected('@diagnosisTypeOptionType1', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to type 2 in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOptionType2', 'Type 2');
    userProfile.isSelected('@diagnosisTypeOptionType2', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to gestational in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeGestational', 'Gestational');
    userProfile.isSelected('@diagnosisTypeGestational', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to prediabetes in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypePrediabetes', 'Pre-diabetes');
    userProfile.isSelected('@diagnosisTypePrediabetes', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to lada in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeLada', 'LADA');
    userProfile.isSelected('@diagnosisTypeLada', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to mody in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeMody', 'MODY');
    userProfile.isSelected('@diagnosisTypeMody', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to other in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOther', 'Other');
    userProfile.isSelected('@diagnosisTypeOther', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save MRN in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.setValue('@mrn', '8192024');
    userProfile.setValue('@fullName', 'new4');
    userProfile.click('@save');
    userProfile.waitForElementVisible('xpath', "//div[contains(text(),'new4')]", browser.globals.elementTimeout);
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.assert.valueEquals('@mrn', '8192024', 'mrn equals 8192024');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Edit and save bio in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.setValue('@bio', 'test bio');
    userProfile.setValue('@fullName', 'new5');
    userProfile.click('@save');
    userProfile.waitForElementVisible('xpath', "//div[contains(text(),'new5')]", browser.globals.elementTimeout);
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    userProfile.assert.valueEquals('@bio', 'test bio', 'bio equals test bio');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
  },
  'Reset custodial user profile page'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.click('@edit');
    userProfile.setValue('@diagnosisDate', '04/04/2000');
    userProfile.setValue('@dob', '03/03/2000');
    userProfile.setValue('@fullName', 'custodial user');
    userProfile.setValue('@bio', 'empty');
    userProfile.setValue('@mrn', '7182022');
    userProfile.waitForElementVisible('@save', browser.globals.elementTimeout);
    userProfile.click('@save');
    const loginPage = browser.page.loginPage();
    loginPage.userLogout();
  },

};
