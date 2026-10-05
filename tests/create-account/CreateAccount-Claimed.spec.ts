import { expect, test } from '@fixtures/base';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import LoginPage from '@pom/LoginPage';
import SignUpPage from '@pom/SignUpPage';
import WorkspacesPage from '@pom/clinician/WorkspacesPage';
import ClinicianDashboardPage from '@pom/clinician/ClinicianDashboardPage';
import ClaimAccountPage from '@pom/patient/ClaimAccountPage';
import { getLatestClaimEmail } from '../../utilities/mail';
import { newAccountEmail } from '../../utilities/account';
import { saveAccount, storageStateFor } from '../../utilities/account-store';

/**
 * Create Account - Claimed
 *
 * Produces a "claimed" patient account. The test opens logged in as the freshly-created clinician
 * (project storageState = chromium-create-clinician), adds a custodial patient to their clinic
 * using the email we want the claimed account to own, then — in a SEPARATE logged-out context —
 * opens the clinic invitation link, completes the claim flow (different device → set password +
 * confirm birthday), logs in, accepts the one-time age/terms action, and lands on the patient data
 * view. Saves the `claimed` account for the claimed-lifecycle chain to depend on.
 *
 * Claim flow verified on qa2 (2026-10-05):
 *   invite email → /verification-with-c2c (device) → /verification-with-password (password +
 *   birthday → Confirm) → Keycloak login → age/terms required-action → /patients/:id/data.
 *
 * Dependency chain: chromium-create-clinician → chromium-create-claimed.
 */

const PASSWORD = 'CreateAccountPassword'; // matches the other producers
const CLINIC_NAME = 'New Clinic'; // matches CreateAccount-Clinician
const PATIENT_BIRTHDATE = '01/01/2000'; // reused verbatim on the claim setup screen
const PATIENT_MRN = '123456789';

test.describe('Create Account - Claimed', () => {
  test(
    'Create Account - Claimed',
    {
      tag: createValidatedTags([
        TEST_TAGS.CLINICIAN,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.BACK_KEYCLOAK,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page, browser }, testInfo) => {
      test.setTimeout(300_000); // clinic add + invitation delivery + claim + login + terms

      const claimedEmail = newAccountEmail('claimed');
      const patientName = `Claimed Patient ${Date.now()}`;

      // ----- As the new clinician (project storageState = created-clinician) -----
      const workspaces = new WorkspacesPage(page);
      const dashboard = new ClinicianDashboardPage(page);

      await test.step(
        'Given the new clinician opens their clinic workspace',
        async () => {
          await workspaces.goto();
          await workspaces.waitUntilLoaded();
          await workspaces.visitClinic(CLINIC_NAME);
        },
        { detail: `Go to Workspaces and open "${CLINIC_NAME}".` },
      );

      await test.step(
        'When the clinician adds a custodial patient with the claimed account email',
        async () => {
          await dashboard.openAndFillAddPatientDialog(
            patientName,
            PATIENT_BIRTHDATE,
            PATIENT_MRN,
            claimedEmail,
          );
          await dashboard.submitAddPatientDialog();
          await dashboard.closeBringDataDialog();
        },
        {
          detail:
            'Add New Patient → fill name, birthdate, MRN, and the claimed account email → submit → dismiss the bring-data dialog.',
        },
      );

      // ----- As the prospective patient, LOGGED OUT (fresh context) -----
      const claimContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const claimPage = await claimContext.newPage();
      const claim = new ClaimAccountPage(claimPage);
      const login = new LoginPage(claimPage);
      const signUp = new SignUpPage(claimPage);

      try {
        let claimLink: string | null = null;

        await test.step(
          'Then the clinic invitation email is received',
          async () => {
            const { html, link } = await getLatestClaimEmail(claimedEmail, {
              sinceMinutes: 10,
              timeoutMs: 180_000,
            });
            claimLink = link;
            expect(claimLink, 'invitation email should contain a signupKey link').toBeTruthy();
            const emailHtml = html ?? `<pre>Invitation email received for ${claimedEmail}</pre>`;
            await claimPage.setContent(emailHtml, { waitUntil: 'domcontentloaded' });
            await testInfo.attach('invitation-email', {
              body: await claimPage.screenshot({ fullPage: true }),
              contentType: 'image/png',
            });
          },
          { detail: 'Read the clinic invitation email over IMAP and render it as evidence.' },
        );

        await test.step(
          'When the patient opens the invitation and picks "I have a different device"',
          async () => {
            // Navigate the clean extracted link — the rendered email anchor's href is
            // quoted-printable-decoded and mangles the signupKey, so never click it.
            await claimPage.goto(claimLink as string);
            await claim.chooseDifferentDevice();
          },
          {
            detail:
              'Open the "Share Diabetes Data with Your Clinic" link and choose "I have a different device".',
          },
        );

        await test.step(
          'And sets a password and confirms the birthday',
          async () => {
            await claim.setupAccount(PASSWORD, PATIENT_BIRTHDATE);
          },
          {
            detail:
              'On "Optional: Setup Your Account", set the password and confirm the birthday the clinic recorded, then Confirm.',
          },
        );

        await test.step(
          'And logs in and accepts the age/terms confirmation',
          async () => {
            await login.login(claimedEmail, PASSWORD);
            await signUp.confirmAdultAndAcceptTerms();
          },
          {
            detail:
              'Sign in with the claimed credentials, then confirm "18 or older" and accept the terms to finish setup.',
          },
        );

        await test.step(
          'Then the claimed patient lands on their data view',
          async () => {
            await expect(claimPage).toHaveURL(/\/patients\/[^/]+\/data/, { timeout: 30_000 });
          },
          { detail: 'Confirm the new claimed account is authenticated on its patient data page.' },
        );

        // Persist the claimed account for the claimed-lifecycle chain (project dependency plumbing).
        const storageStatePath = storageStateFor('claimed');
        await claimPage.context().storageState({ path: storageStatePath });
        saveAccount({ role: 'claimed', email: claimedEmail, password: PASSWORD, storageStatePath });
      } finally {
        await claimContext.close();
      }
    },
  );
});
