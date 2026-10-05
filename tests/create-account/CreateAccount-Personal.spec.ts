import { expect, test } from '@fixtures/base';
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
import LoginPage from '@pom/LoginPage';
import SignUpPage from '@pom/SignUpPage';
import OnboardingPage from '@pom/patient/OnboardingPage';
import PatientNavigation from '@pom/patient/PatientNavigation';
import { getLatestKeycloakEmail } from '../../utilities/mail';
import { newAccountEmail } from '../../utilities/account';
import { saveAccount, storageStateFor } from '../../utilities/account-store';

// Account creation runs logged-out (the chromium-create-account project supplies an empty
// storageState; asserted here too so the file is self-describing).
test.use({ storageState: { cookies: [], origins: [] } });

const PASSWORD = 'CreateAccountPassword';
const FIRST_NAME = 'Test';
const LAST_NAME = 'User';
const BIRTHDAY = '01/01/1990';
const DIAGNOSIS_DATE = '01/01/2010'; // must be after the birthday

test.describe('Create Account - Personal', () => {
  test(
    'Create Account - Personal',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.PERSONAL,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.BACK_KEYCLOAK,
        TEST_TAGS.WIP,
      ]),
    },
    async ({ page }, testInfo) => {
      // Signup + email delivery + onboarding; the mail reader alone polls up to ~90s.
      test.setTimeout(180_000);

      const loginPage = new LoginPage(page);
      const signUpPage = new SignUpPage(page);
      const onboardingPage = new OnboardingPage(page);
      const patientNav = new PatientNavigation(page);
      // Unique alias per run — no collisions, and mail lands in the readable inbox.
      const email = newAccountEmail('personal');
      let verificationLink = ''; // captured in the email step, used to follow the link

      // Step 1: Open the sign-up flow
      await test.step(
        'Given a new visitor opens the sign-up flow',
        async () => {
          await loginPage.goto();
          await loginPage.openSignUp();
        },
        { detail: 'Open Tidepool Web (redirects to the hosted login screen) and click "Sign Up".' },
      );

      // Step 2: Choose a Personal Account
      await test.step(
        'When the visitor chooses a Personal Account',
        async () => {
          await signUpPage.choosePersonalAccount();
        },
        { detail: 'Select the "Personal Account" type and continue.' },
      );

      // Step 3: Registration form is shown
      await test.step(
        'Then the registration form is displayed',
        async () => {
          await expect(signUpPage.emailInput).toBeVisible();
          await expect(signUpPage.passwordInput).toBeVisible();
        },
        { detail: 'Confirm the email/password registration form appears.' },
      );

      // Step 4: Register with email and password
      await test.step(
        'When the visitor registers with a unique email and password',
        async () => {
          await signUpPage.fillRegistration(email, PASSWORD);
        },
        {
          detail:
            'Enter a unique email, set the password and confirmation, and submit "Create Account".',
        },
      );

      // Step 5: Age + terms screen is shown
      await test.step(
        'Then the age and terms confirmation is displayed',
        async () => {
          // The radio/checkbox inputs are style-hidden, so assert on their visible labels.
          await expect(signUpPage.age18OrOlderLabel).toBeVisible({ timeout: 15_000 });
          await expect(signUpPage.termsLabel).toBeVisible();
        },
        { detail: 'Confirm the "Confirm details to continue" age/terms screen appears.' },
      );

      // Step 6: Confirm age and accept terms
      await test.step(
        'When the visitor confirms they are 18+ and accepts the terms',
        async () => {
          await signUpPage.confirmAdultAndAcceptTerms();
        },
        { detail: 'Choose "I am 18 years old or older", accept the Terms of Use, and continue.' },
      );

      // Step 7: Verification email is received (captured as evidence)
      await test.step(
        'Then a verification email is received',
        async () => {
          const { link, html } = await getLatestKeycloakEmail(email, {
            sinceMinutes: 10,
            timeoutMs: 90_000,
          });
          verificationLink = link;
          expect(verificationLink).toMatch(/^https?:\/\//);

          // The email is read over IMAP, not in the browser. Render it onto the page so the
          // step's evidence screenshot IS the received email; step 8 then navigates to the
          // real verification link. Also attach it explicitly for good measure.
          const emailHtml =
            html ?? `<pre>Verification email received for ${email}\n\nLink: ${link}</pre>`;
          await page.setContent(emailHtml, { waitUntil: 'domcontentloaded' });
          await testInfo.attach('verification-email', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
        },
        {
          detail:
            'Read the Keycloak verification email for the new address over IMAP, attach a rendered image of it, and capture its verification link.',
        },
      );

      // Step 8: Follow the verification link
      await test.step(
        'When the verification link is opened',
        async () => {
          await page.goto(verificationLink);
        },
        {
          detail:
            'Open the verification link, completing email verification and signing the new account in.',
        },
      );

      // Step 9: Onboarding asks for name + who the account is for
      await test.step(
        'Then onboarding asks for the name and who the account is for',
        async () => {
          await expect(onboardingPage.firstNameInput).toBeVisible({ timeout: 30_000 });
          // Confirm every "Who is this account for?" option is present.
          await expect(onboardingPage.accountTypeForMe).toBeVisible();
          await expect(onboardingPage.accountTypeForSomeoneElse).toBeVisible();
          await expect(onboardingPage.accountTypeViewOnly).toBeVisible();
        },
        {
          detail:
            'Confirm the name fields and all three "Who is this account for?" options are shown.',
        },
      );

      // Step 10: Enter name and select the self account type
      await test.step(
        'When the user enters their name and selects "This is for me, I have diabetes"',
        async () => {
          await onboardingPage.enterNameAndSelectSelf(FIRST_NAME, LAST_NAME);
        },
        { detail: 'Fill first and last name, then choose "This is for me, I have diabetes".' },
      );

      // Step 11: Next becomes enabled, continue
      await test.step(
        'Then the Next button is enabled, and the user continues',
        async () => {
          await expect(onboardingPage.nextButton).toBeEnabled();
        },
        { detail: 'Confirm "Next" is enabled once the required fields are set.' },
      );

      // Step 12: Click Next Button
      await test.step(
        'When the user clicks the Next button',
        async () => {
          await onboardingPage.clickNext();
        },
        { detail: 'Click the "Next" button.' },
      );

      // Step 12: Onboarding asks for birthday / diagnosis / type
      await test.step(
        'Then onboarding asks for birthday, diagnosis date, and diabetes type',
        async () => {
          await expect(onboardingPage.birthdayInput).toBeVisible();
          await expect(onboardingPage.diagnosisDateInput).toBeVisible();
          await expect(onboardingPage.diagnosisTypeSelect).toBeVisible();
        },
        { detail: 'Confirm the birthday, diagnosis-date, and diabetes-type fields are shown.' },
      );

      // Step 13: Enter health details
      await test.step(
        'When the user enters birthday, diagnosis date, and diabetes type',
        async () => {
          await onboardingPage.enterDiabetesDetails(BIRTHDAY, DIAGNOSIS_DATE);
        },
        {
          detail:
            'Enter a birthday, a diagnosis date after the birthday, and a diabetes type other than "Select one".',
        },
      );

      // Step 14: Next becomes enabled, continue
      await test.step(
        'Then the Next button is enabled, and the user continues',
        async () => {
          await expect(onboardingPage.nextButton).toBeEnabled();
          await onboardingPage.clickNext();
        },
        { detail: 'Confirm "Next" is enabled once the health details are set, then continue.' },
      );

      // Step 15: Data-donation prompt is shown
      await test.step(
        'Then the data-donation prompt is displayed',
        async () => {
          await expect(onboardingPage.declineDonationButton).toBeVisible();
        },
        { detail: 'Confirm the data-donation screen appears.' },
      );

      // Step 16: Decline donation
      await test.step(
        'When the user declines data donation',
        async () => {
          await onboardingPage.declineDonation();
        },
        { detail: 'Choose "No, Thanks" on the data-donation prompt.' },
      );

      // Step 17: View Data screen is shown
      await test.step(
        'Then the View Data screen is displayed',
        async () => {
          await expect(patientNav.pages.ViewData.verifyElement).toBeVisible({ timeout: 30_000 });
        },
        { detail: 'Confirm the new account lands on the View Data screen.' },
      );

      // Persist the created account (credentials + logged-in session) so tests that depend on
      // this one — via Playwright project dependencies — can consume it. Not a Gherkin step;
      // it's test-dependency plumbing, so it stays out of the Xray step list.
      const storageStatePath = storageStateFor('personal');
      await page.context().storageState({ path: storageStatePath });
      saveAccount({ role: 'personal', email, password: PASSWORD, storageStatePath });
    },
  );
});
