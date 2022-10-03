require('../../utilities/keepAliveSelenium');

module.exports = {
  '@tags': ['parallel'],
  'Log In'(browser) {
    const loginPage = browser.page.loginPage();
    const loginForm = loginPage.section.loginForm;
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.loadPage();
    loginForm.loginDsa(dsaUsername, dsaPassword);
  },
  'verify login dropdown elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const navBar = common.section.navBar;
    navBar.expect.element('@loginDropdown').to.be.visible;
    navBar.click('@loginDropdown');
    navBar.expect.element('@privateWorkspace').to.be.visible;
    navBar.expect.element('@accountSettings').to.be.visible;
    navBar.expect.element('@logout').to.be.visible;
    navBar.assert.screenshotIdenticalToBaseline('@loginDropdownMenu', 'login dropdown menu');
    navBar.click('@privateWorkspace');
  },
  'verify private workspace elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const navBar = common.section.navBar;
    const privateWorkspace = browser.page.dsaPrivateWorkspace();
    navBar.waitForElementVisible('@logo', browser.globals.elementTimeout);
    navBar.expect.element('@loginDropdown').to.be.visible;
    privateWorkspace.expect.element('@patientCard').to.be.visible;
    privateWorkspace.expect.element('@patientView').to.be.visible;
    privateWorkspace.expect.element('@patientShare').to.be.visible;
    privateWorkspace.expect.element('@patientUpload').to.be.visible;
    privateWorkspace.assert.screenshotIdenticalToBaseline('@navBar', 'nav bar');
    privateWorkspace.assert.screenshotIdenticalToBaseline('@patientsSection', 'private workspace patients');
  },
};
