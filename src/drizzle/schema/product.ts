import { relations } from "drizzle-orm";
import { pgTable, text, integer, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CourseProductTable } from "./courseProduct";
import { CategoryTable } from "./category"; 

export const productStatuses = ["public", "private"] as const
export type ProductStatus = (typeof productStatuses)[number]
export const productStatusEnum = pgEnum("product_status", productStatuses)

export const ProductTable = pgTable("products", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    imageUrl: text().notNull(),
    priceInDollars: integer().notNull(),
    status: productStatusEnum().notNull().default("private"),
    categoryId: uuid("category_id").references(() => CategoryTable.id),
    prerequisites: jsonb("prerequisites").$type<string[]>().default([]), 
    learningOutcomes: jsonb("learning_outcomes").$type<string[]>().default([]), 
    createdAt,
    updatedAt
})

export const ProductRelationships = relations(ProductTable, ({one, many}) => ({
    courseProducts: many(CourseProductTable),
    category: one(CategoryTable, { 
        fields: [ProductTable.categoryId],
        references: [CategoryTable.id],
    })
}))