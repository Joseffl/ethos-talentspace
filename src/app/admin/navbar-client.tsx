"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { LogOut, Wallet, Mail } from "lucide-react"

export function AdminNavbarClient() {
  const router = useRouter()
  const { isLoading, logout, displayName, hasWallet, walletAddress, email } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
    router.push("/")
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
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
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
        title="Disconnect"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
