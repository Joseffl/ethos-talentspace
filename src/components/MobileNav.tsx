"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"
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
          fixed top-14 right-0 h-auto w-full  bg-white shadow-lg z-50 border-t
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
                href="/courses"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                My Courses
              </Link>
              <Link
                href="/purchases"
                className="px-4 py-3 hover:bg-gray-100 rounded-md text-gray-700"
                onClick={closeMenu}
              >
                Purchase History
              </Link>
              <div className="px-4 py-3">
                <NavbarClient />
              </div>
            </>
          ) : (
            <div className="px-4 py-3">
              <Button className="w-full bg-[#28ac30]" asChild>
                <SignInButton>Sign In</SignInButton>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}
