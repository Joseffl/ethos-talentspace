"use server"

import { db } from "@/drizzle/db"
import { GigApplicationTable, GigTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { eq, desc } from "drizzle-orm"

export async function getMyApplications() {
    const { userId } = await getCurrentUser()

    if (!userId) return []

    const applications = await db.query.GigApplicationTable.findMany({
        where: eq(GigApplicationTable.applicantId, userId),
        with: {
            gig: {
                with: {
                    client: true
                }
            }
        },
        orderBy: [desc(GigApplicationTable.createdAt)],
    })

    return applications
}
