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
    'Clinician - Login - Valid credentials',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.CRITICAL,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Open the login page
      await test.step(
        'Given the user is on the login page',
        async () => {
          await loginPage.goto();
        },
        {
          detail: 'Open the Tidepool Web login page (redirects to the hosted login screen).',
        },
      );

      // Step 2: Sign in with valid credentials
      await test.step(
        'When the user signs in with valid clinician credentials',
        async () => {
          await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
        },
        {
          detail:
            'Enter the automated clinician account credentials stored in 1Password as "UI Auto Clinician" and submit the login form.',
        },
      );

      // Step 3: Confirm redirect to the workspaces page
      await test.step(
        'Then the user is redirected to the workspaces page',
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
    'Clinician - Login - Invalid credentials',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.HIGH,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Open the login page
      await test.step(
        'Given the user is on the login page',
        async () => {
          await loginPage.goto();
        },
        {
          detail: 'Open the Tidepool Web login page (redirects to the hosted login screen).',
        },
      );

      // Step 2: Submit an email that has no account
      await test.step(
        'When the user submits an email that has no account',
        async () => {
          await loginPage.usernameInput.fill('invalid@email.com');
          await loginPage.submitButton.click();
        },
        {
          detail: 'Enter an email address that has no account and submit the login form.',
        },
      );

      // Step 3: Confirm the no-account error
      await test.step(
        'Then an error states the email does not belong to an account',
        async () => {
          await expect(loginPage.usernameError).toBeVisible();
          await expect(loginPage.usernameError).toContainText(
            "This email doesn't belong to an account yet.",
          );
        },
        {
          detail:
            'Confirm an error appears under the email field reading "This email doesn\'t belong to an account yet.".',
        },
      );
    },
  );

  test(
    'Clinician - Login - Validate email format',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.REGRESSION,
        TEST_TAGS.MEDIUM,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Open the login page
      await test.step(
        'Given the user is on the login page',
        async () => {
          await loginPage.goto();
        },
        {
          detail: 'Open the Tidepool Web login page (redirects to the hosted login screen).',
        },
      );

      // Step 2: Submit a value that is not a valid email
      await test.step(
        'When the user submits a value that is not a valid email',
        async () => {
          await loginPage.usernameInput.fill('invalidemail');
          await loginPage.submitButton.click();
        },
        {
          detail:
            'Type a value that is not a valid email format into the email field and submit the login form.',
        },
      );

      // Step 3: Confirm the no-account error
      await test.step(
        'Then an error states the email does not belong to an account',
        async () => {
          await expect(loginPage.usernameError).toBeVisible();
          await expect(loginPage.usernameError).toContainText(
            "This email doesn't belong to an account yet.",
          );
        },
        {
          detail:
            'Confirm an error appears under the email field reading "This email doesn\'t belong to an account yet.".',
        },
      );
    },
  );

  test(
    'Clinician - Login - Invalid password message displays',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.SMOKE,
        TEST_TAGS.HIGH,
      ]),
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Open the login page
      await test.step(
        'Given the user is on the login page',
        async () => {
          await loginPage.goto();
        },
        {
          detail: 'Open the Tidepool Web login page (redirects to the hosted login screen).',
        },
      );

      // Step 2: Sign in with a valid username but an invalid password
      await test.step(
        'When the user signs in with an invalid password',
        async () => {
          await loginPage.login(env.CLINICIAN_USERNAME, `${env.CLINICIAN_PASSWORD}1`);
        },
        {
          detail:
            'Enter the automated clinician account username from 1Password ("UI Auto Clinician") with an incorrect password and submit the login form.',
        },
      );

      // Step 3: Confirm the invalid-credentials error below the password field
      await test.step(
        'Then an "Invalid username or password." error is shown below the password field',
        async () => {
          await expect(loginPage.passwordError).toBeVisible();
          await expect(loginPage.passwordError).toContainText('Invalid username or password.');
        },
        {
          detail:
            'Confirm an error reading "Invalid username or password." is displayed below the password field.',
        },
      );
    },
  );
});
