"use client"

import { useState } from "react"
import { getFlutterwavePaymentLink } from "../actions/flutterwave"

type ProductProps = {
  priceInDollars: number
  name: string
  id: string
  imageUrl: string
  description: string
}

type UserProps = {
  email: string
  id: string
}

export function FlutterwaveCheckoutForm({
  product,
  user,
}: {
  product: ProductProps
  user: UserProps
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const paymentLink = await getFlutterwavePaymentLink(product, user)
      // Redirect to Flutterwave payment page
      window.location.href = paymentLink
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize payment"
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-3xl font-bold text-blue-600">
          ${product.priceInDollars.toFixed(2)}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  )
}