module.exports = {
  '@tags': ['parallel'],
  'Verify nav elements present'(browser) {
    const loginPage = browser.page.loginPage();
    const pageNav = loginPage.section.navigation;
    loginPage.loadPage();
    pageNav.waitForElementVisible('@signupLink', browser.globals.elementTimeout);
    pageNav.expect.element('@logo').to.be.visible;
  },
  'Verify login Form elements present'(browser) {
    const loginPage = browser.page.loginPage();
    const loginForm = loginPage.section.loginForm;
    loginPage.loadPage();
    loginForm.waitForElementVisible('@usernameInput', browser.globals.elementTimeout);
    loginForm.expect.element('@passwordInput').to.be.visible;
    loginForm.expect.element('@rememberChk').to.be.visible;
    loginForm.expect.element('@loginBtn').to.be.visible;
  },
  'Verify footer elements present'(browser) {
    const loginPage = browser.page.loginPage();
    const footer = loginPage.section.footer;
    loginPage.loadPage();
    footer.waitForElementVisible('@twitterLogo', browser.globals.elementTimeout);
    footer.expect.element('@facebookLogo').to.be.visible;
    footer.expect.element('@mobileLink').to.be.visible;
    footer.expect.element('@supportLink').to.be.visible;
    footer.expect.element('@termsLink').to.be.visible;
    footer.expect.element('@jdrfLink').to.be.visible;
  },
};
