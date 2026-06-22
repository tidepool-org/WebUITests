// @ts-check
import { expect, test } from '@fixtures/base';
import LoginPage from 'page-objects/LoginPage';
import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import env from '../../utilities/env';
import { TEST_TAGS, createValidatedTags } from '../fixtures/test-tags';

// make sure we don't have any cookies or origins
test.use({ storageState: { cookies: [], origins: [] } });

// Possible testcases: https://tidepool.atlassian.net/jira/software/c/projects/WEB/issues/?jql=project%20%3D%20%22WEB%22%20AND%20type%20%3D%20Test%20AND%20textfields%20~%20%22login%22%20ORDER%20BY%20created%20DESC
test.describe('Login into application', () => {
  test(
    'Login - Valid credentials',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.CRITICAL,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step(
        'When user is logged into application',
        async () => {
          await loginPage.goto();
          await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
        },
        {
          detail:
            'Open the Tidepool Web login page and sign in using the automated clinician account credentials stored in 1Password.',
        },
      );

      await test.step(
        'Then the user is redirected to workspaces page',
        async () => {
          const workspacesPage = new WorkspacesPage(page);
          await page.waitForURL(workspacesPage.url);

          await expect(workspacesPage.header).toBeVisible();
        },
        {
          detail:
            'Confirm the browser lands on the workspaces page and the workspaces header is shown.',
        },
      );
    },
  );

  test(
    'Login - Invalid credentials',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.HIGH,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step(
        'When user attempts to login with invalid username',
        async () => {
          await loginPage.goto();

          // Enter email
          await page.fill('#username', 'invalid@email.com');
          await page.click('#kc-login');
        },
        {
          detail:
            'Open the login page, enter an email address that has no account, and submit the login form.',
        },
      );

      await test.step(
        'Then error message should be displayed',
        async () => {
          // Wait for the error message to appear
          await expect(page.locator('#input-error-username')).toBeVisible();
          await expect(page.locator('#input-error-username')).toContainText(
            "This email doesn't belong to an account yet.",
          );
        },
        {
          detail:
            'Confirm an error appears under the username field stating that the email does not belong to an account yet.',
        },
      );
    },
  );

  test(
    'Login - Validate email format',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.REGRESSION,
        TEST_TAGS.MEDIUM,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step(
        'When user attempts to login with unrecognized email',
        async () => {
          await loginPage.goto();

          // Enter unrecognized email
          await page.fill('#username', 'invalidemail');
          await page.click('#kc-login');
        },
        {
          detail:
            'Open the login page, type a value that is not a valid email format into the username field, and submit the login form.',
        },
      );

      await test.step(
        'Then email validation error should be displayed',
        async () => {
          // Check for email validation error message
          await expect(page.locator('#input-error-username')).toBeVisible();
          await expect(page.locator('#input-error-username')).toContainText(
            "This email doesn't belong to an account yet.",
          );
        },
        {
          detail:
            'Confirm a validation error is shown under the username field indicating the email is not recognized.',
        },
      );
    },
  );

  test(
    'Login - Invalid password message displays',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.HIGH,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await test.step(
        'When user is logged into application',
        async () => {
          await loginPage.goto();
          await loginPage.login(env.CLINICIAN_USERNAME, `${env.CLINICIAN_PASSWORD}1`);
        },
        {
          detail:
            'Open the login page and sign in using the automated clinician account username from 1Password together with an incorrect password.',
        },
      );

      await test.step(
        'Then error message should be displayed',
        async () => {
          await expect(page.locator('#input-error')).toBeVisible();
          await expect(page.locator('#input-error')).toContainText('Invalid password.');
        },
        {
          detail:
            'Confirm an error message reading "Invalid password." is displayed on the login form.',
        },
      );
    },
  );
});
