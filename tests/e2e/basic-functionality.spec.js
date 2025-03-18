// @ts-check
import { expect, test } from "@playwright/test";

import LoginPage from "../../pageobjects/pages/login.page";
import PatientDataDailyPage from "../../pageobjects/pages/patients/[id]/data/daily/page";
import PatientDataPage from "../../pageobjects/pages/patients/[id]/data/page";
import env from "../../utilities/env";

test.describe("Basic functionality of the application", () => {
  test.beforeEach(async ({ page }) => {
    await test.step("Given user has been logged in", async () => {
      page.setViewportSize({ width: 1920, height: 1080 });
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(env.DSA_USERNAME_TANDEM, env.DSA_PASSWORD_TANDEM);
    });
  });

  test("User should be able to navigate to daily chart and see the correct date and chart", async ({
    page,
  }) => {
    const patientDataPage = new PatientDataPage(page);
    const patientDataDailyPage = new PatientDataDailyPage(page);

    await test.step("When the navigation bar is visible", async () => {
      await patientDataPage.navigationBar.buttons.viewData.waitFor({
        state: "visible",
      });
    });

    let clickedDayString;

    await test.step("When the user clicks on the most recent day", async () => {
      const day = patientDataPage.calendarDayMostRecentBgReading;

      await day.waitFor({ state: "visible" });
      await day.hover();
      clickedDayString = await patientDataPage.calendarDayHover.text();
      await patientDataPage.calendarDayHover.el.click();
    });

    await test.step("Then the daily chart is visible and correctly rendered", async () => {
      await patientDataDailyPage.dailyChart.container.waitFor({
        state: "visible",
      });

      // assert that the current date is the clicked day

      // screenshot the daily chart
      await expect(patientDataDailyPage.dailyChart.container).toHaveScreenshot(
        "daily-chart.png"
      );
    });

    await test.step("Then the current date is correctly displayed in submenu", async () => {
      await expect(
        patientDataDailyPage.navigationSubMenu.currentDate
      ).toContainText(clickedDayString);
    });
  });
});
