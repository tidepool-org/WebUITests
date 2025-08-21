# Endpoint-Specific Validation Fields

This system allows each API endpoint to define its own validation fields for data consistency checking, eliminating the need for hardcoded validation arrays in the network helpers.

## How It Works

1. **Endpoint Schema Definition**: Each endpoint schema includes a `validationFields` array
2. **Automatic Field Selection**: Network helper methods automatically use the endpoint-specific fields
3. **Fallback Support**: If no fields are defined, sensible defaults are used
4. **Override Capability**: Test code can still override with custom validation fields if needed

## Example Usage

### Defining an Endpoint Schema

```typescript
// In profile-endpoints.ts
export const getProfileMetadataSchema: EndpointSchema = {
  url: /\/metadata\/.*\/profile$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    fullName: 'string',
    patient: 'object',
  },
  validationFields: [
    'fullName',
    'patient.fullName',
    'patient.birthday',
    'patient.diagnosisDate',
    'email',
  ],
};
```

### Using in Tests

```typescript
// Automatically uses endpoint-specific validation fields
await api.compareEndpointResponse('profile-metadata-get', putCapture);

// Override with custom fields if needed
await api.compareEndpointResponse('profile-metadata-get', putCapture, ['fullName', 'email']);
```

## Benefits

- **Maintainable**: Validation fields are defined once per endpoint
- **Scalable**: Easy to add new endpoints with different validation requirements
- **Flexible**: Can override validation fields per test when needed
- **Clear**: Validation logic is co-located with endpoint definition
- **Type Safe**: TypeScript ensures endpoint names are valid

## Adding New Endpoints

1. Define the schema in the appropriate `*-endpoints.ts` file
2. Include the `validationFields` array
3. Add to the `ENDPOINT_REGISTRY` in `endpoint-registry.ts`
4. The NetworkHelper will automatically use the defined fields

## Field Notation

- Simple fields: `'fullName'`
- Nested fields: `'patient.birthday'`
- Array fields: `'patient.emails'`
- Deep nesting: `'patient.settings.timezone'`
