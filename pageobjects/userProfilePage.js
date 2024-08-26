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
        dob: {
          selector: '//input[@id="birthday"]',
          locateStrategy: 'xpath',
        },
        diagnosisDate: {
          selector: '//input[@id="diagnosisDate"]',
          locateStrategy: 'xpath',
        },
        diagnosisType: {
          selector: '//select[@id="diagnosisType"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeOptionType1: {
          selector: '//option[@value="type1"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeOptionType2: {
          selector: '//option[@value="type2"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeGestational: {
          selector: '//option[@value="gestational"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypePrediabetes: {
          selector: '//option[@value="prediabetes"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeLada: {
          selector: '//option[@value="lada"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeMody: {
          selector: '//option[@value="mody"]',
          locateStrategy: 'xpath',
        },
        diagnosisTypeOther: {
          selector: '//option[@value="other"]',
          locateStrategy: 'xpath',
        },
        mrn: {
          selector: '//input[@id="mrn"]',
          locateStrategy: 'xpath',
        },
        email: {
          selector: '//input[@id="email"]',
          locateStrategy: 'xpath',
        },
        bio: {
          selector: '//textarea[@class="PatientInfo-input"]',
          locateStrategy: 'xpath',
        },
        profile: {
          selector: '//div[@class="patientcard-fullname"]',
          locateStrategy: 'xpath',
        },
        edit: {
          selector: '//button[text()="Edit"]',
          locateStrategy: 'xpath',
        },
        save: {
          selector: '//button[text()="Save changes"]',
          locateStrategy: 'xpath',
        },
        patientInfoDiagnosed: {
          selector: '//div[@class="PatientInfo-block" and contains(text(),"Diagnosed")]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
        selectDiagnosesAs(diagnosisType) {
          return this
            .waitForElementVisible('@edit', browser.globals.elementTimeout)
            .click('@edit')
            .click('@diagnosisType')
            .click(diagnosisType)
            .click('@save')
            .waitForElementVisible('@patientInfoDiagnosed', browser.globals.elementTimeout)
            .click('@edit');
        },
      }],
    },
    targetRange: {
      selector: '#app',
      elements: {
        increaseLow: {
          selector: '//*[@class="IncrementalInput IncrementalInput--low"]//*[@class="IncrementalInputArrow IncrementalInputArrow--increase"]',
          locateStrategy: 'xpath',
        },
        decreaseLow: {
          selector: '//*[@class="IncrementalInput IncrementalInput--low"]//*[@class="IncrementalInputArrow IncrementalInputArrow--decrease"]',
          locateStrategy: 'xpath',
        },
        increaseHigh: {
          selector: '//*[@class="IncrementalInput IncrementalInput--high"]//*[@class="IncrementalInputArrow IncrementalInputArrow--increase"]',
          locateStrategy: 'xpath',
        },
        decreaseHigh: {
          selector: '//*[@class="IncrementalInput IncrementalInput--high"]//*[@class="IncrementalInputArrow IncrementalInputArrow--decrease"]',
          locateStrategy: 'xpath',
        },
        low: {
          selector: '//*[@class="IncrementalInput IncrementalInput--low"]//span',
          locateStrategy: 'xpath',
        },
        high: {
          selector: '//*[@class="IncrementalInput IncrementalInput--high"]//span',
          locateStrategy: 'xpath',
        },
        reset: {
          selector: '//*[@class="PatientSettings-reset"]',
          locateStrategy: 'xpath',
        },

      },
    },
    units: {
      selector: '#app',
      elements: {
        mgdl: {
          selector: '//input[@id="bgUnits0"]',
          locateStrategy: 'xpath',
        },
        mmoll: {
          selector: '//input[@id="bgUnits1"]',
          locateStrategy: 'xpath',
        },

      },
    },

  },
  commands: [{
  }],
};
