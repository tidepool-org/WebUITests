# Network Testing & API Validation Structure

This directory structure provides a comprehensive framework for testing and validating network requests and API responses in Playwright tests.

## Directory Structure

```
tests/
├── patient/
│   └── profile-tests/           # Profile-specific tests
│       └── profile-api-validation.spec.ts
├── fixtures/
│   └── network-helpers.ts       # Network capture and validation utilities
└── endpoint-schema/             # API endpoint schema definitions
    ├── auth-endpoints.ts        # Authentication API schemas
    ├── patient-data-endpoints.ts # Patient data API schemas
    └── profile-endpoints.ts     # Profile API schemas
```

## How It Works

### 1. Network Helper (`tests/fixtures/network-helpers.ts`)

The `NetworkHelper` class provides:
- **Request/Response Capture**: Automatically intercepts and captures all network traffic
- **Schema Validation**: Validates API responses against predefined schemas
- **Filtering**: Filter captures by URL patterns, HTTP methods, etc.
- **Waiting**: Wait for specific requests to complete
- **Validation**: Validate request/response structure and data types

### 2. Endpoint Schemas (`endpoint-schema/`)

Schema files define the expected structure of API endpoints:
- **URL Patterns**: Regular expressions to match API endpoints
- **HTTP Methods**: Expected HTTP methods (GET, POST, PUT, DELETE)
- **Status Codes**: Expected response status codes
- **Request/Response Schemas**: Data structure validation

### 3. Test Implementation

Tests can:
- Capture all network traffic during user interactions
- Validate specific API calls against schemas
- Assert on response data and structure
- Log and analyze API usage patterns

## Usage Example

```typescript
import { test } from '@fixtures/patient-helpers';
import { createNetworkHelper } from '@fixtures/network-helpers';
import { getUserProfileSchema } from '../../../endpoint-schema/profile-endpoints';

test('should validate profile API', async ({ page }) => {
  const networkHelper = createNetworkHelper(page);
  
  // Register schemas
  networkHelper.registerSchema('getUserProfile', getUserProfileSchema);
  
  // Start capturing
  await networkHelper.startCapture();
  
  // Perform user actions
  await test.patient.navigateTo('Profile', page);
  
  // Validate API calls
  await networkHelper.validateCapture('profileRequest', 'getUserProfile');
  
  // Stop capturing
  await networkHelper.stopCapture();
});
```

## Benefits

1. **API Contract Validation**: Ensure APIs return expected data structures
2. **Regression Detection**: Catch API changes that break the frontend
3. **Performance Monitoring**: Track API response times and patterns
4. **Documentation**: Schema files serve as API documentation
5. **Debugging**: Capture and analyze network traffic during test failures

## Schema Definition Examples

### Profile GET Endpoint
```typescript
export const getUserProfileSchema: EndpointSchema = {
  url: /\/v1\/users\/[^\/]+$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    userid: 'string',
    username: 'string',
    profile: {
      fullName: 'string',
      patient: 'object'
    }
  }
};
```

### Profile Update Endpoint
```typescript
export const updateUserProfileSchema: EndpointSchema = {
  url: /\/v1\/users\/[^\/]+$/,
  method: 'PUT',
  expectedStatus: 200,
  requestSchema: {
    profile: {
      fullName: 'string',
      patient: 'object'
    }
  },
  responseSchema: {
    userid: 'string',
    profile: 'object'
  }
};
```

## Network Helper Methods

- `startCapture()`: Begin capturing network requests
- `stopCapture()`: Stop capturing and clean up
- `registerSchema(name, schema)`: Register an endpoint schema
- `validateCapture(captureName, schemaName)`: Validate against schema
- `getCapturesByUrl(pattern)`: Filter captures by URL
- `getCapturesByMethod(method)`: Filter captures by HTTP method
- `waitForRequest(pattern, method, timeout)`: Wait for specific request
- `clearCaptures()`: Clear all captured data

This structure makes it easy to:
- Add new endpoint schemas as the API evolves
- Create comprehensive API validation tests
- Debug network-related issues
- Ensure API contracts are maintained
