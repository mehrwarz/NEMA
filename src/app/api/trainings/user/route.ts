import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enrollments, trainings } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";


export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifyToken(token);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userTrainings = await db
            .select().from(trainings)
            .where(
                inArray(
                    trainings.id,
                    db.select({ trainingId: enrollments.trainingId }).from(enrollments)
                        .where(eq(enrollments.userId, session.user.id))
                )
            );
        return NextResponse.json(userTrainings);
    } catch (error) {
        console.error("Get user trainings error:", error);
        return NextResponse.json(
            { error: "Failed to load trainings" },
            { status: 500 }
        );
    }
}