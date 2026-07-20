import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const session = await verifyToken(token);
  
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userEnrollments = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, session.user.id));
    return NextResponse.json({ enrollments: userEnrollments });
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const session = await verifyToken(token);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { trainingId } = await request.json();
    if (!trainingId) return NextResponse.json({ error: "Training ID required" }, { status: 400 });
    
    await db
        .delete(enrollments)
        .where(and(eq(enrollments.userId, session.user.id), eq(enrollments.trainingId, trainingId)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return NextResponse.json({ error: "Failed to delete enrollment" }, { status: 500 });
  }
}
