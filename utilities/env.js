import dotenv from "dotenv";
import z from "zod";

dotenv.config();

/** making sure that we have all the required environment variables */
const envSchema = z.object({
  BROWSERSTACK_USER: z.string(),
  BROWSERSTACK_KEY: z.string(),
  DSA_USERNAME_TANDEM: z.string(),
  DSA_PASSWORD_TANDEM: z.string(),
  OTP_SECRET: z.string().optional(),
  GMAIL_PASSWORD: z.string(),
  GMAIL_USERNAME: z.string(),
  CLINICIAN_USERNAME: z.string(),
  CLINICIAN_PASSWORD: z.string(),
  ENV: z.enum(["qa1", "qa2", "qa3", "qa4", "qa5", "production"]),
});

const env = envSchema.safeParse(process.env);
if (!env.success) {
  throw new Error("Invalid environment variables", { cause: env.error });
}

export default env.data;
