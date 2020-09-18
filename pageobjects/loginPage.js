'use strict';

module.exports = {
  url: 'https://qa2.development.tidepool.org',
  elements: {
    usernameInput: '#username',
    passwordInput: '#password',
    loginBtn: {
      selector: '//button[text()="Login"]',
      locateStrategy: 'xpath'
    }
  },
  commands: [{
    loginDsa(username, password) {
      return this
        .setValue('@usernameInput', username)
        .setValue('@passwordInput', password)
        .click('@loginBtn');
    }
  }]
};
