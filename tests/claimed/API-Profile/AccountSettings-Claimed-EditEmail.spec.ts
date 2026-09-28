import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import LoginPage from '../../../page-objects/LoginPage';
import { getLatestKeycloakVerificationLink } from '../../../utilities/mail';
import env from '../../../utilities/env';

/**
 * Account Settings - Claimed - Edit Email
 *
 * Email editing moved OUT of the app into Keycloak. The old in-app flow (fill the email
 * field → Save → PUT /profile) no longer exists, so this test drives the new flow:
 *   profile → Update Email → Keycloak re-auth → enter new email → Keycloak SENDS a
 *   verification email to the new address.
 *
 * FIRST INCREMENT (validating the IMAP mail reader): we stop once the verification email
 * is received and its action-token link is extracted — we do NOT click the link, so the
 * account's email (its login identity) is left unchanged and no revert is needed. Once the
 * reader is confirmed, a follow-up will click the link, assert the change, and revert.
 *
 * Flow (confirmed against qa2 on 2026-09-14):
 *   /profile → "Edit Personal Details" (opens dialog) → "Update Email" → Keycloak
 *   update-email form at auth.qa.tidepool.org/.../required-action?execution=UPDATE_EMAIL
 *   (no re-auth prompt while the session is valid) → fill #email → submit #kc-submit →
 *   Keycloak sends a verification email to the new address.
 */

const NEW_EMAIL = 'qa+ClaimedEmailEdit@tidepool.org'; // a plus-alias that delivers to the QA mailbox

test.describe('Account Settings - Claimed - Edit Email', () => {
  test(
    'Account Settings - Claimed - Edit Email',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.CLAIMED,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // The mail reader polls the inbox for up to ~90s while Keycloak's verification email
      // is delivered, so this test needs more than the 60s default.
      test.setTimeout(150_000);
      const login = new LoginPage(page);

      await test.step('Given the claimed account is logged in', async () => {
        await page.goto('/data');
        await patientTest.patient.setup(page);
      });

      await test.step('When the user starts an email change from the profile', async () => {
        await page.goto('/profile');
        // Email changes live inside the Edit Personal Details dialog; "Update Email" hands
        // off to Keycloak (execution=UPDATE_EMAIL).
        await page.getByRole('button', { name: 'Edit Personal Details' }).click();
        await page.getByRole('button', { name: 'Update Email' }).click();
      });

      await test.step('And re-authenticates in Keycloak (identity-first)', async () => {
        // AIA UPDATE_EMAIL re-prompts for credentials. Handle either a username-first page
        // or a password-only page, reusing the same #kc-login submit as normal login.
        if (await login.usernameInput.isVisible({ timeout: 15000 }).catch(() => false)) {
          await login.usernameInput.fill(env.CLAIMED_USERNAME);
          await login.submitButton.click();
        }
        if (await login.passwordInput.isVisible({ timeout: 15000 }).catch(() => false)) {
          await login.passwordInput.fill(env.CLAIMED_PASSWORD);
          await login.submitButton.click();
        }
      });

      await test.step('And submits the new email address', async () => {
        // Keycloak update-email form: #email input + #kc-submit ("Update Email").
        const kcEmail = page.locator('#email');
        await kcEmail.waitFor({ state: 'visible', timeout: 15000 });
        await kcEmail.fill(NEW_EMAIL);
        await page.locator('#kc-submit').click();
      });

      await test.step('Then a Keycloak verification email is received and its link is extracted', async () => {
        const link = await getLatestKeycloakVerificationLink(NEW_EMAIL, {
          sinceMinutes: 10,
          timeoutMs: 90_000, // Keycloak mail can take a little while
        });
        // eslint-disable-next-line no-console
        console.log(`✅ Verification link for ${NEW_EMAIL}:\n   ${link}`);
        if (!/^https?:\/\//.test(link)) {
          throw new Error(`Expected an http(s) verification link, got: ${link}`);
        }
        // Intentionally NOT navigating to the link — leaves the account email unchanged.
      });
    },
  );
});
