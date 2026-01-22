import { pgEnum, pgTable, text, timestamp, integer, real } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { relations } from "drizzle-orm"
import { UserCourseAccessTable } from "./userCourseAccess"

export const userRoles = ["user", "admin"] as const
export type UserRole = (typeof userRoles)[number]
export const userRoleEnum = pgEnum("user_role", userRoles)

export const UserTable = pgTable("users", {
  id,
  privyUserId: text().notNull().unique(),
  walletAddress: text(),
  email: text().notNull(),
  name: text().notNull(),
  role: userRoleEnum().notNull().default("user"),
  imageUrl: text(),
  bio: text(),

  // Twitter OAuth data
  twitterId: text("twitter_id"),
  twitterUsername: text("twitter_username"),
  twitterName: text("twitter_name"),
  twitterImage: text("twitter_image"),
  twitterAccessToken: text("twitter_access_token"),
  twitterRefreshToken: text("twitter_refresh_token"),

  // Reputation Metrics
  ethosScore: integer("ethos_score").default(0),
  reviewCount: integer("review_count").default(0),
  averageRating: real("average_rating").default(0),

  deletedAt: timestamp({ withTimezone: true }),
  createdAt,
  updatedAt,
})

export const UserRelationships = relations(UserTable, ({ many }) => ({
  userCourseAccesses: many(UserCourseAccessTable),
}))
