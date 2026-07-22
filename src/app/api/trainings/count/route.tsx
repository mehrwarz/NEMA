import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trainings } from "@/lib/db/schema";
import { count } from "drizzle-orm";


export async function GET() {
  try {
    const [result] = await db.select({ count: count() }).from(trainings);
    
    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error("Get trainings error:", error);
    return NextResponse.json(
      { count: 0 },
      { status: 500 }
    );
  }
}
