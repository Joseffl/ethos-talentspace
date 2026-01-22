import { PageHeader } from "@/components/PageHeader"
import { ServiceCard } from "@/components/ServiceCard"
import { GigCard } from "@/components/GigCard"
import { db } from "@/drizzle/db"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { ProductTable, GigTable } from "@/drizzle/schema"
import { eq, desc, and } from "drizzle-orm"
import { Search, Briefcase, LayoutGrid } from "lucide-react"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExploreFilters } from "./ExploreFilters"

interface FilterParams {
  minEthosScore?: number
  minRating?: number
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const params = await searchParams
  return (
    <div className="container my-6">
      <PageHeader title="Explore Ethos" />
      <p className="text-gray-500 mb-8 max-w-2xl">
        Discover verified Web3 talent and services, or find open gigs to apply for.
        Your reputation is your resume.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1">
          <ExploreFilters />
        </aside>

        <main className="lg:col-span-3">
          <Suspense fallback={<ExploreSkeleton />}>
            <ExploreContent filters={params} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

async function ExploreContent({ filters }: { filters: FilterParams }) {
  const [services, gigs] = await Promise.all([
    getPublicServices(filters),
    getPublicGigs(filters)
  ])

  const hasServices = services.length > 0
  const hasGigs = gigs.length > 0

  if (!hasServices && !hasGigs) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-[#2563EB]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          No matches found
        </h2>
        <p className="text-gray-600 max-w-md">
          Try adjusting your filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="services" className="space-y-8">
      <TabsList className="bg-gray-100 p-1 rounded-xl w-full sm:w-auto flex overflow-x-auto">
        <TabsTrigger value="gigs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex-1 sm:flex-none">
          <Briefcase className="w-4 h-4 mr-2" />
          Open Gigs
          {hasGigs && <Badge variant="secondary" className="ml-2 bg-gray-200">{gigs.length}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex-1 sm:flex-none">
          <LayoutGrid className="w-4 h-4 mr-2" />
          Services
          {hasServices && <Badge variant="secondary" className="ml-2 bg-gray-200">{services.length}</Badge>}
        </TabsTrigger>

      </TabsList>

      <TabsContent value="services" className="space-y-6">
        {!hasServices ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No services match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="gigs" className="space-y-6">
        {!hasGigs ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No open gigs match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <GigCard key={gig.id} {...gig} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function ExploreSkeleton() {
  return (
    <div className="space-y-8">
      <div className="w-full sm:w-64 h-10 bg-gray-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

async function getPublicServices({ minEthosScore, minRating }: FilterParams) {
  "use cache"
  cacheTag(getProductGlobalTag())

  const products = await db.query.ProductTable.findMany({
    where: eq(ProductTable.status, "public"),
    orderBy: (products, { desc }) => desc(products.createdAt),
    with: { category: true, owner: true },
  })

  return products.filter(p => {
    if (!p.owner) return false
    const score = p.owner.ethosScore ?? 0
    const rating = p.owner.averageRating ?? 0

    if (minEthosScore && score < minEthosScore) return false
    if (minRating && rating < minRating) return false
    return true
  })
}

async function getPublicGigs({ minEthosScore, minRating }: FilterParams) {
  "use cache"
  cacheTag("gigs")

  const gigs = await db.query.GigTable.findMany({
    where: eq(GigTable.status, "open"),
    orderBy: desc(GigTable.createdAt),
    with: { client: true },
  })

  return gigs.filter(g => {
    if (!g.client) return false
    const score = g.client.ethosScore ?? 0
    const rating = g.client.averageRating ?? 0

    if (minEthosScore && score < minEthosScore) return false
    if (minRating && rating < minRating) return false
    return true
  })
}
