"use server"

import { db } from "@/drizzle/db"
import { GigTable, GigApplicationTable } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { getCurrentUser } from "@/services/privy"

export async function markGigAsCompleted(gigId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) {
        return { error: true, message: "Unauthorized" }
    }

    try {
        // 1. Get the gig to check owner
        const gig = await db.query.GigTable.findFirst({
            where: eq(GigTable.id, gigId),
        })

        if (!gig) return { error: true, message: "Gig not found" }

        // 2. Get the accepted application to check talent
        const acceptedApp = await db.query.GigApplicationTable.findFirst({
            where: and(
                eq(GigApplicationTable.gigId, gigId),
                eq(GigApplicationTable.status, "accepted")
            )
        })

        const isClient = gig.clientId === userId
        const isTalent = acceptedApp?.applicantId === userId

        if (!isClient && !isTalent) {
            return { error: true, message: "Permission denied" }
        }

        await db.update(GigTable)
            .set({ status: "completed", updatedAt: new Date() })
            .where(eq(GigTable.id, gigId))

        revalidateTag("gigs")
        return { success: true, message: "Gig marked as completed" }
    } catch (error) {
        console.error("Error completing gig:", error)
        return { error: true, message: "Failed to update status" }
    }
}
