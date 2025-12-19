import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { CourseFileTable, CourseProductTable, UserCourseAccessTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getSignedDownloadUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; fileId: string }> }
) {
  try {
    const { courseId, fileId } = await params;
    const { userId } = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this COURSE (not product)
    const hasAccess = await db.query.UserCourseAccessTable.findFirst({
      where: (access, { and, eq }) =>
        and(
          eq(access.userId, userId),
          eq(access.courseId, courseId)
        ),
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this course" },
        { status: 403 }
      );
    }

    // Get file metadata
    const file = await db.query.CourseFileTable.findFirst({
      where: eq(CourseFileTable.id, fileId),
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate signed URL (expires in 1 hour)
    const signedUrl = await getSignedDownloadUrl(file.storageKey, 3600);

    // Redirect to view file
return NextResponse.json({
  url: signedUrl,
});  } catch (error) {
    console.error("View error:", error);
    return NextResponse.json(
      { error: "Failed to load file" },
      { status: 500 }
    );
  }
}