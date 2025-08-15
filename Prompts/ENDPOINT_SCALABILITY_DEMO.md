# Scalable Network Helpers - Endpoint-Driven API Validation

## Overview
The network helpers now use a scalable endpoint-driven approach instead of hardcoded functions. This allows validation of any API endpoint defined in the endpoint-schema folder.

## Before vs After

### Before (Hardcoded Functions)
```typescript
// Hardcoded profile-specific functions
await api.validateProfileGetResponse(saveToPath);
await api.validateProfilePutResponse(saveToPath);
```

### After (Endpoint-Driven Approach)
```typescript
// Generic function that works with any endpoint in the registry
await api.validateEndpointResponse('profile-metadata-get', saveToPath);
await api.validateEndpointResponse('profile-metadata-put', saveToPath);
```

## Architecture

### 1. Endpoint Schema Pattern
Each API endpoint is defined with a schema in `/endpoint-schema/`:
```typescript
// profile-endpoints.ts
export const getProfileMetadataSchema: EndpointSchema = {
  url: /\/metadata\/.*\/profile/,
  method: 'GET',
  expectedStatusCode: 200,
};
```

### 2. Centralized Registry
All endpoints are registered in `/endpoint-schema/endpoint-registry.ts`:
```typescript
export const ENDPOINT_REGISTRY = {
  'profile-metadata-get': getProfileMetadataSchema,
  'profile-metadata-put': putProfileMetadataSchema,
  // Easy to add new endpoints here
} as const;
```

### 3. Generic Validation Function
The network helpers use the registry to validate any endpoint:
```typescript
async validateEndpointResponse(endpointName: EndpointName, saveToPath?: string): Promise<NetworkCapture | null> {
  const schema = getEndpointSchema(endpointName);
  const request = this.getLatestCaptureMatching(schema.method, schema.url as RegExp);
  
  if (request?.responseBody && saveToPath) {
    await this.saveApiResponse(request.responseBody, request.url, schema.method, saveToPath);
  }
  
  return request;
}
```

## Benefits

### 1. Scalability
- Add new endpoints by simply defining them in endpoint-schema folder
- No need to create new hardcoded functions for each endpoint
- Consistent validation pattern across all API endpoints

### 2. Type Safety
```typescript
// TypeScript ensures only valid endpoint names can be used
type EndpointName = keyof typeof ENDPOINT_REGISTRY;
```

### 3. Maintainability
- Single place to define endpoint specifications
- DRY principle - no duplicated validation logic
- Easy to update endpoint definitions without touching test code

### 4. Future Extensibility
Easy to add new endpoints by following the pattern:
1. Define schema in appropriate endpoint file
2. Add to endpoint registry
3. Use in tests with `api.validateEndpointResponse('new-endpoint-name')`

## Usage Examples

```typescript
// Validate any GET endpoint
await api.validateEndpointResponse('profile-metadata-get', './responses/profile-get.json');

// Validate any PUT endpoint  
await api.validateEndpointResponse('profile-metadata-put', './responses/profile-put.json');

// Future: Easy to add more endpoints
await api.validateEndpointResponse('patient-data-get', './responses/patient-get.json');
await api.validateEndpointResponse('auth-token-post', './responses/auth-token.json');
```

## Migration
The old hardcoded functions are still available but marked as deprecated:
```typescript
/**
 * @deprecated Use validateEndpointResponse('profile-metadata-get', saveToPath) instead
 */
async validateProfileGetResponse(saveToPath?: string): Promise<NetworkCapture | null> {
  return this.validateEndpointResponse('profile-metadata-get', saveToPath);
}
```

This ensures backward compatibility while encouraging migration to the new scalable approach.
