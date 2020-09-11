# Nightwatch + Browserstack UI Tests
The home of Tidepool UI testing with nightwatch/browser stack combination

## Background Information

### Nightwatch
Nightwatch is a Node.js end to end testing solution using the W3C Webdriver API. See the documentation here: https://nightwatchjs.org/#

### Browserstack
BrowserStack is a cloud web and mobile testing platform that enables developers to test their websites and mobile applications across on-demand browsers, operating systems and real mobile devices, without requiring users to install or maintain an internal lab of virtual machines, devices or emulators. Learn more here: https://www.browserstack.com/

### Page Objects
The tests here use page objects. This means that frequently used UI elements and actions are mapped out in an appropriately named page objects file and imported into the test files to run tests. This means the test themselves can remain relatively unchanged and, if there is a change to an element that's causing a test to fail (selector/text/ect), it can be updated in the corresponding page object file without having to navigate through and rewrite every single test that uses said element. If you'd like to learn more about page objects... https://martinfowler.com/bliki/PageObject.html

## Testing Locally (with Browserstack)

- Clone this Repo and install dev dependencies
- Create a .env file containing:

      BROWSERSTACK_USER=<browserstack username>
      BROWSERSTACK_KEY=<browserstack key>
      DSA_USERNAME=<username for valis non-clinician account>
      DSA_PASSWORD=<password for valid non-clinician account>
    
- run `npm test`

## Testing Locally (without Browserstack)
The nightwatch tests can be run without using the browserstack service. You will, however, need to install selenium and the appropriate web driver dependencies for the browsers you wish to test as well as update the `nightwatch.conf.js` to use these dependencies instead of browserstack. There's really no reason to do this.
