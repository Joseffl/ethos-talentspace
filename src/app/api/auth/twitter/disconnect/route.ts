import { NextResponse } from "next/server"
import { getCurrentUser } from "@/services/privy"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function POST() {
  try {
    const { userId } = await getCurrentUser()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Revoke Twitter access (optional - Twitter doesn't always require this)
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
    })

    if (user?.twitterAccessToken) {
      try {
        await fetch("https://api.twitter.com/2/oauth2/revoke", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            token: user.twitterAccessToken,
            token_type_hint: "access_token",
          }),
        })
      } catch (e) {
        // Ignore revocation errors - we'll clear locally anyway
        console.log("Token revocation failed (non-critical):", e)
      }
    }

    // Clear Twitter data from database
    await db
      .update(UserTable)
      .set({
        twitterId: null,
        twitterUsername: null,
        twitterName: null,
        twitterImage: null,
        twitterAccessToken: null,
        twitterRefreshToken: null,
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, userId))

    revalidatePath("/profile")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Twitter disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect Twitter" }, { status: 500 })
  }
}
