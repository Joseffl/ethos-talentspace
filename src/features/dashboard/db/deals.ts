"use server"

import { db } from "@/drizzle/db"
import { GigApplicationTable, GigTable } from "@/drizzle/schema"
import { eq, and, desc, inArray, ne } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getDealById(dealId: string) {
    return db.query.GigApplicationTable.findFirst({
        where: eq(GigApplicationTable.id, dealId),
        with: {
            gig: {
                with: {
                    client: true
                }
            },
            applicant: true
        }
    })
}

export async function getMyDeals(userId: string) {
    "use cache"
    cacheTag("gigs", `user-deals-${userId}`)

    // 1. Deals where I am the APPLICANT (I got hired)
    const asTalentRaw = await db.query.GigApplicationTable.findMany({
        where: and(
            eq(GigApplicationTable.applicantId, userId),
            eq(GigApplicationTable.status, "accepted")
        ),
        with: {
            gig: {
                with: {
                    client: true
                }
            }
        },
        orderBy: desc(GigApplicationTable.updatedAt)
    })

    // Filter out completed gigs
    const asTalent = asTalentRaw.filter(deal => deal.gig.status !== "completed")

    // 2. Deals where I am the CLIENT (I hired someone)
    const myGigs = await db.query.GigTable.findMany({
        where: and(
            eq(GigTable.clientId, userId),
            ne(GigTable.status, "completed")
        ),
        columns: { id: true }
    })

    const myGigIds = myGigs.map(g => g.id)

    let asClient: any[] = []

    if (myGigIds.length > 0) {
        asClient = await db.query.GigApplicationTable.findMany({
            where: and(
                inArray(GigApplicationTable.gigId, myGigIds),
                eq(GigApplicationTable.status, "accepted")
            ),
            with: {
                gig: true,
                applicant: true
            },
            orderBy: desc(GigApplicationTable.updatedAt)
        })
    }

    return { asTalent, asClient }
}
