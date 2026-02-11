"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = __importDefault(require("zod"));
dotenv_1.default.config();
const envSchema = zod_1.default.object({
    BROWSERSTACK_USERNAME: zod_1.default.string().optional(),
    BROWSERSTACK_ACCESS_KEY: zod_1.default.string().optional(),
    PERSONAL_USERNAME: zod_1.default.string(),
    PERSONAL_PASSWORD: zod_1.default.string(),
    CLAIMED_USERNAME: zod_1.default.string(),
    CLAIMED_PASSWORD: zod_1.default.string(),
    SHARED_USERNAME: zod_1.default.string(),
    SHARED_PASSWORD: zod_1.default.string(),
    CLINICIAN_USERNAME: zod_1.default.string(),
    CLINICIAN_PASSWORD: zod_1.default.string(),
    TARGET_ENV: zod_1.default.enum(['qa1', 'qa2', 'qa3', 'qa4', 'qa5', 'production', 'prd', 'int']),
    XRAY_CLIENT_ID: zod_1.default.string().optional(),
    XRAY_CLIENT_SECRET: zod_1.default.string().optional(),
    XRAY_PROJECT_KEY: zod_1.default.string().default('SAND'),
    XRAY_EVIDENCE_SIZE_THRESHOLD_KB: zod_1.default.coerce.number().default(100),
    JIRA_EMAIL: zod_1.default.string().optional(),
    JIRA_API_KEY: zod_1.default.string().optional(),
});
const env = envSchema.safeParse(process.env);
if (!env.success) {
    console.error('❌ Invalid environment variables:\n', env.error.format());
    throw new Error('Invalid environment variables. Check your .env file.');
}
const URL_MAP = {
    qa1: 'https://qa1.development.tidepool.org',
    qa2: 'https://qa2.development.tidepool.org',
    qa3: 'https://qa3.development.tidepool.org',
    qa4: 'https://qa4.development.tidepool.org',
    qa5: 'https://qa5.development.tidepool.org',
    production: 'https://app.tidepool.org',
    prd: 'https://app.tidepool.org', // Alias for production
    int: 'https://int.development.tidepool.org', // Integration environment
};
exports.default = {
    ...env.data,
    BASE_URL: URL_MAP[env.data.TARGET_ENV],
};
