"use client"

import { PrivyProvider as Privy } from "@privy-io/react-auth"

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#2563EB",
          logo: "/logo.png",
          showWalletLoginFirst: true,
        },
        loginMethods: ["wallet", "email", "google", "twitter"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </Privy>
  )
}