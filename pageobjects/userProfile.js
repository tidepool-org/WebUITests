module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    profile: {
      selector: '#app',
      elements: {
        fullName: {
          selector: '//input[@id="fullName"]',
          locateStrategy: 'xpath',
        },
        profile: {
          selector: '//div[@class="patientcard-fullname"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
  },
  commands: [{
  }],
};
