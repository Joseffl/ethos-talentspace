import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/formatters"
import { Calendar, Link as LinkIcon, Shield, Send, Clock, User } from "lucide-react"
import Link from "next/link"

interface GigCardProps {
    id: string
    title: string
    description: string
    budgetMin: number
    budgetMax?: number | null
    deadline?: Date | string | null
    externalLinks?: string[] | null
    skillTags?: string[] | null
    status: "open" | "in_progress" | "submitted" | "completed" | "cancelled"
    client?: {
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
    createdAt?: Date | string
    compact?: boolean
}

function getReputationTooltip(criteria?: GigCardProps["reputationCriteria"]) {
    if (!criteria) return ""
    const parts: string[] = []
    if (criteria.minEthosScore) parts.push(`Min Score: ${criteria.minEthosScore}`)
    if (criteria.minPositiveReviewPercent) parts.push(`Min Positive Reviews: ${criteria.minPositiveReviewPercent}%`)
    if (criteria.minVouchCount) parts.push(`Min Vouches: ${criteria.minVouchCount}`)
    return parts.join(" | ")
}

export function GigCard({
    id,
    title,
    description,
    budgetMin,
    budgetMax,
    deadline,
    externalLinks,
    skillTags,
    status,
    client,
    reputationCriteria,
    compact = false,
}: GigCardProps) {
    const hasReputationRequirements =
        reputationCriteria?.minEthosScore ||
        reputationCriteria?.minPositiveReviewPercent ||
        reputationCriteria?.minVouchCount

    const clientDisplayName = client?.name ||
        (client?.walletAddress ? `${client.walletAddress.slice(0, 6)}...${client.walletAddress.slice(-4)}` : "Anonymous")

    const budgetDisplay = budgetMax && budgetMax > budgetMin
        ? `${formatPrice(budgetMin)} - ${formatPrice(budgetMax)}`
        : formatPrice(budgetMin)

    const deadlineDate = deadline ? new Date(deadline) : null
    const isUrgent = deadlineDate && (deadlineDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

    const statusColors = {
        open: "bg-blue-100 text-blue-700",
        in_progress: "bg-blue-100 text-blue-700",
        submitted: "bg-amber-100 text-amber-700",
        completed: "bg-gray-100 text-gray-700",
        cancelled: "bg-red-100 text-red-700",
    }

    if (compact) {
        return (
            <Card className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500 w-full">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{title}</h3>
                        <Badge className={`${statusColors[status]} text-[10px]`} variant="secondary">
                            {status.replace("_", " ")}
                        </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{clientDisplayName}</p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-blue-600 text-sm">{budgetDisplay}</div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border-l-4 border-l-blue-500 w-full max-w-sm mx-auto">
            <CardContent className="flex-1 p-5 space-y-3">
                {/* Status Badges */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                        <Badge className={`${statusColors[status]} uppercase text-[10px] px-1.5 py-0`}>
                            {status.replace("_", " ")}
                        </Badge>
                        {isUrgent && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Urgent
                            </Badge>
                        )}
                    </div>
                    {hasReputationRequirements && (
                        <div className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1" title={getReputationTooltip(reputationCriteria)}>
                            <Shield className="w-3 h-3" />
                            Rep Required
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div>
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-1 hover:text-blue-600 transition-colors leading-snug">
                        <Link href={`/gigs/${id}`}>{title}</Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-normal">{description}</p>
                </div>

                {/* Skill Tags */}
                {skillTags && skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {skillTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Reputation Requirements */}
                {hasReputationRequirements && (
                    <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Reputation Requirements
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                            {reputationCriteria?.minEthosScore && (
                                <span className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-800">
                                    Score: {reputationCriteria.minEthosScore}+
                                </span>
                            )}
                            {reputationCriteria?.minPositiveReviewPercent && (
                                <span className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-800">
                                    Reviews: {reputationCriteria.minPositiveReviewPercent}%+
                                </span>
                            )}
                            {reputationCriteria?.minVouchCount && (
                                <span className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-800">
                                    Vouches: {reputationCriteria.minVouchCount}+
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Client Info */}
                <div className="flex items-center gap-2 pt-3 border-t">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {client?.imageUrl ? (
                            <img src={client.imageUrl} alt={clientDisplayName} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-3.5 h-3.5 text-blue-600" />
                        )}
                    </div>
                    <p className="text-xs font-medium text-gray-600 truncate">By {clientDisplayName}</p>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between bg-gray-50/50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Budget</span>
                    <div className="text-base font-bold text-blue-600">{budgetDisplay}</div>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-4">
                    <Link href={`/gigs/${id}/apply`}>
                        Apply
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}