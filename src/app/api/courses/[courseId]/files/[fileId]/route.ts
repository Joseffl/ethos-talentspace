import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { CourseFileTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/r2";
import { revalidateTag } from "next/cache";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; fileId: string } }
) {
  try {
    const { userId } = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get file info
    const file = await db.query.CourseFileTable.findFirst({
      where: eq(CourseFileTable.id, params.fileId),
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from R2
    await deleteFromR2(file.storageKey);

    // Delete from database
    await db.delete(CourseFileTable).where(eq(CourseFileTable.id, params.fileId));

    // Revalidate cache
    revalidateTag(getCourseIdTag(params.courseId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}