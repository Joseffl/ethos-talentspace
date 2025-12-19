import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { CourseProductTable } from "./courseProduct";
import { User } from "lucide-react";
import { UserCourseAccessTable } from "./userCourseAccess";
import { CourseSectionTable } from "./courseSection";
import { CourseFileTable } from "./courseFile"; 


export const CourseTable = pgTable("courses", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    createdAt,
    updatedAt
})

export const CourseRelationships = relations(CourseTable, ({ many}) => ({
    courseProducts: many(CourseProductTable),
    userCourseAccesses: many(UserCourseAccessTable),
    courseSections: many(CourseSectionTable),
    courseFiles: many(CourseFileTable), 
})) 