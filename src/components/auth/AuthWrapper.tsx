"use client"

import { usePrivy } from "@privy-io/react-auth"
import { ReactNode } from "react"

interface AuthWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SignedIn({ children, fallback }: AuthWrapperProps) {
  const { authenticated, ready } = usePrivy()

  if (!ready) {
    return fallback || null
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}

export function SignedOut({ children, fallback }: AuthWrapperProps) {
  const { authenticated, ready } = usePrivy()

  if (!ready) {
    return fallback || null
  }

  if (authenticated) {
    return null
  }

  return <>{children}</>
}

interface LoginButtonProps {
  children: ReactNode
  className?: string
}

export function LoginButton({ children, className }: LoginButtonProps) {
  const { login } = usePrivy()

  return (
    <button onClick={login} className={className}>
      {children}
    </button>
  )
}
