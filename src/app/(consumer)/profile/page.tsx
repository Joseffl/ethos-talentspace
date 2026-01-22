import { PageHeader } from "@/components/PageHeader"
import { getCurrentUser } from "@/services/privy"
import { ProfileClient } from "./ProfileClient"
import { getProfileStats } from "@/features/users/actions/users"

export default async function ProfilePage() {
  // Try to get current user data for initial state
  let initialData: {
    name?: string
    bio?: string
    imageUrl?: string
    averageRating?: number
    reviewCount?: number
    memberSince?: Date
    twitter?: {
      id: string
      username: string
      name: string
      image?: string
    }
    stats?: {
      gigsPosted: number
      dealsCompletedAsClient: number
      dealsCompletedAsTalent: number
      activeDeals: number
    }
  } = {}

  try {
    const { user, userId } = await getCurrentUser({ allData: true })
    if (user && userId) {
      initialData = {
        name: user.name || undefined,
        bio: user.bio || undefined,
        imageUrl: user.imageUrl || undefined,
        averageRating: user.averageRating || undefined,
        reviewCount: user.reviewCount || undefined,
        memberSince: user.createdAt || undefined,
        twitter: user.twitterId && user.twitterUsername ? {
          id: user.twitterId,
          username: user.twitterUsername,
          name: user.twitterName || user.twitterUsername,
          image: user.twitterImage || undefined,
        } : undefined,
        stats: await getProfileStats(userId),
      }
    }
  } catch {
    // If there's an auth error, we'll let the client component handle it
  }

  return (
    <div className="container my-6 max-w-4xl">
      <PageHeader title="Profile" />
      <ProfileClient initialData={initialData} />
    </div>
  )
}
