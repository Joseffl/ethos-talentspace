import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { CourseFileTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";

// Create new file record
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      storageKey,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      mimeType,
      order,
      status,
      sectionId,
    } = body;

    // Insert file record
    const [file] = await db
      .insert(CourseFileTable)
      .values({
        courseId: params.courseId,
        sectionId: sectionId || null,
        name,
        description,
        storageKey,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        mimeType,
        order: order || 0,
        status: status || "draft",
      })
      .returning();

    // Revalidate cache
    revalidateTag(getCourseIdTag(params.courseId));

    return NextResponse.json({ success: true, file });
  } catch (error) {
    console.error("Create file error:", error);
    return NextResponse.json(
      { error: "Failed to create file record" },
      { status: 500 }
    );
  }
}

// Get all files for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const files = await db.query.CourseFileTable.findMany({
      where: eq(CourseFileTable.courseId, params.courseId),
      orderBy: (files, { asc }) => [asc(files.order)],
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}