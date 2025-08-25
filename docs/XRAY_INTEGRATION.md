# Xray Integration Documentation

## Overview

This project uses a unified JSON-based Xray integration that captures rich test data from Playwright and uploads it to Xray with step-by-step evidence including screenshots, videos, and test annotations.

## Architecture

### 1. **Playwright Configuration** (`playwright.config.ts`)

- **JSON Reporter**: Generates `test-results/last-run.json` with complete test data
- **Xray JSON Reporter**: Custom reporter that automatically uploads to Xray
- **Legacy XML Reporter**: Still available for backward compatibility

```typescript
reporter: [
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'test-results/last-run.json' }],        // New JSON format
  ['junit', xrayOptions],                                        // Legacy XML format
  ['./utilities/xray-json-reporter.ts'],                         // Auto-upload to Xray
],
```

### 2. **Xray JSON Reporter** (`utilities/xray-json-reporter.ts`)

**Features:**

- Maps Playwright test steps to Xray test steps with individual evidence
- Attaches screenshots per step (e.g., `step-01-given-clinician-has-been-logged-in.png`)
- Includes test tags, annotations, and custom properties
- Embeds video evidence for failed tests
- Supports test execution key parameter for linking to existing test executions

**Data Mapping:**

- **Test Steps**: Extracts from `Step Duration:` annotations
- **Evidence**: Screenshots, videos, JSON responses per step
- **Status**: Pass/Fail/Pending with detailed failure messages
- **Metadata**: Environment, build info, test tags

### 3. **CircleCI Integration** (`.circleci/config.yml`)

**Simplified Workflow:**

1. Run tests → Generate `test-results/last-run.json`
2. Build TypeScript utilities
3. Upload to Xray using `node utilities/upload-to-xray.js`

**Environment Variables:**

- `TEST_EXECUTION_KEY`: Links results to existing Xray test execution
- `XRAY_CLIENT_ID`: Xray API authentication
- `XRAY_CLIENT_SECRET`: Xray API authentication
- `TARGET_ENV`: Test environment (qa1, qa2, etc.)

## Usage

### Local Development

```bash
# Run tests and auto-upload to Xray (if credentials available)
npm test

# Manual upload of existing results
npm run upload-to-xray test-results/last-run.json

# Build TypeScript utilities
npm run build
```

### CI/CD Pipeline

Tests automatically upload to Xray when:

- `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are available
- `TEST_EXECUTION_KEY` parameter is provided
- JSON results file exists

### Test Tagging

Use test tags to organize and filter results in Xray:

```typescript
{
  tag: createValidatedTags([
    TEST_TAGS.PATIENT,
    TEST_TAGS.API,
    TEST_TAGS.HIGH,
    TEST_TAGS.API_USER,
  ]),
}
```

## Xray JSON Format

### Test Execution Structure

```json
{
  "info": {
    "summary": "Playwright Test Execution - 2025-08-22T19:50:15.680Z",
    "testExecutionKey": "XT-123",
    "testEnvironments": ["qa1"],
    "startDate": "2025-08-22T19:50:15.680Z",
    "finishDate": "2025-08-22T19:50:56.408Z"
  },
  "tests": [...]
}
```

### Individual Test Structure

```json
{
  "testInfo": {
    "summary": "should allow navigation to account settings",
    "type": "Generic",
    "projectKey": "XT",
    "labels": ["patient", "api", "high"]
  },
  "status": "PASS",
  "evidences": [
    {
      "data": "base64-encoded-screenshot",
      "filename": "final-screenshot.png",
      "contentType": "image/png"
    }
  ],
  "steps": [
    {
      "action": "Given clinician has been logged in",
      "data": "Duration: 5193ms",
      "status": "PASS",
      "evidences": [
        {
          "data": "base64-encoded-step-screenshot",
          "filename": "step-01-given-clinician-has-been-logged-in.png",
          "contentType": "image/png"
        }
      ]
    }
  ]
}
```

## Benefits Over Legacy XML

| Feature           | XML (Legacy)          | JSON (New)             |
| ----------------- | --------------------- | ---------------------- |
| Test Steps        | ❌ Basic only         | ✅ Full step breakdown |
| Screenshots       | ❌ Separate API calls | ✅ Embedded per step   |
| Videos            | ❌ Not supported      | ✅ Embedded evidence   |
| Custom Properties | ❌ Limited            | ✅ Rich metadata       |
| Test Tags         | ❌ Basic              | ✅ Full tag system     |
| Debugging Info    | ❌ Minimal            | ✅ Comprehensive       |

## Migration Notes

### Current State

- **JSON**: Primary integration with rich evidence
- **XML**: Available for backward compatibility
- **Duplicate Steps**: Removed from CircleCI

### Future Cleanup

Once fully validated, remove:

- `xrayOptions` configuration in `playwright.config.ts`
- `['junit', xrayOptions]` reporter
- Legacy `utilities/xray-reporter.ts` file

## Troubleshooting

### Common Issues

1. **Missing JSON file**: Ensure `json` reporter is enabled in Playwright config
2. **Upload failures**: Check Xray credentials and network connectivity
3. **Step evidence missing**: Verify step naming conventions in test annotations
4. **TypeScript compilation**: Run `npm run build` before upload

### Debug Information

- Generated JSON saved to `test-results/xray-execution.json`
- Full logs available in CircleCI build output
- Test step timing and evidence captured in annotations
