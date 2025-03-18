import { test as base } from "@playwright/test";
import LoginPage from "../../pageobjects/pages/login.page";
import PatientDataDailyPage from "../../pageobjects/pages/patients/[id]/data/daily/page";
import PatientDataPage from "../../pageobjects/pages/patients/[id]/data/page";

/**
 * @typedef {import('@playwright/test').TestFixture} TestFixture
 */

/**
 * @typedef {Object} CustomFixtures
 * @property {LoginPage} loginPage
 * @property {PatientDataPage} patientDataPage
 * @property {PatientDataDailyPage} patientDataDailyPage
 */

/**
 * @typedef {TestFixture & CustomFixtures} Test
 */

/** @type {Test} */
const test = base.extend({
  // todoPage: async ({ page }, use) => {
  //   // Set up the fixture.
  //   const todoPage = new TodoPage(page);
  //   await todoPage.goto();
  //   await todoPage.addToDo('item1');
  //   await todoPage.addToDo('item2');

  //   // Use the fixture value in the test.
  //   await use(todoPage);

  //   // Clean up the fixture.
  //   await todoPage.removeAll();
  // },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  patientDataPage: async ({ page }, use) => {
    await use(new PatientDataPage(page));
  },
  patientDataDailyPage: async ({ page }, use) => {
    await use(new PatientDataDailyPage(page));
  },
});

export { expect, test } from "@playwright/test";
