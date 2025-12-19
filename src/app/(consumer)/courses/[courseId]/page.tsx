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
    <div className="my-6 container">
      <PageHeader className="mb-2" title={course.name} />
      <p className="text-muted-foreground mb-8">{course.description}</p>

      {/* Course Files Section */}
      {course.courseFiles && course.courseFiles.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>View and download course resources</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseFilesViewer courseId={courseId} files={course.courseFiles} />
          </CardContent>
        </Card>
      )}

      {/* Course Sections & Lessons */}
      {course.courseSections && course.courseSections.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
            <CardDescription>
              {course.courseSections.length} sections •{" "}
              {course.courseSections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {course.courseSections.map((section, index) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Section {index + 1}: {section.name}
                      </span>
                      {section.status === "private" && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {section.lessons.length > 0 ? (
                      <div className="space-y-2 pl-4">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-5 h-5 text-[#28ac30]" />
                              <div>
                                <p className="font-medium">
                                  {lessonIndex + 1}. {lesson.name}
                                </p>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button asChild size="sm">
                              <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                                Start Lesson
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm pl-4">
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
          <CardContent className="py-8 text-center text-muted-foreground">
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