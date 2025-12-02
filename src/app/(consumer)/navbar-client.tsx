'use client'

import { UserButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function NavbarClient() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="size-8" /> // Empty placeholder while loading
  }

  return (
    <div className="size-8 flex items-center justify-center">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: { width: "100%", height: "100%" },
          },
        }}
      />
    </div>
  )
}