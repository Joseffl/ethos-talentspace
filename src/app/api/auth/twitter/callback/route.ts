import { NextRequest, NextResponse } from "next/server"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("Twitter OAuth error:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=${error}`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=missing_params`)
    }

    // Get stored state from cookie
    const storedData = request.cookies.get("twitter_oauth_state")?.value
    if (!storedData) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=no_state`)
    }

    const { state: storedState, codeVerifier, userId } = JSON.parse(
      Buffer.from(storedData, "base64").toString()
    )

    // Verify state
    if (state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=invalid_state`)
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Twitter token error:", errorData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=token_error`)
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token } = tokens

    // Get user info from Twitter
    const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error("Twitter user info error:", await userResponse.text())
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=user_info_error`)
    }

    const userData = await userResponse.json()
    const twitterUser = userData.data

    // Update user in database
    await db
      .update(UserTable)
      .set({
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        twitterName: twitterUser.name,
        twitterImage: twitterUser.profile_image_url?.replace("_normal", "_400x400"), // Get larger image
        twitterAccessToken: access_token,
        twitterRefreshToken: refresh_token,
        updatedAt: new Date(),
      })
      .where(eq(UserTable.id, userId))

    revalidatePath("/profile")

    // Clear the OAuth cookie and redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_connected=true`)
    response.cookies.delete("twitter_oauth_state")

    return response
  } catch (error) {
    console.error("Twitter OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?twitter_error=callback_error`)
  }
}
