import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lectures } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(lectures)
      .orderBy(asc(lectures.sortOrder));

    return NextResponse.json({ lectures: list });
  } catch (error) {
    console.error("Get lectures error:", error);
    return NextResponse.json(
      { error: "Failed to load lectures" },
      { status: 500 }
    );
  }
}
