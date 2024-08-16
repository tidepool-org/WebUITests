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
        rpmReportStartDate: {
          selector: '//input[@id="rpm-report-start-date"]',
          locateStrategy: 'xpath',
        },
        rpmReportEndDate: {
          selector: '//input[@id="rpm-report-end-date"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersDropdown: {
          selector: '//button[@id="last-upload-filter-trigger"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersType: {
          selector: '//label//*[text()="CGM"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersToday: {
          selector: '//label//*[text()="Today"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersLast2Days: {
          selector: '//label//*[text()="Last 2 days"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersLast14Days: {
          selector: '//label//*[text()="Last 14 days"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersLast30Days: {
          selector: '//label//*[text()="Last 30 days"]',
          locateStrategy: 'xpath',
        },
        lastUploadFiltersApply: {
          selector: '//button[@id="apply-last-upload-filter"]',
          locateStrategy: 'xpath',
        },
        rpmClearDates: {
          selector: '//button[contains(@aria-label,"Clear Dates")]',
          locateStrategy: 'xpath',
        },
        previousMonth: {
          selector: '//div[contains(@aria-label,"Move backward to switch to the previous month.")]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterButton: {
          selector: '//button[@id="time-in-range-filter-trigger"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterVeryLow: {
          selector: '//label[@for="range-timeInVeryLowPercent-filter"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterLow: {
          selector: '//label[@for="range-timeInLowPercent-filter"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterTarget: {
          selector: '//label[@for="range-timeInTargetPercent-filter"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterHigh: {
          selector: '//label[@for="range-timeInHighPercent-filter"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterVeryHigh: {
          selector: '//label[@for="range-timeInVeryHighPercent-filter"]',
          locateStrategy: 'xpath',
        },
        timeInRangeFilterApply: {
          selector: '//button[@id="timeInRangeFilterConfirm"]',
          locateStrategy: 'xpath',
        },
        row0PatientName: {
          selector: '//*[@id="peopleTable-row-0"]//div',
          locateStrategy: 'xpath',
        },
        uploadButton: {
          selector: '//*[@class="patientcard-actions-upload" and contains(text(),"Upload")]',
          locateStrategy: 'xpath',
        },
        resendVerificationEmailButton: {
          selector: '//button[contains(text(),"RESEND VERIFICATION EMAIL")]',
          locateStrategy: 'xpath',
        },

      },
      commands: [{
        cgmFilter70OrMore() {
          return this.waitForElementVisible('@cgmUseFilterButton', browser.globals.elementTimeout)
            .click('@cgmUseFilterButton')
            .waitForElementVisible('@cgmUse70OrMore', browser.globals.elementTimeout)
            .click('@cgmUse70OrMore')
            .waitForElementVisible('@cgmUseApply', browser.globals.elementTimeout)
            .click('@cgmUseApply');
        },
        cgmFilterLessThan70() {
          return this.waitForElementVisible('@cgmUseFilterButton', browser.globals.elementTimeout)
            .click('@cgmUseFilterButton')
            .waitForElementVisible('@cgmUseLessThan70', browser.globals.elementTimeout)
            .click('@cgmUse70OrMore')
            .waitForElementVisible('@cgmUseApply', browser.globals.elementTimeout)
            .click('@cgmUseApply');
        },
        patientFilterSearch(searchValue) {
          return this.waitForElementVisible('@patientsSearch', browser.globals.elementTimeout)
            .setValue('@patientsSearch', searchValue)
            .waitForElementVisible('@loadIconHidden', browser.globals.elementTimeout);
        },
        lastUploadFilterToday() {
          return this.waitForElementVisible('@lastUploadFiltersDropdown', browser.globals.elementTimeout)
            .click('@lastUploadFiltersDropdown')
            .waitForElementVisible('@lastUploadFiltersType', browser.globals.elementTimeout)
            .click('@lastUploadFiltersType')
            .waitForElementVisible('@lastUploadFiltersLast2Days', browser.globals.elementTimeout)
            .click('@lastUploadFiltersLast2Days')
            .waitForElementVisible('@lastUploadFiltersApply', browser.globals.elementTimeout)
            .click('@lastUploadFiltersApply');
        },
        lastUploadFilterLast2days() {
          return this.waitForElementVisible('@lastUploadFiltersDropdown', browser.globals.elementTimeout)
            .click('@lastUploadFiltersDropdown')
            .waitForElementVisible('@lastUploadFiltersType', browser.globals.elementTimeout)
            .click('@lastUploadFiltersType')
            .waitForElementVisible('@lastUploadFiltersLast2Days', browser.globals.elementTimeout)
            .click('@lastUploadFiltersLast2Days')
            .waitForElementVisible('@lastUploadFiltersApply', browser.globals.elementTimeout)
            .click('@lastUploadFiltersApply');
        },
        lastUploadFilterLast14days() {
          return this.waitForElementVisible('@lastUploadFiltersDropdown', browser.globals.elementTimeout)
            .click('@lastUploadFiltersDropdown')
            .waitForElementVisible('@lastUploadFiltersType', browser.globals.elementTimeout)
            .click('@lastUploadFiltersType')
            .waitForElementVisible('@lastUploadFiltersLast14Days', browser.globals.elementTimeout)
            .click('@lastUploadFiltersLast14Days')
            .waitForElementVisible('@lastUploadFiltersApply', browser.globals.elementTimeout)
            .click('@lastUploadFiltersApply');
        },
        lastUploadFilterLast30days() {
          return this.waitForElementVisible('@lastUploadFiltersDropdown', browser.globals.elementTimeout)
            .click('@lastUploadFiltersDropdown')
            .waitForElementVisible('@lastUploadFiltersType', browser.globals.elementTimeout)
            .click('@lastUploadFiltersType')
            .waitForElementVisible('@lastUploadFiltersLast30Days', browser.globals.elementTimeout)
            .click('@lastUploadFiltersLast30Days')
            .waitForElementVisible('@lastUploadFiltersApply', browser.globals.elementTimeout)
            .click('@lastUploadFiltersApply');
        },
        rpmExportClickCalendarStartDate(date) {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .click('@rpmClearDates')
            .click('@rpmReportStartDate')
            .click('xpath', `//*[contains(@aria-label,'${date}')]`)
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        rpmExportClickCalendarStartDatePreviousMonth(date) {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .click('@rpmClearDates')
            .click('@rpmReportStartDate')
            .click('@previousMonth')
            .click('xpath', `//*[contains(@aria-label,'${date}')]`)
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        rpmExportClickCalendarEndDate(date) {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .click('@rpmClearDates')
            .click('@rpmReportEndDate')
            .click('xpath', `//*[contains(@aria-label,'${date}')]`)
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        rpmExportClickCalendarEndDatePreviousMonth(date) {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .click('@rpmClearDates')
            .click('@rpmReportEndDate')
            .click('@previousMonth')
            .click('xpath', `//*[contains(@aria-label,'${date}')]`)
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        rpmExportTypeInputStartAndEndDate(start, end) {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .click('@rpmReportStartDate')
            .setValue('@rpmReportStartDate', start)
            .setValue('@rpmReportEndDate', end)
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        rpmExportDefaultDate() {
          return this.waitForElementVisible('@rpmReportButton', browser.globals.elementTimeout)
            .click('@rpmReportButton')
            .waitForElementVisible('@rpmReportConfirm', browser.globals.elementTimeout)
            .click('@rpmReportConfirm');
        },
        timeInRangeVeryLow() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .waitForElementVisible('@timeInRangeFilterVeryLow', browser.globals.elementTimeout)
            .click('@timeInRangeFilterVeryLow')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },
        timeInRangeLow() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .waitForElementVisible('@timeInRangeFilterLow', browser.globals.elementTimeout)
            .click('@timeInRangeFilterLow')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },
        timeInRangeTarget() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .waitForElementVisible('@timeInRangeFilterTarget', browser.globals.elementTimeout)
            .click('@timeInRangeFilterTarget')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },
        timeInRangeHigh() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .waitForElementVisible('@timeInRangeFilterHigh', browser.globals.elementTimeout)
            .click('@timeInRangeFilterHigh')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },
        timeInRangeVeryHigh() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .waitForElementVisible('@timeInRangeFilterVeryHigh', browser.globals.elementTimeout)
            .click('@timeInRangeFilterVeryHigh')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },
        timeInRangeAll() {
          return this.waitForElementVisible('@timeInRangeFilterButton', browser.globals.elementTimeout)
            .click('@timeInRangeFilterButton')
            .click('@timeInRangeFilterVeryLow')
            .click('@timeInRangeFilterLow')
            .click('@timeInRangeFilterTarget')
            .click('@timeInRangeFilterVeryHigh')
            .click('@timeInRangeFilterHigh')
            .waitForElementVisible('@timeInRangeFilterApply', browser.globals.elementTimeout)
            .click('@timeInRangeFilterApply');
        },

      }],
    },
  },
};
