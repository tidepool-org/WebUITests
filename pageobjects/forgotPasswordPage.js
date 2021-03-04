const { getToken } = require('../utilities/utilities');

module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    resetForm: {
      selector: '#app',
      elements: {
        logo: 'img[alt="Tidepool"]',
        forgotPasswordTitle: '.PasswordReset-title',
        forgotPasswordInstructions: '.PasswordReset-instructions',
        emailInputLabel: 'label[for="email"]',
        emailInput: '#email',
        resetSubmitBtn: {
          selector: '//button[text()="Send reset link"]',
          locateStrategy: 'xpath',
        },
        loginReturnLink: 'a[href="/login"]',
      },
      commands: [{
      }],
    },
    gmail: {
      selector: 'body',
      elements: {
        emailInput: 'input[type="email"]',
        usernameNextButton: '#identifierNext',
        passwordNextButton: '#passwordNext',
        passwordInput: 'input[name="password"]',
        otpInput: 'input[name="totpPin"]',
        otpNextButton: '#totpNext',
        passwordResetEmail: {
          selector: '(//b[text()="Password reset for your Tidepool account"])',
          locateStrategy: 'xpath',
        },
        emailResetPassButton: 'a[href*="confirm-password-reset"]',
      },
      commands: [{
        accessGmail() {
          this.api.url('https://mail.google.com');
          return this.waitForElementPresent('@emailInput')
            .setValue('@emailInput', this.api.globals.gmailUsername)
            .click('@usernameNextButton')
            .waitForElementPresent('@passwordInput', this.api.globals.elementTimeout)
            .setValue('@passwordInput', this.api.globals.gmailPassword)
            .click('@passwordNextButton')
            .waitForElementPresent('@otpInput')
            .setValue('@otpInput', getToken())
            .click('@otpNextButton')
            .waitForElementPresent('#guser', this.api.globals.elementTimeout)
            .click('@passwordResetEmail')
            .click('@otpNextButton');
        },
        submitValidOTP() {
          this.waitForElementVisible('#guser', this.api.globals.elementTimeout, false, (result) => {
            if (result.state !== 'success') {
              this.clearValue('@otpInput')
                .setValue('@otpInput', getToken())
                .click('@otpNextButton');
            }
            return this;
          });
        },
        accessResetEmail() {
          return this.click('@passwordResetEmail')
            .waitForElementPresent('@emailResetPassButton')
            .click('@emailResetPassButton');
        },
      }],
    },
    newPasswordForm: {
      selector: '#app',
      elements: {
        changePasswordTitle: '.PasswordReset-title',
        emailInput: '#email',
        passwordInput: '#password',
        passwordConfirmInput: '#passwordConfirm',
        saveButton: '.simple-form-submit',
        loginButton: 'a[href="/login"]',
      },
      commands: [{
        switchTab() {
          return this.api.windowHandles((result) => {
            const handle = result.value[1];
            this.switchWindow(handle);
          });
        },
      }],
    },
  },
};
