# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based UI testing suite for Tidepool's web application, supporting both local testing and BrowserStack cloud testing. The project tests clinician and patient user flows across multiple environments (qa1-qa5, production).

## Essential Commands

### Testing Commands

- `npm test` - Run all tests (uses TARGET_ENV from .env file)
- `npm run test:smoke` - Run only smoke tests
- `npm run test:critical` - Run only critical tests
- `npm run test:api` - Run only API tests
- `npm run test:ui` - Run only UI tests
- `npm run test:patient` - Run only patient tests
- `npm run test:clinician` - Run only clinician tests
- `npm run test:regression` - Run only regression tests
- `npm run debug` - Debug tests with Playwright's debug mode
- `npx playwright test tests/specific-test.spec.ts` - Run a single test file

**Advanced Tag Filtering:**
- Combine tags with AND logic: `npx playwright test --grep "(?=.*@smoke)(?=.*@ui)"`
- Combine tags with OR logic: `npx playwright test --grep "@smoke|@critical"`
- Change environment: Set `TARGET_ENV` in your .env file or export it before running tests

### Code Quality Commands

- `npm run check` - Run both linting and TypeScript checking
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript compiler check
- `npm run build` - Compile TypeScript files
- `npm run format` - Format code with Prettier

### Report Generation and Integration

- `npm run merge-reports` - Merge XML test reports from different test suites
- `npm run upload-to-xray` - Upload test results to Xray (requires credentials)

## Architecture Overview

### Page Object Model Structure

The codebase follows the Page Object Model (POM) pattern with a clear separation:

- **`page-objects/`** - Contains all page object classes
  - `LoginPage.ts` - Handles authentication flow
  - `clinician/` - Clinician-specific pages and components
  - `patient/` - Patient-specific pages and components
  - `components/` - Reusable UI components shared across pages

### Test Organization

- **`tests/fixtures/base.ts`** - Custom Playwright fixtures with enhanced logging, timing, and exception handling
- **`tests/global-setup.ts`** - Pre-authenticates users and stores session state
- **`tests/clinician/`** - Tests for clinician user flows
- **`tests/patient/`** - Tests for patient user flows

### Environment Management

- **`utilities/env.ts`** - Centralized environment configuration using Zod validation
- **`.env` file** - Local environment configuration (set TARGET_ENV and credentials)
- Supports environments: qa1, qa2, qa3, qa4, qa5, prd, int
- Environment variables validated at startup via Zod schema
- CircleCI uses pipeline parameters to set environment variables

### Key Configuration Files

- **`playwright.config.ts`** - Playwright configuration with dual project setup (local + BrowserStack), includes JSON and Xray reporters
- **`tsconfig.json`** - TypeScript configuration with path mapping for imports
- **`eslint.config.mjs`** - ESLint configuration using Airbnb Extended rules, includes test automation exceptions
- **`.circleci/config.yml`** - CI/CD pipeline with dynamic environment and tag support

### Test Result Reporting

- **JSON Reporter**: Generates `test-results/last-run.json` with rich test data
- **Xray Integration**: `utilities/xray-json-reporter.ts` uploads test results with intelligent evidence handling
  - Videos only for failed tests (saves storage)
  - Screenshots and JSON responses for all tests
  - Configurable project key via `XRAY_PROJECT_KEY` (default: SAND)
  - Step-level evidence properly mapped to test steps
- **HTML Reports**: Interactive reports in `playwright-report/`
- **CircleCI Integration**: Automated test result submission to Xray with configurable project key

## Project-Specific Patterns

### Authentication Strategy

- Global setup pre-authenticates both patient and clinician users
- Session state stored in `tests/.auth/` directory
- Separate projects for patient vs clinician test isolation

### Path Aliases

Use these import aliases defined in tsconfig.json:

- `@pom/*` - Page objects (e.g., `@pom/LoginPage`)
- `@components/*` - UI components
- `@fixtures/*` - Test fixtures

### Custom Test Fixtures

The project includes enhanced fixtures in `tests/fixtures/base.ts`:

- `timeLogger` - Logs test start/end times
- `stepTimer` - Times individual test steps
- `exceptionLogger` - Captures and reports frontend exceptions

### BrowserStack Integration

Tests automatically detect BrowserStack environment variables and switch between local Chrome and cloud testing. BrowserStack projects are conditionally added based on credential availability.

### Test Data Management

- Patient/clinician credentials managed via environment variables
- Dynamic test data generation (e.g., timestamps) to avoid test conflicts
- Environment-specific URL mapping

### Test Tagging System

- **`tests/fixtures/test-tags.ts`** - Comprehensive tag system with validation
- **Required Categories**: User Types (@patient, @clinician), Test Types (@api, @ui, @smoke), Priorities (@critical, @high, @medium, @low)
- **Tag Filtering**:
  - Space-separated tags = AND logic (test must have ALL tags): `TEST_TAGS='@smoke @ui'`
  - Comma-separated tags = OR logic (test must have ANY tag): `TEST_TAGS='@smoke,@critical'`
- **Dynamic Execution**: Use `TEST_TAGS` environment variable for selective test runs
- **Implementation**: Uses Playwright's `--grep` flag with regex patterns to filter tests by tag metadata

## Development Notes

### Adding New Tests

1. Create test files in appropriate directory (`tests/clinician/`, `tests/patient/`, `tests/claimed/`, `tests/personal/`)
2. Import custom fixtures: `import { expect, test } from '@fixtures/base'`
3. Use page objects with path aliases: `import LoginPage from '@pom/LoginPage'`
4. Follow the Given-When-Then pattern with `test.step()` blocks
5. Add test tags using `createValidatedTags()` from `@fixtures/test-tags`
6. Use project-specific imports for specialized fixtures (e.g., `network-helpers`, `patient-helpers`)

### Creating Page Objects

1. Extend the pattern established in existing page objects
2. Use semantic locators (`getByRole`, `getByText`) over CSS selectors
3. Include JSDoc comments for public methods
4. Add `name` property for step decorator context

### Environment Setup

Required environment variables:

- `PERSONAL_USERNAME` / `PERSONAL_PASSWORD` - Personal patient account
- `CLAIMED_USERNAME` / `CLAIMED_PASSWORD` - Claimed patient account
- `SHARED_USERNAME` / `SHARED_PASSWORD` - Shared patient account
- `CLINICIAN_USERNAME` / `CLINICIAN_PASSWORD` - Clinician account
- `TARGET_ENV` (qa1, qa2, qa3, qa4, qa5, prd, int)
- Optional: `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` (for BrowserStack cloud testing)

**Xray Integration (Optional):**
- `XRAY_CLIENT_ID` / `XRAY_CLIENT_SECRET` - Required for automatic Xray upload after test runs
- `XRAY_PROJECT_KEY` - Jira project key (default: SAND)
- `TEST_EXECUTION_KEY` - Link to existing Xray execution, or 'none' to auto-create

**Note:** If `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are not provided, the Xray reporter will silently skip upload and only generate local JSON reports.

### Project Structure Understanding

The test suite is organized by user authentication state:

- **`tests/personal/`** - Tests for personal (individual) patient accounts
- **`tests/claimed/`** - Tests for claimed patient accounts (connected to clinicians)
- **`tests/clinician/`** - Tests for clinician user flows
  Each directory has separate authentication setup and isolated test execution.
