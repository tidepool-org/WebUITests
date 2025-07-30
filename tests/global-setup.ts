import { chromium, FullConfig } from '@playwright/test';
import LoginPage from '@pom/LoginPage';
import fs from 'fs';
import path from 'path';
import env from '../utilities/env';


async function loginUserType(role: 'patient' | 'clinician') {
  const browser = await chromium.launch();
   const context = await browser.newContext({
    baseURL: process.env.BASE_URL,
  });
  const page = await context.newPage();
  await page.goto(env.BASE_URL);
  const loginPage = new LoginPage(page);
if (role === 'patient') {
    await loginPage.login(env.PATIENT_USERNAME, env.PATIENT_PASSWORD);
    await page.waitForURL('**/data');
  } else {
    await loginPage.login(env.CLINICIAN_USERNAME, env.CLINICIAN_PASSWORD);
    await page.waitForURL('**/workspaces');
  }

  const authDir = path.resolve(process.cwd(), 'tests', '.auth');
  fs.mkdirSync(authDir, { recursive: true });
  const filePath = path.join(authDir, `${role}.json`);
  await context.storageState({ path: filePath });

  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  await loginUserType('patient');
  await loginUserType('clinician');
}
