/**
 * Ethos Network API Client
 * Public API - no authentication required
 * Docs: https://developers.ethos.network/api-documentation/api-v2
 */

const ETHOS_API_BASE = "https://api.ethos.network/api/v2";

// ============ Types ============

export interface EthosReviewStats {
    positive: number;
    neutral: number;
    negative: number;
}

export interface EthosVouchStats {
    count: number;
    amountWeiTotal: string;
}

export interface EthosUserStats {
    review: {
        received: EthosReviewStats;
    };
    vouch: {
        given: EthosVouchStats;
        received: EthosVouchStats;
    };
}

export interface EthosUser {
    id: number;
    profileId: number;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
    description: string | null;
    score: number;
    status: "ACTIVE" | "INACTIVE" | string;
    xpTotal: number;
    influenceFactor: number;
    influenceFactorPercentile: number;
    links: {
        profile: string;
        scoreBreakdown: string;
    };
    stats: EthosUserStats;
}

export interface EthosProfile {
    id: number;
    archived: boolean;
    createdAt: number;
    updatedAt: number;
    invitesAvailable: number;
    invitedBy: number | null;
}

export interface EthosProfileData {
    profile: EthosProfile;
    user: EthosUser;
    inviterUser?: EthosUser | null;
}

export interface EthosProfilesResponse {
    values: EthosProfileData[];
    total: number;
    limit: number;
    offset: number;
}

export interface EthosScoreResponse {
    score: number;
    level?: string;
}

// Reputation criteria that can be set on products/services
export interface ReputationCriteria {
    minEthosScore?: number;
    minPositiveReviewPercent?: number;
    minVouchCount?: number;
}

// Simplified reputation data for display
export interface EthosReputation {
    score: number;
    reviews: {
        positive: number;
        neutral: number;
        negative: number;
        total: number;
        positivePercent: number;
    };
    vouches: {
        received: number;
        given: number;
        amountReceivedWei: string;
    };
    profile: {
        displayName: string | null;
        username: string | null;
        avatarUrl: string | null;
        profileUrl: string;
    };
}

// ============ API Functions ============

/**
 * Fetch Ethos profile data by wallet address
 */
export async function getEthosProfileByAddress(
    address: string
): Promise<EthosProfileData | null> {
    try {
        console.log(`[Ethos] Fetching profile for address: ${address}`);

        const response = await fetch(`${ETHOS_API_BASE}/profiles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                addresses: [address],
                limit: 1,
            }),
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Ethos] API error for ${address}:`, response.status, response.statusText, errorText);
            return null;
        }

        const data: EthosProfilesResponse = await response.json();
        console.log(`[Ethos] Response for ${address}:`, {
            total: data.total,
            hasProfile: !!data.values[0],
            score: data.values[0]?.user?.score
        });

        return data.values[0] || null;
    } catch (error) {
        console.error(`[Ethos] Failed to fetch profile for ${address}:`, error);
        return null;
    }
}

/**
 * Fetch simplified reputation data for display
 */
export async function getEthosReputation(
    address: string
): Promise<EthosReputation | null> {
    const profileData = await getEthosProfileByAddress(address);

    if (!profileData) {
        return null;
    }

    const { user } = profileData;
    const reviewStats = user.stats.review.received;
    const totalReviews =
        reviewStats.positive + reviewStats.neutral + reviewStats.negative;

    return {
        score: user.score,
        reviews: {
            positive: reviewStats.positive,
            neutral: reviewStats.neutral,
            negative: reviewStats.negative,
            total: totalReviews,
            positivePercent:
                totalReviews > 0
                    ? Math.round((reviewStats.positive / totalReviews) * 100)
                    : 0,
        },
        vouches: {
            received: user.stats.vouch.received.count,
            given: user.stats.vouch.given.count,
            amountReceivedWei: user.stats.vouch.received.amountWeiTotal,
        },
        profile: {
            displayName: user.displayName,
            username: user.username,
            avatarUrl: user.avatarUrl,
            profileUrl: user.links.profile,
        },
    };
}

/**
 * Check if a user meets reputation criteria
 */
export function meetsReputationCriteria(
    reputation: EthosReputation | null,
    criteria: ReputationCriteria
): { meets: boolean; reasons: string[] } {
    if (!reputation) {
        return {
            meets: false,
            reasons: ["No Ethos profile found"],
        };
    }

    const reasons: string[] = [];

    if (
        criteria.minEthosScore !== undefined &&
        reputation.score < criteria.minEthosScore
    ) {
        reasons.push(
            `Ethos score ${reputation.score} is below required ${criteria.minEthosScore}`
        );
    }

    if (
        criteria.minPositiveReviewPercent !== undefined &&
        reputation.reviews.positivePercent < criteria.minPositiveReviewPercent
    ) {
        reasons.push(
            `Positive review rate ${reputation.reviews.positivePercent}% is below required ${criteria.minPositiveReviewPercent}%`
        );
    }

    if (
        criteria.minVouchCount !== undefined &&
        reputation.vouches.received < criteria.minVouchCount
    ) {
        reasons.push(
            `Vouch count ${reputation.vouches.received} is below required ${criteria.minVouchCount}`
        );
    }

    return {
        meets: reasons.length === 0,
        reasons,
    };
}

/**
 * Format Wei to ETH for display
 */
export function formatWeiToEth(weiString: string): string {
    const wei = BigInt(weiString);
    const eth = Number(wei) / 1e18;
    return eth.toFixed(4);
}

/**
 * Get score level/tier based on Ethos score
 */
export function getScoreLevel(score: number): {
    level: string;
    color: string;
    bgColor: string;
} {
    if (score >= 1800) {
        return { level: "Exceptional", color: "text-purple-600", bgColor: "bg-purple-100" };
    }
    if (score >= 1500) {
        return { level: "Trusted", color: "text-green-600", bgColor: "bg-green-100" };
    }
    if (score >= 1200) {
        return { level: "Established", color: "text-blue-600", bgColor: "bg-blue-100" };
    }
    if (score >= 900) {
        return { level: "Building", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    }
    return { level: "New", color: "text-gray-600", bgColor: "bg-gray-100" };
}
