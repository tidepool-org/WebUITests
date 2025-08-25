"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const test_1 = require("@playwright/test");
const LoginPage_1 = __importDefault(require("@pom/LoginPage"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const env_1 = __importDefault(require("../utilities/env"));
async function loginUserType(role) {
    const browser = await test_1.chromium.launch();
    const context = await browser.newContext({
        baseURL: process.env.BASE_URL,
    });
    const page = await context.newPage();
    await page.goto(env_1.default.BASE_URL);
    const loginPage = new LoginPage_1.default(page);
    if (role === 'personal') {
        await loginPage.login(env_1.default.PERSONAL_USERNAME, env_1.default.PERSONAL_PASSWORD);
        await page.waitForURL('**/data');
    }
    else if (role === 'claimed') {
        await loginPage.login(env_1.default.CLAIMED_USERNAME, env_1.default.CLAIMED_PASSWORD);
        await page.waitForURL('**/data');
    }
    else if (role === 'shared') {
        await loginPage.login(env_1.default.SHARED_USERNAME, env_1.default.SHARED_PASSWORD);
        await page.waitForURL('**/data');
    }
    else {
        await loginPage.login(env_1.default.CLINICIAN_USERNAME, env_1.default.CLINICIAN_PASSWORD);
        await page.waitForURL('**/workspaces');
    }
    const authDir = node_path_1.default.resolve(process.cwd(), 'tests', '.auth');
    await node_fs_1.default.promises.mkdir(authDir, { recursive: true });
    const filePath = node_path_1.default.join(authDir, `${role}.json`);
    await context.storageState({ path: filePath });
    await browser.close();
}
async function globalSetup(_config) {
    await loginUserType('personal');
    await loginUserType('claimed');
    await loginUserType('shared');
    await loginUserType('clinician');
}
