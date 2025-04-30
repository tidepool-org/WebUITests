/* eslint-disable comma-dangle */
/* eslint-disable quotes */
require("../../utilities/seleniumKeepAlive");

module.exports = {
  "@tags": ["parallel"],
  "Verify nav elements present"(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    loginPage.waitForElementVisible(
      "@signupLink",
      browser.globals.elementTimeout
    );
    loginPage.expect.element("@logo").to.be.visible;
  },

  "Verify Login Form elements present"(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    loginPage.waitForElementVisible(
      "@usernameInput",
      browser.globals.elementTimeout
    );
    loginPage.expect.element("@rememberChk").to.be.visible;
    loginPage.expect.element("@nextBtn").to.be.visible;
  },

  "Verify footer elements present"(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    loginPage.waitForElementVisible(
      "@twitterLogo",
      browser.globals.elementTimeout
    );
    loginPage.expect.element("@facebookLogo").to.be.visible;
    loginPage.expect.element("@mobileLink").to.be.visible;
    loginPage.expect.element("@supportLink").to.be.visible;
    loginPage.expect.element("@termsLink").to.be.visible;
  },
};
