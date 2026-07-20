import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const session = await verifyToken(token);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { trainingId } = await request.json();
    if (!trainingId) {
      return NextResponse.json({ error: "Training ID is required" }, { status: 400 });
    }
    await db.insert(enrollments).values({ userId: session.user.id, trainingId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
