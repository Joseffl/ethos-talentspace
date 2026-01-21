"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { NavbarClient } from "@/app/(consumer)/navbar-client"

interface MobileNavProps {
  isSignedIn: boolean
  showAdminLink: boolean
}

export function MobileNav({ isSignedIn, showAdminLink }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`
          fixed top-14 right-0 h-auto w-full bg-white shadow-lg z-50 border-t
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {isSignedIn ? (
            <>
              {showAdminLink && (
                <Link
                  href="/admin"
                  className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/explore"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Explore
              </Link>
              <Link
                href="/jobs"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Jobs
              </Link>
              <Link
                href="/messages"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Messages
              </Link>
              <Link
                href="/profile"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Profile
              </Link>
              <div className="px-4 py-3 border-t mt-2 pt-4">
                <NavbarClient />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/explore"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Explore Talent
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                How It Works
              </Link>
              <div className="px-4 py-3 border-t mt-2 pt-4">
                <NavbarClient />
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
