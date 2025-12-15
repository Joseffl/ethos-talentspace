
import { db } from "@/drizzle/db";
import { ProductTable, CategoryTable } from "@/drizzle/schema";
import { getProductGlobalTag } from "@/features/products/db/cache";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import AllCourses from "./AllCourses";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function AllCoursesPage({ searchParams }: PageProps) {
  const { category: categorySlug } = await searchParams;
  
  const [products, categories] = await Promise.all([
    getPublicProducts(categorySlug),
    getCategories(),
  ]);

  return <AllCourses products={products} categories={categories} activeCategorySlug={categorySlug} />;
}

async function getPublicProducts(categorySlug?: string) {
  "use cache";
  cacheTag(getProductGlobalTag());

  if (categorySlug) {
    const category = await db.query.CategoryTable.findFirst({
      where: eq(CategoryTable.slug, categorySlug),
    });

    if (!category) {
      return [];
    }

    return db.query.ProductTable.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        priceInDollars: true,
        imageUrl: true,
        status: true,
      },
      where: (products, { and, eq }) =>
        and(wherePublicProducts, eq(products.categoryId, category.id)),
      orderBy: asc(ProductTable.name),
      with: {
        category: true,
      },
    });
  }

  return db.query.ProductTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      priceInDollars: true,
      imageUrl: true,
      status: true,
    },
    where: wherePublicProducts,
    orderBy: asc(ProductTable.name),
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