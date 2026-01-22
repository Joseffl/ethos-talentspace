import { getCurrentUser } from "@/services/privy"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { getEthosReputation } from "@/lib/ethos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugReputationPage() {
    const { userId } = await getCurrentUser()

    if (!userId) {
        return <div>Not authenticated</div>
    }

    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId)
    })

    if (!user) {
        return <div>User not found</div>
    }

    let ethosReputation = null
    let ethosError = null

    if (user.walletAddress) {
        try {
            ethosReputation = await getEthosReputation(user.walletAddress)
        } catch (error) {
            ethosError = error instanceof Error ? error.message : String(error)
        }
    }

    return (
        <div className="container py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Reputation Debug Info</h1>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>User Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 font-mono text-sm">
                            <div><strong>User ID:</strong> {user.id}</div>
                            <div><strong>Name:</strong> {user.name}</div>
                            <div><strong>Wallet Address:</strong> {user.walletAddress || 'NOT CONNECTED'}</div>
                            <div><strong>Stored Ethos Score:</strong> {user.ethosScore ?? 'null'}</div>
                        </div>
                    </CardContent>
                </Card>

                {user.walletAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Live Ethos API Check</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ethosError ? (
                                <div className="text-red-600">
                                    <strong>Error:</strong> {ethosError}
                                </div>
                            ) : ethosReputation ? (
                                <div className="space-y-2">
                                    <div><strong>Score:</strong> {ethosReputation.score}</div>
                                    <div><strong>Positive Reviews:</strong> {ethosReputation.reviews.positive}</div>
                                    <div><strong>Neutral Reviews:</strong> {ethosReputation.reviews.neutral}</div>
                                    <div><strong>Negative Reviews:</strong> {ethosReputation.reviews.negative}</div>
                                    <div><strong>Positive %:</strong> {ethosReputation.reviews.positivePercent}%</div>
                                    <div><strong>Vouches Received:</strong> {ethosReputation.vouches.received}</div>
                                    <div><strong>Profile URL:</strong> <a href={ethosReputation.profile.profileUrl} target="_blank" className="text-blue-600 hover:underline">{ethosReputation.profile.profileUrl}</a></div>
                                </div>
                            ) : (
                                <div className="text-amber-600">
                                    <strong>No Ethos profile found for this wallet address</strong>
                                    <div className="mt-2 text-sm">
                                        This wallet may not have an Ethos profile yet. Visit{' '}
                                        <a href="https://ethos.network" target="_blank" className="text-blue-600 hover:underline">ethos.network</a>
                                        {' '}to create one.
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
