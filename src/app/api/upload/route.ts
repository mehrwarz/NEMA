import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/rbac";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["video/mp4", "video/x-matroska", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(request: NextRequest) {
  const auth = await authorize(request, ["system_administrator", "admin"]);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });

    // In a real app, upload to S3/Blob storage here
    // For now, return a dummy URL
    const fileUrl = `/uploads/${file.name}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
