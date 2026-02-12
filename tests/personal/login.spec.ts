// @ts-check
import { expect, test } from '@fixtures/base';
import LoginPage from 'page-objects/LoginPage';
import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import env from '../../utilities/env';

// make sure we don't have any cookies or origins
test.use({ storageState: { cookies: [], origins: [] } });

// Possible testcases: https://tidepool.atlassian.net/jira/software/c/projects/WEB/issues/?jql=project%20%3D%20%22WEB%22%20AND%20type%20%3D%20Test%20AND%20textfields%20~%20%22login%22%20ORDER%20BY%20created%20DESC
test.describe('Login into application', () => {
  test(
    'should work with valid credentials for clinician with multiple clinics',
    {
      tag: createValidatedTags([TEST_TAGS.CLINICIAN, TEST_TAGS.UI, TEST_TAGS.PRIORITY_HIGH]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await test.step('When user is logged into application', async () => {
        await loginPage.goto();
        await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
      });
      await test.step('Then the user is redirected to workspaces page', async () => {
        const workspacesPage = new WorkspacesPage(page);
        await page.waitForURL(workspacesPage.url);

        await expect(workspacesPage.header).toBeVisible();
      });
    },
  );

  test(
    'should show error message with invalid credentials',
    {
      tag: createValidatedTags([TEST_TAGS.PATIENT, TEST_TAGS.UI, TEST_TAGS.PRIORITY_MEDIUM]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step('When user attempts to login with invalid username', async () => {
        await loginPage.goto();

        // Enter email
        await page.fill('#username', 'invalid@email.com');
        await page.click('#kc-login');
      });
      await test.step('Then error message should be displayed', async () => {
        // Wait for the error message to appear
        await expect(page.locator('#input-error-username')).toBeVisible();
        await expect(page.locator('#input-error-username')).toContainText(
          "This email doesn't belong to an account yet.",
        );
      });
    },
  );

  test(
    'should validate email format',
    {
      tag: createValidatedTags([TEST_TAGS.PATIENT, TEST_TAGS.UI, TEST_TAGS.PRIORITY_MEDIUM]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step('When user attempts to login with unrecognized email', async () => {
        await loginPage.goto();

        // Enter unrecognized email
        await page.fill('#username', 'invalidemail');
        await page.click('#kc-login');
      });

      await test.step('Then email validation error should be displayed', async () => {
        // Check for email validation error message
        await expect(page.locator('#input-error-username')).toBeVisible();
        await expect(page.locator('#input-error-username')).toContainText(
          "This email doesn't belong to an account yet.",
        );
      });
    },
  );

  test(
    'should show error message with invalid password',
    {
      tag: createValidatedTags([TEST_TAGS.PATIENT, TEST_TAGS.UI, TEST_TAGS.PRIORITY_MEDIUM]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step('When user is logged into application', async () => {
        await loginPage.goto();
        await loginPage.login(env.CLINICIAN_USERNAME, `${env.CLINICIAN_PASSWORD}1`);
      });

      await test.step('Then error message should be displayed', async () => {
        await expect(page.locator('#input-error')).toBeVisible();
        await expect(page.locator('#input-error')).toContainText('Invalid password.');
      });
    },
  );
});
