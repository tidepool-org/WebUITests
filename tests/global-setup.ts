import { chromium, FullConfig } from '@playwright/test';
import LoginPage from '@pom/LoginPage';
import fs from 'node:fs';
import path from 'node:path';
import env from '../utilities/env';

async function loginUserType(role: 'personal' | 'claimed' | 'shared' | 'clinician') {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL,
  });
  const page = await context.newPage();
  await page.goto(env.BASE_URL);
  const loginPage = new LoginPage(page);
  if (role === 'personal') {
    await loginPage.login(env.PERSONAL_USERNAME, env.PERSONAL_PASSWORD);
    await page.waitForURL('**/data');
  } else if (role === 'claimed') {
    await loginPage.login(env.CLAIMED_USERNAME, env.CLAIMED_PASSWORD);
    await page.waitForURL('**/data');
  } else if (role === 'shared') {
    await loginPage.login(env.SHARED_USERNAME, env.SHARED_PASSWORD);
    await page.waitForURL('**/data');
  } else {
    await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
    await page.waitForURL('**/workspaces');
  }

  const authDir = path.resolve(process.cwd(), 'tests', '.auth');
  await fs.promises.mkdir(authDir, { recursive: true });
  const filePath = path.join(authDir, `${role}.json`);
  await context.storageState({ path: filePath });

  await browser.close();
}

export default async function globalSetup(_config: FullConfig) {
  await loginUserType('personal');
  await loginUserType('claimed');
  await loginUserType('shared');
  await loginUserType('clinician');
}
