import { PageHeader } from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { CourseTable, CategoryTable } from "@/drizzle/schema"
import { getCourseGlobalTag } from "@/features/courses/db/cache/courses"
import { ProductForm } from "@/features/products/components/ProductForm"
import { asc } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export default async function NewProductPage() {
  return (
    <div className="container my-6">
      <PageHeader title="New Product" />
      <ProductForm 
        courses={await getCourses()} 
        categories={await getCategories()}

      />
    </div>
  )
}

async function getCourses() {
  "use cache"
  cacheTag(getCourseGlobalTag())

  return db.query.CourseTable.findMany({
    orderBy: asc(CourseTable.name),
    columns: { id: true, name: true },
  })
}

async function getCategories() {
  "use cache"

  return db.query.CategoryTable.findMany({
    orderBy: asc(CategoryTable.name),
    columns: { id: true, name: true },
  })
}