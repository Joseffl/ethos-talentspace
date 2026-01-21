import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { ProfileClient } from "./ProfileClient"

export default async function ProfilePage() {
  // Try to get current user data for initial state
  let initialName: string | undefined

  try {
    const { user } = await getCurrentUser({ allData: true })
    initialName = user?.name || undefined
  } catch {
    // If there's an auth error, we'll let the client component handle it
    initialName = undefined
  }

  return (
    <div className="container my-6 max-w-4xl">
      <PageHeader title="Profile" />
      <ProfileClient initialName={initialName} />
    </div>
  )
}
