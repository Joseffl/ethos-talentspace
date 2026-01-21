"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignUpPage() {
  const { login, authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/")
    } else if (ready && !authenticated) {
      login()
    }
  }, [ready, authenticated, login, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Creating Account...</h1>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  )
}
