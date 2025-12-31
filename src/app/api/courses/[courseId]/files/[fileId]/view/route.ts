import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { CourseFileTable, UserCourseAccessTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { r2Client } from "@/lib/r2"; 
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; fileId: string }> }
) {
  try {
    const { courseId, fileId } = await params;
    const { userId } = await getCurrentUser();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const hasAccess = await db.query.UserCourseAccessTable.findFirst({
      where: and(
        eq(UserCourseAccessTable.userId, userId),
        eq(UserCourseAccessTable.courseId, courseId)
      ),
    });

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const file = await db.query.CourseFileTable.findFirst({
      where: eq(CourseFileTable.id, fileId),
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: file.storageKey,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("File empty", { status: 404 });
    }


    return new NextResponse(response.Body as ReadableStream, {
      headers: {
        "Content-Type": response.ContentType || "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600", 
        "Content-Length": response.ContentLength?.toString() || "",
      },
    });

  } catch (error) {
    console.error("View error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}