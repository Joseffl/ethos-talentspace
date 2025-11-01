import { Button } from "@/components/ui/button"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode, Suspense } from "react"

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  )
}

function Navbar() {
  return (
    <header className="shadow bg-background z-10">
      <nav className="flex items-center justify-between container mx-auto px-4 h-12">
        <Link
          className="text-lg text-[#28ac30] font-bold hover:underline flex items-center"
          href="/"
        >
          MAGS LMS
        </Link>

        <div className="flex items-center gap-4">
          <Suspense>
            <SignedIn>
              <AdminLink />
              <Link
                className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
                href="/courses"
              >
                My Courses
              </Link>
              <Link
                className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
                href="/purchases"
              >
                Purchase History
              </Link>
              <div className="size-8 flex items-center justify-center">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: { width: "100%", height: "100%" },
                    },
                  }}
                />
              </div>
            </SignedIn>
          </Suspense>

          <Suspense>
            <SignedOut>
              <Button className="self-center bg-[#28ac30]" asChild>
                <SignInButton>Sign In
                  
                  </SignInButton>
              </Button>
            </SignedOut>
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

async function AdminLink() {
  const user = await getCurrentUser()
  if (!canAccessAdminPages(user)) return null

  return (
    <Link
      className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
      href="/admin"
    >
      Admin
    </Link>
  )
}
