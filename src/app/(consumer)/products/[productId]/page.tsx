
import { SkeletonButton } from "@/components/Skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  ProductTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getProductIdTag } from "@/features/products/db/cache";
import { userOwnsProduct } from "@/features/products/db/products";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { formatPlural, formatPrice } from "@/lib/formatters";
import { sumArray } from "@/lib/sumArray";
import { getCurrentUser } from "@/services/clerk";
import { and, asc, eq } from "drizzle-orm";
import { VideoIcon, CheckCircle2 } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ProductPage(props: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await props.params;

  const product = await getPublicProduct(productId);

  if (product == null) return notFound();

  const courseCount = product.courses.length;
  const lessonCount = sumArray(product.courses, (course) =>
    sumArray(course.courseSections, (s) => s.lessons.length)
  );

  return (
    <div className="container my-6">
     <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
  <div className="flex gap-6 flex-col items-start flex-1">
    <div className="flex flex-col gap-2">
      <Suspense
        fallback={
          <div className="text-xl">
            {formatPrice(product.priceInNaira)}
          </div>
        }
      >
        <Price price={product.priceInNaira} />
      </Suspense>

      <h1 className="text-4xl font-semibold">{product.name}</h1>

      <div className="text-muted-foreground">
        {formatPlural(courseCount, {
          singular: "course",
          plural: "courses",
        })}{" "}
        •{" "}
        {formatPlural(lessonCount, {
          singular: "lesson",
          plural: "lessons",
        })}
      </div>
    </div>

    <div className="text-xl">{product.description}</div>

    <Suspense fallback={<SkeletonButton className="h-12 w-36" />}>
      <PurchaseButton productId={product.id} />
    </Suspense>
  </div>

  <div className="relative aspect-video w-full lg:w-[500px] flex-shrink-0">
    <Image
      src={product.imageUrl}
      fill
      alt={product.name}
      className="object-cover rounded-xl"
    />
  </div>
</div>

      {((product.prerequisites && product.prerequisites.length > 0) ||
        (product.learningOutcomes && product.learningOutcomes.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {product.prerequisites && product.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {product.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#28ac30] mt-1 font-bold">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {product.learningOutcomes && product.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Outcomes</CardTitle>
                <CardDescription>
                  By the end of this course, participants will be able to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {product.learningOutcomes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#28ac30] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
        {product.courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {formatPlural(course.courseSections.length, {
                  plural: "sections",
                  singular: "section",
                })}{" "}
                •{" "}
                {formatPlural(
                  sumArray(course.courseSections, (s) => s.lessons.length),
                  {
                    plural: "lessons",
                    singular: "lesson",
                  }
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Accordion type="multiple">
                {course.courseSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="flex gap-2">
                      <div className="flex flex-col flex-grow">
                        <span className="text-lg">{section.name}</span>
                        <span className="text-muted-foreground">
                          {formatPlural(section.lessons.length, {
                            plural: "lessons",
                            singular: "lesson",
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="flex flex-col gap-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 text-base"
                        >
                          <VideoIcon className="size-4" />

                          {lesson.status === "preview" ? (
                            <Link
                              href={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="underline text-accent"
                            >
                              {lesson.name}
                            </Link>
                          ) : (
                            lesson.name
                          )}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function PurchaseButton({ productId }: { productId: string }) {
  const { userId } = await getCurrentUser();

  const alreadyOwnsProduct =
    userId != null && (await userOwnsProduct({ userId, productId }));

  if (alreadyOwnsProduct) {
    return <p>You already own this product</p>;
  }

  return (
    <Button className="text-xl h-auto py-4 px-8 rounded-lg" asChild>
      <Link href={`/products/${productId}/purchase`}>Get Now</Link>
    </Button>
  );
}

async function Price({ price }: { price: number }) {
  return <div className="text-xl">{formatPrice(price)}</div>;
}

async function getPublicProduct(id: string) {
  "use cache";
  cacheTag(getProductIdTag(id));

  const product = await db.query.ProductTable.findFirst({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInNaira: true,
      imageUrl: true,
      prerequisites: true, 
      learningOutcomes: true, 
    },
    where: and(eq(ProductTable.id, id), wherePublicProducts),
    with: {
      courseProducts: {
        columns: {},
        with: {
          course: {
            columns: { id: true, name: true },
            with: {
              courseSections: {
                columns: { id: true, name: true },
                where: wherePublicCourseSections,
                orderBy: asc(CourseSectionTable.order),
                with: {
                  lessons: {
                    columns: { id: true, name: true, status: true },
                    where: wherePublicLessons,
                    orderBy: asc(LessonTable.order),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (product == null) return product;

  cacheTag(
    ...product.courseProducts.flatMap((cp) => [
      getLessonCourseTag(cp.course.id),
      getCourseSectionCourseTag(cp.course.id),
      getCourseIdTag(cp.course.id),
    ])
  );

  const { courseProducts, ...other } = product;

  return {
    ...other,
    courses: courseProducts.map((cp) => cp.course),
  };
}
