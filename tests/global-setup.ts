import { chromium, FullConfig } from '@playwright/test';
import LoginPage from '@pom/LoginPage';
import fs from 'node:fs';
import path from 'node:path';
import env from '../utilities/env';

async function loginUserType(role: 'personal' | 'claimed' | 'shared' | 'clinician') {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: env.BASE_URL,
  });
  const page = await context.newPage();

  try {
    console.log(`\n🔐 Authenticating ${role} user on ${env.BASE_URL}...`);
    await page.goto(env.BASE_URL);
    const loginPage = new LoginPage(page);

    let username: string;
    let password: string;
    let expectedURL: string;

    if (role === 'personal') {
      username = env.PERSONAL_USERNAME;
      password = env.PERSONAL_PASSWORD;
      expectedURL = '**/data';
    } else if (role === 'claimed') {
      username = env.CLAIMED_USERNAME;
      password = env.CLAIMED_PASSWORD;
      expectedURL = '**/data';
    } else if (role === 'shared') {
      username = env.SHARED_USERNAME;
      password = env.SHARED_PASSWORD;
      expectedURL = '**/data';
    } else {
      username = env.CLINICIAN_USERNAME;
      password = env.CLINICIAN_PASSWORD;
      expectedURL = '**/workspaces';
    }

    await loginPage.login(username, password);
    await page.waitForURL(expectedURL, { timeout: 15000 });

    const authDir = path.resolve(process.cwd(), 'tests', '.auth');
    await fs.promises.mkdir(authDir, { recursive: true });
    const filePath = path.join(authDir, `${role}.json`);
    await context.storageState({ path: filePath });

    console.log(`✅ ${role} authentication successful`);
  } catch (error) {
    console.error(`\n❌ GLOBAL SETUP FAILED: Unable to authenticate ${role} user`);
    console.error(`\nPossible causes:`);
    console.error(`  1. Invalid credentials for ${role} user`);
    console.error(`  2. Wrong environment (currently: ${env.TARGET_ENV} -> ${env.BASE_URL})`);
    console.error(`  3. User account doesn't exist on this environment`);
    console.error(`  4. Network issues or environment is down`);
    console.error(`\nPlease verify:`);
    console.error(`  - TARGET_ENV in .env file is set to the correct environment`);
    console.error(`  - Credentials in .env file match the environment`);
    console.error(`  - The ${env.BASE_URL} environment is accessible\n`);

    await browser.close();
    throw new Error(
      `Global setup failed: Could not authenticate ${role} user. Check credentials and environment configuration.`,
    );
  }

  await browser.close();
}

export default async function globalSetup(_config: FullConfig) {
  await loginUserType('personal');
  await loginUserType('claimed');
  await loginUserType('shared');
  await loginUserType('clinician');
}
