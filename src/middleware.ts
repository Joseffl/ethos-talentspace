import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Use the lightweight privy-token check for middleware 
// to avoid heavy JWKS fetching on every single request
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/webhooks",
  "/explore", // Added based on your Navbar
  "/how-it-works",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get("privy-token")?.value

  // 1. Check if the route is public
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 2. If it's a public route, let them through regardless of auth
  if (isPublic) {
    return NextResponse.next()
  }

  // 3. If NOT a public route and NO token exists, redirect to home
  if (!authToken) {
    const searchParams = new URLSearchParams(request.nextUrl.search)
    searchParams.set("unauthorized", "true")
    return NextResponse.redirect(new URL(`/?${searchParams.toString()}`, request.url))
  }

  // 4. Token exists, let it pass to Server Components.
  // We do the HEAVY verification in 'getCurrentUser' (Server Component) 
  // rather than Middleware to keep edge execution fast and prevent JWKS timeouts.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}