"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-check
const base_1 = require("@fixtures/base");
const LoginPage_1 = __importDefault(require("page-objects/LoginPage"));
const WorkspacesPage_1 = __importDefault(require("@pom/clinician/WorkspacesPage"));
const env_1 = __importDefault(require("../../utilities/env"));
const test_tags_1 = require("../fixtures/test-tags");
// make sure we don't have any cookies or origins
base_1.test.use({ storageState: { cookies: [], origins: [] } });
// Possible testcases: https://tidepool.atlassian.net/jira/software/c/projects/WEB/issues/?jql=project%20%3D%20%22WEB%22%20AND%20type%20%3D%20Test%20AND%20textfields%20~%20%22login%22%20ORDER%20BY%20created%20DESC
base_1.test.describe('Login into application', () => {
    (0, base_1.test)('should work with valid credentials for clinician with multiple clinics', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.CLINICIAN,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.SMOKE,
            test_tags_1.TEST_TAGS.CRITICAL,
        ]),
    }, async ({ page }) => {
        const loginPage = new LoginPage_1.default(page);
        await base_1.test.step('When user is logged into application', async () => {
            await loginPage.goto();
            await loginPage.login(env_1.default.CLINICIAN_USERNAME, env_1.default.CLINICIAN_PASSWORD);
        });
        await base_1.test.step('Then the user is redirected to workspaces page', async () => {
            const workspacesPage = new WorkspacesPage_1.default(page);
            await page.waitForURL(workspacesPage.url);
            await (0, base_1.expect)(workspacesPage.header).toBeVisible();
        });
    });
    (0, base_1.test)('should show error message with invalid credentials', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.CLINICIAN,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.SMOKE,
            test_tags_1.TEST_TAGS.HIGH,
        ]),
    }, async ({ page }) => {
        const loginPage = new LoginPage_1.default(page);
        await base_1.test.step('When user attempts to login with invalid credentials', async () => {
            await loginPage.goto();
            // Enter email
            await page.fill('#username', 'invalid@email.com');
            await page.click('#kc-login');
        });
        await base_1.test.step('Then error message should be displayed', async () => {
            // Wait for the error message to appear
            await (0, base_1.expect)(page.locator('#input-error-username')).toBeVisible();
            await (0, base_1.expect)(page.locator('#input-error-username')).toContainText("This email doesn't belong to an account yet.");
        });
    });
    (0, base_1.test)('should validate email format', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.CLINICIAN,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.REGRESSION,
            test_tags_1.TEST_TAGS.MEDIUM,
        ]),
    }, async ({ page }) => {
        const loginPage = new LoginPage_1.default(page);
        await base_1.test.step('When user attempts to login with invalid email format', async () => {
            await loginPage.goto();
            // Enter invalid email format
            await page.fill('#username', 'invalidemail');
            await page.click('#kc-login');
        });
        await base_1.test.step('Then email validation error should be displayed', async () => {
            // Check for email validation error message
            await (0, base_1.expect)(page.locator('#input-error-username')).toBeVisible();
            await (0, base_1.expect)(page.locator('#input-error-username')).toContainText("This email doesn't belong to an account yet.");
        });
    });
    (0, base_1.test)('should show error message with invalid credentials 1', {
        tag: (0, test_tags_1.createValidatedTags)([
            test_tags_1.TEST_TAGS.CLINICIAN,
            test_tags_1.TEST_TAGS.UI,
            test_tags_1.TEST_TAGS.SMOKE,
            test_tags_1.TEST_TAGS.HIGH,
        ]),
    }, async ({ page }) => {
        const loginPage = new LoginPage_1.default(page);
        await base_1.test.step('When user is logged into application', async () => {
            await loginPage.goto();
            await loginPage.login(env_1.default.CLINICIAN_USERNAME, `${env_1.default.CLINICIAN_PASSWORD}1`);
        });
        await base_1.test.step('Then error message should be displayed', async () => {
            await (0, base_1.expect)(page.locator('#input-error')).toBeVisible();
            await (0, base_1.expect)(page.locator('#input-error')).toContainText('Invalid password.');
        });
    });
});
