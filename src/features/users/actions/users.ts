"use server"

import { db } from "@/drizzle/db"
import { UserTable, GigTable, GigApplicationTable } from "@/drizzle/schema"
import { eq, and, or, sql } from "drizzle-orm"
import { revalidateUserCache } from "../db/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/privy"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  bio: z.string().max(500, "Bio too long").optional(),
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
    bio: formData.get("bio") || undefined,
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
        bio: result.data.bio ?? null,
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

export async function getProfileStats(userId: string) {
  // Count gigs created (as client)
  const gigsCreated = await db
    .select({ count: sql<number>`count(*)` })
    .from(GigTable)
    .where(eq(GigTable.clientId, userId))

  // Count completed deals (as client)
  const clientDealsCompleted = await db
    .select({ count: sql<number>`count(*)` })
    .from(GigTable)
    .where(and(
      eq(GigTable.clientId, userId),
      eq(GigTable.status, "completed")
    ))

  // Count deals as talent (accepted applications with completed gigs)
  const talentDealsCompleted = await db
    .select({ count: sql<number>`count(*)` })
    .from(GigApplicationTable)
    .innerJoin(GigTable, eq(GigApplicationTable.gigId, GigTable.id))
    .where(and(
      eq(GigApplicationTable.applicantId, userId),
      eq(GigApplicationTable.status, "accepted"),
      eq(GigTable.status, "completed")
    ))

  // Count active deals (in_progress or submitted)
  const activeDeals = await db
    .select({ count: sql<number>`count(*)` })
    .from(GigApplicationTable)
    .innerJoin(GigTable, eq(GigApplicationTable.gigId, GigTable.id))
    .where(and(
      or(
        eq(GigTable.clientId, userId),
        eq(GigApplicationTable.applicantId, userId)
      ),
      eq(GigApplicationTable.status, "accepted"),
      or(
        eq(GigTable.status, "in_progress"),
        eq(GigTable.status, "submitted")
      )
    ))

  return {
    gigsPosted: Number(gigsCreated[0]?.count || 0),
    dealsCompletedAsClient: Number(clientDealsCompleted[0]?.count || 0),
    dealsCompletedAsTalent: Number(talentDealsCompleted[0]?.count || 0),
    activeDeals: Number(activeDeals[0]?.count || 0),
  }
}