"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.logoutSchema = exports.loginSchema = void 0;
/**
 * Schema for user authentication login
 */
exports.loginSchema = {
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
    validationFields: ['userid', 'username', 'emails', 'roles'],
    requiredFields: [
        'userid', // Auth endpoints require userid instead of fullName
        'username', // Username is also critical for auth
    ],
};
/**
 * Schema for user logout
 */
exports.logoutSchema = {
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
exports.refreshTokenSchema = {
    url: /\/auth\/token$/,
    method: 'POST',
    expectedStatus: 200,
    responseSchema: {
        userid: 'string',
        username: 'string',
    },
    validationFields: ['userid', 'username'],
    requiredFields: [
        'userid', // Token refresh must return userid
    ],
};
