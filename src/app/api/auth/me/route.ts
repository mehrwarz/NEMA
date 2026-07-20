import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = await getSession(request);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: payload.user,
  });
}