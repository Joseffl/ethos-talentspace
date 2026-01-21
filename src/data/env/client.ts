import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
    NEXT_PUBLIC_SERVER_URL: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
})