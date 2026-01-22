"use server"

import { db } from "@/drizzle/db"
import { ReviewTable, GigApplicationTable, GigTable, UserTable } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { getCurrentUser } from "@/services/privy"
import { revalidateTag } from "next/cache"

export async function submitReview(data: {
    gigId: string,
    rating: number,
    comment: string
}) {
    const { userId } = await getCurrentUser()
    if (!userId) {
        return { error: true, message: "Unauthorized" }
    }

    try {
        const { gigId, rating, comment } = data

        // 1. Get Gig and Accepted Application details to verify participants
        const gig = await db.query.GigTable.findFirst({
            where: eq(GigTable.id, gigId),
        })
        if (!gig) return { error: true, message: "Gig not found" }

        const acceptedApp = await db.query.GigApplicationTable.findFirst({
            where: and(
                eq(GigApplicationTable.gigId, gigId),
                eq(GigApplicationTable.status, "accepted")
            )
        })
        if (!acceptedApp) return { error: true, message: "No accepted application found" }

        // 2. Identify roles
        const isClient = gig.clientId === userId
        const isTalent = acceptedApp.applicantId === userId

        if (!isClient && !isTalent) {
            return { error: true, message: "You are not a participant in this deal" }
        }

        // 3. Determine target (Client reviews Talent; Talent reviews Client)
        const targetId = isClient ? acceptedApp.applicantId : gig.clientId

        // 4. Check if already reviewed
        const existingReview = await db.query.ReviewTable.findFirst({
            where: and(
                eq(ReviewTable.gigId, gigId),
                eq(ReviewTable.authorId, userId)
            )
        })

        if (existingReview) {
            return { error: true, message: "You have already reviewed this deal" }
        }

        // 5. Insert Review
        await db.insert(ReviewTable).values({
            gigId,
            authorId: userId,
            targetId,
            rating,
            comment,
            createdAt: new Date(),
        })

        // 6. Update User Stats (averageRating & reviewCount)
        const reviews = await db.query.ReviewTable.findMany({
            where: eq(ReviewTable.targetId, targetId),
            columns: { rating: true }
        })

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
        const newReviewCount = reviews.length
        const newAverage = newReviewCount > 0 ? totalRating / newReviewCount : 0

        await db.update(UserTable)
            .set({
                reviewCount: newReviewCount,
                averageRating: newAverage,
                updatedAt: new Date()
            })
            .where(eq(UserTable.id, targetId))

        revalidateTag("reviews")
        revalidateTag("gigs") // Revalidate gigs to show updated reputed score if shown there
        return { success: true, message: "Review submitted successfully" }

    } catch (error) {
        console.error("Error submitting review:", error)
        return { error: true, message: "Failed to submit review" }
    }
}
