"use server"

import { db } from "@/drizzle/db"
import { GigApplicationTable, GigTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"

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
