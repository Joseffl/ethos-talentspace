import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/drizzle/db";
import { ProductTable, GigTable, UserTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/privy";
import { eq, desc, and, ne, isNotNull, sql } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";

// UI Components
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { GigCard } from "@/components/GigCard";
import { TalentCard } from "@/components/TalentCard";
import { AnimatedStat } from "@/components/AnimatedStat";
import {
  ChevronRight, Users, Award,
  PlayCircle, TrendingUp,
  Plus, Briefcase, Wallet, LayoutGrid, Search, FileText,
  Shield, CheckCircle, ArrowRight, Star, Lock, Zap, UserCheck, BadgeCheck
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
  const [featuredServices, featuredGigs, featuredTalent] = await Promise.all([
    getFeaturedServices(),
    getFeaturedGigs(),
    getFeaturedTalent(),
  ]);

  return (
    <div className="py-8">
      <div className="container">
        <HeroUnauthenticated />
      </div>

      {/* Trusted By / Powered By Section */}
      <section className="bg-gray-50 py-8 mb-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-500">
            <span className="text-sm font-medium uppercase tracking-wider">Powered by</span>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">Ethos Network</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">Privy Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-900">Neon Database</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedStat value={1200} suffix="+" label="Verified Talent" />
            <AnimatedStat value={5000} suffix="+" label="Gigs Completed" />
            <AnimatedStat value={98} suffix="%" label="Success Rate" />
            <AnimatedStat value={20} suffix="M+" label="Value Transacted" />
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Ethos Integration Highlight */}
        <EthosIntegrationSection />

        {/* Featured Talent Section */}
        {featuredTalent.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Featured Talent</h3>
                <p className="text-gray-500 mt-1">Verified professionals with on-chain reputation</p>
              </div>
              <Link href="/explore" className="text-blue-600 hover:underline flex items-center gap-1">
                Browse all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTalent.map((talent) => (
                <TalentCard key={talent.id} {...talent} />
              ))}
            </div>
          </section>
        )}

        {/* Open Gigs Section */}
        {featuredGigs.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Open Gigs</h3>
              <Link href="/explore" className="text-blue-600 hover:underline flex items-center gap-1">
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
        {featuredServices.length > 0 && (
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
        )}

        <UnauthenticatedContent />
        <CTAUnauthenticated />
      </div>
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
    <section className="mb-16 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center p-10 md:p-16 relative z-10">
        <div className="text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Reputation-Gated Marketplace</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Hire Web3 Talent You Can{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Actually Trust
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
            The first freelance marketplace where reputation is verified on-chain.
            Set minimum Ethos scores, filter by vouches, and hire with confidence.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>On-chain reputation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Escrow protection</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Two-step delivery</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/sign-up" className="px-8 py-4 bg-white text-[#1E40AF] rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              Start Hiring
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Find Work
            </Link>
          </div>
        </div>

        {/* Right Side - Visual Representation */}
        <div className="relative hidden md:block">
          {/* Reputation Card Mockup */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">John Developer</h3>
                <p className="text-gray-500 text-sm">Smart Contract Auditor</p>
              </div>
              <div className="ml-auto">
                <BadgeCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* Ethos Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ethos Score</span>
                <span className="text-2xl font-bold text-blue-600">1,847</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: "73%" }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Top 15% of all users</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  4.9
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-bold">23</div>
                <p className="text-xs text-gray-500">Vouches</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 font-bold">98%</div>
                <p className="text-xs text-gray-500">Success</p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
            Verified
          </div>
          <div className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Reputation Gated
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Wallet,
      title: "Connect & Verify",
      description: "Link your wallet and social accounts. Your Ethos reputation score is automatically fetched.",
      color: "blue",
    },
    {
      number: "02",
      icon: Search,
      title: "Post or Apply",
      description: "Post gigs with reputation requirements, or apply to jobs that match your verified credentials.",
      color: "purple",
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Work & Get Paid",
      description: "Complete work, submit for review. Client confirms and funds are released instantly.",
      color: "green",
    },
  ];

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          From posting a gig to getting paid—everything is reputation-verified and trustless.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            {/* Connector Line */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
            )}

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 relative">
              {/* Step Number */}
              <div className="absolute -top-4 left-6 bg-gray-900 text-white text-sm font-bold px-3 py-1 rounded-full">
                {step.number}
              </div>

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                step.color === "blue" ? "bg-blue-100 text-blue-600" :
                step.color === "purple" ? "bg-purple-100 text-purple-600" :
                "bg-green-100 text-green-600"
              }`}>
                <step.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EthosIntegrationSection() {
  return (
    <section className="mb-20">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Powered by Ethos Network</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Reputation-Gated Hiring
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Set minimum requirements for who can apply to your gigs. Filter by Ethos score,
              positive review percentage, and vouch count—ensuring you only work with
              verified, trustworthy talent.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Minimum Score Gating</h4>
                  <p className="text-slate-400 text-sm">Only allow applicants above a certain Ethos score threshold</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Review Verification</h4>
                  <p className="text-slate-400 text-sm">Require minimum positive review percentages</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Vouch Requirements</h4>
                  <p className="text-slate-400 text-sm">Set minimum vouch counts from trusted network members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-sm font-medium text-slate-400 mb-4">Gig Requirements Preview</div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Minimum Ethos Score</span>
                  <span className="text-white font-bold">1,200+</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: "48%" }} />
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Positive Reviews</span>
                  <span className="text-white font-bold">80%+</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Minimum Vouches</span>
                  <span className="text-white font-bold">5+</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <p className="text-amber-200 text-sm">
                  Applicants who don&apos;t meet these requirements cannot apply
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UnauthenticatedContent() {
  const features = [
    { icon: UserCheck, title: "Verified Identity", description: "Every profile is linked to on-chain credentials and social proof via Ethos Network." },
    { icon: Lock, title: "Secure Escrow", description: "Funds are locked until work is submitted and confirmed by the client." },
    { icon: Star, title: "On-Chain Reviews", description: "Reviews and ratings are tied to real transactions, preventing fake testimonials." },
    { icon: Zap, title: "Instant Release", description: "Get paid instantly once the client confirms the work is complete." },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Ethos Talentspace?</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Built for the Web3 economy with trust and transparency at its core.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <f.icon className="w-7 h-7 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h4>
            <p className="text-gray-600 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTAUnauthenticated() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Join 1,200+ verified talent</span>
        </div>

        <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your On-Chain Reputation?</h3>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
          Connect your wallet, link your Ethos profile, and start working with verified clients and talent today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up" className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 shadow-lg">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </Link>
          <Link href="/explore" className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Explore First
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Reputation Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Secure Escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>98% Success Rate</span>
          </div>
        </div>
      </div>
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

async function getFeaturedTalent() {
  "use cache";
  cacheTag("users", "talent");

  const talentWithStats = await db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      bio: UserTable.bio,
      imageUrl: UserTable.imageUrl,
      twitterImage: UserTable.twitterImage,
      twitterUsername: UserTable.twitterUsername,
      walletAddress: UserTable.walletAddress,
      ethosScore: UserTable.ethosScore,
      averageRating: UserTable.averageRating,
      reviewCount: UserTable.reviewCount,
      // FIXED: Hard-referencing "users"."id" to prevent "id" ambiguity
      completedDeals: sql<number>`(
        SELECT COUNT(*)::int 
        FROM gig_applications ga
        JOIN gigs g ON ga.gig_id = g.id
        WHERE ga.applicant_id = "users"."id"
        AND ga.status = 'accepted'
        AND g.status = 'completed'
      )`.mapWith(Number),
    })
    .from(UserTable)
    .where(
      and(
        isNotNull(UserTable.walletAddress),
        sql`${UserTable.deletedAt} IS NULL`
      )
    )
    .orderBy(desc(UserTable.ethosScore), desc(UserTable.averageRating))
    .limit(4);

  return talentWithStats.map(t => ({
    ...t,
    completedDeals: t.completedDeals || 0,
    skills: [], 
  }));
}