import { db } from '@/drizzle/db'
import { UserTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidateUserCache } from './cache'

export async function insertUser(data: typeof UserTable.$inferInsert) {
    const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
        target: [UserTable.privyUserId],
        set: data,
    })

    if (newUser == null) throw new Error("Failed to create user")
      revalidateUserCache(newUser.id)

  return newUser
}

export async function updateUser(
    {privyUserId}: {privyUserId: string},
    data: Partial<typeof UserTable.$inferInsert>) {
    const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.privyUserId, privyUserId))
    .returning()


    if (updatedUser == null) throw new Error("Failed to update user")

  return updatedUser
}


export async function deleteUser(
    {privyUserId}: {privyUserId: string}) {
    const [deletedUser] = await db
    .update(UserTable)
    .set({
        deletedAt: new Date(),
        email: "redacted@deleted.com",
        name: "Deleted User",
        privyUserId: `deleted-${Date.now()}`,
        walletAddress: null,
        imageUrl: null,
    })
    .where(eq(UserTable.privyUserId, privyUserId))
    .returning()


    if (deletedUser == null) throw new Error("Failed to delete user")

  return deletedUser
}
