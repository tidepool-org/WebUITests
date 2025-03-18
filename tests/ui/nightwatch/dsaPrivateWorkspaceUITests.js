require('../../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel'],
  'Log In'(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.userLogin(dsaUsername, dsaPassword);
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

    navBar.waitForElementVisible('@logo', browser.globals.elementTimeout);
    navBar.expect.element('@loginDropdown').to.be.visible;
  },
};
