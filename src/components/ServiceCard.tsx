import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/formatters"
import { Star, MessageCircle, Shield, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ServiceCardProps {
    id: string
    name: string
    description: string
    priceInNaira: number
    imageUrl: string
    category?: { name: string } | null
    owner?: {
        id: string
        name: string
        imageUrl?: string | null
        walletAddress?: string | null
    } | null
    reputationCriteria?: {
        minEthosScore?: number
        minPositiveReviewPercent?: number
        minVouchCount?: number
    } | null
    compact?: boolean
}

export function ServiceCard({
    id,
    name,
    description,
    priceInNaira,
    imageUrl,
    category,
    owner,
    reputationCriteria,
    compact = false,
}: ServiceCardProps) {
    const hasReputationRequirements =
        reputationCriteria?.minEthosScore ||
        reputationCriteria?.minPositiveReviewPercent ||
        reputationCriteria?.minVouchCount

    const ownerDisplayName = owner?.name ||
        (owner?.walletAddress ? `${owner.walletAddress.slice(0, 6)}...${owner.walletAddress.slice(-4)}` : "Anonymous")

    if (compact) {
        return (
            <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500 w-full">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={imageUrl} alt={name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">{name}</h3>
                    <p className="text-xs text-gray-500 truncate">{ownerDisplayName}</p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-blue-600 text-sm">{formatPrice(priceInNaira)}</div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full border-l-4 border-l-blue-500 w-full max-w-sm mx-auto">
            {/* Image Section */}
            <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {category && (
                    <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700 hover:bg-white text-[10px]">
                        {category.name}
                    </Badge>
                )}
            </div>

            <CardContent className="flex-1 p-5 space-y-3">
                {/* Status/Reputation Bar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">4.9</span>
                    </div>
                    {hasReputationRequirements && (
                        <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Score: {reputationCriteria?.minEthosScore}
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div>
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-1 hover:text-blue-600 transition-colors leading-snug">
                        <Link href={`/services/${id}`}>{name}</Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-normal">{description}</p>
                </div>

                {/* Owner Info synced with GigCard style */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {owner?.imageUrl ? (
                            <img src={owner.imageUrl} alt={ownerDisplayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-3.5 h-3.5 text-blue-600" />
                        )}
                    </div>
                    <p className="text-xs font-medium text-gray-600 truncate">By {ownerDisplayName}</p>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Starting at</span>
                    <div className="text-base font-bold text-blue-600">{formatPrice(priceInNaira)}</div>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-4">
                    <Link href={`/services/${id}`}>
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        Contact
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}