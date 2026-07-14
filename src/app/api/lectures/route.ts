import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lectures } from "@/lib/db/schema";
import { asc, eq, or, isNull } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainingId = searchParams.get("trainingId");

  try {
    let query = db.select().from(lectures);
    
    if (trainingId) {
      query = query.where(or(eq(lectures.trainingId, parseInt(trainingId)), isNull(lectures.trainingId)));
    }

    const list = await query.orderBy(asc(lectures.sortOrder));

    return NextResponse.json({ lectures: list });
  } catch (error) {
    console.error("Get lectures error:", error);
    return NextResponse.json(
      { error: "Failed to load lectures" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, category, videoUrl, duration, sortOrder, trainingId } = await request.json();
    await db.insert(lectures).values({ title, description, category, videoUrl, duration, sortOrder, trainingId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create lecture error:", error);
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 });
  }
}
