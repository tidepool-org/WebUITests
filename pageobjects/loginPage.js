'use strict';

module.exports = {
  url: function() {
    return this.api.launch_url
  },
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
