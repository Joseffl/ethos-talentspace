"use server"

import axios from "axios"
import { env } from "@/data/env/server"
import { canRefundPurchases } from "../permissions/products"
import { getCurrentUser } from "@/services/clerk"
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
      // Verify the transaction first to get details
      const verifyResponse = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${refundedPurchase.flutterwaveTransactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      )

      if (verifyResponse.data.status !== "success") {
        trx.rollback()
        return {
          error: true,
          message: "There was an error refunding this purchase",
        }
      }

      // Create refund using Flutterwave API
      await axios.post(
        `https://api.flutterwave.com/v3/transactions/${refundedPurchase.flutterwaveTransactionId}/refund`,
        {},
        {
          headers: {
            Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      )

      // Revoke course access
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