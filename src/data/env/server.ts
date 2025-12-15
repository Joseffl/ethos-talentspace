
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"



export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    TEST_IP_ADDRESS: z.string().min(1).optional(),
    FLUTTERWAVE_SECRET_KEY: z.string().min(1),
    FLUTTERWAVE_WEBHOOK_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
})