"use server"

import { canRefundPurchases } from "../permissions/products"
import { getCurrentUser } from "@/services/privy"
import { db } from "@/drizzle/db"
import { updatePurchase } from "../db/purchases"
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAcccess"

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error refunding this purchase",
    }
  }

  const data = await db.transaction(async (trx) => {
    const refundedPurchase = await updatePurchase(
      id,
      { refundedAt: new Date() },
      trx
    )

    try {
      await revokeUserCourseAccess(refundedPurchase, trx)
    } catch (error) {
      console.error("Refund error:", error)
      trx.rollback()
      return {
        error: true,
        message: "There was an error refunding this purchase",
      }
    }
  })

  return data ?? { error: false, message: "Successfully refunded purchase" }
}
