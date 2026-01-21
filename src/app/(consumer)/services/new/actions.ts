"use server"

import { db } from "@/drizzle/db"
import { ProductTable } from "@/drizzle/schema"
import { getCurrentUser } from "@/services/privy"
import { revalidateProductCache } from "@/features/products/db/cache"

export async function createServiceAction(formData: FormData) {
    const { userId } = await getCurrentUser()

    if (!userId) {
        return {
            error: true,
            message: "Not authenticated"
        }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const priceInNaira = parseInt(formData.get("priceInNaira") as string)
    const imageUrl = formData.get("imageUrl") as string
    const categoryId = formData.get("categoryId") as string | null

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
    if (!name || name.length < 5) {
        return { error: true, message: "Title must be at least 5 characters" }
    }
    if (!description || description.length < 20) {
        return { error: true, message: "Description must be at least 20 characters" }
    }
    if (!priceInNaira || priceInNaira < 1000) {
        return { error: true, message: "Minimum price is $1,000" }
    }
    if (!imageUrl) {
        return { error: true, message: "Image URL is required" }
    }

    try {
        const [service] = await db
            .insert(ProductTable)
            .values({
                name,
                description,
                priceInNaira,
                imageUrl,
                categoryId: categoryId || null,
                ownerId: userId,
                status: "public",
                reputationCriteria,
                prerequisites: [],
                learningOutcomes: [],
            })
            .returning()

        if (!service) {
            return {
                error: true,
                message: "Failed to create service"
            }
        }

        revalidateProductCache(service.id)

        return {
            error: false,
            message: "Service created successfully",
            serviceId: service.id
        }
    } catch (err) {
        console.error("Failed to create service:", err)
        return {
            error: true,
            message: "An error occurred while creating your service"
        }
    }
}
