'use server';

import { db } from '@/db/drizzle';
import { propertiesTable, propertyImagesTable, usersTable } from '@/db/schema';
import { eq, and, or, ilike, count, desc, asc } from 'drizzle-orm';
import {
  Property,
  PropertyWithImages,
  PropertyWithAll,
  GetPropertiesResponse,
  NewProperty,
  PropertyUpdate,
} from '@/lib/types';
import { findProperty } from '@/lib/bridge';
import { requireUser } from '@/lib/session';

type BridgeMedia = {
  Order: number;
  MediaKey: string;
  MediaURL: string;
  ResourceRecordKey: string;
  ResourceName: string;
  ClassName: string;
  MediaCategory: string;
  MimeType: string;
  MediaObjectID: string;
  ShortDescription: string | null;
};

// Using the generated types in function parameters and returns
export async function getProperties({
  page = 1,
  pageSize = 12,
  search = '',
  type,
  userId,
}: {
  page: number;
  pageSize: number;
  search?: string;
  type?: Property['type']; // Uses the inferred enum type
  userId?: string;
}): Promise<GetPropertiesResponse> {
  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (userId) {
    whereConditions.push(eq(propertiesTable.userId, userId));
  }

  if (search) {
    whereConditions.push(
      or(
        ilike(propertiesTable.title, `%${search}%`),
        ilike(propertiesTable.description, `%${search}%`),
        ilike(propertiesTable.address, `%${search}%`)
      )
    );
  }

  if (type) {
    whereConditions.push(eq(propertiesTable.type, type));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(propertiesTable)
    .where(whereClause);

  // Get properties - Drizzle will infer the return type
  const properties = await db
    .select()
    .from(propertiesTable)
    .where(whereClause)
    .orderBy(desc(propertiesTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get images for these properties
  const propertyIds = properties.map((p) => p.id);
  const images =
    propertyIds.length > 0
      ? await db
          .select()
          .from(propertyImagesTable)
          .where(
            or(
              ...propertyIds.map((id) => eq(propertyImagesTable.propertyId, id))
            )
          )
          .orderBy(asc(propertyImagesTable.order))
      : [];

  // Group images by property ID
  const imagesByPropertyId = images.reduce((acc, image) => {
    if (!acc[image.propertyId]) {
      acc[image.propertyId] = [];
    }
    acc[image.propertyId].push(image);
    return acc;
  }, {} as Record<string, PropertyWithImages['images']>);

  // Combine properties with images - TypeScript knows the exact shape
  const propertiesWithImages: PropertyWithImages[] = properties.map(
    (property) => ({
      ...property,
      images: imagesByPropertyId[property.id] || [],
    })
  );

  const pageCount = Math.ceil(totalCount / pageSize);

  return {
    properties: propertiesWithImages,
    totalCount,
    pageCount,
    currentPage: page,
  };
}

// Get single property with all related data (images + user) for detail view
export async function getProperty(
  propertyId: string,
  userId?: string
): Promise<PropertyWithAll | null> {
  const whereConditions = [eq(propertiesTable.id, propertyId)];

  // If userId is provided, ensure the user owns the property
  if (userId) {
    whereConditions.push(eq(propertiesTable.userId, userId));
  }

  const [propertyWithUser] = await db
    .select({
      // Property fields
      id: propertiesTable.id,
      title: propertiesTable.title,
      description: propertiesTable.description,
      address: propertiesTable.address,
      city: propertiesTable.city,
      state: propertiesTable.state,
      zipCode: propertiesTable.zipCode,
      country: propertiesTable.country,
      price: propertiesTable.price,
      type: propertiesTable.type,
      bedrooms: propertiesTable.bedrooms,
      bathrooms: propertiesTable.bathrooms,
      squareFootage: propertiesTable.squareFootage,
      yearBuilt: propertiesTable.yearBuilt,
      lotSize: propertiesTable.lotSize,
      status: propertiesTable.status,
      userId: propertiesTable.userId,
      createdAt: propertiesTable.createdAt,
      updatedAt: propertiesTable.updatedAt,
      // User fields
      userFirstName: usersTable.firstName,
      userLastName: usersTable.lastName,
      userEmail: usersTable.email,
    })
    .from(propertiesTable)
    .leftJoin(usersTable, eq(propertiesTable.userId, usersTable.id))
    .where(and(...whereConditions))
    .limit(1);

  if (!propertyWithUser) {
    return null;
  }

  // Get images for this property
  const images = await db
    .select()
    .from(propertyImagesTable)
    .where(eq(propertyImagesTable.propertyId, propertyId))
    .orderBy(asc(propertyImagesTable.order));

  return {
    id: propertyWithUser.id,
    title: propertyWithUser.title,
    description: propertyWithUser.description,
    address: propertyWithUser.address,
    city: propertyWithUser.city,
    state: propertyWithUser.state,
    zipCode: propertyWithUser.zipCode,
    country: propertyWithUser.country,
    price: propertyWithUser.price,
    type: propertyWithUser.type,
    bedrooms: propertyWithUser.bedrooms,
    bathrooms: propertyWithUser.bathrooms,
    squareFootage: propertyWithUser.squareFootage,
    yearBuilt: propertyWithUser.yearBuilt,
    lotSize: propertyWithUser.lotSize,
    status: propertyWithUser.status,
    userId: propertyWithUser.userId,
    createdAt: propertyWithUser.createdAt,
    updatedAt: propertyWithUser.updatedAt,
    images,
    user:
      propertyWithUser.userFirstName && propertyWithUser.userLastName
        ? {
            id: propertyWithUser.userId,
            firstName: propertyWithUser.userFirstName,
            lastName: propertyWithUser.userLastName,
            email: propertyWithUser.userEmail,
          }
        : undefined,
  };
}

export async function createPropertyAction(
  prevState: unknown,
  formData: FormData
) {
  const user = await requireUser();

  const street = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const postalCode = formData.get('postalCode') as string;

  const address = `${street}, ${city}, ${state} ${postalCode}`;

  try {
    const mlsProperty = await findProperty(address);
    await db.transaction(async (tx) => {
      const [{ id: propertyId }] = await tx
        .insert(propertiesTable)
        .values({
          userId: user.id,
          address: `${mlsProperty.StreetNumber} ${mlsProperty.StreetName} ${mlsProperty.StreetSuffix}`,
          city: mlsProperty.City,
          state: mlsProperty.StateOrProvince,
          postalCode: mlsProperty.PostalCode,
          country: mlsProperty.Country,
          originalListPrice: mlsProperty.OriginalListPrice,
          currentPrice: mlsProperty.CurrentPrice,
          closePrice: mlsProperty.ClosePrice,
          pricePerSqFt: mlsProperty.HAR_PriceSqFtList,
          status: mlsProperty.MlsStatus,
          bedrooms: mlsProperty.BedroomsTotal,
          bathrooms: mlsProperty.BathroomsTotalDecimal,
          livingArea: mlsProperty.LivingArea,
          yearBuilt: mlsProperty.YearBuilt,
          lotSize: mlsProperty.LotSizeSquareFeet,
        })
        .returning({ id: propertiesTable.id });

      const images = mlsProperty.Media.filter(
        (media: BridgeMedia) => media.MediaCategory === 'Photo'
      ).map((media: BridgeMedia) => ({
        order: media.Order,
        url: media.MediaURL,
        alt: media.ShortDescription,
        propertyId,
      }));

      await tx.insert(propertyImagesTable).values(images);
    });

    return {
      success: true,
      message: 'Successfully created property',
    };
  } catch (err) {
    console.error('Error creating property', err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// Create property using the NewProperty type
export async function createProperty(
  propertyData: Omit<NewProperty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Property> {
  const [newProperty] = await db
    .insert(propertiesTable)
    .values({
      ...propertyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newProperty;
}

// Update property using the PropertyUpdate type
export async function updateProperty(
  propertyId: string,
  updates: PropertyUpdate
): Promise<Property | null> {
  const [updatedProperty] = await db
    .update(propertiesTable)
    .set(updates)
    .where(eq(propertiesTable.id, propertyId))
    .returning();

  return updatedProperty || null;
}
