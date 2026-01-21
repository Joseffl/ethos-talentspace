import { relations } from "drizzle-orm";
import { pgTable, text, integer, pgEnum, uuid, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";

export const gigStatuses = ["open", "in_progress", "completed", "cancelled"] as const
export type GigStatus = (typeof gigStatuses)[number]
export const gigStatusEnum = pgEnum("gig_status", gigStatuses)

export const GigTable = pgTable("gigs", {
    id,
    title: text().notNull(),
    description: text().notNull(),
    budgetMin: integer("budget_min").notNull(),
    budgetMax: integer("budget_max"), // null = fixed price (budgetMin only)
    deadline: timestamp("deadline", { withTimezone: true }),
    externalLinks: jsonb("external_links").$type<string[]>().default([]),
    skillTags: jsonb("skill_tags").$type<string[]>().default([]),
    status: gigStatusEnum().notNull().default("open"),
    clientId: uuid("client_id").notNull().references(() => UserTable.id),
    reputationCriteria: jsonb("reputation_criteria").$type<{
        minEthosScore?: number;
        minPositiveReviewPercent?: number;
        minVouchCount?: number;
    }>().default({}),
    isFunded: boolean("is_funded").default(false),
    createdAt,
    updatedAt
})

export const GigRelationships = relations(GigTable, ({ one }) => ({
    client: one(UserTable, {
        fields: [GigTable.clientId],
        references: [UserTable.id],
    }),
}))
