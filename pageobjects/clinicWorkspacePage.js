/* eslint-disable linebreak-style */
module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    clinicWorkspace: {
      selector: '#app',
      elements: {
        chartDateRangeModal: '#ChartDateRangePicker',
        title: {
          selector: '//*[text()="Welcome To Tidepool"]',
          locateStrategy: 'xpath',
        },
        goToWorkspace: {
          selector: '//*[text()="MD Clinic"]/ancestor::div[contains(@class,"workspace-item-clinic")][1]//button//*[text()="Go To Workspace"]',
          locateStrategy: 'xpath',
        },

      },
      commands: [{
      }],
    },
  },
};
