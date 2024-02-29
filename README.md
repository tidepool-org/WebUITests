
# Nightwatch + Browserstack UI Tests
The home of Tidepool UI testing with nightwatch/browser stack combination

## Background Information
### Nightwatch
Nightwatch is a Node.js end to end testing solution using the W3C Webdriver API. See the documentation here: https://nightwatchjs.org/#

### Browserstack
BrowserStack is a cloud web and mobile testing platform that enables developers to test their websites and mobile applications across on-demand browsers, operating systems and real mobile devices, without requiring users to install or maintain an internal lab of virtual machines, devices or emulators. Learn more here: https://www.browserstack.com/

## Setup
### Local

 1. Clone this repo

 2.  `npm install`

 3. Create a `.env` file containing:
 
    ```
    BROWSERSTACK_USER=<browserstack  username>
    
    BROWSERSTACK_KEY=<browserstack  key>
    
    DSA_USERNAME_TANDEM=<username  for  valid  non-clinician  account  using  tandem  data>
    
    DSA_PASSWORD_TANDEM=<password  for  valid  non-clinician  account  using  tandem  data>
    
    TEST_EXECUTION_KEY=none
    ```

4. run `npm testAll` to test all setup environments (qa1, qa2, prd) on all browsers (chrome, edge).

5. run `npm run test<env><Browser>` to test an environment with a given browser. i.e `npm run testqa1Chrome` It is case sensitive.

  

### JIRA
1. Navigate to the desired JIRA issue you wish to run the tests on.

2. Click on "Actions" underneath the issue status.

3. Choose "Trigger Web UI Automated Test Cases".

4. The test will run on their own. A test execution will be automatically created and linked to the issue that you used the action on with the relation of "tested by". The test results and their video evidence will automatically populate within the test execution with 10 minutes.

  

## Development
### Page Object theory
The tests here use page objects. This means that frequently used UI elements and actions are mapped out in an appropriately named page objects file and imported into the test files to run tests. This means the test themselves can remain relatively unchanged and, if there is a change to an element that's causing a test to fail (selector/text/ect), it can be updated in the corresponding page object file without having to navigate through and rewrite every single test that uses said element. If you'd like to learn more about page objects... https://martinfowler.com/bliki/PageObject.html

Here's an example of a partial page object:
```
module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
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
        mostRecentDay: {
          selector: '//div[contains(@class,"Calendar-day--fingersticks") and contains(@class, "Calendar-day-most-recent")]',
          locateStrategy: 'xpath',
        },
        dayHover: {
          selector: '//div[contains(@class,"Calendar-day--HOVER")]//*[@class="Calendar-weekday"]',
          locateStrategy: 'xpath',
        },
      },
   
 {...}
```
and how it's used within a test
```
'BG readings dashboard functionality'(browser) {
    const basics = browser.page.basicsPage();
    const daily = browser.page.dailyPage();
    const dailyViewDay = daily.section.dailyViewDay;
    const bgDashboard = basics.section.bgDashboard;
    const common = browser.page.commonElementsPage();
    const patientData = common.section.patientData;
    
    bgDashboard.waitForElementVisible('@title', browser.globals.elementTimeout);
    bgDashboard.getLocationInView('@bottomOfDashboard');
    bgDashboard.moveToElement('@mostRecentDay', 0, 0);
    bgDashboard.waitForElementVisible('@dayHover', browser.globals.elementTimeout);
    bgDashboard.getText('@dayHover', ((result) => {
      const day = result.value;
```
### Helpful functions
A login function (for any type of user) is available by loading the login page object. A common way to enter the application is:

```
const loginPage = browser.page.loginPage();
const dsaUsername = browser.globals.dsaUsernameTandem;
const dsaPassword = browser.globals.dsaPasswordTandem;

loginPage.loadPage();
loginPage.userLogin(dsaUsername, dsaPassword);
```
  

Loading data view pages is also available as a function with the paramater of which data view function you're trying to load and includes and implicit wait to make sure the page is loaded before you attempt to click anything on it. An example of it's use is here:
```
`'log in and navigate to basics page'(browser) {

const loginPage = browser.page.loginPage();
const common = browser.page.commonElementsPage();
const patientData = common.section.patientData;
const dsaUsername = browser.globals.dsaUsernameTandem;
const dsaPassword = browser.globals.dsaPasswordTandem;

loginPage.loadPage();
loginPage.userLogin(dsaUsername, dsaPassword);
patientData.loadView('basics'); }`
```