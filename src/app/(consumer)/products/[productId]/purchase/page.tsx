import { LoadingSpinner } from "@/components/LoadingSpinner"
import { PageHeader } from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { ProductTable } from "@/drizzle/schema"
import { getProductIdTag } from "@/features/products/db/cache"
import { userOwnsProduct } from "@/features/products/db/products"
import { wherePublicProducts } from "@/features/products/permissions/products"
import { getCurrentUser } from "@/services/privy"
import { formatPrice } from "@/lib/formatters"
import { and, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

export default function PurchasePage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  return (
    <Suspense fallback={<LoadingSpinner className="my-6 size-36 mx-auto" />}>
      <SuspendedComponent params={params} />
    </Suspense>
  )
}

async function SuspendedComponent({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const { user } = await getCurrentUser({ allData: true })
  const product = await getPublicProduct(productId)

  if (product == null) return notFound()

  if (user != null) {
    if (await userOwnsProduct({ userId: user.id, productId })) {
      redirect("/courses")
    }

    return (
      <div className="container my-6">
        <div className="w-full max-w-md mx-auto p-6 border rounded-lg">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-3xl font-bold text-[#2563EB]">
              {formatPrice(product.priceInNaira)}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Payment integration coming soon. Contact us to complete your purchase.
          </p>
          <Link
            href={`/products/${productId}`}
            className="block w-full text-center bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container my-6 flex flex-col items-center">
      <PageHeader title="You need an account to make a purchase" />
      <p className="text-gray-600 mb-4">
        Please connect your wallet to continue with the purchase.
      </p>
      <Link
        href="/sign-in"
        className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1D4ED8] transition-colors"
      >
        Connect Wallet
      </Link>
    </div>
  )
}

async function getPublicProduct(id: string) {
  "use cache"
  cacheTag(getProductIdTag(id))

  return db.query.ProductTable.findFirst({
    columns: {
      name: true,
      id: true,
      imageUrl: true,
      description: true,
      priceInNaira: true,
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
  })
}
