# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based UI testing suite for Tidepool's web application, supporting both local testing and BrowserStack cloud testing. The project tests clinician and patient user flows across multiple environments (qa1-qa5, production).

## Essential Commands

### Testing Commands

- `npm test` - Run all tests on qa1 environment
- `npm run test:qa2` - Run tests on qa2 environment
- `npm run test:prd` - Run tests on production
- `npm run test:smoke` - Run only smoke tests
- `npm run test:critical` - Run only critical tests
- `npm run test:api` - Run only API tests
- `npm run test:ui` - Run only UI tests
- `npm run test:patient` - Run only patient tests
- `npm run test:clinician` - Run only clinician tests
- `npm run debug` - Debug tests with Playwright's debug mode
- `playwright test tests/specific-test.spec.ts` - Run a single test file
- `TARGET_ENV=qa2 TEST_TAGS='@smoke @critical' npm test` - Run tests with environment and tags

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
- Supports environments: qa1, qa2, qa3, qa4, qa5, prd, int
- Environment variables validated at startup
- **`utilities/test-runner.js`** - Dynamic test execution with environment and tag filtering

### Key Configuration Files

- **`playwright.config.ts`** - Playwright configuration with dual project setup (local + BrowserStack), includes JSON and Xray reporters
- **`tsconfig.json`** - TypeScript configuration with path mapping for imports
- **`eslint.config.mjs`** - ESLint configuration using Airbnb Extended rules, includes test automation exceptions
- **`.circleci/config.yml`** - CI/CD pipeline with dynamic environment and tag support

### Test Result Reporting

- **JSON Reporter**: Generates `test-results/last-run.json` with rich test data
- **Xray Integration**: `utilities/xray-json-reporter.ts` uploads test results with step-by-step evidence
- **HTML Reports**: Interactive reports in `playwright-report/`
- **CircleCI Integration**: Automated test result submission to Xray using testExecKey parameter

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
- **Tag Filtering**: Supports AND logic (space-separated) and OR logic (comma-separated)
- **Dynamic Execution**: Use `TEST_TAGS` environment variable for selective test runs

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

- `PATIENT_USERNAME` / `PATIENT_PASSWORD`
- `CLINICIAN_USERNAME` / `CLINICIAN_PASSWORD`
- `TARGET_ENV` (qa1, qa2, qa3, qa4, qa5, prd, int)
- Optional: `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY`
- Optional: `XRAY_CLIENT_ID` / `XRAY_CLIENT_SECRET` (for Xray integration)
- Optional: `TEST_TAGS` (for filtering tests by tags)

### Project Structure Understanding

The test suite is organized by user authentication state:

- **`tests/personal/`** - Tests for personal (individual) patient accounts
- **`tests/claimed/`** - Tests for claimed patient accounts (connected to clinicians)
- **`tests/clinician/`** - Tests for clinician user flows
  Each directory has separate authentication setup and isolated test execution.
