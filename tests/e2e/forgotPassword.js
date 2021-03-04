const { dsaUsernameTandem, dsaPasswordTandem } = require('../../global');

module.exports = {
  'User Submits Password Reset Form'(browser) {
    const loginPage = browser.page.loginPage();
    const loginForm = loginPage.section.loginForm;
    const forgotPasswordPage = browser.page.forgotPasswordPage();
    const resetForm = forgotPasswordPage.section.resetForm;
    loginPage.loadPage();
    loginForm.click('@forgotPasswordLink');
    resetForm
      .assert.containsText('@forgotPasswordTitle', 'Forgot your password?', 'Successful Navigation to Password Reset Page')
      .setValue('@emailInput', dsaUsernameTandem)
      .click('@resetSubmitBtn')
      .assert.containsText('@forgotPasswordTitle', 'Email sent!', 'Email Sent');
  },
  'User Accesses Email'(browser) {
    const forgotPasswordPage = browser.page.forgotPasswordPage();
    const gmail = forgotPasswordPage.section.gmail;
    gmail.accessGmail();
    gmail.submitValidOTP();
    gmail.accessResetEmail();
  },
  'User Resets Password'(browser) {
    const forgotPasswordPage = browser.page.forgotPasswordPage();
    const newPasswordForm = forgotPasswordPage.section.newPasswordForm;
    newPasswordForm.switchTab();
    newPasswordForm.loadPage();
    newPasswordForm
      .assert.containsText('@changePasswordTitle', 'Change your password', 'Successful Navigation to Change Password Form')
      .setValue('@emailInput', dsaUsernameTandem)
      .setValue('@passwordInput', dsaPasswordTandem)
      .setValue('@passwordConfirmInput', dsaPasswordTandem)
      .waitForElementVisible('@saveButton')
      .click('@saveButton')
      .assert.containsText('@changePasswordTitle', 'Success!', 'Successsfully Changed Password');
  },

};
