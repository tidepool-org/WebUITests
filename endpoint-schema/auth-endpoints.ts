import { EndpointSchema } from './profile-endpoints';

/**
 * Schema for user authentication login
 */
export const loginSchema: EndpointSchema = {
  url: /\/auth\/login$/,
  method: 'POST',
  expectedStatus: 200,
  requestSchema: {
    username: 'string',
    password: 'string',
  },
  responseSchema: {
    userid: 'string',
    username: 'string',
    emails: 'object',
    roles: 'object',
  },
  validationFields: [
    'userid',
    'username',
    'emails',
    'roles',
  ],
  requiredFields: [
    'userid',    // Auth endpoints require userid instead of fullName
    'username',  // Username is also critical for auth
  ],
};

/**
 * Schema for user logout
 */
export const logoutSchema: EndpointSchema = {
  url: /\/auth\/logout$/,
  method: 'POST',
  expectedStatus: 200,
  validationFields: [
    // Logout typically doesn't return data to validate
  ],
};

/**
 * Schema for token refresh
 */
export const refreshTokenSchema: EndpointSchema = {
  url: /\/auth\/token$/,
  method: 'POST',
  expectedStatus: 200,
  responseSchema: {
    userid: 'string',
    username: 'string',
  },
  validationFields: [
    'userid',
    'username',
  ],
  requiredFields: [
    'userid',    // Token refresh must return userid
  ],
};
