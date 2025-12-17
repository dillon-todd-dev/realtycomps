'use server';

import { db } from '@/db/drizzle';
import { evaluationsTable } from '@/db/schema';
import { EvaluationWithRelations, NewEvaluation } from '@/lib/types';
import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEvaluation(newEvaluation: NewEvaluation) {
  const result = await db.transaction(async (tx) => {
    const [evaluation] = await tx
      .insert(evaluationsTable)
      .values(newEvaluation)
      .returning();

    return evaluation;
  });

  revalidatePath(`/dashboard/properties/${newEvaluation.propertyId}`);
  redirect(
    `/dashboard/properties/${newEvaluation.propertyId}/evaluations/${result.id}`,
  );
}

export async function getEvaluation(
  evaluationId: string,
  userId: string,
): Promise<EvaluationWithRelations | null> {
  const evaluation = await db.query.evaluationsTable.findFirst({
    where: and(
      eq(evaluationsTable.id, evaluationId),
      eq(evaluationsTable.userId, userId),
    ),
    with: {
      property: {
        columns: {
          id: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
        },
      },
      comparables: {
        with: {
          images: true,
        },
      },
    },
  });

  return evaluation || null;
}

export async function getEvaluationsByProperty(
  propertyId: string,
  userId: string,
) {
  try {
    const evaluations = await db
      .select()
      .from(evaluationsTable)
      .where(
        and(
          eq(evaluationsTable.propertyId, propertyId),
          eq(evaluationsTable.userId, userId),
        ),
      )
      .orderBy(desc(evaluationsTable.updatedAt));

    return evaluations;
  } catch (err) {
    console.error('Error getting evaluation by property id:', err);
  }
}

/**
 * Update deal terms (core evaluation fields)
 */
export async function updateDealTerms(
  evaluationId: string,
  userId: string,
  data: {
    estimatedSalePrice: string | null;
    purchasePrice: string | null;
    sellerContribution: string | null;
    repairs: string | null;
    insurance: string | null;
    survey: string | null;
    inspection: string | null;
    appraisal: string | null;
    miscellaneous: string | null;
    rent: string | null;
    hoa: string | null;
    propertyTax: string | null;
  },
) {
  try {
    const [updated] = await db
      .update(evaluationsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(evaluationsTable.id, evaluationId),
          eq(evaluationsTable.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error('Evaluation not found or unauthorized');
    }

    // Get property ID for revalidation
    const evaluation = await db.query.evaluationsTable.findFirst({
      where: eq(evaluationsTable.id, evaluationId),
      columns: { propertyId: true },
    });

    if (evaluation) {
      revalidatePath(`/dashboard/properties/${evaluation.propertyId}`);
      revalidatePath(
        `/dashboard/properties/${evaluation.propertyId}/evaluations/${evaluationId}`,
      );
    }

    return updated;
  } catch (error) {
    console.error('Error updating deal terms:', error);
    throw new Error('Failed to update deal terms');
  }
}

/**
 * Update hard money loan parameters
 */
export async function updateHardMoneyLoanParams(
  evaluationId: string,
  userId: string,
  data: {
    loanToValue: string | null;
    lenderFees: string | null;
    interestRate: string | null;
    firstPhaseCosts: string | null;
  },
) {
  try {
    const [propertyId] = await db
      .update(evaluationsTable)
      .set({
        hardLoanToValue: data.loanToValue,
        hardLenderFees: data.lenderFees,
        hardInterestRate: data.interestRate,
        hardFirstPhaseCosts: data.firstPhaseCosts,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(evaluationsTable.id, evaluationId),
          eq(evaluationsTable.userId, userId),
        ),
      )
      .returning({ propertyId: evaluationsTable.propertyId });

    revalidatePath(
      `/dashboard/properties/${propertyId}/evaluations/${evaluationId}`,
    );
  } catch (error) {
    console.error('Error updating hard money loan params:', error);
    throw new Error('Failed to update hard money loan parameters');
  }
}

/**
 * Update refinance loan parameters
 */
export async function updateRefinanceLoanParams(
  evaluationId: string,
  userId: string,
  data: {
    loanToValue: string | null;
    loanTerm: number | null;
    interestRate: string | null;
    lenderFees: string | null;
    mortgageInsurance: string | null;
  },
) {
  try {
    const [propertyId] = await db
      .update(evaluationsTable)
      .set({
        refiLoanToValue: data.loanToValue,
        refiLoanTerm: data.loanTerm,
        refiInterestRate: data.interestRate,
        refiLenderFees: data.lenderFees,
        refiMortgageInsurance: data.mortgageInsurance,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(evaluationsTable.id, evaluationId),
          eq(evaluationsTable.userId, userId),
        ),
      )
      .returning({ propertyId: evaluationsTable.propertyId });

    revalidatePath(
      `/dashboard/properties/${propertyId}/evaluations/${evaluationId}`,
    );
  } catch (error) {
    console.error('Error updating refinance loan params:', error);
    throw new Error('Failed to update refinance loan parameters');
  }
}

/**
 * Delete an evaluation
 */
export async function deleteEvaluation(evaluationId: string, userId: string) {
  try {
    // Get property ID before deleting
    const evaluation = await db.query.evaluationsTable.findFirst({
      where: and(
        eq(evaluationsTable.id, evaluationId),
        eq(evaluationsTable.userId, userId),
      ),
      columns: { propertyId: true },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found or unauthorized');
    }

    // Delete evaluation (cascades to loan params)
    await db
      .delete(evaluationsTable)
      .where(
        and(
          eq(evaluationsTable.id, evaluationId),
          eq(evaluationsTable.userId, userId),
        ),
      );

    revalidatePath(`/dashboard/properties/${evaluation.propertyId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw new Error('Failed to delete evaluation');
  }
}
