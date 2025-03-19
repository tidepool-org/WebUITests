import { test as setup } from "@playwright/test";
import path from "path";
import LoginPage from "../../pageobjects/pages/login.page";
import PatientDataBasicsPage from "../../pageobjects/pages/patients/[id]/data/basics/page";
import env from "../../utilities/env";

// Use process.cwd() to ensure we're using the correct root directory
const authFile = path.join(process.cwd(), "playwright", ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  console.log("👉 Authenticating user");
  const loginPage = new LoginPage(page);
  const basicsPage = new PatientDataBasicsPage(page);

  await setup.step("When user is logged into application", async () => {
    await loginPage.goto();
    await loginPage.login(env.DSA_USERNAME_TANDEM, env.DSA_PASSWORD_TANDEM);
  });

  await basicsPage.navigationBar.buttons.viewData.waitFor({
    state: "visible",
  });

  await page.context().storageState({ path: authFile });
});
