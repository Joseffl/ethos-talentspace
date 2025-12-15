
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/PageHeader"
import Link from "next/link"
import { db } from "@/drizzle/db"
import {
  CourseProductTable,
  ProductTable as DbProductTable,
  PurchaseTable,
} from "@/drizzle/schema"
import { asc, countDistinct, eq } from "drizzle-orm"
import { getProductGlobalTag } from "@/features/products/db/cache"
import { ProductTable } from "@/features/products/components/ProductTable"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { unstable_cache } from "next/cache"

export default async function ProductsPage() {
  return (
    <div className="container my-6">
      <PageHeader title="Products">
        <Button asChild>
          <Link href="/admin/products/new">New Product</Link>
        </Button>
      </PageHeader>

      <Suspense fallback={<ProductTableSkeleton />}>
        <ProductTableData />
      </Suspense>
    </div>
  )
}

async function ProductTableData() {
  const products = await getProducts()
  return <ProductTable products={products} />
}

function ProductTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0">
              <span className="sr-only">Image</span>
            </TableHead>
            <TableHead className="w-[30%]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-4 w-12 mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-4 w-16 mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-4 w-20 mx-auto" />
            </TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-12 w-12 rounded" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full max-w-xs" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-6 w-16 mx-auto rounded-full" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-5 w-12 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

async function getProducts() {
  return unstable_cache(
    async () => {
      return db
        .select({
          id: DbProductTable.id,
          name: DbProductTable.name,
          status: DbProductTable.status,
          priceInDollars: DbProductTable.priceInDollars,
          description: DbProductTable.description,
          imageUrl: DbProductTable.imageUrl,
          coursesCount: countDistinct(CourseProductTable.courseId),
          customersCount: countDistinct(PurchaseTable.userId),
        })
        .from(DbProductTable)
        .leftJoin(PurchaseTable, eq(PurchaseTable.productId, DbProductTable.id))
        .leftJoin(
          CourseProductTable,
          eq(CourseProductTable.productId, DbProductTable.id)
        )
        .orderBy(asc(DbProductTable.name))
        .groupBy(DbProductTable.id)
    },
    ["products-list"],
    {
      tags: [getProductGlobalTag()],
      revalidate: false
    }
  )()
}