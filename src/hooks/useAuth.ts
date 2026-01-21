"use client"

import { usePrivy } from "@privy-io/react-auth"

export function useAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkWallet,
    linkEmail,
    linkTwitter,
    unlinkWallet,
    unlinkEmail,
    unlinkTwitter,
  } = usePrivy()

  // Extract wallet address from user's linked accounts
  const walletAddress = user?.wallet?.address ||
    user?.linkedAccounts?.find((a) => a.type === "wallet")?.address ||
    null

  // Extract email from user
  const email = user?.email?.address || null

  // Extract Twitter info
  // Extract Twitter info
  const twitterAccount = user?.linkedAccounts?.find(
    (a) => a.type === "twitter_oauth" || (a.type as string) === "twitter"
  ) as
    | { type: "twitter_oauth" | "twitter"; username?: string; name?: string; subject?: string }
    | undefined
  const twitterUsername = twitterAccount?.username || null
  const twitterName = twitterAccount?.name || null
  const twitterSubject = twitterAccount?.subject || null
  const hasTwitter = !!twitterAccount

  // Get display name - prioritize wallet, then email
  const displayName = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : email?.split("@")[0] || "User"

  // Check if user has a wallet connected
  const hasWallet = !!walletAddress

  // Check if user has email connected
  const hasEmail = !!email

  // Get all linked wallets
  const linkedWallets = user?.linkedAccounts?.filter((a) => a.type === "wallet") || []

  // Get user's Privy ID
  const privyUserId = user?.id || null

  return {
    // State
    ready,
    authenticated,
    user,
    privyUserId,
    walletAddress,
    email,
    displayName,
    hasWallet,
    hasEmail,
    hasTwitter,
    twitterUsername,
    twitterName,
    twitterSubject,
    linkedWallets,

    // Actions
    login,
    logout,
    linkWallet,
    linkEmail,
    linkTwitter,
    unlinkWallet,
    unlinkEmail,
    unlinkTwitter,

    // Computed
    isLoading: !ready,
    isAuthenticated: ready && authenticated,
  }
}

