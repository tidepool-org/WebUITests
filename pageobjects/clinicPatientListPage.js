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
          selector: '//*[@id="peopleTable-header-tags"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        GMI: {
          selector: '//*[@id="peopleTable-header-cgm-glucoseManagementIndicator"]//span[@role="button"]',
          locateStrategy: 'xpath',
        },
        timeInRange: {
          selector: '//*[@id="peopleTable-header-bgRangeSummary"]//span[@role="button"]',
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
          selector: '//*[@id="peopleTable-header-cgm-lastUploadDate"]//span[@role="Button"]',
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
        rpmReportButton: {
          selector: '//button[@id="open-rpm-report-config"]',
          locateStrategy: 'xpath',
        },
        cgmUseFilterButton: {
          selector: '//button[@id="cgm-use-filter-trigger"]',
          locateStrategy: 'xpath',
        },
        cgmUseLessThan70: {
          selector: '//*[text()="Less than 70%"]',
          locateStrategy: 'xpath',
        },
        cgmUse70OrMore: {
          selector: '//*[text()="70% or more"]',
          locateStrategy: 'xpath',
        },
        cgmUseClear: {
          selector: '//button[@id="clear-cgm-use-filter"]',
          locateStrategy: 'xpath',
        },
        cgmUseApply: {
          selector: '//button[@id="apply-cgm-use-filter"]',
          locateStrategy: 'xpath',
        },
        loadIconHidden: {
          selector: '//*[contains(@class,"Loader--hidden")]',
          locateStrategy: 'xpath',
        },
        patientsSearch: {
          selector: '//input[@id="patients-search"]',
          locateStrategy: 'xpath',
        },
        rpmReportConfirm: {
          selector: '//button[@id="configureRpmReportConfirm"]',
          locateStrategy: 'xpath',
        },

      },
      commands: [{
      }],
    },
  },
};
