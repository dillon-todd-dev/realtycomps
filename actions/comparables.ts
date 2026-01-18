'use server';

import { db } from '@/db/drizzle';
import { comparableImagesTable, comparablesTable } from '@/db/schema';
import { findSaleComparables } from '@/lib/bridge';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type SearchComparablesParams = {
  evaluationId: string;
  propertyId: string;
  address: string;
  latitude?: string | null;
  longitude?: string | null;
  maxRadius: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  daysOld?: number;
  type: 'SALE' | 'RENT';
};

export async function searchSaleComparables(params: SearchComparablesParams) {
  try {
    const comparables = await findSaleComparables(params);

    const result = await db.transaction(async (tx) => {
      // Delete existing comparables and their images (cascade handles images)
      await tx
        .delete(comparablesTable)
        .where(
          and(
            eq(comparablesTable.evaluationId, params.evaluationId),
            eq(comparablesTable.type, params.type),
          ),
        );

      // Filter out comparables without square footage
      const validComparables = comparables.filter(
        (comp: any) => comp.LivingArea != null && comp.LivingArea > 0
      );

      // Insert comparables one by one to get their IDs
      const insertedComparables = [];

      for (const comp of validComparables) {
        const [insertedComp] = await tx
          .insert(comparablesTable)
          .values({
            evaluationId: params.evaluationId,
            address: comp.UnparsedAddress,
            subdivision: comp.SubdivisionName,
            bedrooms: comp.BedroomsTotal,
            bathrooms: comp.BathroomsTotalDecimal,
            garageSpaces: comp.GarageSpaces ?? 0,
            yearBuilt: comp.YearBuilt ?? 0,
            lotSize: comp.LotSizeSquareFeet ?? 0,
            squareFootage: comp.LivingArea,
            listPrice: comp.ListPrice,
            salePrice: comp.ClosePrice,
            closeDate: new Date(comp.CloseDate),
            daysOnMarket: comp.DaysOnMarket,
            type: params.type,
            included: true,
          })
          .returning({ id: comparablesTable.id });

        insertedComparables.push(insertedComp);

        // Insert images if they exist
        if (comp.Media && Array.isArray(comp.Media)) {
          const images = comp.Media.filter(
            (media: any) => media.MediaCategory === 'Photo',
          ).map((media: any) => ({
            order: media.Order,
            url: media.MediaURL,
            description: media.ShortDescription,
            comparableId: insertedComp.id,
          }));

          if (images.length > 0) {
            await tx.insert(comparableImagesTable).values(images);
          }
        }
      }

      const comps = await tx.query.comparablesTable.findMany({
        where: and(
          eq(comparablesTable.evaluationId, params.evaluationId),
          eq(comparablesTable.type, params.type),
        ),
        with: {
          images: {
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
        orderBy: (comparables, { desc, asc }) => [
          desc(comparables.included),
          asc(comparables.address),
        ],
      });

      revalidatePath(
        `/dashboard/properties/${params.propertyId}/evaluation/${params.evaluationId}`,
      );
      return comps;
    });

    return result;
  } catch (error) {
    console.error('Error searching comparables:', error);
    throw new Error('Failed to search for comparables');
  }
}

/**
 * Toggle whether a comparable should be included in analysis
 */
export async function toggleComparable(
  comparableId: string,
  included: boolean,
) {
  await db
    .update(comparablesTable)
    .set({
      included,
      updatedAt: new Date(),
    })
    .where(eq(comparablesTable.id, comparableId));

  // Revalidate the evaluation page
  // Note: You'll need to get the evaluation/property IDs if you want to revalidate specific paths

  return { success: true };
}

/**
 * Delete a comparable
 */
export async function deleteComparable(comparableId: string) {
  await db
    .delete(comparablesTable)
    .where(eq(comparablesTable.id, comparableId));

  return { success: true };
}
