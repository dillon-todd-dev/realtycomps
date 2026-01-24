import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { db } from '@/db/drizzle';
import { projectImagesTable, usersTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { uploadFile } from '@/lib/gcs';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
];

async function getAdminUser() {
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

    if (!user || !user.isActive || user.role !== 'ROLE_ADMIN') {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getAdminUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string;
    const alt = formData.get('alt') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (JPEG, PNG, GIF, WebP, HEIC)' },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeBaseName = file.name
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50);
    const uniqueFileName = `${safeBaseName}-${timestamp}${ext}`;

    // GCS path for project images
    const gcsPath = `projects/${projectId}/${uniqueFileName}`;

    // Upload to Google Cloud Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await uploadFile(buffer, gcsPath, file.type);

    // Get the highest order value for this project
    const maxOrder = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${projectImagesTable.order}), -1)`,
      })
      .from(projectImagesTable)
      .where(eq(projectImagesTable.projectId, projectId))
      .then((result) => result[0].maxOrder);

    // Insert image record
    const [image] = await db
      .insert(projectImagesTable)
      .values({
        url: gcsPath,
        alt: alt || null,
        order: maxOrder + 1,
        projectId,
      })
      .returning();

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 },
    );
  }
}
