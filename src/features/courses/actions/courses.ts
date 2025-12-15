// "use server"

// import { z } from "zod"
// import { courseSchema } from "../schemas/courses"
// import { redirect } from "next/navigation"
// import { getCurrentUser } from "@/services/clerk"
// import {
//   canCreateCourses,
//   canDeleteCourses,
//   canUpdateCourses,
// } from "../permissions/courses"
// import {
//   insertCourse,
//   deleteCourse as deleteCourseDB,
//   updateCourse as updateCourseDb,
// } from "../db/courses"

// export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
//   const { success, data } = courseSchema.safeParse(unsafeData)

//   if (!success || !canCreateCourses(await getCurrentUser())) {
//     return { error: true, message: "There was an error creating your course" }
//   }

//   const course = await insertCourse(data)

//   redirect(`/admin/courses/${course.id}/edit`)
// }

// export async function updateCourse(
//   id: string,
//   unsafeData: z.infer<typeof courseSchema>
// ) {
//   const { success, data } = courseSchema.safeParse(unsafeData)

//   if (!success || !canUpdateCourses(await getCurrentUser())) {
//     return { error: true, message: "There was an error updating your course" }
//   }

//   await updateCourseDb(id, data)

//   return { error: false, message: "Successfully updated your course" }
// }

// export async function deleteCourse(id: string) {
//   if (!canDeleteCourses(await getCurrentUser())) {
//     return { error: true, message: "Error deleting your course" }
//   }

//   await deleteCourseDB(id)

//   return { error: false, message: "Successfully deleted your course" }
// }

// "use server"

// import { z } from "zod"
// import { courseSchema } from "../schemas/courses"
// import { redirect } from "next/navigation"
// import { getCurrentUser } from "@/services/clerk"
// import {
//   canCreateCourses,
//   canDeleteCourses,
//   canUpdateCourses,
// } from "../permissions/courses"
// import {
//   insertCourse,
//   deleteCourse as deleteCourseDB,
//   updateCourse as updateCourseDb,
// } from "../db/courses"
// import { revalidateTag } from "next/cache"
// import { getCourseGlobalTag, getCourseIdTag } from "../db/cache/courses"

// export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
//   const { success, data } = courseSchema.safeParse(unsafeData)

//   if (!success || !canCreateCourses(await getCurrentUser())) {
//     return { error: true, message: "There was an error creating your course" }
//   }

//   const course = await insertCourse(data)

//   revalidateTag(getCourseGlobalTag())

//   redirect(`/admin/courses/${course.id}/edit`)
// }

// export async function updateCourse(
//   id: string,
//   unsafeData: z.infer<typeof courseSchema>
// ) {
//   const { success, data } = courseSchema.safeParse(unsafeData)

//   if (!success || !canUpdateCourses(await getCurrentUser())) {
//     return { error: true, message: "There was an error updating your course" }
//   }

//   await updateCourseDb(id, data)

//   revalidateTag(getCourseIdTag(id))
//   revalidateTag(getCourseGlobalTag())

//   return { error: false, message: "Successfully updated your course" }
// }

// export async function deleteCourse(id: string) {
//   if (!canDeleteCourses(await getCurrentUser())) {
//     return { error: true, message: "Error deleting your course" }
//   }

//   await deleteCourseDB(id)

//   revalidateTag(getCourseIdTag(id))
//   revalidateTag(getCourseGlobalTag())

//   return { error: false, message: "Successfully deleted your course" }
// }

"use server"

import { z } from "zod"
import { courseSchema } from "../schemas/courses"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/clerk"
import {
  canCreateCourses,
  canDeleteCourses,
  canUpdateCourses,
} from "../permissions/courses"
import {
  insertCourse,
  deleteCourse as deleteCourseDB,
  updateCourse as updateCourseDb,
} from "../db/courses"
import { revalidateTag, revalidatePath } from "next/cache"
import { getCourseGlobalTag, getCourseIdTag } from "../db/cache/courses"

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData)

  if (!success || !canCreateCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error creating your course" }
  }

  const course = await insertCourse(data)

  // Use both methods for maximum reliability
  revalidateTag(getCourseGlobalTag())
  revalidatePath("/admin/courses")
  revalidatePath("/admin/courses", "layout")

  redirect(`/admin/courses/${course.id}/edit`)
}

export async function updateCourse(
  id: string,
  unsafeData: z.infer<typeof courseSchema>
) {
  const { success, data } = courseSchema.safeParse(unsafeData)

  if (!success || !canUpdateCourses(await getCurrentUser())) {
    return { error: true, message: "There was an error updating your course" }
  }

  await updateCourseDb(id, data)

  // Use both methods for maximum reliability
  revalidateTag(getCourseIdTag(id))
  revalidateTag(getCourseGlobalTag())
  revalidatePath("/admin/courses")
  revalidatePath(`/admin/courses/${id}`)

  return { error: false, message: "Successfully updated your course" }
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourses(await getCurrentUser())) {
    return { error: true, message: "Error deleting your course" }
  }

  await deleteCourseDB(id)

  // Use both methods for maximum reliability
  revalidateTag(getCourseIdTag(id))
  revalidateTag(getCourseGlobalTag())
  revalidatePath("/admin/courses")

  return { error: false, message: "Successfully deleted your course" }
}