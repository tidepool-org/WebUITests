module.exports = {
  '@tags': ['parallel'],
  'UI Elements Present'(browser) {
    const loginPage = browser.page.loginPage();
    const pageNav = loginPage.section.navigation;
    const loginForm = loginPage.section.loginForm;
    const footer = loginPage.section.footer;
    loginPage.loadPage();
    pageNav.elementsPresent();
    loginForm.elementsPresent();
    footer.elementsPresent();
  },
};
