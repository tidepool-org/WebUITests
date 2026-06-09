import dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  BROWSERSTACK_USERNAME: z.string().optional(),
  BROWSERSTACK_ACCESS_KEY: z.string().optional(),
  PERSONAL_USERNAME: z.string(),
  PERSONAL_PASSWORD: z.string(),
  CLAIMED_USERNAME: z.string(),
  CLAIMED_PASSWORD: z.string(),
  SHARED_USERNAME: z.string(),
  SHARED_PASSWORD: z.string(),
  CLINICIAN_USERNAME: z.string(),
  CLINICIAN_PASSWORD: z.string(),
  TARGET_ENV: z.enum(['qa1', 'qa2', 'qa3', 'qa4', 'qa5', 'production', 'prd', 'int', 'dev1']),
  XRAY_CLIENT_ID: z.string().optional(),
  XRAY_CLIENT_SECRET: z.string().optional(),
  XRAY_PROJECT_KEY: z.string().default('SAND'),
  XRAY_BATCH_SIZE_MB: z.coerce.number().default(2),
  TEST_EXECUTION_KEY: z.string().optional(),
  JIRA_EMAIL: z.string().optional(),
  JIRA_API_KEY: z.string().optional(),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error('❌ Invalid environment variables:\n', env.error.format());
  throw new Error('Invalid environment variables. Check your .env file.');
}

const URL_MAP: Record<typeof env.data.TARGET_ENV, string> = {
  qa1: 'https://qa1.development.tidepool.org',
  qa2: 'https://qa2.development.tidepool.org',
  qa3: 'https://qa3.development.tidepool.org',
  qa4: 'https://qa4.development.tidepool.org',
  qa5: 'https://qa5.development.tidepool.org',
  production: 'https://app.tidepool.org',
  prd: 'https://app.tidepool.org', // Alias for production
  int: 'https://external.integration.tidepool.org', // Integration environment
  dev1: 'https://dev1.dev.tidepool.org/', // Development environment
};

export default {
  ...env.data,
  BASE_URL: URL_MAP[env.data.TARGET_ENV],
};
