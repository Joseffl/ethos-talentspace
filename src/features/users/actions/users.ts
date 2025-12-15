"use server"

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidateUserCache } from "../db/cache"
import { redirect } from "next/navigation"

export async function deleteUserAction(userId: string) {
  try {
    const [deletedUser] = await db
      .update(UserTable)
      .set({
        deletedAt: new Date(),
        email: "redacted@deleted.com",
        name: "Deleted User",
        imageUrl: null,
      })
      .where(eq(UserTable.id, userId))
      .returning()

    if (deletedUser == null) {
      return {
        error: true,
        message: "Failed to delete user"
      }
    }

    revalidateUserCache(userId)
    
    return {
      error: false,
      message: "User deleted successfully"
    }
  } catch (error) {
    return {
      error: true,
      message: "An error occurred while deleting the user"
    }
  }
}

export async function deleteUserAndRedirect(userId: string) {
  const result = await deleteUserAction(userId)
  
  if (!result.error) {
    redirect("/admin/users")
  }
  
  return result
}