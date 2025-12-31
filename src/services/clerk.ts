// import { db } from "@/drizzle/db"
// import { UserRole, UserTable } from "@/drizzle/schema"
// import { getUserIdTag } from "@/features/users/db/cache"
// import { auth, clerkClient } from "@clerk/nextjs/server"
// import { eq } from "drizzle-orm"
// import { cacheTag } from "next/dist/server/use-cache/cache-tag"
// import { redirect } from "next/navigation"

// const client = await clerkClient()

// export async function getCurrentUser({ allData = false } = {}) {
//   const { userId, sessionClaims, redirectToSignIn } = await auth()

//   if (userId != null && sessionClaims.dbId == null) {
//     redirect("/api/clerk/syncUsers")
//   }

//   return {
//     clerkUserId: userId,
//     userId: sessionClaims?.dbId,
//     role: sessionClaims?.role,
//     user:
//       allData && sessionClaims?.dbId != null
//         ? await getUser(sessionClaims.dbId)
//         : undefined,
//     redirectToSignIn,
//   }
// }

// export function syncClerkUserMetadata(user: {
//   id: string
//   clerkUserId: string
//   role: UserRole
// }) {
//   return client.users.updateUserMetadata(user.clerkUserId, {
//     publicMetadata: {
//       dbId: user.id,
//       role: user.role,
//     },
//   })
// }

// async function getUser(id: string) {
//   "use cache"
//   cacheTag(getUserIdTag(id))
//   console.log("Called")

//   return db.query.UserTable.findFirst({
//     where: eq(UserTable.id, id),
//   })
// }

import { db } from "@/drizzle/db"
import { UserRole, UserTable } from "@/drizzle/schema"
import { getUserIdTag } from "@/features/users/db/cache"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  if (userId == null) {
    return { userId: undefined, role: undefined, user: undefined, redirectToSignIn }
  }

  let dbId = sessionClaims?.dbId as string | undefined
  let role = sessionClaims?.role as UserRole | undefined

  if (!dbId) {
    const clerkUser = await currentUser()
    if (!clerkUser) return { userId: undefined, role: undefined, user: undefined, redirectToSignIn }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? ""
    const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "New User"

    try {
      const [dbUser] = await db
        .insert(UserTable)
        .values({
          clerkUserId: userId,
          email: primaryEmail,
          name: fullName,
          imageUrl: clerkUser.imageUrl,
          role: "user",
        })
        .onConflictDoUpdate({
          target: UserTable.clerkUserId,
          set: { 
            email: primaryEmail, 
            name: fullName, 
            imageUrl: clerkUser.imageUrl 
          },
        })
        .returning()

      if (dbUser) {
        dbId = dbUser.id
        role = dbUser.role

        await syncClerkUserMetadata({
          id: dbUser.id,
          clerkUserId: userId,
          role: dbUser.role
        })
      }
    } catch (error) {
      console.error("Sync error:", error)
    }
  }

  return {
    clerkUserId: userId,
    userId: dbId ?? undefined,
    role: role ?? undefined,
    user: allData && dbId != null ? await getUser(dbId) : undefined,
    redirectToSignIn,
  }
}

async function getUser(id: string) {
  "use cache"
  cacheTag(getUserIdTag(id))
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  })
}

export async function syncClerkUserMetadata(user: { id: string; clerkUserId: string; role: UserRole }) {
  const client = await clerkClient()
  
  return await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  })
}