// app/admin/users/page.tsx
import { PageHeader } from "@/components/PageHeader"
import { db } from "@/drizzle/db"
import { UserTable, PurchaseTable, UserCourseAccessTable } from "@/drizzle/schema"
import { asc, countDistinct, eq, isNull } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { Suspense } from "react"
import { UserTable as UsersTable } from "@/features/users/components/UserTable"
import { UserTableSkeleton } from "@/features/users/components/UserTable"
import { getUserGlobalTag } from "@/features/users/db/cache"

export default async function UsersPage() {
  return (
    <div className="container my-6">
      <PageHeader title="Users" />

      <Suspense fallback={<UserTableSkeleton />}>
        <UserTableData />
      </Suspense>
    </div>
  )
}

async function UserTableData() {
  const users = await getUsers()
  return <UsersTable users={users} />
}

async function getUsers() {
  "use cache"
  cacheTag(getUserGlobalTag())

  return db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      email: UserTable.email,
      imageUrl: UserTable.imageUrl,
      createdAt: UserTable.createdAt,
      purchaseCount: countDistinct(PurchaseTable.id),
      courseCount: countDistinct(UserCourseAccessTable.courseId),
    })
    .from(UserTable)
    .leftJoin(PurchaseTable, eq(PurchaseTable.userId, UserTable.id))
    .leftJoin(UserCourseAccessTable, eq(UserCourseAccessTable.userId, UserTable.id))
    .where(isNull(UserTable.deletedAt))
    .orderBy(asc(UserTable.createdAt))
    .groupBy(UserTable.id)
}