import { ActionButton } from "@/components/ActionButton"
import { SkeletonButton } from "@/components/Skeleton"
import { Button } from "@/components/ui/button"
import { db } from "@/drizzle/db"
import {
  CourseSectionTable,
  LessonStatus,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema"
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections"
import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete"
import { BunnyVideoPlayer } from "@/features/lessons/components/BunnyVideoPlayer"
import { getLessonIdTag } from "@/features/lessons/db/cache/lessons"
import { getUserLessonCompleteIdTag } from "@/features/lessons/db/cache/userLessonComplete"
import {
  canViewLesson,
  wherePublicLessons,
} from "@/features/lessons/permissions/lessons"
import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete"
import { getCurrentUser } from "@/services/clerk"
import { and, asc, desc, eq, gt, lt } from "drizzle-orm"
import { CheckSquare2Icon, LockIcon, XSquareIcon, ChevronLeft } from "lucide-react"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ReactNode, Suspense } from "react"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const lesson = await getLesson(lessonId)

  if (lesson == null) return notFound()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SuspenseBoundary lesson={lesson} courseId={courseId} />
    </Suspense>
  )
}

function LoadingSkeleton() {
  return null
}

async function SuspenseBoundary({
  lesson,
  courseId,
}: {
  lesson: {
    id: string
    youtubeVideoId: string
    name: string
    description: string | null
    status: LessonStatus
    sectionId: string
    order: number
  }
  courseId: string
}) {
  const { userId, role } = await getCurrentUser()
  const isLessonComplete =
    userId == null
      ? false
      : await getIsLessonComplete({ lessonId: lesson.id, userId })
  const canView = await canViewLesson({ role, userId }, lesson)
  const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
    { userId },
    lesson.id
  )

  return (
    <div className="my-4 md:my-6 flex flex-col gap-4 md:gap-6 px-4 md:px-0">
      {/* Back Button */}
      <div className="flex justify-start">
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Course</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* Video Player */}
      <div className="aspect-video rounded-lg overflow-hidden">
        {canView ? (
          <BunnyVideoPlayer
            videoId={lesson.youtubeVideoId}
            onFinishedVideo={
              !isLessonComplete && canUpdateCompletionStatus
                ? updateLessonCompleteStatus.bind(null, lesson.id, true)
                : undefined
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground h-full w-full gap-4">
            <LockIcon className="size-12 md:size-16" />
            <p className="text-sm md:text-base text-center px-4">
              This lesson is locked
            </p>
          </div>
        )}
      </div>

      {/* Lesson Info & Controls */}
      <div className="flex flex-col gap-4">
        {/* Title and Actions - Stack on mobile */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold break-words">
            {lesson.name}
          </h1>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            {/* Navigation Buttons Row */}
            <div className="flex gap-2 order-2 sm:order-1">
              <Suspense fallback={<SkeletonButton className="flex-1 sm:flex-initial" />}>
                <ToLessonButton
                  lesson={lesson}
                  courseId={courseId}
                  lessonFunc={getPreviousLesson}
                  className="flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </ToLessonButton>
              </Suspense>
              <Suspense fallback={<SkeletonButton className="flex-1 sm:flex-initial" />}>
                <ToLessonButton
                  lesson={lesson}
                  courseId={courseId}
                  lessonFunc={getNextLesson}
                  className="flex-1 sm:flex-initial"
                >
                  Next
                </ToLessonButton>
              </Suspense>
            </div>

            {/* Mark Complete Button */}
            {canUpdateCompletionStatus && (
              <ActionButton
                action={updateLessonCompleteStatus.bind(
                  null,
                  lesson.id,
                  !isLessonComplete
                )}
                variant="outline"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                <div className="flex gap-2 items-center justify-center">
                  {isLessonComplete ? (
                    <>
                      <CheckSquare2Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Incomplete</span>
                      <span className="sm:hidden">Incomplete</span>
                    </>
                  ) : (
                    <>
                      <XSquareIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Complete</span>
                      <span className="sm:hidden">Complete</span>
                    </>
                  )}
                </div>
              </ActionButton>
            )}
          </div>
        </div>

        {/* Description */}
        {canView ? (
          lesson.description && (
            <p className="text-sm md:text-base text-muted-foreground break-words">
              {lesson.description}
            </p>
          )
        ) : (
          <div className="bg-muted/50 border border-muted rounded-lg p-4 md:p-6">
            <p className="text-sm md:text-base text-center">
              🔒 This lesson is locked. Please purchase the course to view it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

async function ToLessonButton({
  children,
  courseId,
  lessonFunc,
  lesson,
  className,
}: {
  children: ReactNode
  courseId: string
  lesson: {
    id: string
    sectionId: string
    order: number
  }
  lessonFunc: (lesson: {
    id: string
    sectionId: string
    order: number
  }) => Promise<{ id: string } | undefined>
  className?: string
}) {
  const toLesson = await lessonFunc(lesson)
  if (toLesson == null) return null

  return (
    <Button variant="outline" asChild className={className}>
      <Link href={`/courses/${courseId}/lessons/${toLesson.id}`}>
        {children}
      </Link>
    </Button>
  )
}

async function getPreviousLesson(lesson: {
  id: string
  sectionId: string
  order: number
}) {
  let previousLesson = await db.query.LessonTable.findFirst({
    where: and(
      lt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: desc(LessonTable.order),
    columns: { id: true },
  })

  if (previousLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const previousSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        lt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections
      ),
      orderBy: desc(CourseSectionTable.order),
      columns: { id: true },
    })

    if (previousSection == null) return

    previousLesson = await db.query.LessonTable.findFirst({
      where: and(
        eq(LessonTable.sectionId, previousSection.id),
        wherePublicLessons
      ),
      orderBy: desc(LessonTable.order),
      columns: { id: true },
    })
  }

  return previousLesson
}

async function getNextLesson(lesson: {
  id: string
  sectionId: string
  order: number
}) {
  let nextLesson = await db.query.LessonTable.findFirst({
    where: and(
      gt(LessonTable.order, lesson.order),
      eq(LessonTable.sectionId, lesson.sectionId),
      wherePublicLessons
    ),
    orderBy: asc(LessonTable.order),
    columns: { id: true },
  })

  if (nextLesson == null) {
    const section = await db.query.CourseSectionTable.findFirst({
      where: eq(CourseSectionTable.id, lesson.sectionId),
      columns: { order: true, courseId: true },
    })

    if (section == null) return

    const nextSection = await db.query.CourseSectionTable.findFirst({
      where: and(
        gt(CourseSectionTable.order, section.order),
        eq(CourseSectionTable.courseId, section.courseId),
        wherePublicCourseSections
      ),
      orderBy: asc(CourseSectionTable.order),
      columns: { id: true },
    })

    if (nextSection == null) return

    nextLesson = await db.query.LessonTable.findFirst({
      where: and(eq(LessonTable.sectionId, nextSection.id), wherePublicLessons),
      orderBy: asc(LessonTable.order),
      columns: { id: true },
    })
  }

  return nextLesson
}

async function getLesson(id: string) {
  "use cache"
  cacheTag(getLessonIdTag(id))

  return db.query.LessonTable.findFirst({
    columns: {
      id: true,
      youtubeVideoId: true,
      name: true,
      description: true,
      status: true,
      sectionId: true,
      order: true,
    },
    where: and(eq(LessonTable.id, id), wherePublicLessons),
  })
}

async function getIsLessonComplete({
  userId,
  lessonId,
}: {
  userId: string
  lessonId: string
}) {
  "use cache"
  cacheTag(getUserLessonCompleteIdTag({ userId, lessonId }))

  const data = await db.query.UserLessonCompleteTable.findFirst({
    where: and(
      eq(UserLessonCompleteTable.userId, userId),
      eq(UserLessonCompleteTable.lessonId, lessonId)
    ),
  })

  return data != null
}