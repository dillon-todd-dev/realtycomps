'use server';

import { db } from '@/db/drizzle';
import {
  evaluationsTable,
  hardMoneyLoanParamsTable,
  refinanceLoanParamsTable,
} from '@/db/schema';
import { NewEvaluation } from '@/lib/types';
import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type EvaluationWithRelations = {
  id: string;
  propertyId: string;
  userId: string;
  name: string | null;

  // Core fields
  estimatedSalePrice: string | null;
  purchasePrice: string | null;
  hardAppraisedPrice: string | null;
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

  createdAt: Date;
  updatedAt: Date;

  // Related data
  property: {
    id: string;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  };

  conventionalLoanParams?: {
    id: string;
    downPayment: string | null;
    loanTerm: number | null;
    interestRate: string | null;
    lenderFees: string | null;
    mortgageInsurance: string | null;
    monthsOfTaxes: number | null;
  } | null;

  hardMoneyLoanParams?: {
    id: string;
    loanToValue: string | null;
    lenderFees: string | null;
    interestRate: string | null;
    monthsToRefi: number | null;
    rollInLenderFees: boolean | null;
    weeksUntilLeased: number | null;
  } | null;

  refinanceLoanParams?: {
    id: string;
    loanToValue: string | null;
    loanTerm: number | null;
    interestRate: string | null;
    lenderFees: string | null;
    monthsOfTaxes: number | null;
    mortgageInsurance: string | null;
  } | null;
};

export async function createEvaluation(newEvaluation: NewEvaluation) {
  const result = await db.transaction(async (tx) => {
    const [evaluation] = await tx
      .insert(evaluationsTable)
      .values(newEvaluation)
      .returning();

    await tx.insert(hardMoneyLoanParamsTable).values({
      evaluationId: evaluation.id,
    });

    await tx
      .insert(refinanceLoanParamsTable)
      .values({ evaluationId: evaluation.id });

    return evaluation;
  });

  revalidatePath(`/dashboard/properties/${newEvaluation.propertyId}`);
  redirect(
    `/dashboard/properties/${newEvaluation.propertyId}/evaluations/${result.id}`,
  );
}

export async function getEvaluation(evaluationId: string, userId: string) {
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
      hardMoneyLoanParams: true,
      refinanceLoanParams: true,
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
    name?: string;
    estimatedSalePrice?: string;
    purchasePrice?: string;
    hardAppraisedPrice?: string;
    sellerContribution?: string;
    repairs?: string;
    insurance?: string;
    survey?: string;
    inspection?: string;
    appraisal?: string;
    miscellaneous?: string;
    rent?: string;
    hoa?: string;
    propertyTax?: string;
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
    loanToValue?: string;
    lenderFees?: string;
    interestRate?: string;
    monthsToRefi?: number;
    rollInLenderFees?: boolean;
    weeksUntilLeased?: number;
  },
) {
  try {
    // Verify ownership
    const evaluation = await db.query.evaluationsTable.findFirst({
      where: and(
        eq(evaluationsTable.id, evaluationId),
        eq(evaluationsTable.userId, userId),
      ),
      columns: { id: true, propertyId: true },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found or unauthorized');
    }

    // Update or create hard money loan params
    const existing = await db.query.hardMoneyLoanParamsTable.findFirst({
      where: eq(hardMoneyLoanParamsTable.evaluationId, evaluationId),
    });

    let updated;
    if (existing) {
      [updated] = await db
        .update(hardMoneyLoanParamsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(hardMoneyLoanParamsTable.evaluationId, evaluationId))
        .returning();
    } else {
      [updated] = await db
        .insert(hardMoneyLoanParamsTable)
        .values({
          evaluationId,
          ...data,
        })
        .returning();
    }

    revalidatePath(
      `/dashboard/properties/${evaluation.propertyId}/evaluations/${evaluationId}`,
    );

    return updated;
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
    loanToValue?: string;
    loanTerm?: number;
    interestRate?: string;
    lenderFees?: string;
    monthsOfTaxes?: number;
    mortgageInsurance?: string;
  },
) {
  try {
    // Verify ownership
    const evaluation = await db.query.evaluationsTable.findFirst({
      where: and(
        eq(evaluationsTable.id, evaluationId),
        eq(evaluationsTable.userId, userId),
      ),
      columns: { id: true, propertyId: true },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found or unauthorized');
    }

    // Update or create refinance loan params
    const existing = await db.query.refinanceLoanParamsTable.findFirst({
      where: eq(refinanceLoanParamsTable.evaluationId, evaluationId),
    });

    let updated;
    if (existing) {
      [updated] = await db
        .update(refinanceLoanParamsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(refinanceLoanParamsTable.evaluationId, evaluationId))
        .returning();
    } else {
      [updated] = await db
        .insert(refinanceLoanParamsTable)
        .values({
          evaluationId,
          ...data,
        })
        .returning();
    }

    revalidatePath(
      `/dashboard/properties/${evaluation.propertyId}/evaluations/${evaluationId}`,
    );

    return updated;
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
