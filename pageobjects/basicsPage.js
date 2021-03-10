module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    dateRangeSelector: {
      selector: '#app',
      elements: {
        customDateIcon: 'span[aria-label="Choose custom date range"]',
        modalTitle: {
          selector: '//h3[text()="Chart Date Range"]',
          locateStrategy: 'xpath',
        },
        modalDismiss: {
          selector: '//span[@aria-label="close dialog"]',
          locateStrategy: 'xpath',
        },
        daysOptions: {
          selector: '//div[@id="days-chart"]',
          locateStrategy: 'xpath',
        },
        fourteenDays: {
          selector: '//button[@id="days-chart-0"]',
          locateStrategy: 'xpath',
        },
        twentyOneDays: {
          selector: '//button[@id="days-chart-1"]',
          locateStrategy: 'xpath',
        },
        thirtyDays: {
          selector: '//button[@id="days-chart-2"]',
          locateStrategy: 'xpath',
        },
        dateRangeStart: {
          selector: '//input[@id="chart-start-date"]',
          locateStrategy: 'xpath',
        },
        dateRangeEnd: {
          selector: '//input[@id="chart-end-date"]',
          locateStrategy: 'xpath',
        },
        datePicker: {
          selector: '//div[@aria-roledescription="datepicker"]',
          locateStrategy: 'xpath',
        },
        cancel: {
          selector: '//div[text()="Cancel"]',
          locateStrategy: 'xpath',
        },
        apply: {
          selector: '//div[text()="Apply"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
    bgDashboard: {
      selector: '#tidelineContainer',
      elements: {
        title: {
          selector: '//h3[text()="BG readings"]',
          locateStrategy: 'xpath',
        },
        bottomOfDashboard: {
          selector: '//h3[text()="Bolusing"]',
          locateStrategy: 'xpath',
        },
        averagePerDay: {
          selector: '//div[contains(@class,"Calendar-container-fingersticks")]//span[text()="Avg per day"]',
          locateStrategy: 'xpath',
        },
        meter: {
          selector: '//span[text()="Meter"]',
          locateStrategy: 'xpath',
        },
        manual: {
          selector: '//span[text()="Manual"]',
          locateStrategy: 'xpath',
        },
        below: {
          selector: '//span[contains(text(),"Below")]',
          locateStrategy: 'xpath',
        },
        above: {
          selector: '//span[contains(text(),"Above")]',
          locateStrategy: 'xpath',
        },
        mostRecentDay: {
          selector: '//div[contains(@class,"Calendar-day--fingersticks") and contains(@class, "Calendar-day-most-recent")]',
          locateStrategy: 'xpath',
        },
        dayHover: {
          selector: '//div[contains(@class,"Calendar-day--HOVER")]//*[@class="Calendar-weekday"]',
          locateStrategy: 'xpath',
        },
        bgReading: {
          selector: '//div[contains(@class,"Calendar-day--fingersticks")]//*[name()="circle"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
    bolusDashboard: {
      selector: '#tidelineContainer',
      elements: {
        title: {
          selector: '//h3[text()="Bolusing"]',
          locateStrategy: 'xpath',
        },
        bottomOfDashboard: {
          selector: '//h3[text()="Infusion site changes"]',
          locateStrategy: 'xpath',
        },
        averagePerDay: {
          selector: '//div[contains(@class,"Calendar-container-boluses")]//span[text()="Avg per day"]',
          locateStrategy: 'xpath',
        },
        calculator: {
          selector: '//span[text()="Calculator"]',
          locateStrategy: 'xpath',
        },
        correction: {
          selector: '//span[text()="Correction"]',
          locateStrategy: 'xpath',
        },
        override: {
          selector: '//span[text()="Override"]',
          locateStrategy: 'xpath',
        },
        extended: {
          selector: '//span[text()="Extended"]',
          locateStrategy: 'xpath',
        },
        interrupted: {
          selector: '//span[text()="Interrupted"]',
          locateStrategy: 'xpath',
        },
        underride: {
          selector: '//span[text()="Underride"]',
          locateStrategy: 'xpath',
        },
        mostRecentDay: {
          selector: '//div[contains(@class,"Calendar-day--boluses") and contains(@class, "Calendar-day-most-recent")]',
          locateStrategy: 'xpath',
        },
        dayHover: {
          selector: '//div[contains(@class,"Calendar-day--HOVER")]//*[@class="Calendar-weekday"]',
          locateStrategy: 'xpath',
        },
        bolusEntry: {
          selector: '//div[contains(@class,"Calendar-day--boluses")]//*[name()="circle"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
    infusionSiteChanges: {
      selector: '#tidelineContainer',
      elements: {
        title: {
          selector: '//h3[text()="Infusion site changes"]',
          locateStrategy: 'xpath',
        },
        bottomOfDashboard: {
          selector: '//h3[text()="Basals"]',
          locateStrategy: 'xpath',
        },
        settingsToggle: {
          selector: '//i[contains(@class, "icon--toggle")]',
          locateStrategy: 'xpath',
        },
        siteChangeSelector: '.SiteChangeSelector',
        fillCannulaOption: 'input[value="cannulaPrime"]',
        fillTubingOption: 'input[value="tubingPrime"]',
        filledCannulaDay: 'div[class*="Change--cannula"]',
        filledTubingDay: 'div[class*="Change--tubing"]',
        siteChangeDay: '.SiteChange',
        dayHover: {
          selector: '//div[contains(@class,"Calendar-day--HOVER")]//*[@class="Calendar-weekday"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
    basalsDashboard: {
      selector: '#tidelineContainer',
      elements: {
        title: {
          selector: '//h3[text()="Basals"]',
          locateStrategy: 'xpath',
        },
        bottomOfDashboard: {
          selector: '//button[text()="Refresh"]',
          locateStrategy: 'xpath',
        },
        basalEvents: {
          selector: '//span[text()="Basal Events"]',
          locateStrategy: 'xpath',
        },
        tempBasals: {
          selector: '//span[text()="Temp Basals"]',
          locateStrategy: 'xpath',
        },
        suspends: {
          selector: '//span[text()="Suspends"]',
          locateStrategy: 'xpath',
        },
        mostRecentDay: {
          selector: '//div[contains(@class,"Calendar-day--basals") and contains(@class, "Calendar-day-most-recent")]',
          locateStrategy: 'xpath',
        },
        dayHover: {
          selector: '//div[contains(@class,"Calendar-day--HOVER")]//*[@class="Calendar-weekday"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
      }],
    },
    sidebar: {
      selector: '#tidelineMain',
      elements: {
        copyAsText: 'button[title="For email or notes"]',
        bgmCgmToggle: 'div[class*="TwoOptionToggle--toggle"]',
        activeToggle: {
          selector: '//span[contains(@class,"TwoOptionToggle--active")]',
          locateStrategy: 'xpath',
        },
        timeInRange: '#Stat--timeInRange',
        timeInRangeTitle: {
          selector: '//div[@id="Stat--timeInRange"]//div[contains(@class,"chartTitle")]',
          locateStrategy: 'xpath',
        },
        timeInRangeTooltip: {
          selector: '//div[@id="Stat--timeInRange"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        timeInRangeTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        timeVeryAboveRangeBar: {
          selector: '//div[@id="Stat--timeInRange"]//*[name()="g" and contains(@class, "HoverBar")][5]',
          locateStrategy: 'xpath',
        },
        timeAboveRangeBar: {
          selector: '//div[@id="Stat--timeInRange"]//*[name()="g" and contains(@class, "HoverBar")][4]',
          locateStrategy: 'xpath',
        },
        timeInRangeBar: {
          selector: '//div[@id="Stat--timeInRange"]//*[name()="g" and contains(@class, "HoverBar")][3]',
          locateStrategy: 'xpath',
        },
        timeBelowRangeBar: {
          selector: '//div[@id="Stat--timeInRange"]//*[name()="g" and contains(@class, "HoverBar")][2]',
          locateStrategy: 'xpath',
        },
        timeVeryBelowRangeBar: {
          selector: '//div[@id="Stat--timeInRange"]//*[name()="g" and contains(@class, "HoverBar")][1]',
          locateStrategy: 'xpath',
        },
        readingsInRange: '#Stat--readingsInRange',
        readingsInRangeTitle: {
          selector: '//div[@id="Stat--readingsInRange"]//div[contains(@class,"chartTitle")]',
          locateStrategy: 'xpath',
        },
        readingsInRangeTooltip: {
          selector: '//div[@id="Stat--readingsInRange"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        readingsInRangeTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        readingsVeryAboveRangeBar: {
          selector: '//div[@id="Stat--readingsInRange"]//*[name()="g" and contains(@class, "HoverBar")][5]',
          locateStrategy: 'xpath',
        },
        readingsAboveRangeBar: {
          selector: '//div[@id="Stat--readingsInRange"]//*[name()="g" and contains(@class, "HoverBar")][4]',
          locateStrategy: 'xpath',
        },
        readingsInRangeBar: {
          selector: '//div[@id="Stat--readingsInRange"]//*[name()="g" and contains(@class, "HoverBar")][3]',
          locateStrategy: 'xpath',
        },
        readingsBelowRangeBar: {
          selector: '//div[@id="Stat--readingsInRange"]//*[name()="g" and contains(@class, "HoverBar")][2]',
          locateStrategy: 'xpath',
        },
        readingsVeryBelowRangeBar: {
          selector: '//div[@id="Stat--readingsInRange"]//*[name()="g" and contains(@class, "HoverBar")][1]',
          locateStrategy: 'xpath',
        },
        averageGlucose: '#Stat--averageGlucose',
        averageGlucoseTooltip: {
          selector: '//div[@id="Stat--averageGlucose"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        averageGlucoseTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        sensorUsage: '#Stat--sensorUsage',
        sensorUsageTooltip: {
          selector: '//div[@id="Stat--sensorUsage"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        sensorUsageTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        totalInsulin: '#Stat--totalInsulin',
        totalInsulinTitle: {
          selector: '//div[@id="Stat--totalInsulin"]//div[contains(@class,"chartTitle")]',
          locateStrategy: 'xpath',
        },
        basalInsulinBar: {
          selector: '//div[@id="Stat--totalInsulin"]//*[name()="g" and contains(@class, "HoverBar")][2]',
          locateStrategy: 'xpath',
        },
        bolusInsulinBar: {
          selector: '//div[@id="Stat--totalInsulin"]//*[name()="g" and contains(@class, "HoverBar")][1]',
          locateStrategy: 'xpath',
        },
        totalInsulinTooltip: {
          selector: '//div[@id="Stat--totalInsulin"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        totalInsulinTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        averageDailyDose: '#Stat--averageDailyDose',
        averageDailyDoseTooltip: {
          selector: '//div[@id="Stat--averageDailyDose"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        averageDailyDoseTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        weight: '#weight',
        units: '#units',
        averageCarbs: '#Stat--carbs',
        averageCarbsTooltip: {
          selector: '//div[@id="Stat--carbs"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        averageCarbsTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        gmi: '#Stat--glucoseManagementIndicator',
        gmiTooltip: {
          selector: '//div[@id="Stat--glucoseManagementIndicator"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        gmiTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        cv: '#Stat--coefficientOfVariation',
        cvTooltip: {
          selector: '//div[@id="Stat--coefficientOfVariation"]//img[@alt="Hover for more info"]',
          locateStrategy: 'xpath',
        },
        cvTooltipMessage: {
          selector: '//div[contains(@class,"StatTooltip--message")]/p',
          locateStrategy: 'xpath',
        },
        tooltipMessage: 'div[class*="StatTooltip--message"]',
        filterDevices: '#deviceSelection-header',
        deviceCheckbox: {
          selector: '//div[@id="deviceSelection-content"]//label',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
        toggleBGM() {
          this.getText('@activeToggle', (result) => {
            if (result.value === 'CGM') {
              this.click('@bgmCgmToggle');
            }
            return this;
          });
        },
        toggleCGM() {
          this.getText('@activeToggle', (result) => {
            if (result.value === 'BGM') {
              this.click('@bgmCgmToggle');
            }
            return this;
          });
        },
      }],
    },
  },
};
