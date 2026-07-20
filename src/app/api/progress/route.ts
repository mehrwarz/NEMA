import { userProgress } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";


export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyToken(token);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Extract trainingId from query string (?trainingId=...)
  const { searchParams } = request.nextUrl;
  const trainingIdParam = searchParams.get("trainingId");

  if (!trainingIdParam || isNaN(Number(trainingIdParam))) {
    return NextResponse.json(
      { error: "A valid trainingId query parameter is required." },
      { status: 400 }
    );
  }

  const trainingId = parseInt(trainingIdParam, 10);

  try {
    // 2. Query only rows matching BOTH userId and trainingId
    const progress = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, session.user.id),
        eq(userProgress.trainingId, trainingId)
      )
    );

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Fetch progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress." },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyToken(token);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;

  try {
    const { trainingId, lectureId, watchedDuration, completed } = await request.json();

    if (!lectureId) {
      return NextResponse.json(
        { error: "Lecture ID is required." },
        { status: 400 }
      );
    }

    // Check if progress entry already exists
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.lectureId, lectureId)
        )
      )
      .limit(1);
    if (existing.length > 0) {
      // Update
      const record = existing[0];
      // Keep completed as true if it was already true, or use the new value
      const isCompleted = record.completed || completed;
      // Keep max watched duration
      const duration = Math.max(record.watchedDuration, watchedDuration);

      await db
        .update(userProgress)
        .set({
          watchedDuration: duration,
          completed: isCompleted,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, record.id));
    } else {
      // Insert new
      await db.insert(userProgress).values({
        userId: user.id,
        trainingId,
        lectureId,
        watchedDuration: watchedDuration || 0,
        completed: completed || false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress." },
      { status: 500 }
    );
  }
}
