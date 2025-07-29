/* eslint-disable linebreak-style */
module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    patientList: {
      selector: "#app",
      elements: {
        chartDateRangeModal: "#ChartDateRangePicker",
        patientDetails: {
          selector: '//*[@id="peopleTable-header-fullName"]//span',
          locateStrategy: "xpath",
        },
        dataRecency: {
          selector: '//*[@id="peopleTable-header-cgm-lastData"]//span',
          locateStrategy: "xpath",
        },
        patientTags: {
          selector: '//*[@id="peopleTable-header-tags"]//span',
          locateStrategy: "xpath",
        },
        GMI: {
          selector: '//*[@id="peopleTable-header-cgm-glucoseManagementIndicator"]//span',
          locateStrategy: "xpath",
        },
        timeInRange: {
          selector: '//*[@id="peopleTable-header-bgRangeSummary"]//span',
          locateStrategy: "xpath",
        },
        avgGlucose: {
          selector: '//*[@id="peopleTable-header-bgm-averageGlucoseMmol"]//span',
          locateStrategy: "xpath",
        },
        lows: {
          selector: '//*[@id="peopleTable-header-bgm-timeInVeryLowRecords"]//span',
          locateStrategy: "xpath",
        },
        highs: {
          selector: '//*[@id="peopleTable-header-bgm-timeInVeryHighRecords"]//span',
          locateStrategy: "xpath",
        },
        showAll: {
          selector: '//*[contains(@class,"peopletable-names-showall") and text()="Show All"]',
          locateStrategy: "xpath",
        },
        lastUploadDesc: {
          selector:
            '//*[@id="peopleTable-header-cgm-lastData"]//*[contains(@class," MuiTableSortLabel-iconDirectionDesc")]',
          locateStrategy: "xpath",
        },
      },
      commands: [{}],
    },
  },
};
