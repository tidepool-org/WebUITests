/* eslint-disable linebreak-style */
module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    patientList: {
      selector: '#app',
      elements: {

        chartDateRangeModal: '#ChartDateRangePicker',
        patientDetails: {
          selector: '//*[@id="peopleTable-header-fullName"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        lastUpload: {
          selector: '//*[@id="peopleTable-header-cgm-lastUploadDate"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        patientTags: {
          selector: '//*[@id="peopleTable-header-tags"]//span',
          locateStrategy: 'xpath',
        },
        GMI: {
          selector: '//*[@id="peopleTable-header-cgm-glucoseManagementIndicator"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        timeInRange: {
          selector: '//*[@id="peopleTable-header-bgRangeSummary"]//span',
          locateStrategy: 'xpath',
        },
        avgGlucose: {
          selector: '//*[@id="peopleTable-header-bgm-averageGlucoseMmol"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        lows: {
          selector: '//*[@id="peopleTable-header-bgm-timeInVeryLowRecords"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        highs: {
          selector: '//*[@id="peopleTable-header-bgm-timeInVeryHighRecords"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        showAll: {
          selector: '//*[contains(@class,"peopletable-names-showall") and text()="Show All"]',
          locateStrategy: 'xpath',
        },
        lastUploadDesc: {
          selector: '//*[@id="peopleTable-header-cgm-lastUploadDate"]//span',
          locateStrategy: 'xpath',
        },
        workspaceSettings: {
          selector: '//button[@id="profileNavigationButton"]',
          locateStrategy: 'xpath',
        },
        edit: {
          selector: '//button//*[text()="Edit"]',
          locateStrategy: 'xpath',
        },
        city: {
          selector: '//input[@id="city"]',
          locateStrategy: 'xpath',
        },
        clinicProfileSubmit: {
          selector: '//button[@id="editClinicProfileSubmit"]',
          locateStrategy: 'xpath',
        },

      },
      commands: [{
      }],
    },
  },
};
