"use server"

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { revalidateUserCache } from "../db/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/privy"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
})

export async function updateProfileAction(formData: FormData) {
  const { userId } = await getCurrentUser()

  if (!userId) {
    return {
      error: true,
      message: "Not authenticated"
    }
  }

  const rawData = {
    name: formData.get("name"),
  }

  const result = updateProfileSchema.safeParse(rawData)

  if (!result.success) {
    return {
      error: true,
      message: result.error.issues[0]?.message || "Invalid data"
    }
  }

  try {
    const [updatedUser] = await db
      .update(UserTable)
      .set({
        name: result.data.name,
      })
      .where(eq(UserTable.id, userId))
      .returning()

    if (!updatedUser) {
      return {
        error: true,
        message: "Failed to update profile"
      }
    }

    revalidateUserCache(userId)

    return {
      error: false,
      message: "Profile updated successfully"
    }
  } catch {
    return {
      error: true,
      message: "An error occurred while updating your profile"
    }
  }
}

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
  } catch {
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