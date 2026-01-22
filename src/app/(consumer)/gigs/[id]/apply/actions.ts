"use server"

import { db } from "@/drizzle/db"
import { GigApplicationTable, GigTable, UserTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"
import { getEthosReputation, meetsReputationCriteria, type ReputationCriteria } from "@/lib/ethos"

export async function submitGigApplication(formData: FormData) {
    const { userId } = await getCurrentUser()

    if (!userId) {
        return {
            error: true,
            message: "You must be logged in to apply"
        }
    }

    const gigId = formData.get("gigId") as string
    const coverLetter = formData.get("coverLetter") as string
    const proposedBudgetStr = formData.get("proposedBudget") as string | null
    const proposedBudget = proposedBudgetStr ? parseInt(proposedBudgetStr) : null
    const portfolioLinksStr = formData.get("portfolioLinks") as string
    const portfolioLinks = portfolioLinksStr ? JSON.parse(portfolioLinksStr) as string[] : []

    // Validation
    if (!gigId) {
        return { error: true, message: "Invalid gig" }
    }
    if (!coverLetter || coverLetter.length < 50) {
        return { error: true, message: "Cover letter must be at least 50 characters" }
    }

    try {
        // Check if gig exists and is open
        const gig = await db.query.GigTable.findFirst({
            where: eq(GigTable.id, gigId),
        })

        if (!gig) {
            return { error: true, message: "Gig not found" }
        }

        if (gig.status !== "open") {
            return { error: true, message: "This gig is no longer accepting applications" }
        }

        // Check if user is the gig owner
        if (gig.clientId === userId) {
            return { error: true, message: "You cannot apply to your own gig" }
        }

        // Check reputation criteria if the gig has any
        const reputationCriteria = gig.reputationCriteria as ReputationCriteria | null
        if (reputationCriteria && Object.keys(reputationCriteria).length > 0) {
            // Get user's wallet address
            const user = await db.query.UserTable.findFirst({
                where: eq(UserTable.id, userId),
            })

            if (!user?.walletAddress) {
                return {
                    error: true,
                    message: "This gig requires reputation verification. Please connect a wallet to your account."
                }
            }

            // Fetch Ethos reputation
            const reputation = await getEthosReputation(user.walletAddress)
            const { meets, reasons } = meetsReputationCriteria(reputation, reputationCriteria)

            if (!meets) {
                return {
                    error: true,
                    message: `You don't meet the reputation requirements: ${reasons.join(", ")}`
                }
            }
        }

        // Check if user already applied
        const existingApplication = await db.query.GigApplicationTable.findFirst({
            where: and(
                eq(GigApplicationTable.gigId, gigId),
                eq(GigApplicationTable.applicantId, userId)
            ),
        })

        if (existingApplication) {
            return { error: true, message: "You have already applied to this gig" }
        }

        // Create application
        const [application] = await db
            .insert(GigApplicationTable)
            .values({
                gigId,
                applicantId: userId,
                coverLetter,
                proposedBudget,
                portfolioLinks,
                status: "pending",
            })
            .returning()

        if (!application) {
            return {
                error: true,
                message: "Failed to submit application"
            }
        }

        revalidatePath(`/gigs/${gigId}`)
        revalidatePath("/")

        return {
            error: false,
            message: "Application submitted successfully!",
            applicationId: application.id
        }
    } catch (err) {
        console.error("Failed to submit application:", err)
        return {
            error: true,
            message: "An error occurred while submitting your application"
        }
    }
}

export async function getGigForApplication(gigId: string) {
    const gig = await db.query.GigTable.findFirst({
        where: eq(GigTable.id, gigId),
        with: {
            client: true,
        },
    })

    return gig
}

export async function checkUserReputationEligibility(gigId: string) {
    const { userId } = await getCurrentUser()

    if (!userId) {
        return { eligible: false, reasons: ["Not logged in"], reputation: null }
    }

    const gig = await db.query.GigTable.findFirst({
        where: eq(GigTable.id, gigId),
    })

    if (!gig) {
        return { eligible: false, reasons: ["Gig not found"], reputation: null }
    }

    const reputationCriteria = gig.reputationCriteria as ReputationCriteria | null

    // No criteria means everyone is eligible
    if (!reputationCriteria || Object.keys(reputationCriteria).length === 0) {
        return { eligible: true, reasons: [], reputation: null, criteria: null }
    }

    // Get user's wallet address
    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId),
    })

    if (!user?.walletAddress) {
        return {
            eligible: false,
            reasons: ["No wallet connected - required for reputation verification"],
            reputation: null,
            criteria: reputationCriteria
        }
    }

    // Fetch Ethos reputation
    const reputation = await getEthosReputation(user.walletAddress)
    const { meets, reasons } = meetsReputationCriteria(reputation, reputationCriteria)

    return {
        eligible: meets,
        reasons,
        reputation,
        criteria: reputationCriteria
    }
}
