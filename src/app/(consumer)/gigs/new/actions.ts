"use server"

import { db } from "@/drizzle/db"
import { GigTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { revalidatePath } from "next/cache"

export async function createGigAction(formData: FormData) {
    const { userId } = await getCurrentUser()

    if (!userId) {
        return {
            error: true,
            message: "Not authenticated"
        }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const budgetMin = parseInt(formData.get("budgetMin") as string)
    const budgetMaxStr = formData.get("budgetMax") as string | null
    const budgetMax = budgetMaxStr ? parseInt(budgetMaxStr) : null
    const deadlineStr = formData.get("deadline") as string | null
    const deadline = deadlineStr ? new Date(deadlineStr) : null

    // Parse JSON arrays
    const externalLinksStr = formData.get("externalLinks") as string
    const externalLinks = externalLinksStr ? JSON.parse(externalLinksStr) as string[] : []

    const skillTagsStr = formData.get("skillTags") as string
    const skillTags = skillTagsStr ? JSON.parse(skillTagsStr) as string[] : []

    // Reputation criteria (optional)
    const minEthosScore = formData.get("minEthosScore")
    const minPositiveReviewPercent = formData.get("minPositiveReviewPercent")
    const minVouchCount = formData.get("minVouchCount")

    const reputationCriteria: {
        minEthosScore?: number
        minPositiveReviewPercent?: number
        minVouchCount?: number
    } = {}

    if (minEthosScore) {
        reputationCriteria.minEthosScore = parseInt(minEthosScore as string)
    }
    if (minPositiveReviewPercent) {
        reputationCriteria.minPositiveReviewPercent = parseInt(minPositiveReviewPercent as string)
    }
    if (minVouchCount) {
        reputationCriteria.minVouchCount = parseInt(minVouchCount as string)
    }

    // Validation
    if (!title || title.length < 10) {
        return { error: true, message: "Title must be at least 10 characters" }
    }
    if (!description || description.length < 50) {
        return { error: true, message: "Description must be at least 50 characters" }
    }
    if (!budgetMin || budgetMin < 1000) {
        return { error: true, message: "Minimum budget is $1,000" }
    }

    try {
        const [gig] = await db
            .insert(GigTable)
            .values({
                title,
                description,
                budgetMin,
                budgetMax,
                deadline,
                externalLinks,
                skillTags,
                clientId: userId,
                status: "open",
                reputationCriteria,
            })
            .returning()

        if (!gig) {
            return {
                error: true,
                message: "Failed to create gig"
            }
        }

        revalidatePath("/")
        revalidatePath("/explore")

        return {
            error: false,
            message: "Gig created successfully",
            gigId: gig.id
        }
    } catch (err) {
        console.error("Failed to create gig:", err)
        return {
            error: true,
            message: "An error occurred while posting your gig"
        }
    }
}
