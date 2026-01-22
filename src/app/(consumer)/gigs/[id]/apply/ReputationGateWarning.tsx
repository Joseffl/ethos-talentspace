"use client"

import Link from "next/link"
import { ArrowLeft, ShieldX, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReputationCriteria, EthosReputation } from "@/lib/ethos"

interface ReputationGateWarningProps {
    gigId: string
    gigTitle: string
    criteria: ReputationCriteria
    reasons: string[]
    reputation: EthosReputation | null
}

export function ReputationGateWarning({
    gigId,
    gigTitle,
    criteria,
    reasons,
    reputation,
}: ReputationGateWarningProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href={`/gigs/${gigId}`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Gig
                </Link>
            </div>

            <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <ShieldX className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-red-900">
                                Reputation Requirements Not Met
                            </CardTitle>
                            <p className="text-sm text-red-700 mt-1">
                                You cannot apply to this gig
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                        <h3 className="font-medium text-gray-900 mb-1">{gigTitle}</h3>
                        <p className="text-sm text-gray-500">
                            This gig has minimum reputation requirements
                        </p>
                    </div>

                    {/* Requirements vs Your Stats */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Required vs Your Reputation
                        </h4>

                        <div className="grid gap-3">
                            {criteria.minEthosScore !== undefined && (
                                <RequirementRow
                                    label="Ethos Score"
                                    required={criteria.minEthosScore}
                                    actual={reputation?.score ?? 0}
                                    met={(reputation?.score ?? 0) >= criteria.minEthosScore}
                                />
                            )}
                            {criteria.minPositiveReviewPercent !== undefined && (
                                <RequirementRow
                                    label="Positive Reviews"
                                    required={`${criteria.minPositiveReviewPercent}%`}
                                    actual={`${reputation?.reviews.positivePercent ?? 0}%`}
                                    met={(reputation?.reviews.positivePercent ?? 0) >= criteria.minPositiveReviewPercent}
                                />
                            )}
                            {criteria.minVouchCount !== undefined && (
                                <RequirementRow
                                    label="Vouches Received"
                                    required={criteria.minVouchCount}
                                    actual={reputation?.vouches.received ?? 0}
                                    met={(reputation?.vouches.received ?? 0) >= criteria.minVouchCount}
                                />
                            )}
                        </div>
                    </div>

                    {/* Why you don't qualify */}
                    {reasons.length > 0 && (
                        <div className="bg-red-100 rounded-lg p-4">
                            <h4 className="font-medium text-red-900 mb-2">Why you don&apos;t qualify:</h4>
                            <ul className="space-y-1">
                                {reasons.map((reason, i) => (
                                    <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                        <span className="text-red-500 mt-0.5">•</span>
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href={`/gigs/${gigId}`}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Gig
                            </Link>
                        </Button>
                        <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <a
                                href="https://ethos.network"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Build Your Ethos Profile
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function RequirementRow({
    label,
    required,
    actual,
    met,
}: {
    label: string
    required: number | string
    actual: number | string
    met: boolean
}) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
            met ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                    Required: <span className="font-medium text-gray-900">{required}</span>
                </span>
                <span className={met ? "text-green-600" : "text-red-600"}>
                    Yours: <span className="font-medium">{actual}</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                    {met ? "Met" : "Not Met"}
                </span>
            </div>
        </div>
    )
}
