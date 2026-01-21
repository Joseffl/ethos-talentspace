import { relations } from "drizzle-orm";
import { pgTable, text, pgEnum, uuid, integer } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { UserTable } from "./user";
import { GigTable } from "./gig";

export const applicationStatuses = ["pending", "accepted", "rejected", "withdrawn"] as const
export type ApplicationStatus = (typeof applicationStatuses)[number]
export const applicationStatusEnum = pgEnum("application_status", applicationStatuses)

export const GigApplicationTable = pgTable("gig_applications", {
    id,
    gigId: uuid("gig_id").notNull().references(() => GigTable.id),
    applicantId: uuid("applicant_id").notNull().references(() => UserTable.id),
    coverLetter: text("cover_letter").notNull(),
    proposedBudget: integer("proposed_budget"),
    portfolioLinks: text("portfolio_links").array().default([]),
    status: applicationStatusEnum().notNull().default("pending"),
    createdAt,
    updatedAt
})

export const GigApplicationRelationships = relations(GigApplicationTable, ({ one }) => ({
    gig: one(GigTable, {
        fields: [GigApplicationTable.gigId],
        references: [GigTable.id],
    }),
    applicant: one(UserTable, {
        fields: [GigApplicationTable.applicantId],
        references: [UserTable.id],
    }),
}))
