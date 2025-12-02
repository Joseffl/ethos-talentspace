import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  ProductTable,
  PurchaseTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses";
import { getUserCourseAccessGlobalTag } from "@/features/courses/db/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lessons";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { getPurchaseGlobalTag } from "@/features/purchases/db/cache";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { count, countDistinct, isNotNull, sql, sum } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ReactNode, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  RefreshCcw,
  ShoppingBag,
  XCircle,
  Users,
  Package,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default async function AdminPage() {
  return (
    <div className="min-h-screen ">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Dashboard Overview
          </h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#28ac30]" />
            Revenue 
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Suspense fallback={<StatCardSkeleton count={5} />}>
              <PurchaseStats />
            </Suspense>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#28ac30]" />
            Platform Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Suspense fallback={<StatCardSkeleton />}>
              <StudentStats />
            </Suspense>
            <Suspense fallback={<StatCardSkeleton />}>
              <ProductStats />
            </Suspense>
            <Suspense fallback={<StatCardSkeleton />}>
              <CourseStats />
            </Suspense>
            <Suspense fallback={<StatCardSkeleton />}>
              <CourseSectionStats />
            </Suspense>
            <Suspense fallback={<StatCardSkeleton />}>
              <LessonStats />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function PurchaseStats() {
  const {
    averageNetPurchasesPerCustomer,
    netPurchases,
    netSales,
    refundedPurchases,
    totalRefunds,
  } = await getPurchaseDetails();

  return (
    <>
      <AnimatedStatCard
        title="Net Sales"
        icon={DollarSign}
        trend="up"
        accentColor="primary"
      >
        {formatPrice(netSales)}
      </AnimatedStatCard>
      <AnimatedStatCard
        title="Refunded Sales"
        icon={RefreshCcw}
        trend="down"
        accentColor="secondary"
      >
        {formatPrice(totalRefunds)}
      </AnimatedStatCard>
      <AnimatedStatCard
        title="Active Purchases"
        icon={ShoppingBag}
        accentColor="primary"
      >
        {formatNumber(netPurchases)}
      </AnimatedStatCard>
      <AnimatedStatCard title="Refunded" icon={XCircle} accentColor="secondary">
        {formatNumber(refundedPurchases)}
      </AnimatedStatCard>
      <AnimatedStatCard
        title="Avg Per Customer"
        icon={TrendingUp}
        accentColor="primary"
      >
        {formatNumber(averageNetPurchasesPerCustomer, {
          maximumFractionDigits: 2,
        })}
      </AnimatedStatCard>
    </>
  );
}

async function StudentStats() {
  const total = await getTotalStudents();
  return (
    <AnimatedStatCard title="Students" icon={Users} accentColor="primary">
      {formatNumber(total)}
    </AnimatedStatCard>
  );
}

async function ProductStats() {
  const total = await getTotalProducts();
  return (
    <AnimatedStatCard title="Products" icon={Package} accentColor="primary">
      {formatNumber(total)}
    </AnimatedStatCard>
  );
}

async function CourseStats() {
  const total = await getTotalCourses();
  return (
    <AnimatedStatCard title="Courses" icon={GraduationCap} accentColor="primary">
      {formatNumber(total)}
    </AnimatedStatCard>
  );
}

async function CourseSectionStats() {
  const total = await getTotalCourseSections();
  return (
    <AnimatedStatCard title="Sections" icon={BookOpen} accentColor="primary">
      {formatNumber(total)}
    </AnimatedStatCard>
  );
}

async function LessonStats() {
  const total = await getTotalLessons();
  return (
    <AnimatedStatCard title="Lessons" icon={FileText} accentColor="primary">
      {formatNumber(total)}
    </AnimatedStatCard>
  );
}

interface AnimatedStatCardProps {
  title: string;
  children: ReactNode;
  icon: any;
  trend?: "up" | "down";
  accentColor?: "primary" | "secondary";
}

function AnimatedStatCard({
  title,
  children,
  icon: Icon,
  trend,
  accentColor = "primary",
}: AnimatedStatCardProps) {
  const colorClasses = {
    primary: "from-[#28ac30] to-[#1f8622] shadow-green-500/20",
    secondary: "from-[#28ac30]/70 to-[#1f8622]/70 shadow-green-500/10",
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colorClasses[accentColor]}`}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-50/50 to-transparent dark:via-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between mb-2">
          <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </CardDescription>
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[accentColor]} shadow-lg`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <CardTitle className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            {children}
          </CardTitle>

          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend === "up"
                  ? "text-[#28ac30] dark:text-[#28ac30]"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

function StatCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="relative overflow-hidden border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-28" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
}

async function getPurchaseDetails() {
  "use cache";
  cacheTag(getPurchaseGlobalTag());

  const data = await db
    .select({
      totalSales: sql<number>`COALESCE(${sum(
        PurchaseTable.pricePaidInCents
      )}, 0)`.mapWith(Number),
      totalPurchases: count(PurchaseTable.id),
      totalUsers: countDistinct(PurchaseTable.userId),
      isRefund: isNotNull(PurchaseTable.refundedAt),
    })
    .from(PurchaseTable)
    .groupBy((table) => table.isRefund);

  const [refundData] = data.filter((row) => row.isRefund);
  const [salesData] = data.filter((row) => !row.isRefund);

  const netSales = (salesData?.totalSales ?? 0) / 100;
  const totalRefunds = (refundData?.totalSales ?? 0) / 100;
  const netPurchases = salesData?.totalPurchases ?? 0;
  const refundedPurchases = refundData?.totalPurchases ?? 0;
  const averageNetPurchasesPerCustomer =
    salesData?.totalUsers != null && salesData.totalUsers > 0
      ? netPurchases / salesData.totalUsers
      : 0;

  return {
    netSales,
    totalRefunds,
    netPurchases,
    refundedPurchases,
    averageNetPurchasesPerCustomer,
  };
}

async function getTotalStudents() {
  "use cache";
  cacheTag(getUserCourseAccessGlobalTag());

  const [data] = await db
    .select({ totalStudents: countDistinct(UserCourseAccessTable.userId) })
    .from(UserCourseAccessTable);

  if (data == null) return 0;
  return data.totalStudents;
}

async function getTotalCourses() {
  "use cache";
  cacheTag(getCourseGlobalTag());

  const [data] = await db
    .select({ totalCourses: count(CourseTable.id) })
    .from(CourseTable);

  if (data == null) return 0;
  return data.totalCourses;
}

async function getTotalProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  const [data] = await db
    .select({ totalProducts: count(ProductTable.id) })
    .from(ProductTable);
  if (data == null) return 0;
  return data.totalProducts;
}

async function getTotalLessons() {
  "use cache";
  cacheTag(getLessonGlobalTag());

  const [data] = await db
    .select({ totalLessons: count(LessonTable.id) })
    .from(LessonTable);
  if (data == null) return 0;
  return data.totalLessons;
}

async function getTotalCourseSections() {
  "use cache";
  cacheTag(getCourseSectionGlobalTag());

  const [data] = await db
    .select({ totalCourseSections: count(CourseSectionTable.id) })
    .from(CourseSectionTable);
  if (data == null) return 0;
  return data.totalCourseSections;
}