import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Star, ShieldCheck, Users, Briefcase } from "lucide-react"
import Link from "next/link"

interface TalentCardProps {
    id: string
    name: string
    bio?: string | null
    imageUrl?: string | null
    twitterImage?: string | null
    twitterUsername?: string | null
    walletAddress?: string | null
    ethosScore?: number | null
    averageRating?: number | null
    reviewCount?: number | null
    completedDeals?: number
    skills?: string[]
}

export function TalentCard({
    id,
    name,
    bio,
    imageUrl,
    twitterImage,
    twitterUsername,
    walletAddress,
    ethosScore,
    averageRating,
    reviewCount,
    completedDeals = 0,
    skills = [],
}: TalentCardProps) {
    const displayImage = twitterImage || imageUrl
    const hasReputation = ethosScore && ethosScore > 0

    return (
        <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-16 relative">
                    {/* Ethos Score Badge */}
                    {hasReputation && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-bold text-gray-900">{ethosScore?.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="px-5 pb-5">
                    {/* Avatar */}
                    <div className="-mt-10 mb-3">
                        <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                                {displayImage ? (
                                    <img
                                        src={displayImage}
                                        alt={name}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-blue-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Handle */}
                    <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{name}</h3>
                        {twitterUsername && (
                            <p className="text-sm text-gray-500">@{twitterUsername}</p>
                        )}
                        {!twitterUsername && walletAddress && (
                            <p className="text-xs text-gray-400 font-mono">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    {bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{bio}</p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                        {(averageRating ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{averageRating?.toFixed(1)}</span>
                                <span className="text-gray-400">({reviewCount})</span>
                            </div>
                        )}
                        {completedDeals > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                                <Briefcase className="w-4 h-4" />
                                <span className="font-semibold">{completedDeals}</span>
                                <span className="text-gray-400">deals</span>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-medium">
                                    {skill}
                                </Badge>
                            ))}
                            {skills.length > 3 && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-400 text-xs">
                                    +{skills.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href={`/talent/${id}`}>
                            <Users className="w-4 h-4 mr-2" />
                            View Profile
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
