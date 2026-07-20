import { NextRequest, NextResponse } from 'next/server';
import { isAllowed } from '@/lib/abac/engine';
import { getSession } from '@/lib/auth'; 
import { comments } from "@/lib/db/schema"
import { db } from '@/lib/db';            
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch data from your database (Drizzle)
  const [comment] = await db.select().from(comments).where(eq(comments.id, parseInt(params.id)));

  if (!comment) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // 2. Perform the ABAC decision check
  const allowed = isAllowed(
    session.user, // Must match UserAttributes structure
    'update',
    {
      type: 'comment',
      ownerId: comment.id,
      attributes: {},
    }
  );

  // 3. Simple branch routing decision
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Authorized logic execution continues...
  return NextResponse.json({ message: 'Updated successfully' });
}