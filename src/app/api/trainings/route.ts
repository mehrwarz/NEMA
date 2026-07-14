import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trainings } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const list = await db.select().from(trainings);
    return NextResponse.json({ trainings: list });
  } catch (error) {
    console.error("Get trainings error:", error);
    return NextResponse.json(
      { error: "Failed to load trainings" },
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
    const { title, description, category } = await request.json();
    await db.insert(trainings).values({ title, description, category });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create training error:", error);
    return NextResponse.json({ error: "Failed to create training" }, { status: 500 });
  }
}
