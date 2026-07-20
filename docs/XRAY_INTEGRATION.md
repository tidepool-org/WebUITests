# Xray Integration Documentation

## Overview

This project uses a JSON-based Xray integration that captures Playwright test data and uploads it to JIRA Xray Cloud with evidence handling including screenshots and videos (failed tests only).

## Architecture

### 1. **Playwright Configuration** ([playwright.config.ts](../playwright.config.ts))

- **JSON Reporter**: Generates `test-results/last-run.json` with complete test data
- **Xray JSON Reporter**: Custom reporter that automatically uploads to Xray Cloud

```typescript
reporter: [
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'test-results/last-run.json' }],
  ['./utilities/xray-json-reporter.ts'], // Auto-upload to Xray
],
```

### 2. **Xray JSON Reporter** ([utilities/xray-json-reporter.ts](../utilities/xray-json-reporter.ts))

**Core Features:**

- Maps Playwright test steps to Xray test steps with evidence
- Attaches screenshots per step (e.g., `step-01-given-clinician-has-been-logged-in.png`)
- Embeds video evidence for failed tests only
- Supports configurable project keys
- Supports test execution key parameter for linking to existing test executions

**Evidence Handling:**

- **Videos**: Only uploaded for failed tests (saves storage)
- **Screenshots**: Always included as base64-encoded inline evidence
- **JSON responses**: Always included inline
- Passing test videos are skipped entirely

**Data Mapping:**

- **Test Steps**: Extracts from `Step Duration:` annotations
- **Evidence**: Screenshots, videos, JSON responses per step
- **Status**: PASSED/FAILED/TODO with detailed failure messages

### 3. **CircleCI Integration** ([.circleci/config.yml](../.circleci/config.yml))

The Xray reporter uploads automatically during `onEnd` — no separate CI step needed.

**Pipeline Parameters:**

- `testEnvironment` - Target environment (qa1, qa2, qa3, qa4, qa5, prd, int)
- `testExecKey` - Test Execution Key to link results to (or 'none' for auto-create)
- `testTags` - Filter tests by tags
- `xrayProjectKey` - Xray project key (default: 'SAND')

## Usage

### Local Development

```bash
# Set required environment variables in .env
XRAY_CLIENT_ID=your_client_id
XRAY_CLIENT_SECRET=your_client_secret
XRAY_PROJECT_KEY=SAND  # Optional, defaults to SAND
TARGET_ENV=qa1
TEST_EXECUTION_KEY=SAND-1245  # Or 'none' for auto-create

# Run tests — reporter auto-uploads to Xray if credentials are set
npm test
```

### CI/CD Pipeline

Tests automatically upload to Xray when:

- `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are available in environment
- `TEST_EXECUTION_KEY` is set (and not 'none')
- JSON results file exists (`test-results/last-run.json`)

**CircleCI Pipeline Triggers:**

```bash
# Run tests on qa2 and link to existing test execution
curl -X POST \
  --url https://circleci.com/api/v2/project/github/your-org/your-repo/pipeline \
  -H "Circle-Token: $CIRCLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "testEnvironment": "qa2",
      "testExecKey": "SAND-123",
      "xrayProjectKey": "SAND"
    }
  }'
