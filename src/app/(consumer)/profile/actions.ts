"use server"

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/services/privy"
import { revalidatePath } from "next/cache"

/**
 * Sync wallet address from Privy to database
 * This is useful when a user connects a wallet and we need to update the database
 */
export async function syncWalletAddress() {
    const { userId, walletAddress } = await getCurrentUser()

    if (!userId) {
        return {
            error: true,
            message: "Not authenticated"
        }
    }

    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId),
    })

    if (!user) {
        return {
            error: true,
            message: "User not found"
        }
    }

    // If we have a wallet from Privy but not in DB, update it
    if (walletAddress && walletAddress !== user.walletAddress) {
        console.log(`[Sync] Updating wallet for user ${userId}: ${walletAddress}`)

        await db
            .update(UserTable)
            .set({
                walletAddress,
                updatedAt: new Date()
            })
            .where(eq(UserTable.id, userId))

        revalidatePath("/profile")

        return {
            error: false,
            message: "Wallet synced successfully",
            walletAddress
        }
    }

    return {
        error: false,
        message: "Wallet already synced",
        walletAddress: user.walletAddress
    }
}
