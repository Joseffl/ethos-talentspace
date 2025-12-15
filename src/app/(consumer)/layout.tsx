// import { Button } from "@/components/ui/button"
// import { canAccessAdminPages } from "@/permissions/general"
// import { getCurrentUser } from "@/services/clerk"
// import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
// import Link from "next/link"
// import { ReactNode, Suspense } from "react"
// import { NavbarClient } from "./navbar-client"

// export default function ConsumerLayout({
//   children,
// }: Readonly<{ children: ReactNode }>) {
//   return (
//     <>
//       <Navbar />
//       <main className="container mx-auto px-4 py-6">{children}</main>
//     </>
//   )
// }

// function Navbar() {
//   return (
//     <header className="sticky top-0 z-50  bg-white/80 backdrop-blur-md shadow">
//       <nav className="flex items-center justify-between container mx-auto px-4 h-14">
//         <Link
//           className="text-lg text-[#28ac30] font-bold hover:underline flex items-center"
//           href="/"
//         >
//           MAGS LMS
//         </Link>

//         <div className="flex items-center gap-4">
//           <Suspense>
//             <SignedIn>
//               <AdminLink />
//               <Link
//                 className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
//                 href="/courses"
//               >
//                 My Courses
//               </Link>
//               <Link
//                 className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
//                 href="/purchases"
//               >
//                 Purchase History
//               </Link>
//               <NavbarClient />
//             </SignedIn>
//           </Suspense>

//           <Suspense>
//             <SignedOut>
//               <Button className="self-center bg-[#28ac30]" asChild>
//                 <SignInButton>Sign In</SignInButton>
//               </Button>
//             </SignedOut>
//           </Suspense>
//         </div>
//       </nav>
//     </header>
//   )
// }

// async function AdminLink() {
//   const user = await getCurrentUser()
//   if (!canAccessAdminPages(user)) return null

//   return (
//     <Link
//       className="hover:bg-accent/10 flex items-center px-2 py-1 rounded-md"
//       href="/admin"
//     >
//       Admin
//     </Link>
//   )
// }

import { Button } from "@/components/ui/button"
import { canAccessAdminPages } from "@/permissions/general"
import { getCurrentUser } from "@/services/clerk"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import Link from "next/link"
import { ReactNode, Suspense } from "react"
import { NavbarClient } from "./navbar-client"
import { Footer } from "@/components/Footer"
import { MobileNav } from "@/components/MobileNav"

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow">
      <nav className="flex items-center justify-between container mx-auto px-4 h-14">
        <Link
          className="text-lg text-[#28ac30] font-bold hover:underline flex items-center"
          href="/"
        >
          MAGS LMS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
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
              <NavbarClient />
            </SignedIn>
          </Suspense>

          <Suspense>
            <SignedOut>
              <Button className="self-center bg-[#28ac30]" asChild>
                <SignInButton>Sign In</SignInButton>
              </Button>
            </SignedOut>
          </Suspense>
        </div>


        <Suspense>
          <MobileNavWrapper />
        </Suspense>

        
      </nav>
    </header>
  )
}

async function MobileNavWrapper() {
  const user = await getCurrentUser()
  const isSignedIn = !!user
  const showAdminLink = canAccessAdminPages(user)

  return <MobileNav isSignedIn={isSignedIn} showAdminLink={showAdminLink} />
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