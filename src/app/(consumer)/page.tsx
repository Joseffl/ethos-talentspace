import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/drizzle/db";
import { ProductTable, GigTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/privy";
import { eq, desc, and, ne } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";

// UI Components
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { GigCard } from "@/components/GigCard";
import { AnimatedStat } from "@/components/AnimatedStat";
import {
  ChevronRight, Users, Award,
  PlayCircle, TrendingUp,
  Plus, Briefcase, Wallet, LayoutGrid, Search, FileText, Settings, Send
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const { userId, user, walletAddress } = await getCurrentUser({ allData: true });
  const isAuthenticated = !!userId;

  // --- AUTHENTICATED VIEW (DASHBOARD) ---
  if (isAuthenticated) {
    return (
      <div className="container py-8 space-y-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <UnifiedDashboard userId={userId} userName={user?.name} walletAddress={walletAddress} />
        </Suspense>
      </div>
    );
  }

  // --- UNAUTHENTICATED VIEW (LANDING PAGE) ---
  const [featuredServices, featuredGigs] = await Promise.all([
    getFeaturedServices(),
    getFeaturedGigs(),
  ]);

  return (
    <div className="container py-8">
      <HeroUnauthenticated />

      {/* Stats Section */}
      <section className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatedStat value={1200} suffix="+" label="Verified Talent" />
          <AnimatedStat value={5000} suffix="+" label="Gigs Completed" />
          <AnimatedStat value={98} suffix="%" label="Success Rate" />
          <AnimatedStat value={20} suffix="M+" label="Value Transacted" />
        </div>
      </section>

      {/* Open Gigs Section */}
      {featuredGigs.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Open Gigs</h3>
            <Link href="/explore/gigs" className="text-green-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGigs.map((gig) => (
              <GigCard key={gig.id} {...gig} />
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Featured Services</h3>
          <Link href="/explore" className="text-blue-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      <UnauthenticatedContent />
      <CTAUnauthenticated />
    </div>
  );
}

// --- UNIFIED DASHBOARD ---

// ... imports
import { DealCard } from "@/components/DealCard";

// ... UnifiedDashboard signature ...

async function UnifiedDashboard({
  userId,
  userName,
  walletAddress
}: {
  userId: string;
  userName?: string | null;
  walletAddress?: string | null;
}) {
  const [myServices, myGigs, browseServices, browseGigs, dealsResults] = await Promise.all([
    getMyServices(userId),
    getMyGigs(userId),
    getBrowseServices(userId),
    getBrowseGigs(userId),
    getMyDeals(userId),
  ]);

  // Calculate stats from the fetched deals
  const stats = await getDashboardStats(userId);
  // Optimization: getDashboardStats currently re-fetches deals. 
  // Ideally, we should unify this, but for now let's just use the `dealsResults` for display
  // and `stats` for the counters (or update stats locally).
  // Actually, let's keep `getDashboardStats` for the other counters and overwrite activeDeals
  stats.activeDeals = dealsResults.asTalent.length + dealsResults.asClient.length;


  return (
    <div className="space-y-8">
      {/* Welcome & Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Services"
          value={stats.myServicesCount}
          icon={LayoutGrid}
          color="blue"
          subtitle="Active services"
        />
        <StatsCard
          title="My Gigs"
          value={stats.myGigsCount}
          icon={Briefcase}
          color="purple"
          subtitle="Posted jobs"
        />
        <StatsCard
          title="Active Deals"
          value={stats.activeDeals}
          icon={FileText}
          color="green"
          subtitle="In progress"
        />
        <StatsCard
          title="Earnings"
          value="$0" // content placeholder
          icon={Wallet}
          color="yellow"
          subtitle="Total earned"
          isString
        />
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">My Services</TabsTrigger>
          <TabsTrigger value="gigs">My Gigs</TabsTrigger>
          <TabsTrigger value="deals">Active Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Services</h2>
            <Button asChild>
              <Link href="/services/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Link>
            </Button>
          </div>
          {myServices.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No services"
              description="You haven't created any services yet."
              action={
                <Button asChild>
                  <Link href="/services/new">Create Service</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => (
                <ServiceCard key={service.id} {...service} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gigs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Gigs</h2>
            <Button asChild>
              <Link href="/gigs/new">
                <Plus className="w-4 h-4 mr-2" />
                Post a Gig
              </Link>
            </Button>
          </div>
          {myGigs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No gigs"
              description="You haven't posted any gigs yet."
              action={
                <Button asChild>
                  <Link href="/gigs/new">Post a Gig</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs.map((gig) => (
                <GigCard key={gig.id} {...gig} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          {stats.activeDeals === 0 ? (
            <EmptyState
              icon={FileText}
              title="No active deals"
              description="When you hire someone or get hired, your deals will appear here."
              action={
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link href="/explore">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Services
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-green-600 text-green-600">
                    <Link href="/explore/gigs">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Gigs
                    </Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="grid gap-6">
              {/* Deals as Talent */}
              {dealsResults.asTalent.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Jobs I&apos;m Working On</h3>
                  {dealsResults.asTalent.map(deal => (
                    <DealCard key={deal.id} role="talent" deal={deal} />
                  ))}
                </div>
              )}

              {/* Deals as Client */}
              {dealsResults.asClient.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Talent Hired</h3>
                  {dealsResults.asClient.map(deal => (
                    <DealCard key={deal.id} role="client" deal={deal} />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  isString = false
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: "blue" | "yellow" | "green" | "purple" | "teal";
  subtitle: string;
  isString?: boolean;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    yellow: "bg-amber-50 text-amber-600 border-amber-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    teal: "bg-teal-50 text-teal-600 border-teal-200",
  };

  return (
    <Card className={`border-2 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold">{isString ? value : value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4 shadow-sm">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-10 w-64 bg-gray-200 rounded" />
        <div className="flex gap-3">
          <div className="h-12 w-32 bg-gray-200 rounded-lg" />
          <div className="h-12 w-40 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-12 w-96 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// --- LANDING PAGE COMPONENTS ---

function HeroUnauthenticated() {
  return (
    <section className="mb-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-3xl overflow-hidden shadow-2xl">
      <div className="grid md:grid-cols-2 gap-12 items-center p-10 md:p-16">
        <div className="text-white">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            The Reputation Layer for Web3 Talent
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Ethos Talentspace connects world-class KOLs, developers, and designers with
            verified on-chain track records.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/sign-up" className="px-8 py-4 bg-white text-[#1E40AF] rounded-xl font-bold hover:bg-gray-100 transition-all">
              Get Started
            </Link>
            <Link href="/explore" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all">
              Browse Talent
            </Link>
          </div>
        </div>
        <div className="relative hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80"
            alt="Web3 Talentspace"
            className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
}

function UnauthenticatedContent() {
  const features = [
    { icon: Users, title: "Verified Identity", description: "Every profile is linked to on-chain credentials and social proof." },
    { icon: Award, title: "Smart Escrow", description: "Payments are held in secure smart contracts until milestones are met." },
    { icon: TrendingUp, title: "Reputation Staking", description: "Talent stakes their reputation to ensure high-quality delivery." },
    { icon: PlayCircle, title: "Instant Settlement", description: "Get paid instantly in crypto once the client approves the work." },
  ];

  return (
    <section className="py-16">
      <h3 className="text-3xl font-bold text-center mb-12">Why Build on Ethos Talentspace?</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <f.icon className="w-12 h-12 text-blue-600 mb-4" />
            <h4 className="text-xl font-bold mb-2">{f.title}</h4>
            <p className="text-gray-600 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTAUnauthenticated() {
  return (
    <section className="bg-slate-900 rounded-3xl p-12 text-center text-white">
      <h3 className="text-3xl font-bold mb-4">Ready to hire or get hired?</h3>
      <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join the decentralized workforce. Connect your wallet and start building your reputation today.</p>
      <Link href="/sign-up" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors inline-block">
        Connect Wallet
      </Link>
    </section>
  );
}

// --- DATA FETCHING ---

async function getFeaturedServices() {
  "use cache";
  cacheTag(getProductGlobalTag());
  return db.query.ProductTable.findMany({
    where: wherePublicProducts,
    limit: 4,
    with: { category: true, owner: true },
  });
}

async function getFeaturedGigs() {
  "use cache";
  cacheTag("gigs");
  return db.query.GigTable.findMany({
    where: eq(GigTable.status, "open"),
    limit: 3,
    orderBy: desc(GigTable.createdAt),
    with: { client: true },
  });
}

async function getMyServices(userId: string) {
  "use cache";
  cacheTag(getProductGlobalTag(), `user-services-${userId}`);
  return db.query.ProductTable.findMany({
    where: eq(ProductTable.ownerId, userId),
    orderBy: desc(ProductTable.createdAt),
    with: { category: true, owner: true },
  });
}

async function getMyGigs(userId: string) {
  "use cache";
  cacheTag("gigs", `user-gigs-${userId}`);
  return db.query.GigTable.findMany({
    where: eq(GigTable.clientId, userId),
    orderBy: desc(GigTable.createdAt),
    with: { client: true },
  });
}

async function getBrowseServices(userId: string) {
  "use cache";
  cacheTag(getProductGlobalTag());
  return db.query.ProductTable.findMany({
    where: and(
      wherePublicProducts,
      ne(ProductTable.ownerId, userId)
    ),
    limit: 6,
    orderBy: desc(ProductTable.createdAt),
    with: { category: true, owner: true },
  });
}

async function getBrowseGigs(userId: string) {
  "use cache";
  cacheTag("gigs");
  return db.query.GigTable.findMany({
    where: and(
      eq(GigTable.status, "open"),
      ne(GigTable.clientId, userId)
    ),
    limit: 6,
    orderBy: desc(GigTable.createdAt),
    with: { client: true },
  });
}

// ... (previous helper functions)

// --- DATA FETCHING ---
// ... (previous fetch functions: getFeaturedServices, getFeaturedGigs, getMyServices, getMyGigs, getBrowseServices, getBrowseGigs)

import { getMyDeals } from "@/features/dashboard/db/deals"

async function getDashboardStats(userId: string) {
  const [myServices, myGigs, deals] = await Promise.all([
    db.query.ProductTable.findMany({
      where: eq(ProductTable.ownerId, userId),
      columns: { id: true },
    }),
    db.query.GigTable.findMany({
      where: eq(GigTable.clientId, userId),
      columns: { id: true },
    }),
    getMyDeals(userId)
  ]);

  const activeDealsCount = deals.asTalent.length + deals.asClient.length

  return {
    myServicesCount: myServices.length,
    myGigsCount: myGigs.length,
    incomingRequests: 0,
    activeDeals: activeDealsCount,
    totalEarnings: 0,
  };
}