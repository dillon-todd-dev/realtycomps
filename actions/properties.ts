'use server';

import { db } from '@/db/drizzle';
import { propertiesTable, propertyImagesTable } from '@/db/schema';
import { eq, and, or, ilike, count, desc, asc } from 'drizzle-orm';
import { PropertyWithImages, GetPropertiesResponse } from '@/lib/types';
import { findProperty } from '@/lib/bridge';
import { requireUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type BridgeMedia = {
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
              ...propertyIds.map((id) =>
                eq(propertyImagesTable.propertyId, id),
              ),
            ),
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
    }),
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
  userId?: string,
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
      latitude: propertiesTable.latitude,
      longitude: propertiesTable.longitude,
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
    latitude: property.latitude,
    longitude: property.longitude,
    status: property.status,
    userId: property.userId,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    images,
  };
}

export async function createPropertyAction(
  prevState: unknown,
  formData: FormData,
) {
  const user = await requireUser();

  const street = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const postalCode = formData.get('postalCode') as string;
  const latitudeRaw = formData.get('latitude') as string;
  const longitudeRaw = formData.get('longitude') as string;
  const latitude =
    latitudeRaw && !isNaN(Number(latitudeRaw)) ? latitudeRaw : null;
  const longitude =
    longitudeRaw && !isNaN(Number(longitudeRaw)) ? longitudeRaw : null;
  const manualEntry = formData.get('manualEntry') === 'true';

  // If manual entry mode, create property with user-provided data
  if (manualEntry) {
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const livingArea = formData.get('livingArea') as string;
    const yearBuilt = formData.get('yearBuilt') as string;
    const lotSize = formData.get('lotSize') as string;

    try {
      await db.insert(propertiesTable).values({
        userId: user.id,
        address: street,
        city,
        state,
        postalCode,
        country: 'United States',
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms || null,
        livingArea: livingArea ? parseInt(livingArea) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        lotSize: lotSize || null,
        latitude,
        longitude,
      });

      return {
        success: true,
        message: 'Successfully created property',
      };
    } catch (err) {
      console.error('Error creating property manually', err);
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  // Parse street address to extract street number, street name, and street suffix
  // Example: "123 Main Street" -> streetNumber: "123", streetName: "Main", streetSuffix: "Street"
  const streetParts = street.trim().split(' ');
  const streetNumber = streetParts[0];
  const streetName =
    streetParts.length > 2
      ? streetParts.slice(1, -1).join(' ')
      : streetParts[1] || '';
  const streetSuffix =
    streetParts.length > 2 ? streetParts[streetParts.length - 1] : undefined;

  try {
    const mlsProperty = await findProperty({
      streetNumber,
      streetName,
      streetSuffix,
      state,
    });

    if (!mlsProperty) {
      // Return notFound state so frontend can show manual entry form
      return {
        success: false,
        notFound: true,
        addressData: {
          address: street,
          city,
          state,
          postalCode,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
        },
        message:
          'Property not found in MLS database. You can enter the details manually.',
      };
    }

    let propertyAddress = `${mlsProperty.StreetNumber} ${mlsProperty.StreetName} ${mlsProperty.StreetSuffix}`;
    if (mlsProperty.UnitNumber) {
      propertyAddress += ` ${mlsProperty.UnitNumber}`;
    }

    await db.transaction(async (tx) => {
      const [{ id: propertyId }] = await tx
        .insert(propertiesTable)
        .values({
          userId: user.id,
          address: propertyAddress,
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
          latitude: mlsProperty.Latitude?.toString() || latitude,
          longitude: mlsProperty.Longitude?.toString() || longitude,
        })
        .returning({ id: propertiesTable.id });

      const images = mlsProperty.Media.filter(
        (media: BridgeMedia) => media.MediaCategory === 'Photo',
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

export async function deleteProperty(propertyId: string) {
  await db.delete(propertiesTable).where(eq(propertiesTable.id, propertyId));
  revalidatePath('/dashboard/properties');
  redirect('/dashboard/properties');
}
