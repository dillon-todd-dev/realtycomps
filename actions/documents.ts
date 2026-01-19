'use server';

import { db } from '@/db/drizzle';
import { documentsTable, propertiesTable, usersTable } from '@/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { Document, DocumentCategory, Property, User } from '@/lib/types';
import { requireUser, requireAdmin } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { deleteFile, extractGcsPath } from '@/lib/gcs';

export type DocumentsByCategory = {
  category: DocumentCategory;
  documents: Document[];
};

export type DocumentWithProperty = Document & {
  property: Property | null;
};

export type DocumentWithPropertyAndUser = Document & {
  property: Property | null;
  user: User | null;
};

export type UserDocumentsByProperty = {
  property: Property;
  documents: Document[];
};

const categoryOrder: DocumentCategory[] = [
  'CONTRACT',
  'DISCLOSURE',
  'MARKETING',
  'FINANCIAL',
  'OTHER',
];

// Get all template documents (for all users)
export async function getTemplates(): Promise<Document[]> {
  const templates = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.isTemplate, true))
    .orderBy(asc(documentsTable.category), asc(documentsTable.order));

  return templates;
}

// Get templates grouped by category
export async function getTemplatesByCategory(): Promise<DocumentsByCategory[]> {
  const templates = await getTemplates();

  const grouped = templates.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, Document[]>);

  return categoryOrder
    .filter((category) => grouped[category]?.length > 0)
    .map((category) => ({
      category,
      documents: grouped[category],
    }));
}

// Get user's documents grouped by property
export async function getUserDocuments(
  userId: string,
): Promise<UserDocumentsByProperty[]> {
  const userDocs = await db
    .select({
      document: documentsTable,
      property: propertiesTable,
    })
    .from(documentsTable)
    .innerJoin(
      propertiesTable,
      eq(documentsTable.propertyId, propertiesTable.id),
    )
    .where(
      and(
        eq(documentsTable.userId, userId),
        eq(documentsTable.isTemplate, false),
      ),
    )
    .orderBy(desc(propertiesTable.createdAt), desc(documentsTable.createdAt));

  // Group by property
  const grouped = userDocs.reduce((acc, { document, property }) => {
    const propertyId = property.id;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        property,
        documents: [],
      };
    }
    acc[propertyId].documents.push(document);
    return acc;
  }, {} as Record<string, UserDocumentsByProperty>);

  return Object.values(grouped);
}

// Get all user documents (admin only)
export async function getAllUserDocuments(): Promise<
  DocumentWithPropertyAndUser[]
> {
  await requireAdmin();

  const docs = await db
    .select({
      document: documentsTable,
      property: propertiesTable,
      user: usersTable,
    })
    .from(documentsTable)
    .leftJoin(
      propertiesTable,
      eq(documentsTable.propertyId, propertiesTable.id),
    )
    .leftJoin(usersTable, eq(documentsTable.userId, usersTable.id))
    .where(eq(documentsTable.isTemplate, false))
    .orderBy(desc(documentsTable.createdAt));

  return docs.map(({ document, property, user }) => ({
    ...document,
    property,
    user,
  }));
}

// Delete a document
export async function deleteDocument(documentId: string): Promise<void> {
  const user = await requireUser();

  // Get the document
  const [doc] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, documentId))
    .limit(1);

  if (!doc) {
    throw new Error('Document not found');
  }

  // Check permissions
  const isAdmin = user.role === 'ROLE_ADMIN';
  const isOwner = doc.userId === user.id;

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to delete this document');
  }

  // Delete the file from GCS
  try {
    const gcsPath = extractGcsPath(doc.url);
    await deleteFile(gcsPath);
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
    // Continue with DB deletion even if file delete fails
  }

  // Delete from database
  await db.delete(documentsTable).where(eq(documentsTable.id, documentId));

  revalidatePath('/dashboard');
}

// Get documents for a specific property
export async function getPropertyDocuments(
  propertyId: string,
): Promise<Document[]> {
  const user = await requireUser();

  // Check if user owns the property or is admin
  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, propertyId))
    .limit(1);

  if (!property) {
    throw new Error('Property not found');
  }

  const isAdmin = user.role === 'ROLE_ADMIN';
  const isOwner = property.userId === user.id;

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to view documents for this property');
  }

  const documents = await db
    .select()
    .from(documentsTable)
    .where(
      and(
        eq(documentsTable.propertyId, propertyId),
        eq(documentsTable.isTemplate, false),
      ),
    )
    .orderBy(desc(documentsTable.createdAt));

  return documents;
}

// Get user's properties for the upload form dropdown
export async function getUserProperties(): Promise<Property[]> {
  const user = await requireUser();

  const properties = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.userId, user.id))
    .orderBy(desc(propertiesTable.createdAt));

  return properties;
}

// Legacy function for backwards compatibility
export async function getDocuments(): Promise<Document[]> {
  return getTemplates();
}

// Legacy function for backwards compatibility
export async function getDocumentsByCategory(): Promise<DocumentsByCategory[]> {
  return getTemplatesByCategory();
}
