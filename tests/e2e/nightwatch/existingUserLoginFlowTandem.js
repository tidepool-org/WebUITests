require('../../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel'],
  'User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.userLogin(dsaUsername, dsaPassword);
  },
};
