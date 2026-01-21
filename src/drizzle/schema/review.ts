import { relations } from "drizzle-orm";
import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "../schemaHelpers";
import { UserTable } from "./user";
import { GigTable } from "./gig";

export const ReviewTable = pgTable("reviews", {
    id,
    gigId: uuid("gig_id").notNull().references(() => GigTable.id),
    authorId: uuid("author_id").notNull().references(() => UserTable.id),
    targetId: uuid("target_id").notNull().references(() => UserTable.id),
    rating: integer("rating").notNull(), // 1-5
    comment: text("comment"),
    createdAt
})

export const ReviewRelationships = relations(ReviewTable, ({ one }) => ({
    gig: one(GigTable, {
        fields: [ReviewTable.gigId],
        references: [GigTable.id],
    }),
    author: one(UserTable, {
        fields: [ReviewTable.authorId],
        references: [UserTable.id],
        relationName: "reviewsWritten"
    }),
    target: one(UserTable, {
        fields: [ReviewTable.targetId],
        references: [UserTable.id],
        relationName: "reviewsReceived"
    }),
}))
