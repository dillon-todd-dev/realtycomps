import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { db } from '@/db/drizzle';
import { documentsTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSignedDownloadUrl, extractGcsPath } from '@/lib/gcs';

async function getUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = await decrypt(sessionCookie);

    if (!session?.userId || new Date(session.expiresAt) < new Date()) {
      return null;
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.userId),
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId } = await params;

  try {
    // Get the document
    const [document] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    const isAdmin = user.role === 'ROLE_ADMIN';
    const isOwner = document.userId === user.id;
    const isTemplate = document.isTemplate;

    // Templates are accessible to all authenticated users
    // User files are only accessible to owner or admin
    if (!isTemplate && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Extract GCS path and generate signed URL
    const gcsPath = extractGcsPath(document.url);
    const signedUrl = await getSignedDownloadUrl(gcsPath, 15); // 15 minutes

    // Return the signed URL
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 },
    );
  }
}
