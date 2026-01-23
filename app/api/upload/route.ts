import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { db } from '@/db/drizzle';
import { documentsTable, usersTable, templateCategoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { uploadFile } from '@/lib/gcs';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

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

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const categoryId = formData.get('categoryId') as string | null; // For templates with dynamic categories
    const isTemplate = formData.get('isTemplate') === 'true';
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Only admins can create templates
    if (isTemplate && user.role !== 'ROLE_ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create templates' },
        { status: 403 },
      );
    }

    // Templates require categoryId (dynamic categories)
    if (isTemplate && !categoryId) {
      return NextResponse.json(
        { error: 'Category is required for templates' },
        { status: 400 },
      );
    }

    // User documents require category (enum)
    if (!isTemplate && !category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 },
      );
    }

    // User files must have a propertyId
    if (!isTemplate && !propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required for user files' },
        { status: 400 },
      );
    }

    // Validate categoryId exists for templates
    if (isTemplate && categoryId) {
      const categoryExists = await db.query.templateCategoriesTable.findFirst({
        where: eq(templateCategoriesTable.id, categoryId),
      });
      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 },
        );
      }
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
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

    // Determine GCS path
    let gcsPath: string;
    if (isTemplate) {
      gcsPath = `templates/${uniqueFileName}`;
    } else {
      gcsPath = `documents/${user.id}/${uniqueFileName}`;
    }

    // Upload to Google Cloud Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await uploadFile(buffer, gcsPath, file.type);

    // Insert document record (store GCS path, not public URL)
    const [document] = await db
      .insert(documentsTable)
      .values({
        name,
        description,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: gcsPath, // Store GCS path instead of public URL
        // For templates, use categoryId; for user docs, use category enum
        category: isTemplate
          ? 'OTHER'
          : (category as
              | 'CONTRACT'
              | 'DISCLOSURE'
              | 'MARKETING'
              | 'FINANCIAL'
              | 'OTHER'),
        categoryId: isTemplate ? categoryId : null,
        isTemplate,
        userId: isTemplate ? null : user.id,
        propertyId: isTemplate ? null : propertyId,
      })
      .returning();

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 },
    );
  }
}
