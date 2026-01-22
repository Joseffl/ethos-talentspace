import { db } from "@/drizzle/db"
import { UserRole, UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/db/cache"
import { PrivyClient, verifyAuthToken, verifyIdentityToken } from "@privy-io/node"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { cookies } from "next/headers"
import { createRemoteJWKSet } from "jose"

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
})

const verificationKey = createRemoteJWKSet(
  new URL(`https://auth.privy.io/api/v1/apps/${process.env.NEXT_PUBLIC_PRIVY_APP_ID}/jwks.json`)
)

export async function getCurrentUser({ allData = false } = {}) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("privy-token")?.value
  const idToken = cookieStore.get("privy-id-token")?.value

  if (!authToken) {
    return {
      userId: undefined,
      role: undefined,
      user: undefined,
      walletAddress: undefined,
    }
  }

  try {
    const verifiedClaims = await verifyAuthToken({
      auth_token: authToken,
      app_id: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
      verification_key: verificationKey,
    })
    const privyUserId = verifiedClaims.user_id

    // Try to get user details from identity token if available
    let walletAddress: string | null = null
    let email: string | null = null

    if (idToken) {
      try {
        const privyUser = await verifyIdentityToken({
          identity_token: idToken,
          app_id: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
          verification_key: verificationKey,
        })

        // Extract wallet and email from linked accounts
        for (const account of privyUser.linked_accounts || []) {
          if (account.type === "wallet" && "address" in account) {
            walletAddress = (account as any).address
          }
          if (account.type === "email" && "address" in account) {
            email = (account as any).address
          }
        }
      } catch (e) {
        // Identity token verification failed, continue with just user ID
        console.log("Identity token verification failed, continuing with auth token only")
      }
    }

    // Find or create user in database
    let dbUser = await db.query.UserTable.findFirst({
      where: eq(UserTable.privyUserId, privyUserId),
    })

    if (!dbUser) {
      // Build the set object for onConflictDoUpdate - only include non-null values
      const updateSet: Record<string, string> = {}
      if (walletAddress) updateSet.walletAddress = walletAddress
      if (email) updateSet.email = email

      // Create new user
      const [newUser] = await db
        .insert(UserTable)
        .values({
          privyUserId,
          walletAddress,
          email: email || "",
          name: walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : email?.split("@")[0] || "User",
          role: "user",
        })
        .onConflictDoUpdate({
          target: UserTable.privyUserId,
          // Only set values if we have any, otherwise set privyUserId to itself (no-op)
          set: Object.keys(updateSet).length > 0 ? updateSet : { privyUserId },
        })
        .returning()

      dbUser = newUser
    } else {
      // User exists - update wallet address if we have one from Privy and it's different from DB
      if (walletAddress && dbUser.walletAddress !== walletAddress) {
        console.log(`[Privy] Syncing wallet address for user ${dbUser.id}: ${dbUser.walletAddress} -> ${walletAddress}`)
        const [updatedUser] = await db
          .update(UserTable)
          .set({
            walletAddress,
            updatedAt: new Date()
          })
          .where(eq(UserTable.id, dbUser.id))
          .returning()

        dbUser = updatedUser
      }
    }


    return {
      privyUserId,
      userId: dbUser?.id,
      role: dbUser?.role as UserRole,
      walletAddress: dbUser?.walletAddress || walletAddress,
      user: allData && dbUser?.id ? await getUser(dbUser.id) : undefined,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return {
      userId: undefined,
      role: undefined,
      user: undefined,
      walletAddress: undefined,
    }
  }
}

async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}

export { privy }
