"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    EthosReputation,
    getEthosReputation,
    getScoreLevel,
    formatWeiToEth
} from "@/lib/ethos";
import { Star, ThumbsUp, ThumbsDown, Minus, Users, ExternalLink, Award } from "lucide-react";
import Link from "next/link";

interface EthosReputationCardProps {
    address: string;
    compact?: boolean;
}

export function EthosReputationCard({ address, compact = false }: EthosReputationCardProps) {
    const [reputation, setReputation] = useState<EthosReputation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReputation() {
            try {
                setLoading(true);
                const data = await getEthosReputation(address);
                setReputation(data);
            } catch (err) {
                console.error("Failed to fetch reputation:", err);
            } finally {
                setLoading(false);
            }
        }

        if (address) {
            fetchReputation();
        }
    }, [address]);

    if (loading) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                        <div className="h-12 w-12 bg-gray-200 rounded-full" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!reputation) {
        return (
            <Card className={compact ? "p-4" : ""}>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                        <Award className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No Ethos profile found</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Build your on-chain reputation at{" "}
                        <Link
                            href="https://ethos.network"
                            target="_blank"
                            className="text-blue-600 hover:underline"
                        >
                            ethos.network
                        </Link>
                    </p>
                </CardContent>
            </Card>
        );
    }

    const scoreLevel = getScoreLevel(reputation.score);

    if (compact) {
        return (
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className="flex flex-col items-center">
                    <div className={`text-2xl font-bold ${scoreLevel.color}`}>
                        {reputation.score}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${scoreLevel.bgColor} ${scoreLevel.color}`}>
                        {scoreLevel.level}
                    </span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                        <div className="font-semibold text-green-600">{reputation.reviews.positive}</div>
                        <div className="text-gray-400">Positive</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-600">{reputation.reviews.neutral}</div>
                        <div className="text-gray-400">Neutral</div>
                    </div>
                    <div>
                        <div className="font-semibold text-red-600">{reputation.reviews.negative}</div>
                        <div className="text-gray-400">Negative</div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="font-semibold">{reputation.vouches.received}</div>
                    <div className="text-xs text-gray-400">Vouches</div>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Ethos Reputation
                    </CardTitle>
                    <Link
                        href={reputation.profile.profileUrl}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                        View on Ethos <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Score Section */}
                <div className="flex items-center justify-center gap-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-center">
                        <div className={`text-5xl font-bold ${scoreLevel.color}`}>
                            {reputation.score}
                        </div>
                        <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full ${scoreLevel.bgColor} ${scoreLevel.color} font-medium`}>
                            {scoreLevel.level}
                        </span>
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Reviews Received</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <ThumbsUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <div className="text-xl font-bold text-green-600">{reputation.reviews.positive}</div>
                            <div className="text-xs text-gray-500">Positive</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <Minus className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-gray-600">{reputation.reviews.neutral}</div>
                            <div className="text-xs text-gray-500">Neutral</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                            <ThumbsDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-red-600">{reputation.reviews.negative}</div>
                            <div className="text-xs text-gray-500">Negative</div>
                        </div>
                    </div>
                    {reputation.reviews.total > 0 && (
                        <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-green-500 h-full"
                                style={{ width: `${reputation.reviews.positivePercent}%` }}
                            />
                        </div>
                    )}
                    {reputation.reviews.total > 0 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                            {reputation.reviews.positivePercent}% positive from {reputation.reviews.total} reviews
                        </p>
                    )}
                </div>

                {/* Vouches Section */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Vouches Received</span>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{reputation.vouches.received}</div>
                            {reputation.vouches.amountReceivedWei !== "0" && (
                                <div className="text-xs text-gray-500">
                                    {formatWeiToEth(reputation.vouches.amountReceivedWei)} ETH staked
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                {(reputation.profile.displayName || reputation.profile.username) && (
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-3">
                            {reputation.profile.avatarUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={reputation.profile.avatarUrl}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                            )}
                            <div>
                                <div className="font-medium">{reputation.profile.displayName || reputation.profile.username}</div>
                                {reputation.profile.username && reputation.profile.displayName && (
                                    <div className="text-xs text-gray-500">@{reputation.profile.username}</div>
                                )}
                            </div>
                        </div>
                        {reputation.profile.username && (
                            <Link
                                href={`https://x.com/${reputation.profile.username}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                View on X <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}