"use server"

import { db } from "@/drizzle/db"
import { GigTable, GigApplicationTable } from "@/drizzle/schema"
import { eq, and } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { getCurrentUser } from "@/services/privy"

// Talent Action: Submit Work
export async function submitWork(gigId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) return { error: true, message: "Unauthorized" }

    try {
        const gig = await db.query.GigTable.findFirst({ where: eq(GigTable.id, gigId) })
        if (!gig) return { error: true, message: "Gig not found" }

        const acceptedApp = await db.query.GigApplicationTable.findFirst({
            where: and(
                eq(GigApplicationTable.gigId, gigId),
                eq(GigApplicationTable.status, "accepted")
            )
        })

        if (acceptedApp?.applicantId !== userId) {
            return { error: true, message: "Only the active Talent can submit work" }
        }

        await db.update(GigTable)
            .set({ status: "submitted", updatedAt: new Date() })
            .where(eq(GigTable.id, gigId))

        revalidateTag("gigs")
        return { success: true, message: "Work submitted!" }
    } catch (error) {
        console.error("Error submitting work:", error)
        return { error: true, message: "Failed to submit work" }
    }
}

// Client Action: Confirm & Release Funds
export async function confirmGigCompletion(gigId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) return { error: true, message: "Unauthorized" }

    try {
        const gig = await db.query.GigTable.findFirst({ where: eq(GigTable.id, gigId) })
        if (!gig) return { error: true, message: "Gig not found" }

        if (gig.clientId !== userId) {
            return { error: true, message: "Only the Client can confirm completion" }
        }

        await db.update(GigTable)
            .set({ status: "completed", updatedAt: new Date() })
            .where(eq(GigTable.id, gigId))

        revalidateTag("gigs")
        return { success: true, message: "Gig completed & funds released!" }
    } catch (error) {
        console.error("Error confirming gig:", error)
        return { error: true, message: "Failed to confirm completion" }
    }
}

// Keep this for backward compatibility or admin overrides if needed, 
// though typical flow should use the above.
export async function markGigAsCompleted(gigId: string) {
    return confirmGigCompletion(gigId)
}
