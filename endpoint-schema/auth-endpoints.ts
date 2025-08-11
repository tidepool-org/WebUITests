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
    password: 'string'
  },
  responseSchema: {
    userid: 'string',
    username: 'string',
    emails: 'object',
    roles: 'object'
  }
};

/**
 * Schema for user logout
 */
export const logoutSchema: EndpointSchema = {
  url: /\/auth\/logout$/,
  method: 'POST',
  expectedStatus: 200
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
    username: 'string'
  }
};
