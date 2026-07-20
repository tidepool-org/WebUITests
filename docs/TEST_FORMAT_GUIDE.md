# Test Format and Architecture Guide

## Overview

This guide documents the standardized test format and architecture patterns used in our Playwright-based UI testing suite. This format ensures consistency, maintainability, and readability across all tests.

## Table of Contents

- [Test Step Formatting](#test-step-formatting)
- [Page Objects and Component Scripts](#page-objects-and-component-scripts)
- [Fixtures and Helper Scripts](#fixtures-and-helper-scripts)
- [Navigation Functions](#navigation-functions)
- [Complete Test Example](#complete-test-example)
- [Migrating Existing Playwright Tests](#migrating-existing-playwright-tests)
- [Best Practices](#best-practices)

---

## Test Step Formatting

### Structure Pattern

Tests follow a clear structure using `test.step()` to organize actions into logical groups. Each step includes:

1. **Commented description** - Brief explanation of what the step accomplishes
2. **Step description string** - Descriptive text that appears in test reports
3. **Variable creation and placement** - Local variables declared at step level when needed
4. **Helper function usage** - Leveraging fixtures and page objects

### Basic Step Format

```typescript
// Step 1: Short comment describing the step purpose
await test.step('Given/When/Then descriptive step name', async () => {
  // Local variables for this step
  const variableName = someValue;
  
  // Actions using helper functions and page objects
  await helperFunction.action(page);
  await pageObject.element.action();
});
```

### Variable Creation and Placement

**Variables are created at different scopes based on their usage:**

```typescript
test('Test Name', async ({ page }) => {
  // Test-level variables (used across multiple steps)
  let originalEmail = '';
  const accountSettingsPage = new AccountSettingsPage(page);
  
  await test.step('Step with local variables', async () => {
    // Step-level variables (only used within this step)
    const tempValue = 'temporary-data';
    const currentTimestamp = Date.now();
    
    // Use variables
    await someAction(tempValue, currentTimestamp);
  });
  
  await test.step('Step using test-level variable', async () => {
    originalEmail = await accountSettingsPage.emailInput.inputValue();
  });
});
```

### Step Types and Naming

**Follow Given-When-Then pattern:**

- **Given steps** - Setup/precondition steps
- **When steps** - Action steps  
- **Then steps** - Verification/assertion steps

```typescript
// Setup steps
await test.step('Given personal account has been logged in', async () => {
  // Setup code
});

// Action steps  
await test.step('When user updates the email field', async () => {
  // User actions
});

// Verification steps
await test.step('Then the save changes message displays', async () => {
  // Assertions and validations
});
```

### Special Step Types

**No-screenshot steps for API validations:**
```typescript
await (test as any).stepNoScreenshot(
  'Then profile endpoint responds with GET request consistent with schema',
  async () => {
    await api.validateEndpointResponse('profile-metadata-get');
  },
);
```

---

## Page Objects and Component Scripts

### Purpose

Page objects encapsulate UI elements and functionality into reusable classes, promoting:
- **Code reusability** across multiple tests
- **Maintainability** when UI changes
- **Readability** through semantic method names

### Page Object Structure

```typescript
import { Page, Locator } from '@playwright/test';

export class ComponentNamePage {
  readonly page: Page;
  readonly elementName: Locator;
  readonly anotherElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.elementName = page.getByRole('button', { name: 'Submit' });
    this.anotherElement = page.getByText('Expected Text');
  }

  // Optional: Complex actions as methods
  async performComplexAction(): Promise<void> {
    // Multiple element interactions
  }
}

export default ComponentNamePage;
```

### File Organization

```
page-objects/
├── LoginPage.ts                 # Core authentication
├── account/
│   ├── AccountSettingsPage.ts   # Account management
│   └── AccountNavigation.ts     # Account navigation
├── patient/
│   ├── PatientDashboard.ts      # Patient-specific pages
│   └── PatientNavigation.ts     # Patient navigation
└── clinician/
    ├── ClinicianDashboard.ts    # Clinician-specific pages
    └── ClinicianNavigation.ts   # Clinician navigation
```

### Usage in Tests

```typescript
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';

// Initialize page object
const accountSettingsPage = new AccountSettingsPage(page);

// Use semantic element references
await accountSettingsPage.emailInput.fill('new-email@example.com');
await accountSettingsPage.saveButton.click();
await accountSettingsPage.saveConfirm.waitFor({ state: 'visible' });
```

---

## Fixtures and Helper Scripts

### Fixture Architecture

Fixtures provide reusable functionality and are organized by domain:

```
tests/fixtures/
├── base.ts               # Core test fixtures and custom configurations
├── test-tags.ts          # Test tagging system for organization
├── patient-helpers.ts    # Patient-specific helper functions  
├── account-helpers.ts    # Account management helpers
├── clinic-helpers.ts     # Clinician workflow helpers
└── network-helpers.ts    # API testing and network capture
```

### Base Fixture Usage

```typescript
import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';

// Access custom fixtures
test('Test with enhanced fixtures', async ({ page, timeLogger, stepTimer }) => {
  // Enhanced logging and timing automatically available
});
```

### Helper Function Patterns

**Setup helpers:**
```typescript
// Patient session setup
await patientTest.patient.setup(page);

// API capture setup
api = createNetworkHelper(page);
await api.startCapture();
```

**Navigation helpers:**
```typescript
// Account navigation
await accountTest.account.navigateTo('AccountSettings', page);

// Patient navigation  
await patientTest.patient.navigateTo('Profile', page);
```

**Validation helpers:**
```typescript
// API endpoint validation
await api.validateEndpointResponse('profile-metadata-put');

// Custom validation with captured requests
const putCapture = api.getCaptures()
  .find((req: any) => req.method === 'PUT' && req.url.includes('/profile'));
```

### Test Tagging System

```typescript
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';

test('Test Name', {
  tag: createValidatedTags([
    TEST_TAGS.PATIENT,      // User type
    TEST_TAGS.PERSONAL,     // User subtype  
    TEST_TAGS.API,          // Test type
    TEST_TAGS.UI,           // Test type
    TEST_TAGS.HIGH,         // Priority
    TEST_TAGS.API_PROFILE,  // Specific endpoint
  ]),
}, async ({ page }) => {
  // Test implementation
});
```

---

## Navigation Functions

### Navigation Architecture

Navigation is handled through specialized classes that provide consistent routing:

### Patient Navigation

```typescript
import PatientNav from '@pom/patient/PatientNavigation';

// Initialize navigation
const nav = new PatientNav(page);

// Direct page access
await nav.pages.ViewData.link.click();
await nav.pages.Profile.link.waitFor({ state: 'visible' });

// Verification
await nav.pages.Profile.verifyElement.waitFor({ state: 'visible' });
```

### Account Navigation

```typescript
import AccountNav from '@pom/account/AccountNavigation';

// Helper function usage (recommended)
await accountTest.account.navigateTo('AccountSettings', page);

// Direct navigation (when needed)
const accountNav = new AccountNav(page);
await accountNav.pages.AccountSettings.link.click();
```

### Clinician Multi-Workspace Navigation

**For clinician tests that require workspace navigation, use multi-workspace looping to test across all Admin/Member and tier variations:**

#### Available Workspace Combinations

The system supports 8 workspace combinations covering role and tier variations:
- **Admin Clinic** (Base, Enterprise, Essential, Professional)
- **Member Clinic** (Base, Enterprise, Essential, Professional)

#### Multi-Workspace Test Pattern

```typescript
import { test as clinicTest } from '../../fixtures/clinic-helpers';
import { ALL_WORKSPACE_KEYS, type WorkspaceKey } from '../../page-objects/clinician/ClinicianNavigation';

// Loop through all workspace variations
for (const workspace of ALL_WORKSPACE_KEYS) {
  test(`Test Name - ${workspace}`, async ({ page }) => {
    
    // Step 1: Setup clinician session
    await test.step('Given clinician account has been logged in', async () => {
      await clinicTest.clinic.setup(page);
    });

    // Step 2: Navigate to specific workspace
    await test.step(`When user navigates to ${workspace} workspace`, async () => {
      await clinicTest.clinic.navigateToWorkspace(workspace as WorkspaceKey, page);
    });

    // Step 3: Navigate to target page within workspace
    await test.step('When user navigates to target page', async () => {
      await clinicTest.clinic.navigateTo('PatientList', page);
    });

    // Step 4: Conditional logic based on role
    if (workspace.includes('Member')) {
      await test.step('Then Member user sees limited options', async () => {
        // Member-specific assertions
        await expect(adminOnlyButton).not.toBeVisible();
      });
      return; // Skip admin-only steps
    }

    // Step 5: Admin-only functionality
    await test.step('Then Admin user can access full functionality', async () => {
      await expect(adminOnlyButton).toBeVisible();
      await adminOnlyButton.click();
    });
  });
}
```

#### When to Use Multi-Workspace Looping

**Use multi-workspace looping when:**
- Test involves workspace-specific functionality
- Different roles (Admin/Member) have different permissions
- Testing needs to verify behavior across different workspace tiers
- Navigation requires being within a workspace context

**Skip multi-workspace looping when:**
- Test is purely authentication-related
- Testing global clinician features (account settings, profile)
- Test doesn't involve workspace-specific navigation or functionality

#### Single Workspace Testing

For tests that don't need multi-workspace coverage:

```typescript
import { test as clinicTest } from '../../fixtures/clinic-helpers';

test('Single Workspace Test', async ({ page }) => {
  // Use default workspace (AdminClinicBase)
  await clinicTest.clinic.setup(page);
  await clinicTest.clinic.navigateTo('Profile', page);
  
  // Test implementation without workspace variations
});
```

#### Workspace-Specific Navigation

```typescript
// Navigate to specific workspace
await clinicTest.clinic.navigateToWorkspace('AdminClinicEnterprise', page);

// Navigate to page with workspace context
await clinicTest.clinic.navigateTo('PatientList', page, 'MemberClinicBase');

// Direct workspace navigation using page objects
const clinicianNav = new ClinicianNav(page);
await clinicianNav.workspaces.AdminClinicProfessional.link.click();
```

### Navigation Patterns

**Using helper functions (preferred):**
```typescript
// Setup navigation after login
await patientTest.patient.setup(page);
await clinicTest.clinic.setup(page);

// Navigate to specific pages
await accountTest.account.navigateTo('AccountSettings', page);
await clinicTest.clinic.navigateTo('PatientList', page);
```

**Direct navigation when more control is needed:**
```typescript
const nav = new PatientNav(page);

// Close any blocking dialogs first
await patientTest.patient.closeDialogs(page);

// Navigate with verification
await nav.pages.Profile.link.click();
await nav.pages.Profile.verifyElement.waitFor({ state: 'visible' });
```

---

## Complete Test Example

Here's a complete test demonstrating all patterns:

```typescript
import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { test as accountTest } from '../../fixtures/account-helpers';
import { createNetworkHelper } from '../../fixtures/network-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '../../../page-objects/account/AccountSettingsPage';

test.describe('Account Settings - Personal - Edit Email', () => {
  // Test-level variables for network helpers
  let api: ReturnType<typeof createNetworkHelper>;

  test(
    'Account Settings - Personal - Edit Email',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.PERSONAL,
        TEST_TAGS.API,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
        TEST_TAGS.API_PROFILE,
      ]),
    },
    async ({ page }) => {
      // Test-level variables for cross-step usage
      const accountSettingsPage = new AccountSettingsPage(page);
      let originalEmail = '';

      // Step 1: Setup and authentication
      await test.step('Given personal account has been logged in', async () => {
        api = createNetworkHelper(page);
        await api.startCapture();
        await page.goto('/data');
        await patientTest.patient.setup(page);
      });

      // Step 2: Navigation using helper function
      await test.step('When user navigates to account settings', async () => {
        await accountTest.account.navigateTo('AccountSettings', page);
      });

      // Step 3: API validation using helper function
      await (test as any).stepNoScreenshot(
        'Then profile endpoint responds with GET request consistent with schema',
        async () => {
          await api.validateEndpointResponse('profile-metadata-get');
        },
      );

      // Step 4: UI interaction with variable capture
      await test.step('When user updates the email field', async () => {
        originalEmail = await accountSettingsPage.emailInput.inputValue();
        await accountSettingsPage.emailInput.fill('qa+TempPersonalEdit@tidepool.org');
      });

      // Step 5: User action
      await test.step('When user taps the save button', async () => {
        await accountSettingsPage.saveButton.click();
      });

      // Step 6: UI verification  
      await test.step('Then the save changes message displays', async () => {
        await accountSettingsPage.saveConfirm.waitFor({ state: 'visible', timeout: 5000 });
      });

      // Step 7: API validation with custom logic
      await (test as any).stepNoScreenshot(
        'Then PUT request is validated and email is set to new value',
        async () => {
          await api.validateEndpointResponse('profile-metadata-put');
          
          // Custom validation logic
          const putCapture = api
            .getCaptures()
            .find((req: any) => req.method === 'PUT' && req.url.includes('/profile'));
            
          if (!putCapture) throw new Error('No PUT /profile request captured');
          if (!putCapture.requestBody?.email) {
            throw new Error('PUT request missing email field');
          }
        },
      );

      // Cleanup
      await api.stopCapture();
    },
  );
});
```

---

## Migrating Existing Playwright Tests

This section provides clear patterns for converting existing Playwright tests into our standardized format. Use these examples to transform tests from other frameworks or patterns.

### Migration Checklist

**Before migrating, identify:**
1. **Test type**: Patient, Clinician, or Account-focused
2. **Required imports**: Which fixtures and page objects are needed
3. **Workspace requirements**: Does the clinician test need multi-workspace looping?
4. **API testing**: Does the test need network capture and validation?

### Converting Basic Test Structure

#### Before (Standard Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('Login Test', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'email' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

#### After (Our Format)
```typescript
import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';

test.describe('Authentication Tests', () => {
  test(
    'Patient Login Flow',
    {
      tag: createValidatedTags([
        TEST_TAGS.PATIENT,
        TEST_TAGS.PERSONAL,
        TEST_TAGS.UI,
        TEST_TAGS.HIGH,
      ]),
    },
    async ({ page }) => {
      // Step 1: Navigate to login
      await test.step('Given user navigates to login page', async () => {
        await page.goto('/login');
      });

      // Step 2: Enter credentials  
      await test.step('When user enters valid credentials', async () => {
        await page.getByRole('textbox', { name: 'email' }).fill('user@example.com');
        await page.getByRole('textbox', { name: 'password' }).fill('password');
      });

      // Step 3: Submit login
      await test.step('When user submits login form', async () => {
        await page.getByRole('button', { name: 'Login' }).click();
      });

      // Step 4: Verify success
      await test.step('Then user sees dashboard', async () => {
        await expect(page.locator('h1')).toContainText('Dashboard');
      });
    },
  );
});
```

### Converting Page Object Usage

#### Before (Basic Page Objects)
```typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

// Usage in test
const loginPage = new LoginPage(page);
await loginPage.login('user@example.com', 'password');
```

#### After (Our Page Object + Helper Pattern)
```typescript
// Use existing page objects and helper functions
import LoginPage from '@pom/LoginPage';
import { test as patientTest } from '../../fixtures/patient-helpers';

// In test
await test.step('Given user has been authenticated', async () => {
  await patientTest.patient.setup(page); // Uses helper function
});

// Or manual page object usage when needed
await test.step('When user enters credentials', async () => {
  const loginPage = new LoginPage(page);
  await loginPage.emailInput.fill('user@example.com');
  await loginPage.passwordInput.fill('password');
  await loginPage.loginButton.click();
});
```

### Converting Clinician Tests - Multi-Workspace Decision

#### Identify if Multi-Workspace Looping is Needed

**Ask these questions:**
1. Does the test navigate to a workspace-specific page? (`PatientList`, `WorkspaceSettings`, `AddPatient`)
2. Does the test involve role-based permissions? (Admin vs Member differences)
3. Does the test need to verify behavior across different workspace tiers?

#### Before (Single Test)
```typescript
test('Clinician can add patient', async ({ page }) => {
  await page.goto('/clinic-workspace');
  await page.getByRole('link', { name: 'Patient List' }).click();
  await page.getByRole('button', { name: 'Add Patient' }).click();
  // ... rest of test
});
```

#### After (Multi-Workspace if Needed)
```typescript
import { test as clinicTest } from '../../fixtures/clinic-helpers';
import { ALL_WORKSPACE_KEYS, type WorkspaceKey } from '../../page-objects/clinician/ClinicianNavigation';

// If test involves workspace navigation and role differences
for (const workspace of ALL_WORKSPACE_KEYS) {
  test(`Clinician can add patient - ${workspace}`, async ({ page }) => {
    
    await test.step('Given clinician has been logged in', async () => {
      await clinicTest.clinic.setup(page);
    });

    await test.step(`When user navigates to ${workspace} workspace`, async () => {
      await clinicTest.clinic.navigateToWorkspace(workspace as WorkspaceKey, page);
    });

    await test.step('When user navigates to patient list', async () => {
      await clinicTest.clinic.navigateTo('PatientList', page);
    });

    // Role-specific logic
    if (workspace.includes('Member')) {
      await test.step('Then Member user cannot add patients', async () => {
        await expect(page.getByRole('button', { name: 'Add Patient' })).not.toBeVisible();
      });
      return;
    }

    await test.step('When Admin user clicks Add Patient', async () => {
      await page.getByRole('button', { name: 'Add Patient' }).click();
    });
  });
}

// If test doesn't need workspace variations
test('Clinician profile settings', async ({ page }) => {
  await test.step('Given clinician has been logged in', async () => {
    await clinicTest.clinic.setup(page);
  });

  await test.step('When user navigates to profile', async () => {
    await clinicTest.clinic.navigateTo('Profile', page);
  });
  // ... rest of test (no workspace looping needed)
});
```

### Converting API Testing

#### Before (Basic Network Capture)
```typescript
test('API response validation', async ({ page }) => {
  await page.route('**/api/profile', route => route.continue());
  
  await page.goto('/profile');
  await page.getByRole('textbox', { name: 'email' }).fill('new@email.com');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Manual network validation...
});
```

#### After (Our Network Helper Pattern)
```typescript
import { createNetworkHelper } from '../../fixtures/network-helpers';

test('Profile update with API validation', async ({ page }) => {
  // Test-level variable for network helper
  let api: ReturnType<typeof createNetworkHelper>;

  await test.step('Given user is logged in with network capture', async () => {
    api = createNetworkHelper(page);
    await api.startCapture();
    await patientTest.patient.setup(page);
  });

  await test.step('When user navigates to profile', async () => {
    await accountTest.account.navigateTo('Profile', page);
  });

  // API validation step (no screenshot needed)
  await (test as any).stepNoScreenshot(
    'Then profile GET request is validated',
    async () => {
      await api.validateEndpointResponse('profile-metadata-get');
    },
  );

  await test.step('When user updates email', async () => {
    await profilePage.emailInput.fill('new@email.com');
    await profilePage.saveButton.click();
  });

  await (test as any).stepNoScreenshot(
    'Then profile PUT request is validated',
    async () => {
      await api.validateEndpointResponse('profile-metadata-put');
    },
  );

  // Cleanup
  await api.stopCapture();
});
```

### Import Migration Guide

#### Required Imports for Different Test Types

**Patient Tests:**
```typescript
import { test } from '../../fixtures/base';
import { test as patientTest } from '../../fixtures/patient-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
// Add page objects as needed:
// import PatientDashboard from '@pom/patient/PatientDashboard';
```

**Clinician Tests:**
```typescript
import { test } from '../../fixtures/base';
import { test as clinicTest } from '../../fixtures/clinic-helpers';
import { ALL_WORKSPACE_KEYS, type WorkspaceKey } from '@pom/clinician/ClinicianNavigation';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
```

**Account/Settings Tests:**
```typescript
import { test } from '../../fixtures/base';
import { test as accountTest } from '../../fixtures/account-helpers';
import { TEST_TAGS, createValidatedTags } from '../../fixtures/test-tags';
import { AccountSettingsPage } from '@pom/account/AccountSettingsPage';
```

**API Testing (add to any test type):**
```typescript
import { createNetworkHelper } from '../../fixtures/network-helpers';
// Declare at test level: let api: ReturnType<typeof createNetworkHelper>;
```

### Migration Decision Tree

```
1. What type of user does this test focus on?
   ├── Patient → Use patient-helpers, patient page objects
   ├── Clinician → Use clinic-helpers, clinician page objects  
   └── Account/General → Use account-helpers, account page objects

2. Does the test involve API validation?
   ├── Yes → Add createNetworkHelper import and api variable
   └── No → Skip network helper

3. Is this a clinician test that navigates to workspace pages?
   ├── Yes → Use multi-workspace looping pattern
   └── No → Use single workspace or no workspace

4. How complex are the interactions?
   ├── Simple → Use helper functions (setup, navigateTo)
   └── Complex → Create page object instances + helper functions
```

This migration guide provides clear conversion patterns that any AI can follow to transform existing Playwright tests into your standardized format.

---

## Best Practices

### Test Organization

1. **Use descriptive test and step names** that clearly indicate purpose
2. **Group related tests** in describe blocks
3. **Follow Given-When-Then pattern** for step organization
4. **Use semantic locators** (`getByRole`, `getByText`) over CSS selectors

### Variable Management

1. **Declare variables at appropriate scope** (test-level vs step-level)
2. **Use meaningful variable names** that indicate content/purpose
3. **Initialize complex objects early** (page objects, network helpers)
4. **Clean up resources** in finally blocks or at test end

### Helper Function Usage

1. **Prefer helper functions** over direct page object usage for common flows
2. **Use fixtures** for cross-cutting concerns (logging, timing, network)
3. **Leverage navigation helpers** for consistent routing
4. **Validate API responses** using network helpers when testing UI that triggers API calls

### Error Handling

1. **Use appropriate timeouts** for element waits
2. **Provide meaningful error messages** for custom validations
3. **Clean up resources** even when tests fail
4. **Use stepNoScreenshot** for API-only validations to reduce noise

### Code Reusability  

1. **Create page objects** for any UI component used in multiple tests
2. **Extract repeated logic** into helper functions
3. **Use test tags** consistently for test organization and filtering
4. **Document complex page objects** with JSDoc comments

This guide ensures all team members and AI assistants can create consistent, maintainable tests following established patterns.