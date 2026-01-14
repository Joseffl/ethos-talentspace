// "use server";

// import { env as serverEnv } from "@/data/env/server";
// import { env as clientEnv } from "@/data/env/client";
// import axios from "axios";

// type Product = {
//   id: string;
//   name: string;
//   description: string;
//   imageUrl: string;
//   priceInDollars: number;
// };

// type User = {
//   id: string;
//   email: string;
// };

// export async function getFlutterwavePaymentLink(product: Product, user: User) {
//   const amount = Math.round(product.priceInDollars * 100) / 100;

//   const flutterwavePayload = {
//     tx_ref: `${product.id}-${user.id}-${Date.now()}`,
//     amount,
//     currency: "USD",
//     redirect_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/api/webhooks/flutterwave`,
//     customer: {
//       email: user.email,
//       name: user.id,
//     },
//     customizations: {
//       title: product.name,
//       description: product.description,
//       logo: new URL(product.imageUrl, clientEnv.NEXT_PUBLIC_SERVER_URL).href,
//     },
//     meta: {
//       productId: product.id,
//       userId: user.id,
//     },
//   };

//   try {
//     const response = await axios.post(
//       "https://api.flutterwave.com/v3/payments",
//       flutterwavePayload,
//       {
//         headers: {
//           Authorization: `Bearer ${serverEnv.FLUTTERWAVE_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.status !== "success") {
//       throw new Error("Failed to create Flutterwave payment");
//     }

//     return response.data.data.link;
//   } catch (error) {
//     console.error("Flutterwave payment creation error:", error);
//     throw new Error("Failed to initialize payment");
//   }
// }


"use server";

import { env as serverEnv } from "@/data/env/server";
import axios from "axios";

type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  priceInDollars: number;
};

type User = {
  id: string;
  email: string;
};

export async function getFlutterwavePaymentLink(product: Product, user: User) {
  const amount = Math.round(product.priceInDollars * 100) / 100;

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL // Get the current domain dynamically

  const flutterwavePayload = {
    tx_ref: `${product.id}-${user.id}-${Date.now()}`,
    amount,
    currency: "USD",
    redirect_url: `${baseUrl}/api/webhooks/flutterwave`,
    customer: {
      email: user.email,
      name: user.id,
    },
    customizations: {
      title: product.name,
      description: product.description,
      logo: new URL(product.imageUrl, baseUrl).href,
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