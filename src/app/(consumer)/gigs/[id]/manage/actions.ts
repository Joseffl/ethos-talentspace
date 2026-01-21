"use server"

import { db } from "@/drizzle/db"
import { GigApplicationTable, GigTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { applicationStatusEnum } from "@/drizzle/schema/gigApplication"

export async function getGigApplications(gigId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) return null

    // Check if user owns the gig
    const gig = await db.query.GigTable.findFirst({
        where: eq(GigTable.id, gigId),
    })

    if (!gig || gig.clientId !== userId) return null

    const applications = await db.query.GigApplicationTable.findMany({
        where: eq(GigApplicationTable.gigId, gigId),
        with: {
            applicant: true,
        },
    })

    return { gig, applications }
}

export async function updateApplicationStatus(applicationId: string, status: "accepted" | "rejected") {
    const { userId } = await getCurrentUser()
    if (!userId) return { error: true, message: "Unauthorized" }

    try {
        // Verify ownership
        const application = await db.query.GigApplicationTable.findFirst({
            where: eq(GigApplicationTable.id, applicationId),
            with: {
                gig: true
            }
        })

        if (!application || application.gig.clientId !== userId) {
            return { error: true, message: "Unauthorized" }
        }

        if (status === "accepted") {
            // Update the gig status to in_progress
            await db
                .update(GigTable)
                .set({ status: "in_progress" })
                .where(eq(GigTable.id, application.gigId))

            // Update THIS application to accepted
            await db
                .update(GigApplicationTable)
                .set({ status: "accepted" })
                .where(eq(GigApplicationTable.id, applicationId))

            // Optional: Reject all other pending applications?
            // For now, let's leave them as pending or we could mark them rejected.
            // Let's explicitly mark others as rejected if they were pending
            /*
            await db
                .update(GigApplicationTable)
                .set({ status: "rejected" })
                .where(and(
                    eq(GigApplicationTable.gigId, application.gigId),
                    eq(GigApplicationTable.status, "pending"),
                    ne(GigApplicationTable.id, applicationId)
                ))
            */
        } else {
            await db
                .update(GigApplicationTable)
                .set({ status: "rejected" })
                .where(eq(GigApplicationTable.id, applicationId))
        }

        revalidatePath(`/gigs/${application.gigId}/manage`)
        revalidatePath("/gigs/my-applications")

        return { error: false, message: `Application ${status}` }
    } catch (err) {
        console.error("Failed to update application:", err)
        return { error: true, message: "Failed to update status" }
    }
}
