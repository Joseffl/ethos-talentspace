import { relations } from "drizzle-orm";
import { pgTable, text, integer, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CourseProductTable } from "./courseProduct";
import { CategoryTable } from "./category";
import { UserTable } from "./user";

export const productStatuses = ["public", "private"] as const
export type ProductStatus = (typeof productStatuses)[number]
export const productStatusEnum = pgEnum("product_status", productStatuses)

export const ProductTable = pgTable("products", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    imageUrl: text().notNull(),
    priceInNaira: integer().notNull(),
    status: productStatusEnum().notNull().default("private"),
    categoryId: uuid("category_id").references(() => CategoryTable.id),
    ownerId: uuid("owner_id").references(() => UserTable.id),
    prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
    learningOutcomes: jsonb("learning_outcomes").$type<string[]>().default([]),
    reputationCriteria: jsonb("reputation_criteria").$type<{
        minEthosScore?: number;
        minPositiveReviewPercent?: number;
        minVouchCount?: number;
    }>().default({}),
    createdAt,
    updatedAt
})

export const ProductRelationships = relations(ProductTable, ({ one, many }) => ({
    courseProducts: many(CourseProductTable),
    category: one(CategoryTable, {
        fields: [ProductTable.categoryId],
        references: [CategoryTable.id],
    }),
    owner: one(UserTable, {
        fields: [ProductTable.ownerId],
        references: [UserTable.id],
    }),
}))