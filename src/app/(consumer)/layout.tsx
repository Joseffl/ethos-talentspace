import { canAccessAdminPages } from "@/permissions/general";
import { getCurrentUser } from "@/services/privy";
import Link from "next/link";
import { ReactNode, Suspense } from "react";
import { NavbarClient } from "./navbar-client";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

export default function ConsumerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="flex items-center justify-between container mx-auto px-4 h-16">
        <Link
          className="text-xl text-[#2563EB] font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
          href="/"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          Ethos Talentspace
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Suspense>
            <NavContent />
          </Suspense>
        </div>

        <Suspense>
          <MobileNavWrapper />
        </Suspense>
      </nav>
    </header>
  );
}

async function NavContent() {
  const user = await getCurrentUser();
  const isSignedIn = !!user.userId;
  const showAdminLink = canAccessAdminPages(user);

  if (!isSignedIn) {
    return (
      <>
        <Link
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          href="/explore"
        >
          Explore
        </Link>
        <Link
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          href="/how-it-works"
        >
          How It Works
        </Link>
        <NavbarClient />
      </>
    );
  }

  // Signed in navigation
  return (
    <>
      {showAdminLink && (
        <Link
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          href="/admin"
        >
          Admin
        </Link>
      )}
      <Link
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
        href="/"
      >
        Dashboard
      </Link>
      <Link
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
        href="/explore"
      >
        Explore
      </Link>
      <Link
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
        href="/profile"
      >
        Profile
      </Link>
      <NavbarClient />
    </>
  );
}

async function MobileNavWrapper() {
  const user = await getCurrentUser();
  const isSignedIn = !!user.userId;
  const showAdminLink = canAccessAdminPages(user);

  return <MobileNav isSignedIn={isSignedIn} showAdminLink={showAdminLink} />;
}