```

## Xray JSON Format

### Execution Structure

```json
{
  "testExecutionKey": "SAND-1245",
  "info": {
    "summary": "Playwright Test Execution - 2025-08-22T19:50:15.680Z",
    "description": "Automated test execution for qa1 environment\n\nResults: 45 passed, 2 failed, 1 skipped",
    "startDate": "2025-08-22T19:50:15.680Z",
    "finishDate": "2025-08-22T19:50:56.408Z"
  },
  "tests": [...]
}
```

**Note:** `testExecutionKey` is at the root level. When linking to an existing execution, `testEnvironments` and `version` are omitted to avoid validation errors.

### Individual Test Structure

```json
{
  "testInfo": {
    "summary": "should allow navigation to account settings",
    "type": "Manual",
    "projectKey": "SAND",
    "steps": [
      {
        "action": "When user navigates to settings",
        "data": "Duration: 5193ms",
        "result": "Then the settings page is displayed"
      }
    ]
  },
  "status": "PASSED",
  "evidence": [
    {
      "data": "base64-encoded-screenshot",
      "filename": "final-screenshot.png",
      "contentType": "image/png"
    }
  ],
  "steps": [
    {
      "status": "PASSED",
      "evidence": [
        {
          "data": "base64-encoded-step-screenshot",
          "filename": "step-01-screenshot.png",
          "contentType": "image/png"
        }
      ]
    }
  ]
}
```

**Key details:**

- `testInfo.steps` contains step **definitions** (action, data, result)
- `test.steps` contains step **execution results** (status, evidence, actualResult)
- Status values are `PASSED`, `FAILED`, `TODO`, `EXECUTING` (Xray Cloud format)
- Evidence field is singular `evidence` (not `evidences`)

### Step Mapping Logic

Given/When/Then steps are mapped as follows:

- **Given** → Standalone step (action only)
- **When** → Step action; consecutive Then/And steps become its `result`
- **Then/And** → Combined as the result of the preceding When step

**Example:**
```
When user logs in           →  action: "When user logs in"
Then user sees dashboard         result: "Then user sees dashboard\nAnd user sees welcome"
And user sees welcome
```

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `XRAY_CLIENT_ID` | Yes | - | Xray Cloud API client ID |
| `XRAY_CLIENT_SECRET` | Yes | - | Xray Cloud API client secret |
| `XRAY_PROJECT_KEY` | No | `SAND` | Jira project key for Xray tests |
| `TARGET_ENV` | Yes | `qa1` | Test environment |
| `TEST_EXECUTION_KEY` | No | `none` | Link to existing test execution (or 'none' to auto-create) |
| `TEST_TAGS` | No | - | Filter tests by tags |

### File Locations

| File | Purpose |
|------|---------|
| `test-results/last-run.json` | Playwright JSON results (source data) |
| `test-results/xray-execution.json` | Converted Xray JSON format (debug) |
| `playwright-report/` | HTML test report |

## Troubleshooting

### Common Issues

1. **No upload happening**
   - Check `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are set
   - Verify `TEST_EXECUTION_KEY` is set and not 'none'
   - Check console output for authentication errors

2. **Tests not appearing in correct project**
   - Verify `XRAY_PROJECT_KEY` is set to correct project
   - Ensure project key is uppercase (e.g., 'SAND', not 'sand')

3. **"Result is not valid Xray Format" error**
   - Check `test-results/xray-execution.json` for the actual payload
   - Verify `testExecutionKey` is at root level (not inside `info`)
   - Ensure status values are `PASSED`/`FAILED` (not `PASS`/`FAIL`)

4. **"environments dont exist" or "Version name not valid" errors**
   - These occur when `testEnvironments` or `version` don't match Jira project config
   - When linking to existing executions, these fields are automatically omitted

5. **Steps showing as TODO instead of PASSED**
   - Verify status values use Xray Cloud format: `PASSED`, `FAILED`, `TODO`
   - Xray Server uses `PASS`/`FAIL` but Cloud uses `PASSED`/`FAILED`

### Debug Information

- Check console output during test run for upload status
- Review `test-results/xray-execution.json` for the converted payload
- Check CircleCI build logs for upload details

## API Reference

### Xray Cloud Endpoints Used

1. **Authentication**
   - Endpoint: `POST https://xray.cloud.getxray.app/api/v1/authenticate`
   - Input: `{ client_id, client_secret }`
   - Output: Token string

2. **Import Execution Results**
   - Endpoint: `POST https://xray.cloud.getxray.app/api/v2/import/execution`
   - Auth: Bearer token
   - Input: Xray JSON format
   - Output: Test execution details

## Support

For issues or questions:
- Check this documentation first
- Review CircleCI build logs
- Inspect `test-results/xray-execution.json` for payload details
- Verify environment variables are set correctly
