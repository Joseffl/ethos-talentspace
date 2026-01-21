"use server"

import { db } from "@/drizzle/db"
import { MessageTable, GigApplicationTable, GigTable, UserTable } from "@/drizzle/schema"
import { eq, and, desc, asc } from "drizzle-orm"
import { getCurrentUser } from "@/services/privy"
import { revalidateTag } from "next/cache"

export async function sendMessage(dealId: string, content: string) {
    const { userId } = await getCurrentUser()
    if (!userId) {
        return { error: true, message: "Unauthorized" }
    }

    if (!content.trim()) {
        return { error: true, message: "Message cannot be empty" }
    }

    try {
        // Verify participation
        const deal = await db.query.GigApplicationTable.findFirst({
            where: eq(GigApplicationTable.id, dealId),
            with: {
                gig: true
            }
        })

        if (!deal) return { error: true, message: "Deal not found" }

        const isClient = deal.gig.clientId === userId
        const isTalent = deal.applicantId === userId

        if (!isClient && !isTalent) {
            return { error: true, message: "Permission denied" }
        }

        await db.insert(MessageTable).values({
            dealId,
            senderId: userId,
            content: content.trim()
        })

        // Revalidate specific tag for this deal's messages
        // For polling implementation, revalidation might not be strictly necessary if we fetch client-side, 
        // but good for initial load consistency.
        revalidateTag(`messages-${dealId}`)

        return { success: true }
    } catch (error) {
        console.error("Error sending message:", error)
        return { error: true, message: "Failed to send message" }
    }
}

export async function getMessages(dealId: string) {
    const { userId } = await getCurrentUser()
    if (!userId) return []

    // Verify participation (lighter check)
    const deal = await db.query.GigApplicationTable.findFirst({
        where: eq(GigApplicationTable.id, dealId),
        with: { gig: true }
    })

    if (!deal) return []
    if (deal.gig.clientId !== userId && deal.applicantId !== userId) return []

    return db.query.MessageTable.findMany({
        where: eq(MessageTable.dealId, dealId),
        with: {
            sender: {
                columns: { name: true, imageUrl: true }
            }
        },
        orderBy: asc(MessageTable.createdAt)
    })
}
