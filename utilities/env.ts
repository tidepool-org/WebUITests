import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  BROWSERSTACK_USERNAME: z.string().optional(),
  BROWSERSTACK_ACCESS_KEY: z.string().optional(),
  PATIENT_USERNAME: z.string(),
  PATIENT_PASSWORD: z.string(),
  CLINICIAN_USERNAME: z.string(),
  CLINICIAN_PASSWORD: z.string(),
  TARGET_ENV: z.enum(["qa1", "qa2", "qa3", "qa4", "qa5", "production"]),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error("❌ Invalid environment variables:\n", env.error.format());
  process.exit(1);
}

const URL_MAP: Record<typeof env.data.TARGET_ENV, string> = {
  qa1:        'https://qa1.development.tidepool.org',
  qa2:        'https://qa2.development.tidepool.org',
  qa3:        'https://qa3.development.tidepool.org',
  qa4:        'https://qa4.development.tidepool.org',
  qa5:        'https://qa5.development.tidepool.org',
  production: 'https://app.tidepool.org',
};

export default {
  ...env.data,
  BASE_URL: URL_MAP[env.data.TARGET_ENV],

}
