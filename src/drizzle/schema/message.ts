import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "../schemaHelpers";
import { UserTable } from "./user";
import { GigApplicationTable } from "./gigApplication";

export const MessageTable = pgTable("messages", {
    id,
    dealId: uuid("deal_id").notNull().references(() => GigApplicationTable.id),
    senderId: uuid("sender_id").notNull().references(() => UserTable.id),
    content: text("content").notNull(),
    createdAt
})

export const MessageRelationships = relations(MessageTable, ({ one }) => ({
    deal: one(GigApplicationTable, {
        fields: [MessageTable.dealId],
        references: [GigApplicationTable.id],
    }),
    sender: one(UserTable, {
        fields: [MessageTable.senderId],
        references: [UserTable.id],
    }),
}))
