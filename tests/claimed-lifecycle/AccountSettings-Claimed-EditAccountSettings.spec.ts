import { expect, test } from '@fixtures/base';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import { createNetworkHelper } from '@fixtures/network-helpers';
import { AccountProfilePage } from '@pom/account/AccountProfilePage';
import { getLatestKeycloakEmail } from '../../utilities/mail';
import { loadAccount } from '../../utilities/account-store';
import { newAccountEmail } from '../../utilities/account';

/**
 * Account Settings - Claimed - Edit Account Settings
 *
 * Edits BOTH editable account fields — full name and email — in one test, on the claimed account
 * created by the create-claimed prerequisite (project dependency). Full name is an in-app change
 * (PUT /profile); email hands off to Keycloak's UPDATE_EMAIL flow, whose verification email is
 * read over IMAP, rendered as evidence, and its link followed.
 *
 * Runs against a throwaway created account, so the email change is completed (no revert) — it
 * never touches a shared login. One test per account, so nothing else mutates it concurrently.
 * Mirrors the personal-lifecycle version; the only difference is the account role (claimed).
 */
test.describe('Account Settings - Claimed - Edit Account Settings', () => {
  test(
    'Account Settings - Claimed - Edit Account Settings',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.CLAIMED,
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }, testInfo) => {
      test.setTimeout(180_000); // email delivery polling can take ~90s

      const account = loadAccount('claimed');
      const profile = new AccountProfilePage(page);
      const api = createNetworkHelper(page);
      // Unique, readable name derived from the account's already-unique alias local-part.
      const newName = `Claimed User ${account.email.split('@')[0]}`;
      const newEmail = newAccountEmail('claimededit');
      let verificationLink = '';
      let namePutBody: any; // the profile PUT body captured during the name save

      // Step 1: Land on account settings as the created account
      await test.step(
        'Given the created claimed account is on the account settings page',
        async () => {
          await api.startCapture();
          await page.goto('/profile');
          await expect(profile.editPersonalDetailsButton).toBeVisible({ timeout: 30_000 });
        },
        { detail: 'Open /profile using the session captured when the account was created.' },
      );

      // Step 2: Profile GET responds per schema
      await (test as any).stepNoScreenshot(
        'Then the profile endpoint responds with a GET consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
        { detail: 'Confirm the profile metadata GET responds and matches the expected schema.' },
      );

      // Step 3: Change the full name
      await test.step(
        'When the user edits the full name',
        async () => {
          await profile.openEditDialog();
          const putResp = await profile.setFullNameAndSave(newName);
          namePutBody = putResp.request().postDataJSON();
        },
        { detail: 'Open "Edit Personal Details", set a new full name, and click "Save Changes".' },
      );

      // Step 4: Full-name PUT /profile is validated
      await (test as any).stepNoScreenshot(
        'Then the profile PUT saves the new full name',
        async () => {
          await api.validateEndpointResponse('profile-metadata-put'); // schema check
          if (namePutBody?.fullName !== newName) {
            throw new Error(
              `PUT /profile fullName was ${namePutBody?.fullName}, expected ${newName}`,
            );
          }
        },
        { detail: 'Confirm the profile PUT payload sets fullName to the new value.' },
      );

      // Step 5: Start the email change (hands off to Keycloak)
      await test.step(
        'When the user starts an email change',
        async () => {
          await profile.openEditDialog();
          await profile.startEmailUpdate();
          await profile.submitNewEmail(newEmail);
        },
        {
          detail: 'From "Edit Personal Details" → "Update Email", submit a new email in Keycloak.',
        },
      );

      // Step 6: Verification email received (rendered as evidence)
      await test.step(
        'Then a verification email is received for the new address',
        async () => {
          const { link, html } = await getLatestKeycloakEmail(newEmail, {
            sinceMinutes: 10,
            timeoutMs: 90_000,
          });
          verificationLink = link;
          expect(verificationLink).toMatch(/^https?:\/\//);
          const emailHtml =
            html ?? `<pre>Verification email received for ${newEmail}\n\nLink: ${link}</pre>`;
          await page.setContent(emailHtml, { waitUntil: 'domcontentloaded' });
          await testInfo.attach('verification-email', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
        },
        {
          detail:
            'Read the Keycloak verification email over IMAP, render it as evidence, and capture its link.',
        },
      );

      // Step 7: Follow the verification link
      await test.step(
        'When the verification link is opened',
        async () => {
          await page.goto(verificationLink);
        },
        { detail: 'Open the verification link to complete the email change.' },
      );

      // Step 8: The account now reflects the new email
      await test.step(
        'Then the account settings show the updated email',
        async () => {
          await page.goto('/profile');
          // The email shows in more than one spot (field + account menu), so match the first.
          await expect(page.getByText(newEmail).first()).toBeVisible({ timeout: 30_000 });
        },
        { detail: 'Confirm /profile shows the new email address after verification.' },
      );

      await api.stopCapture();
    },
  );
});
