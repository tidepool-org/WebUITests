import { expect, test } from '@fixtures/base';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import LoginPage from '@pom/LoginPage';
import SignUpPage from '@pom/SignUpPage';
import ClinicianOnboardingPage from '@pom/clinician/ClinicianOnboardingPage';
import ClinicWorkspacePage from '@pom/clinician/ClinicWorkspacePage';
import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import { getLatestKeycloakEmail } from '../../utilities/mail';
import { newAccountEmail } from '../../utilities/account';
import { saveAccount, storageStateFor } from '../../utilities/account-store';

/**
 * Create Account - Clinician
 *
 * Registers a brand-new clinician account through Keycloak signup, verifies it via the emailed
 * link (read over IMAP), then completes clinician onboarding: name + role, and a new clinic
 * workspace. Produces the `clinician` account for the claimed chain to depend on.
 *
 * Flow (discovered on qa2, 2026-09-21):
 *   Sign Up → "Clinician Account" → registration (email/password + inline terms) → "Create
 *   Account" → verification email → follow link → /clinic-details/profile (name + role) → Next
 *   → /clinic-details/new (clinic workspace form) → "Create Workspace" → Clinic Workspace page
 *   lists the new clinic.
 */

const PASSWORD = 'CreateAccountPassword';
const FIRST_NAME = 'Test';
const LAST_NAME = 'Clinician';
const ROLE = 'Clinic Manager';
const CLINIC = {
  name: 'New Clinic',
  clinicType: 'Provider Practice',
  country: 'United States of America',
  state: 'California',
  address: '1234 Test Ave',
  city: 'Phonyville',
  postalCode: '12341',
  website: 'https://tidepool.org',
  bgUnits: 'mg/dL',
};

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Create Account - Clinician', () => {
  test(
    'Create Account - Clinician',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.BACK_KEYCLOAK,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }, testInfo) => {
      test.setTimeout(180_000); // email delivery polling can take ~90s

      const loginPage = new LoginPage(page);
      const signUpPage = new SignUpPage(page);
      const onboarding = new ClinicianOnboardingPage(page);
      const workspaceForm = new ClinicWorkspacePage(page);
      const workspaces = new WorkspacesPage(page);
      const email = newAccountEmail('clinician');
      let verificationLink = '';

      await test.step(
        'Given a new visitor opens the sign-up flow',
        async () => {
          await loginPage.goto();
          await loginPage.openSignUp();
        },
        { detail: 'Open Tidepool Web and click "Sign Up".' },
      );

      await test.step(
        'When the visitor chooses a Clinician Account',
        async () => {
          await signUpPage.chooseClinicianAccount();
        },
        { detail: 'Select the "Clinician Account" type and continue.' },
      );

      await test.step(
        'Then the clinician registration form is displayed',
        async () => {
          await expect(signUpPage.emailInput).toBeVisible();
          await expect(signUpPage.termsCheckbox).toBeVisible();
        },
        { detail: 'Confirm the clinician email/password form with the inline terms checkbox appears.' },
      );

      await test.step(
        'When the visitor registers with a unique email, password, and accepts the terms',
        async () => {
          await signUpPage.fillClinicianRegistration(email, PASSWORD);
        },
        { detail: 'Enter a unique clinician email, set the password/confirmation, accept the terms, and submit.' },
      );

      await test.step(
        'Then a verification email is received',
        async () => {
          const { link, html } = await getLatestKeycloakEmail(email, {
            sinceMinutes: 10,
            timeoutMs: 90_000,
          });
          verificationLink = link;
          expect(verificationLink).toMatch(/^https?:\/\//);
          const emailHtml =
            html ?? `<pre>Verification email received for ${email}\n\nLink: ${link}</pre>`;
          await page.setContent(emailHtml, { waitUntil: 'domcontentloaded' });
          await testInfo.attach('verification-email', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
        },
        { detail: 'Read the Keycloak verification email over IMAP, render it as evidence, and capture its link.' },
      );

      await test.step(
        'When the verification link is opened',
        async () => {
          await page.goto(verificationLink);
        },
        { detail: 'Open the verification link, completing verification and starting clinician onboarding.' },
      );

      await test.step(
        'Then onboarding asks for the clinician name and role',
        async () => {
          await expect(onboarding.firstNameInput).toBeVisible({ timeout: 30_000 });
          await expect(onboarding.roleSelect).toBeVisible();
        },
        { detail: 'Confirm the name fields and "Role or job title" dropdown are shown.' },
      );

      await test.step(
        'When the clinician enters their name and role, then continues',
        async () => {
          await onboarding.fillProfileAndContinue(FIRST_NAME, LAST_NAME, ROLE);
        },
        { detail: 'Fill first/last name, choose "Clinic Manager", and continue.' },
      );

      await test.step(
        'Then the create-clinic-workspace form is displayed',
        async () => {
          await expect(workspaceForm.nameInput).toBeVisible({ timeout: 30_000 });
        },
        { detail: 'Confirm the clinic workspace form appears.' },
      );

      await test.step(
        'When the clinician fills the workspace details and creates the workspace',
        async () => {
          await workspaceForm.fillWorkspace(CLINIC);
          await expect(workspaceForm.createWorkspaceButton).toBeEnabled();
          await workspaceForm.createWorkspace();
        },
        {
          detail:
            'Fill clinic name, team type, address, glucose units, acknowledge default-admin, and click "Create Workspace".',
        },
      );

      await test.step(
        'Then the Clinic Workspace page lists the new clinic',
        async () => {
          await expect(workspaces.header).toBeVisible({ timeout: 30_000 });
          await expect(workspaces.getClinicCard(CLINIC.name)).toBeVisible();
        },
        { detail: 'Confirm the Clinic Workspace page shows the newly created clinic.' },
      );

      // Persist the clinician account for the claimed chain (project dependency plumbing).
      const storageStatePath = storageStateFor('clinician');
      await page.context().storageState({ path: storageStatePath });
      saveAccount({ role: 'clinician', email, password: PASSWORD, storageStatePath });
    },
  );
});
