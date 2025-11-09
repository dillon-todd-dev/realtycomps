'use server';

import { db } from '@/db/drizzle';
import { propertiesTable, propertyImagesTable } from '@/db/schema';
import { eq, and, or, ilike, count, desc, asc } from 'drizzle-orm';
import { PropertyWithImages, GetPropertiesResponse } from '@/lib/types';
import { findProperty } from '@/lib/bridge';
import { requireUser } from '@/lib/session';
import { success } from 'zod';

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

export async function getProperties({
  page = 1,
  pageSize = 12,
  search = '',
  userId,
}: {
  page: number;
  pageSize: number;
  search?: string;
  userId?: string;
}): Promise<GetPropertiesResponse> {
  const offset = (page - 1) * pageSize;

  const whereConditions = [];

  if (userId) {
    whereConditions.push(eq(propertiesTable.userId, userId));
  }

  if (search) {
    whereConditions.push(or(ilike(propertiesTable.address, `%${search}%`)));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(propertiesTable)
    .where(whereClause);

  const properties = await db
    .select()
    .from(propertiesTable)
    .where(whereClause)
    .orderBy(desc(propertiesTable.createdAt))
    .limit(pageSize)
    .offset(offset);

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

  const imagesByPropertyId = images.reduce((acc, image) => {
    if (!acc[image.propertyId]) {
      acc[image.propertyId] = [];
    }
    acc[image.propertyId].push(image);
    return acc;
  }, {} as Record<string, PropertyWithImages['images']>);

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

export async function getProperty(
  propertyId: string,
  userId?: string
): Promise<PropertyWithImages | null> {
  const whereConditions = [eq(propertiesTable.id, propertyId)];

  if (userId) {
    whereConditions.push(eq(propertiesTable.userId, userId));
  }

  const [property] = await db
    .select({
      id: propertiesTable.id,
      address: propertiesTable.address,
      city: propertiesTable.city,
      state: propertiesTable.state,
      postalCode: propertiesTable.postalCode,
      country: propertiesTable.country,
      originalListPrice: propertiesTable.originalListPrice,
      closePrice: propertiesTable.closePrice,
      currentPrice: propertiesTable.currentPrice,
      pricePerSqFt: propertiesTable.pricePerSqFt,
      bedrooms: propertiesTable.bedrooms,
      bathrooms: propertiesTable.bathrooms,
      livingArea: propertiesTable.livingArea,
      yearBuilt: propertiesTable.yearBuilt,
      lotSize: propertiesTable.lotSize,
      status: propertiesTable.status,
      userId: propertiesTable.userId,
      createdAt: propertiesTable.createdAt,
      updatedAt: propertiesTable.updatedAt,
    })
    .from(propertiesTable)
    .where(and(...whereConditions))
    .limit(1);

  if (!property) {
    return null;
  }

  const images = await db
    .select()
    .from(propertyImagesTable)
    .where(eq(propertyImagesTable.propertyId, propertyId))
    .orderBy(asc(propertyImagesTable.order));

  return {
    id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    postalCode: property.postalCode,
    country: property.country,
    originalListPrice: property.originalListPrice,
    currentPrice: property.currentPrice,
    closePrice: property.closePrice,
    pricePerSqFt: property.pricePerSqFt,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    livingArea: property.livingArea,
    yearBuilt: property.yearBuilt,
    lotSize: property.lotSize,
    status: property.status,
    userId: property.userId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    images,
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

  const address = `${street}, ${city} ${state} ${postalCode}`;

  try {
    const mlsProperty = await findProperty(address);
    if (!mlsProperty) {
      return { success: false, error: 'Property not found' };
    }

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

      if (images.length > 0) {
        await tx.insert(propertyImagesTable).values(images);
      }
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
