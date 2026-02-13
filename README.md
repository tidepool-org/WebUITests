# Tidepool Web UI Tests

Automated end-to-end testing suite for Tidepool's web application, built with [Playwright](https://playwright.dev). Playwright is a modern test framework from Microsoft that enables reliable cross-browser testing with auto-waiting, network interception, and built-in test isolation. It runs tests against real browser engines (Chromium, Firefox, WebKit) and supports features like screenshots, video recording, and tracing out of the box.

This suite covers clinician and patient user flows across multiple QA environments, with integrated reporting to Jira Xray.

## Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Tags](#test-tags)
- [Running Tests via Jira](#running-tests-via-jira)
- [Xray Integration](#xray-integration)
- [Development Guide](#development-guide)
- [CI/CD Pipeline](#cicd-pipeline)

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### Installation

```bash
npm ci
npx playwright install --with-deps
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# Required: Test account credentials
PERSONAL_USERNAME=<personal patient email>
PERSONAL_PASSWORD=<password>
CLAIMED_USERNAME=<claimed patient email>
CLAIMED_PASSWORD=<password>
SHARED_USERNAME=<shared member email>
SHARED_PASSWORD=<password>
CLINICIAN_USERNAME=<clinician email>
CLINICIAN_PASSWORD=<password>

# Required: Target environment
TARGET_ENV=qa2   # Options: qa1, qa2, qa3, qa4, qa5, int, prd

# Optional: Xray reporting (see Xray Integration section)
XRAY_CLIENT_ID=<your xray client id>
XRAY_CLIENT_SECRET=<your xray client secret>
XRAY_PROJECT_KEY=SAND
TEST_EXECUTION_KEY=none

# Optional: BrowserStack cloud testing
BROWSERSTACK_USERNAME=<your username>
BROWSERSTACK_ACCESS_KEY=<your access key>
```

Each `TARGET_ENV` maps to a URL:

| Environment | URL |
|---|---|
| `qa1` | `https://qa1.development.tidepool.org` |
| `qa2` | `https://qa2.development.tidepool.org` |
| `qa3`-`qa5` | `https://qa{n}.development.tidepool.org` |
| `int` | `https://int.development.tidepool.org` |
| `prd` / `production` | `https://app.tidepool.org` |

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run a specific test file
npx playwright test tests/personal/basic-functionality.spec.ts

# Debug mode (opens Playwright inspector)
npm run debug

# View the HTML report from the last run
npx playwright show-report
```

### Filtering by Tag

Run a subset of tests using tags:

```bash
# Single tag
npx playwright test --grep "@smoke"

# OR logic (tests matching ANY tag)
npx playwright test --grep "@smoke|@critical"

# AND logic (tests matching ALL tags)
npx playwright test --grep "(?=.*@smoke)(?=.*@ui)"
```

Shorthand npm scripts are also available:

```bash
npm run test:smoke
npm run test:critical
npm run test:api
npm run test:ui
npm run test:patient
npm run test:clinician
npm run test:regression
```

### Changing the Target Environment

Set `TARGET_ENV` in your `.env` file or export it before running:

```bash
TARGET_ENV=qa3 npm test
```

---

## Test Tags

Tests are organized with a tagging system defined in `tests/fixtures/test-tags.ts`. Every test must include at least one tag from each required category.

### Required Tag Categories

| Category | Tags |
|---|---|
| **User Type** | `@patient`, `@clinician` |
| **Test Type** | `@ui`, `@api`, `@smoke`, `@regression` |
| **Priority** | `@critical`, `@high`, `@medium`, `@low` |

### Additional Tags

| Category | Tags |
|---|---|
| **User Subtype** | `@personal`, `@claimed`, `@shared_member`, `@custodial` |
| **Backend Service** | `@back-shoreline`, `@back-clinic`, `@back-keycloak`, `@back-hydrophone`, `@back-platform`, `@back-seagull`, `@back-tidewhisperer`, `@back-messageapi`, `@back-jellyfish`, `@back-gatekeeper`, `@back-export`, `@back-highwater` |
| **API Endpoint** | `@api_profile`, `@api_user` |
| **Jira Link** | `@jira(PROJ-1234)` - links a test to a Jira ticket |

### How Tags are Applied

Tags are added to each test using `createValidatedTags()`, which enforces that all required categories are present:

```typescript
import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';

test('should display patient data', {
  tag: createValidatedTags([
    TEST_TAGS.PATIENT,
    TEST_TAGS.UI,
    TEST_TAGS.PRIORITY_HIGH,
  ]),
}, async ({ page }) => {
  // ...
});
```

---

## Running Tests via Jira

Tests can be triggered directly from Jira, which sends a request to CircleCI to run the tests and automatically attaches the results back to the Jira issue.

### Steps

1. Go to the **WEB**, **BACKEND**, or **UPLOAD** testing project in Jira
2. Open the Story or Bug issue you want to attach test results to
3. Click the **Jira Automation** button (lightning bolt icon)
4. Select **"Trigger Automated Web UI Test Cases"**
5. Fill in the fields:
   - **Environment** - the QA environment to test against (`qa1`, `qa2`, `qa3`, `qa4`, `qa5`, `int`, or `prd`)
   - **Test Tags** *(optional)* - filter which tests to run (e.g., `patient`, `smoke`, `clinician`). See [available tags](#test-tags) above. Leave blank to run all tests.
6. Submit

Jira automation will send the request to CircleCI, which runs the tests and uploads results to Xray. A Test Execution will be created and linked to the Jira issue automatically. Results include pass/fail status, step-level details, screenshots on failure, and video recordings of failed tests.

---

## Xray Integration

The test suite includes a custom Playwright reporter (`utilities/xray-json-reporter.ts`) that automatically uploads test results to [Xray](https://www.getxray.app/) (Jira's test management tool) after each run.

### What Gets Uploaded

Each test result includes:

| Data | When Included |
|---|---|
| Test summary and status (PASSED/FAILED) | Always |
| Step-by-step results (Given/When/Then) | Always |
| Step durations | Always |
| Error messages | On failure |
| Screenshots | On failure |
| Video recordings | On failure |

### Running Locally with Xray Upload

To upload results to Xray from a local run, set these environment variables in your `.env` file:

```env
XRAY_CLIENT_ID=<your xray client id>
XRAY_CLIENT_SECRET=<your xray client secret>
XRAY_PROJECT_KEY=SAND                    # Jira project key
TEST_EXECUTION_KEY=SAND-1234             # Link to existing execution
```

Then run your tests as normal:

```bash
npm test
```

The reporter will authenticate with Xray, upload results, and print the Test Execution key.

To **link results to an existing Test Execution**, set `TEST_EXECUTION_KEY` to the execution's Jira key (e.g., `QAE-643`). To **create a new execution**, set it to `none`.

### Running Locally Without Xray Upload

Simply omit `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` from your `.env` file (or leave them blank). The reporter will silently skip the upload and only generate local reports:

- **HTML report**: `playwright-report/` (open with `npx playwright show-report`)
- **JSON report**: `test-results/last-run.json`

### How It Works

1. Playwright runs tests and generates `test-results/last-run.json`
2. The Xray reporter (`onEnd` hook) reads the JSON results
3. Maps Playwright's Given/When/Then steps to Xray test step definitions and results
4. Converts attachments (screenshots, videos) to base64 evidence
5. Authenticates with Xray Cloud API using client credentials
6. Uploads via Xray's JSON import endpoint (`/api/v2/import/execution`)
7. Test Execution is created or updated in Jira

---

## Development Guide

### Architecture Overview

The project follows the **Page Object Model (POM)** pattern:

```
page-objects/              # Page classes that encapsulate UI interactions
├── LoginPage.ts           # Authentication flow
├── patient/               # Patient-specific pages
│   ├── PatientNavigation.ts
│   ├── ProfilePage.ts
│   ├── BasicsPage.ts
│   ├── DailyPage.ts
│   └── components/        # Reusable patient UI components
│       └── daily-chart.ts
├── clinician/             # Clinician-specific pages
│   ├── ClinicianDashboardPage.ts
│   ├── ClinicianNavigation.ts
│   ├── WorkspacesPage.ts
│   └── components/        # Reusable clinician UI components
└── account/               # Account management pages
    ├── AccountNavigation.ts
    └── AccountSettingsPage.ts

tests/                     # Test suites organized by user auth state
├── global-setup.ts        # Pre-authenticates all user types
├── fixtures/              # Custom fixtures and test helpers
│   ├── base.ts            # Core fixtures (timing, screenshots, exceptions)
│   ├── test-tags.ts       # Tag system with validation
│   ├── clinic-helpers.ts  # Clinician navigation helpers
│   ├── patient-helpers.ts # Patient navigation helpers
│   └── network-helpers.ts # API network capture
├── personal/              # Tests for personal patient accounts
├── claimed/               # Tests for claimed patient accounts
└── clinician/             # Tests for clinician workflows

utilities/                 # Shared utilities
├── env.ts                 # Environment config (Zod validation + URL mapping)
├── xray-json-reporter.ts  # Xray Cloud reporter
├── xray-types.ts          # Xray TypeScript types
└── annotations.ts         # Jira annotation helpers
```

### Authentication

The `global-setup.ts` file runs once before all tests. It authenticates four user types (personal, claimed, shared, clinician) and saves their session state to `tests/.auth/*.json`. Each Playwright project uses `storageState` to load the appropriate session, so individual tests don't need to log in.

### Import Aliases

The project uses TypeScript path aliases (defined in `tsconfig.json`):

```typescript
import { expect, test } from '@fixtures/base';
import { TEST_TAGS } from '@fixtures/test-tags';
import LoginPage from '@pom/LoginPage';
import PatientDataBasicsPage from '@pom/patient/BasicsPage';
```

| Alias | Resolves To |
|---|---|
| `@fixtures/*` | `tests/fixtures/*` |
| `@pom/*` | `page-objects/*` (including patient/ and clinician/ subdirs) |
| `@components/*` | `page-objects/*/components/*` |

### Adding a New Test

1. Create a `.spec.ts` file in the appropriate directory:
   - `tests/personal/` for personal patient tests
   - `tests/claimed/` for claimed patient tests
   - `tests/clinician/` for clinician tests

2. Import fixtures and page objects:

   ```typescript
   import { expect, test } from '@fixtures/base';
   import { TEST_TAGS, createValidatedTags } from '@fixtures/test-tags';
   ```

3. Structure tests using Given/When/Then steps:

   ```typescript
   test('should do something', {
     tag: createValidatedTags([
       TEST_TAGS.PATIENT,
       TEST_TAGS.UI,
       TEST_TAGS.PRIORITY_HIGH,
     ]),
   }, async ({ page }) => {
     await test.step('Given the user is on the basics page', async () => {
       // setup
     });

     await test.step('When the user clicks a button', async () => {
       // action
     });

     await test.step('Then the result is visible', async () => {
       // assertion
     });
   });
   ```

4. Tags are required. Include at least one **User Type**, one **Test Type**, and one **Priority** tag.

### Creating a Page Object

1. Create a new file in the appropriate `page-objects/` subdirectory
2. Use semantic Playwright locators (`getByRole`, `getByText`, `getByLabel`) over CSS selectors
3. Follow the established pattern:

   ```typescript
   import { Locator, Page } from '@playwright/test';

   export default class MyPage {
     readonly page: Page;
     readonly submitButton: Locator;
     readonly nameInput: Locator;

     constructor(page: Page) {
       this.page = page;
       this.submitButton = page.getByRole('button', { name: 'Submit' });
       this.nameInput = page.getByRole('textbox', { name: 'Name' });
     }

     async goto(): Promise<void> {
       await this.page.goto('/my-page');
     }

     async fillName(name: string): Promise<void> {
       await this.nameInput.fill(name);
     }
   }
   ```

### Code Quality

```bash
npm run check        # Lint + TypeScript check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
```

---

## CI/CD Pipeline

Tests run on CircleCI with the following workflow:

### Commit Workflow

Every push triggers:

1. **code-quality-check** - ESLint and TypeScript validation
2. **test** - Parallel Playwright test execution (4 shards)

### Configuration

The pipeline accepts parameters (set via Jira automation or CircleCI API):

| Parameter | Default | Description |
|---|---|---|
| `testEnvironment` | `qa2` | Target environment |
| `testExecKey` | `none` | Xray Test Execution key to link results |
| `testTags` | *(empty)* | Tag filter (e.g., `patient`, `smoke`) |
| `xrayProjectKey` | `SAND` | Jira project for Xray |

### Slack Notifications

Automated Slack notifications are sent on test completion for the `main` and `develop` branches, reporting pass/fail status with a link to the build.
