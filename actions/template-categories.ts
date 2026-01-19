'use server';

import { db } from '@/db/drizzle';
import { templateCategoriesTable, documentsTable } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type TemplateCategory = typeof templateCategoriesTable.$inferSelect;

/**
 * Get all template categories ordered by order
 */
export async function getTemplateCategories(): Promise<TemplateCategory[]> {
  return db.query.templateCategoriesTable.findMany({
    orderBy: [asc(templateCategoriesTable.order)],
  });
}

/**
 * Get a single template category by ID
 */
export async function getTemplateCategory(
  categoryId: string,
): Promise<TemplateCategory | null> {
  const category = await db.query.templateCategoriesTable.findFirst({
    where: eq(templateCategoriesTable.id, categoryId),
  });
  return category || null;
}

/**
 * Create a new template category
 */
export async function createTemplateCategory(name: string) {
  if (!name || name.trim().length === 0) {
    return { error: 'Category name is required' };
  }

  try {
    // Get the highest order value to place new category at the end
    const maxOrder = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${templateCategoriesTable.order}), -1)`,
      })
      .from(templateCategoriesTable)
      .then((result) => result[0].maxOrder);

    const [category] = await db
      .insert(templateCategoriesTable)
      .values({
        name: name.trim(),
        order: maxOrder + 1,
      })
      .returning();

    revalidatePath('/dashboard/templates');

    return { success: true, category };
  } catch (err: any) {
    console.error('Error creating template category:', err);
    if (err.code === '23505') {
      // Unique constraint violation
      return { error: 'A category with this name already exists' };
    }
    return { error: 'Failed to create category' };
  }
}

/**
 * Update a template category's name
 */
export async function updateTemplateCategory(categoryId: string, name: string) {
  if (!name || name.trim().length === 0) {
    return { error: 'Category name is required' };
  }

  try {
    const [category] = await db
      .update(templateCategoriesTable)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(templateCategoriesTable.id, categoryId))
      .returning();

    if (!category) {
      return { error: 'Category not found' };
    }

    revalidatePath('/dashboard/templates');

    return { success: true, category };
  } catch (err: any) {
    console.error('Error updating template category:', err);
    if (err.code === '23505') {
      return { error: 'A category with this name already exists' };
    }
    return { error: 'Failed to update category' };
  }
}

/**
 * Delete a template category (fails if it has templates)
 */
export async function deleteTemplateCategory(categoryId: string) {
  try {
    // Check if category has any templates
    const templatesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(documentsTable)
      .where(eq(documentsTable.categoryId, categoryId))
      .then((result) => result[0].count);

    if (templatesCount > 0) {
      return {
        error: `Cannot delete category: it contains ${templatesCount} template${templatesCount > 1 ? 's' : ''}. Move or delete the templates first.`,
      };
    }

    await db
      .delete(templateCategoriesTable)
      .where(eq(templateCategoriesTable.id, categoryId));

    revalidatePath('/dashboard/templates');

    return { success: true };
  } catch (err) {
    console.error('Error deleting template category:', err);
    return { error: 'Failed to delete category' };
  }
}

/**
 * Reorder template categories
 */
export async function reorderTemplateCategories(categoryIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < categoryIds.length; i++) {
        await tx
          .update(templateCategoriesTable)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(templateCategoriesTable.id, categoryIds[i]));
      }
    });

    revalidatePath('/dashboard/templates');

    return { success: true };
  } catch (err) {
    console.error('Error reordering template categories:', err);
    return { error: 'Failed to reorder categories' };
  }
}
