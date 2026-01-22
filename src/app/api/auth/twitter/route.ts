import { NextResponse } from "next/server"
import { getCurrentUser } from "@/services/privy"
import crypto from "crypto"

// Twitter OAuth 2.0 PKCE flow
export async function GET() {
  try {
    const { userId } = await getCurrentUser()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = process.env.TWITTER_CLIENT_ID
    if (!clientId) {
      return NextResponse.json({ error: "Twitter client ID not configured" }, { status: 500 })
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString("base64url")
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url")

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString("hex")

    // Store state and code_verifier in a cookie (they'll be needed in callback)
    const cookieData = JSON.stringify({ state, codeVerifier, userId })
    const encodedData = Buffer.from(cookieData).toString("base64")

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

    const authUrl = new URL("https://twitter.com/i/oauth2/authorize")
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", redirectUri)
    authUrl.searchParams.set("scope", "users.read tweet.read offline.access")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("code_challenge", codeChallenge)
    authUrl.searchParams.set("code_challenge_method", "S256")

    const response = NextResponse.redirect(authUrl.toString())

    // Set cookie with OAuth state (expires in 10 minutes)
    response.cookies.set("twitter_oauth_state", encodedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Twitter OAuth init error:", error)
    return NextResponse.json({ error: "Failed to initiate Twitter OAuth" }, { status: 500 })
  }
}
