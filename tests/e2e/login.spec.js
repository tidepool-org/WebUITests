// @ts-check
import { expect, test } from "../fixtures/base";
import LoginPage from "../../pageobjects/pages/login.page";
import WorkspacesPage from "../../pageobjects/pages/workspaces/page";
import env from "../../utilities/env";

// make sure we don't have any cookies or origins
test.use({ storageState: { cookies: [], origins: [] } });

//Possible testcases: https://tidepool.atlassian.net/jira/software/c/projects/WEB/issues/?jql=project%20%3D%20%22WEB%22%20AND%20type%20%3D%20Test%20AND%20textfields%20~%20%22login%22%20ORDER%20BY%20created%20DESC
test.describe("Login into application", () => {
  test("should work with valid credentials for clinician with multiple clinics", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("When user is logged into application", async () => {
      await loginPage.goto();
      await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
    });

    await test.step("Then the user is redirected to workspaces page", async () => {
      const workspacesPage = new WorkspacesPage(page);
      await page.waitForURL(workspacesPage.url);

      await expect(workspacesPage.header).toBeVisible();
    });
  });
});
