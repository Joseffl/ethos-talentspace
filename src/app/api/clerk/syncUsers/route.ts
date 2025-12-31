

import { insertUser } from "@/features/users/db/users"
import { syncClerkUserMetadata } from "@/services/clerk"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/server-utils"

export async function GET(request: Request) {
  const user = await currentUser()

  if (!user) return new Response("User not found", { status: 500 })
  if (!user.fullName) return new Response("User name missing", { status: 500 })
  if (!user.primaryEmailAddress?.emailAddress)
    return new Response("User email missing", { status: 500 })

  const dbUser = await insertUser({
    clerkUserId: user.id,
    name: user.fullName,
    email: user.primaryEmailAddress.emailAddress,
    imageUrl: user.imageUrl,
    role: user.publicMetadata.role ?? "user",
  })

  await syncClerkUserMetadata(dbUser)

  await new Promise((res) => setTimeout(res, 100))

  const referer = request.headers.get("referer")
  const baseUrl = await getBaseUrl() 

  const redirectUrl = referer
    ? referer.startsWith("http")
      ? referer
      : `${baseUrl}${referer}`
    : baseUrl

  return NextResponse.redirect(redirectUrl)
}