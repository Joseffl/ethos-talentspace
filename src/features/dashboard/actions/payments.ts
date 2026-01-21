"use server"

import { db } from "@/drizzle/db"
import { GigTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/services/privy"
import { revalidateTag } from "next/cache"

export async function fundGig(gigId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) {
        return { error: true, message: "Unauthorized" }
    }

    try {
        const gig = await db.query.GigTable.findFirst({
            where: eq(GigTable.id, gigId)
        })

        if (!gig) return { error: true, message: "Gig not found" }

        if (gig.clientId !== userId) {
            return { error: true, message: "Only the client can fund this gig" }
        }

        if (gig.isFunded) {
            return { error: true, message: "Gig is already funded" }
        }

        // Simulating Payment Processing...
        // In real app: await stripe.paymentIntents.create(...)

        await db.update(GigTable)
            .set({ isFunded: true, updatedAt: new Date() })
            .where(eq(GigTable.id, gigId))

        revalidateTag("gigs")
        return { success: true, message: "Escrow funded successfully" }

    } catch (error) {
        console.error("Error funding gig:", error)
        return { error: true, message: "Failed to fund escrow" }
    }
}
