import { test as setup } from "@playwright/test";
import LoginPage from "@pom/pages/login.page";
import PatientDataBasicsPage from "@pom/pages/patients/[id]/data/basics/page";
import WorkspacesPage from "@pom/pages/workspaces/page";
import path from "path";
import env from "../../utilities/env";

// Use process.cwd() to ensure we're using the correct root directory
const authFile = path.join(process.cwd(), "playwright", ".auth", "user.json");
const clinicianAuthFile = path.join(process.cwd(), "playwright", ".auth", "clinician.json");

setup("authenticate", async ({ page }) => {
  console.log("=======================");
  console.log("👉 Authenticating user [auth.setup.js]");
  console.log("=======================");
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

setup("authenticate as clinician", async ({ page }) => {
  console.log("=======================");
  console.log("👉 Authenticating clinician [auth.setup.js]");
  console.log("=======================");
  const loginPage = new LoginPage(page);
  const workspacesPage = new WorkspacesPage(page);

  await setup.step("When user is logged into application", async () => {
    await loginPage.goto();
    await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
  });

  // Wait for the workspaces page to load after login
  await setup.step("Then the user is redirected to workspaces page", async () => {
    await page.waitForURL(workspacesPage.url);
    await workspacesPage.header.waitFor({ state: "visible" });
  });

  await page.context().storageState({ path: clinicianAuthFile });
});
