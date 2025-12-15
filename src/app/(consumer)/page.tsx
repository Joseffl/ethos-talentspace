import { db } from "@/drizzle/db";
import { ProductTable, CategoryTable, CourseTable, CourseSectionTable, LessonTable, UserCourseAccessTable, UserLessonCompleteTable } from "@/drizzle/schema";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { asc, eq, and, countDistinct, sql } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  ChevronRight,
  Users,
  Star,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/features/products/components/ProductCard";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AnimatedStat } from "@/components/AnimatedStat";
import { getCurrentUser } from "@/services/clerk";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPlural } from "@/lib/formatters";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { category: categorySlug } = await searchParams;
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <SignedIn>
        <HeroAuthenticated />
      </SignedIn>
      <SignedOut>
        <HeroUnauthenticated />
      </SignedOut>

      <SignedIn>
        <AuthenticatedContent />
      </SignedIn>
      <SignedOut>
        <UnauthenticatedContent />
      </SignedOut>

      <section id="featured" className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Featured Courses
          </h3>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No courses available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/all-courses"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#28ac30] text-white rounded-lg font-semibold hover:bg-[#229a28] transition-colors"
              >
                Browse All Courses <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      {categories.length > 0 && (
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Explore by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/all-courses?category=${category.slug}`}
                className="bg-white rounded-lg p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-all hover:scale-105 border border-gray-100"
              >
                <div className="bg-green-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#28ac30]" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm md:text-base break-words">
                  {category.name}
                </h4>
              </Link>
            ))}
          </div>
          {categories.length > 8 && (
            <div className="text-center mt-8">
              <Link
                href="/all-courses"
                className="text-[#28ac30] font-semibold hover:text-[#229a28] inline-flex items-center gap-1"
              >
                View All Categories <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* CTA Section */}
      <SignedIn>
        <CTAAuthenticated />
      </SignedIn>
      <SignedOut>
        <CTAUnauthenticated />
      </SignedOut>
    </>
  );
}

// Hero for authenticated users
function HeroAuthenticated() {
  return (
    <section className="mb-16 bg-gradient-to-r from-[#28ac30] to-[#1f8a26] rounded-2xl overflow-hidden shadow-xl">
      <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, Engineer!
          </h1>
          <p className="text-xl mb-6 text-green-100">
            Continue your learning journey with world-class engineering courses
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/courses"
              className="px-6 py-3 bg-white text-[#1f8a26] rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              My Courses
            </Link>
            <Link
              href="/all-courses"
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#1f8a26] transition-colors inline-block"
            >
              Explore More
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop"
            alt="Engineering Learning"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// Hero for non-authenticated users
function HeroUnauthenticated() {
  return (
    <section className="mb-16 bg-gradient-to-r from-[#28ac30] to-[#1f8a26] rounded-2xl overflow-hidden shadow-xl">
      <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Master Engineering Skills Online
          </h1>
          <p className="text-xl mb-6 text-green-100">
            Learn from industry experts and advance your career with cutting-edge engineering courses
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="px-6 py-3 bg-white text-[#1f8a26] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              asChild
            >
              <SignUpButton mode="modal">Get Started Free</SignUpButton>
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#1f8a26] transition-colors bg-transparent"
              asChild
            >
              <SignInButton mode="modal">Sign In</SignInButton>
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop"
            alt="Engineering Learning"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// Component for authenticated users
async function AuthenticatedContent() {
  const { userId } = await getCurrentUser();
  
  // Fetch user stats and courses
  const [userStats, userCourses] = await Promise.all([
    userId ? getUserStats(userId) : null,
    userId ? getUserCoursesForHomepage(userId) : []
  ]);

  const stats = [
    {
      label: "Courses Enrolled",
      value: userStats?.coursesEnrolled.toString() || "0",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    { 
      label: "Hours Learned", 
      value: userStats?.hoursLearned.toString() || "0", 
      icon: Clock, 
      color: "bg-purple-500" 
    },
    { 
      label: "Certificates", 
      value: userStats?.certificates.toString() || "0", 
      icon: Award, 
      color: "bg-green-500" 
    },
    {
      label: "Avg Progress",
      value: `${userStats?.avgProgress || 0}%`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Continue Learning Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">
            Continue Learning
          </h3>
          <Link
            href="/courses"
            className="text-[#28ac30] font-semibold hover:text-[#229a28] flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {userCourses.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              No courses enrolled yet
            </h4>
            <p className="text-gray-600 mb-4">
              Start your learning journey by exploring our featured courses below
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCourses.slice(0, 3).map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    {formatPlural(course.sectionsCount, {
                      plural: "sections",
                      singular: "section",
                    })}{" "}
                    •{" "}
                    {formatPlural(course.lessonsCount, {
                      plural: "lessons",
                      singular: "lesson",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="line-clamp-3" title={course.description}>
                  {course.description}
                </CardContent>
                <div className="flex-grow" />
                <CardFooter>
                  <Button asChild>
                    <Link href={`/courses/${course.id}`}>Continue Learning</Link>
                  </Button>
                </CardFooter>
                <div
                  className="bg-accent h-2 -mt-2"
                  style={{
                    width: `${course.lessonsCount > 0 ? (course.lessonsComplete / course.lessonsCount) * 100 : 0}%`,
                  }}
                />
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// Component for non-authenticated users
function UnauthenticatedContent() {
  const features = [
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience",
    },
    {
      icon: Award,
      title: "Certified Learning",
      description: "Earn certificates recognized by top engineering firms",
    },
    {
      icon: PlayCircle,
      title: "On-Demand Access",
      description: "Study at your own pace with lifetime course access",
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Advance your engineering career with in-demand skills",
    },
  ];

  const stats = [
    { value: 10000, suffix: "+", label: "Active Students" },
    { value: 500, suffix: "+", label: "Expert Courses" },
    { value: 95, suffix: "%", label: "Satisfaction Rate" },
    { value: 50, suffix: "+", label: "Industry Partners" },
  ];

  return (
    <>
      {/* Trust Indicators */}
      <section className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-25">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Why Engineers Choose Us
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-[#28ac30]" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
          Start Learning in 3 Simple Steps
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Create Your Account",
              description: "Sign up free and browse our course catalog",
            },
            {
              step: "2",
              title: "Choose Your Course",
              description: "Select from hundreds of expert-led engineering courses",
            },
            {
              step: "3",
              title: "Start Learning",
              description: "Study at your pace and earn recognized certificates",
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-[#28ac30] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                {item.step}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function CTAAuthenticated() {
  return (
    <section className="bg-gradient-to-r from-[#28ac30] to-[#1f8a26] rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
      <h3 className="text-3xl font-bold mb-4">Ready to start learning?</h3>
      <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
        Join thousands of engineers advancing their careers with world-class courses and expert instruction.
      </p>
      <Link
        href="/all-courses"
        className="inline-block px-8 py-3 bg-white text-[#28ac30] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Start Learning Today
      </Link>
    </section>
  );
}

function CTAUnauthenticated() {
  return (
    <section className="bg-gradient-to-r from-[#28ac30] to-[#1f8a26] rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
      <h3 className="text-3xl font-bold mb-4">Ready to start learning?</h3>
      <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
        Join thousands of engineers advancing their careers with world-class courses and expert instruction.
      </p>
      <Button
        className="px-8 py-3 bg-white text-[#28ac30] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        asChild
      >
        <SignUpButton mode="modal">Get Started Free</SignUpButton>
      </Button>
    </section>
  );
}

async function getFeaturedProducts() {
  "use cache";
  cacheTag(getProductGlobalTag());

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
    },
    where: wherePublicProducts,
    orderBy: asc(ProductTable.name),
    limit: 4,
    with: {
      category: true,
    },
  });
}

async function getCategories() {
  "use cache";
  cacheTag("categories");

  return db.query.CategoryTable.findMany({
    orderBy: asc(CategoryTable.name),
  });
}

async function getUserStats(userId: string) {
  "use cache";
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  // Get courses enrolled count
  const coursesEnrolled = await db
    .select({ count: countDistinct(UserCourseAccessTable.courseId) })
    .from(UserCourseAccessTable)
    .where(eq(UserCourseAccessTable.userId, userId))
    .then(result => result[0]?.count || 0);

  // Get completed lessons count (for hours learned approximation)
  const completedLessons = await db
    .select({ count: countDistinct(UserLessonCompleteTable.lessonId) })
    .from(UserLessonCompleteTable)
    .where(eq(UserLessonCompleteTable.userId, userId))
    .then(result => result[0]?.count || 0);

  // Approximate hours: assume each lesson is ~15 minutes
  const hoursLearned = Math.round((completedLessons * 15) / 60);

  // Get certificates (courses with 100% completion)
  const coursesProgress = await db
    .select({
      courseId: CourseTable.id,
      totalLessons: countDistinct(LessonTable.id),
      completedLessons: countDistinct(UserLessonCompleteTable.lessonId),
    })
    .from(CourseTable)
    .innerJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .leftJoin(
      UserLessonCompleteTable,
      and(
        eq(UserLessonCompleteTable.lessonId, LessonTable.id),
        eq(UserLessonCompleteTable.userId, userId)
      )
    )
    .groupBy(CourseTable.id);

  const certificates = coursesProgress.filter(
    course => course.totalLessons > 0 && course.completedLessons === course.totalLessons
  ).length;

  // Calculate average progress
  const avgProgress = coursesProgress.length > 0
    ? Math.round(
        coursesProgress.reduce((sum, course) => {
          const progress = course.totalLessons > 0 
            ? (course.completedLessons / course.totalLessons) * 100 
            : 0;
          return sum + progress;
        }, 0) / coursesProgress.length
      )
    : 0;

  return {
    coursesEnrolled,
    hoursLearned,
    certificates,
    avgProgress,
  };
}

async function getUserCoursesForHomepage(userId: string) {
  "use cache";
  cacheTag(
    getUserCourseAccessUserTag(userId),
    getUserLessonCompleteUserTag(userId)
  );

  const courses = await db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      description: CourseTable.description,
      sectionsCount: countDistinct(CourseSectionTable.id),
      lessonsCount: countDistinct(LessonTable.id),
      lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
    })
    .from(CourseTable)
    .innerJoin(
      UserCourseAccessTable,
      and(
        eq(UserCourseAccessTable.courseId, CourseTable.id),
        eq(UserCourseAccessTable.userId, userId)
      )
    )
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections
      )
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons)
    )
    .leftJoin(
      UserLessonCompleteTable,
      and(
        eq(UserLessonCompleteTable.lessonId, LessonTable.id),
        eq(UserLessonCompleteTable.userId, userId)
      )
    )
    .orderBy(CourseTable.name)
    .groupBy(CourseTable.id)
    .limit(3);

  courses.forEach(course => {
    cacheTag(
      getCourseIdTag(course.id),
      getCourseSectionCourseTag(course.id),
      getLessonCourseTag(course.id)
    );
  });

  return courses;
}