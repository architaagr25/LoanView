import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Resolve .env relative to the server root rather than the current working
// directory, so the app behaves the same whether it is started from server/,
// from the repository root, or by a process manager.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine((value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"), {
      message: "MONGODB_URI must start with mongodb:// or mongodb+srv://",
    }),

  // Anyone holding this value can mint tokens for any account, so it must be
  // long and random. 32 characters is the floor, not a recommendation.
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  // Comma-separated so local development and the deployed frontend can both be
  // allowed without needing a second variable.
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail loudly at startup instead of throwing confusing errors later, when the
  // first request happens to touch whichever variable was missing.
  console.error("Invalid environment configuration:\n");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  console.error("\nCopy .env.example to .env and fill in the values.\n");
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: parsed.data.NODE_ENV === "production",
};
