
"use server";

import { getUserCoupon } from "@/lib/userCountryHeader";
import { env as serverEnv } from "@/data/env/server";
import { env as clientEnv } from "@/data/env/client";
import axios from "axios";

import { ProductTable } from "@/drizzle/schema/product";

type Product = typeof ProductTable.$inferSelect;

type User = {
  id: string;
  email: string;
};

export async function getFlutterwavePaymentLink(product: Product, user: User) {
  const coupon = await getUserCoupon();

  let amount = product.priceInDollars;

  if (coupon) {
    amount *= 1 - (coupon.discountPercentage || 0) / 100;
  }

  amount = Math.round(amount * 100) / 100;

  const flutterwavePayload = {
    tx_ref: `${product.id}-${user.id}-${Date.now()}`,
    amount,
    currency: "USD",
    redirect_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/api/webhooks/flutterwave`,
    customer: {
      email: user.email,
      name: user.id,
    },
    customizations: {
      title: product.name,
      description: product.description,
      logo: new URL(product.imageUrl, clientEnv.NEXT_PUBLIC_SERVER_URL).href,
    },
    meta: {
      productId: product.id,
      userId: user.id,
    },
  };

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      flutterwavePayload,
      {
        headers: {
          Authorization: `Bearer ${serverEnv.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status !== "success") {
      throw new Error("Failed to create Flutterwave payment");
    }

    return response.data.data.link;
  } catch (error) {
    console.error("Flutterwave payment creation error:", error);
    throw new Error("Failed to initialize payment");
  }
}
