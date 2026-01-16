import { env } from "@/data/env/server"
import { db } from "@/drizzle/db"
import { ProductTable, UserTable } from "@/drizzle/schema"
import { addUserCourseAccess } from "@/features/courses/db/userCourseAcccess"
import { insertPurchase } from "@/features/purchases/db/purchases"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import axios from "axios"

export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get("transaction_id")
  if (transactionId == null) redirect("/products/purchase-failure")

  let redirectUrl: string
  try {
    const transaction = await verifyFlutterwaveTransaction(transactionId)
    const productId = await processFlutterwaveCheckout(transaction)
    redirectUrl = `/products/${productId}/purchase/success`
  } catch (error) {
    console.error("Transaction processing error:", error)
    redirectUrl = "/products/purchase-failure"
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || request.url
  return NextResponse.redirect(new URL(redirectUrl, baseUrl))

}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("verif-hash")
  const body = await request.text()

  if (!verifyWebhookSignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.data?.status === "successful") {
    try {
      const transaction = await verifyFlutterwaveTransaction(
        event.data.id.toString()
      )
      await processFlutterwaveCheckout(transaction)
    } catch (error) {
      console.error("Webhook processing error:", error)
      return new Response(null, { status: 500 })
    }
  }

  return new Response(null, { status: 200 })
}

function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false

  const hash = crypto
    .createHmac("sha256", env.FLUTTERWAVE_WEBHOOK_SECRET)
    .update(body)
    .digest("hex")

  return hash === signature
}



async function verifyFlutterwaveTransaction(transactionId: string) {
  try {
    console.log("Verifying transaction ID:", transactionId)
    console.log("Using secret key:", env.FLUTTERWAVE_SECRET_KEY?.substring(0, 10) + "...")

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    )

    console.log("Verification response status:", response.status)
    console.log("Response data:", response.data)

    if (response.data.status !== "success") {
      throw new Error("Transaction verification failed")
    }

    return response.data.data
  } catch (error: any) {
    console.error("Transaction verification error:", error.message)
    console.error("Error response data:", error.response?.data)
    console.error("Error status:", error.response?.status)
    throw new Error("Failed to verify transaction")
  }
}

async function processFlutterwaveCheckout(transaction: any) {
  const { meta } = transaction

  if (!meta?.productId || !meta?.userId) {
    throw new Error("Missing metadata")
  }

  const userId = meta.userId
  const productId = meta.productId

  const [product, user] = await Promise.all([
    getProduct(productId),
    getUser(userId),
  ])

  if (product == null) throw new Error("Product not found")
  if (user == null) throw new Error("User not found")

  const courseIds = product.courseProducts.map((cp: any) => cp.courseId)

  await db.transaction(async (trx) => {
    try {
      await addUserCourseAccess({ userId: user.id, courseIds }, trx)
      await insertPurchase(
        {
          flutterwaveTransactionId: transaction.id.toString(),
          pricePaidInCents: Math.round(transaction.amount * 100),
          productDetails: product,
          userId: user.id,
          productId,
        },
        trx
      )
    } catch (error) {
      trx.rollback()
      throw error
    }
  })

  return productId
}

function getProduct(id: string) {
  return db.query.ProductTable.findFirst({
    columns: {
      id: true,
      priceInNaira: true,
      name: true,
      description: true,
      imageUrl: true,
    },
    where: eq(ProductTable.id, id),
    with: {
      courseProducts: { columns: { courseId: true } },
    },
  })
}

function getUser(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true },
    where: eq(UserTable.id, id),
  })
}