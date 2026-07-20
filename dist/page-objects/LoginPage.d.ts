import { Locator, Page } from '@playwright/test';
/**
 * @class
 * @property {Page} page
 * @property {Locator} emailInput
 * @property {Locator} nextButton
 * @property {Locator} passwordInput
 * @property {Locator} loginButton
 */
export default class LoginPage {
    page: Page;
    emailInput: Locator;
    nextButton: Locator;
    passwordInput: Locator;
    loginButton: Locator;
    /**
     * @param {Page} page
     */
    constructor(page: Page);
    /**
     * Navigate to the login page
     * @returns {Promise<void>}
     */
    goto(): Promise<void>;
    /**
     * Login to the application
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<void>}
     */
    login(email: string, password: string): Promise<void>;
}
