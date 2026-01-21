import { PageHeader } from "@/components/PageHeader"
import { ServiceCard } from "@/components/ServiceCard"
import { GigCard } from "@/components/GigCard"
import { db } from "@/drizzle/db"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { wherePublicProducts } from "@/features/products/permissions/products"
import { GigTable } from "@/drizzle/schema"
import { eq, desc } from "drizzle-orm"
import { Search, Briefcase, LayoutGrid } from "lucide-react"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ExplorePage() {
  return (
    <div className="container my-6">
      <PageHeader title="Explore Ethos" />
      <p className="text-gray-500 mb-8 max-w-2xl">
        Discover verified Web3 talent and services, or find open gigs to apply for.
        Your reputation is your resume.
      </p>
      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreContent />
      </Suspense>
    </div>
  )
}

async function ExploreContent() {
  const [services, gigs] = await Promise.all([
    getPublicServices(),
    getPublicGigs()
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
          Nothing to explore yet
        </h2>
        <p className="text-gray-600 max-w-md">
          Check back soon for new services and gigs!
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
            <p className="text-gray-500">No services found.</p>
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
            <p className="text-gray-500">No open gigs right now.</p>
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

async function getPublicServices() {
  "use cache"
  cacheTag(getProductGlobalTag())

  return db.query.ProductTable.findMany({
    where: wherePublicProducts,
    orderBy: (products, { desc }) => desc(products.createdAt),
    with: { category: true, owner: true },
  })
}

async function getPublicGigs() {
  "use cache"
  cacheTag("gigs")

  return db.query.GigTable.findMany({
    where: eq(GigTable.status, "open"),
    orderBy: desc(GigTable.createdAt),
    with: { client: true },
  })
}
