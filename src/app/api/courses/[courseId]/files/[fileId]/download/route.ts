import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/privy";
import { db } from "@/drizzle/db";
import { CourseFileTable } from "@/drizzle/schema";
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

    const hasAccess = await db.query.UserCourseAccessTable.findFirst({
      where: (access, { and, eq }) =>
        and(eq(access.userId, userId), eq(access.courseId, courseId)),
    });

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const file = await db.query.CourseFileTable.findFirst({
      where: eq(CourseFileTable.id, fileId),
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!file.downloadable) {
      return NextResponse.json({ error: "File is not downloadable" }, { status: 403 });
    }

    const url = await getSignedDownloadUrl(file.storageKey, 3600);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to get download URL" }, { status: 500 });
  }
}