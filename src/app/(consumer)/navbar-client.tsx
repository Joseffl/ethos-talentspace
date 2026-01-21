"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useLogin } from "@privy-io/react-auth"
import { LogOut, Wallet, Mail } from "lucide-react"

export function NavbarClient() {
  const router = useRouter()
  const {
    isLoading,
    isAuthenticated,
    logout,
    displayName,
    hasWallet,
    walletAddress,
    email,
  } = useAuth()

  // Use useLogin hook with onComplete callback to refresh after login
  const { login } = useLogin({
    onComplete: () => {
      router.refresh()
    },
  })

  if (isLoading) {
    return <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-lg" />
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
      >
        <Wallet className="size-4" />
        Connect
      </button>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
        {hasWallet ? (
          <Wallet className="size-4 text-gray-600" />
        ) : (
          <Mail className="size-4 text-gray-600" />
        )}
        <span className="text-sm font-medium text-gray-700" title={walletAddress || email || ""}>
          {displayName}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
        title="Disconnect"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
