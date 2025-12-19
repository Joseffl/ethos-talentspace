// src/app/api/get-upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/services/clerk";
import { canCreateCourses } from "@/features/courses/permissions/courses";
import { getPresignedUploadUrl, generateStorageKey } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !canCreateCourses(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, courseId } = await request.json();

    const key = generateStorageKey(courseId, fileName);
    const uploadUrl = await getPresignedUploadUrl(key, fileType);

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Get upload URL error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}