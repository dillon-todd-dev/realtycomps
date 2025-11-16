'use server';

import { db } from '@/db/drizzle';
import { comparablesTable } from '@/db/schema';
import { findSaleComparables } from '@/lib/bridge';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type SearchComparablesParams = {
  evaluationId: string;
  address: string;
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

/**
 * Search for comparable properties
 *
 * NOTE: This is a placeholder implementation. In a real app, you would:
 * 1. Call an external API (like Zillow, Redfin, or an MLS service)
 * 2. Filter results based on the search criteria
 * 3. Calculate distance from the subject property
 * 4. Calculate correlation/similarity score
 * 5. Save results to database
 */
export async function searchSaleComparables(params: SearchComparablesParams) {
  try {
    const comparables = await findSaleComparables(params);
    const saleComps = comparables.map((comp: any) => ({
      evaluationId: params.evaluationId,
      address: comp.UnparsedAddress,
      subdivision: comp.SubdivisionName,
      bedrooms: comp.BedroomsTotal,
      bathrooms: comp.BathroomsTotalDecimal,
      garageSpaces: comp.GarageSpaces,
      yearBuilt: comp.YearBuilt,
      squareFootage: comp.LivingArea,
      listPrice: comp.ListPrice,
      salePrice: comp.ClosePrice,
      closeDate: new Date(comp.CloseDate),
      daysOnMarket: comp.DaysOnMarket,
      type: 'SALE',
      included: true,
    }));

    const result = await db.transaction(async (tx) => {
      await tx
        .delete(comparablesTable)
        .where(eq(comparablesTable.evaluationId, params.evaluationId));

      await tx.insert(comparablesTable).values(saleComps);

      return await getComparables(params.evaluationId);
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
  included: boolean
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
 * Get all comparables for an evaluation
 */
export async function getComparables(evaluationId: string) {
  const comparables = await db.query.comparablesTable.findMany({
    where: eq(comparablesTable.evaluationId, evaluationId),
    orderBy: (comparables, { desc }) => [desc(comparables.closeDate)],
  });

  return comparables;
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
