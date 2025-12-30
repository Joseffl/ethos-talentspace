import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { db } from "@/drizzle/db"
import { CourseTable, CourseSectionTable, LessonTable, CourseFileTable } from "@/drizzle/schema"
import { getCourseIdTag } from "@/features/courses/db/cache/courses"
import { asc, eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { CourseFilesViewer } from "@/features/courses/components/CourseFilesViewer"

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)

  if (course == null) return notFound()

  return (
    <div className="my-4 md:my-6 w-full max-w-full px-3 md:px-4">
      <PageHeader className="mb-2 text-2xl md:text-3xl" title={course.name} />

      <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
        {course.description}
      </p>

      {course.courseFiles && course.courseFiles.length > 0 && (
        <Card className="mb-6 md:mb-8 w-full">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Course Materials</CardTitle>
            <CardDescription className="text-sm">
              View and download course resources
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <CourseFilesViewer courseId={courseId} files={course.courseFiles} />
          </CardContent>
        </Card>
      )}

      {course.courseSections && course.courseSections.length > 0 ? (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Course Content</CardTitle>
            <CardDescription className="text-sm">
              {course.courseSections.length}{" "}
              {course.courseSections.length === 1 ? "section" : "sections"} •{" "}
              {course.courseSections.reduce((acc, s) => acc + s.lessons.length, 0)}{" "}
              {course.courseSections.reduce((acc, s) => acc + s.lessons.length, 0) === 1
                ? "lesson"
                : "lessons"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <Accordion type="single" collapsible className="w-full">
              {course.courseSections.map((section, index) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline py-3 md:py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-left">
                      <span className="font-semibold text-sm md:text-base">
                        Section {index + 1}: {section.name}
                      </span>

                      {section.status === "private" && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          Private
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4">
                    {section.lessons.length > 0 ? (
                      <div className="space-y-3 pl-0 md:pl-4">

                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="
                              flex flex-col sm:flex-row 
                              sm:items-center sm:justify-between 
                              gap-4 p-3 md:p-4 
                              border rounded-lg 
                              hover:bg-gray-50 transition-colors
                              w-full
                            "
                          >
                            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                              <PlayCircle className="w-5 h-5 text-[#28ac30] flex-shrink-0 mt-0.5 md:mt-0" />

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm md:text-base break-words">
                                  {lessonIndex + 1}. {lesson.name}
                                </p>

                                {lesson.description && (
                                  <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Button */}
                            <Button
                              asChild
                              size="sm"
                              className="w-full sm:w-auto text-sm"
                            >
                              <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                                Start Lesson
                              </Link>
                            </Button>
                          </div>
                        ))}

                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs md:text-sm pl-0 md:pl-4">
                        No lessons in this section yet.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 md:py-12 text-center text-muted-foreground text-sm md:text-base">
            No course content available yet.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

async function getCourse(id: string) {
  "use cache"
  cacheTag(getCourseIdTag(id))

  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: eq(CourseSectionTable.status, "public"),
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            where: eq(LessonTable.status, "public"),
          },
        },
      },
      courseFiles: {
        orderBy: asc(CourseFileTable.order),
        where: eq(CourseFileTable.status, "public"),
      },
    },
  })
}
