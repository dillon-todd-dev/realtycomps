'use server';

import { db } from '@/db/drizzle';
import { projectsTable, projectImagesTable } from '@/db/schema';
import { eq, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { deleteFile, getSignedDownloadUrl } from '@/lib/gcs';

export type ProjectWithImages = typeof projectsTable.$inferSelect & {
  images: (typeof projectImagesTable.$inferSelect)[];
};

type GetProjectsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

/**
 * Get all projects for admin management (includes unpublished)
 */
export async function getProjects({
  page = 1,
  pageSize = 10,
  search = '',
}: GetProjectsParams = {}) {
  const offset = (page - 1) * pageSize;
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(projectsTable.title, `%${search}%`),
        ilike(projectsTable.description, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  const [projects, totalCount] = await Promise.all([
    db.query.projectsTable.findMany({
      where: whereClause,
      with: {
        images: {
          orderBy: [asc(projectImagesTable.order)],
        },
      },
      orderBy: [asc(projectsTable.order), desc(projectsTable.createdAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(projectsTable)
      .where(whereClause)
      .then((result) => result[0].count),
  ]);

  return {
    projects,
    totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

/**
 * Get a single project by ID for editing (includes unpublished)
 */
export async function getProjectForEdit(
  projectId: string,
): Promise<ProjectWithImages | null> {
  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
    with: {
      images: {
        orderBy: [asc(projectImagesTable.order)],
      },
    },
  });

  return project || null;
}

/**
 * Create a new project
 */
export async function createProject(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title || !description) {
    return { error: 'Title and description are required' };
  }

  try {
    // Get the highest order value to place new project at the end
    const maxOrder = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${projectsTable.order}), -1)`,
      })
      .from(projectsTable)
      .then((result) => result[0].maxOrder);

    const [project] = await db
      .insert(projectsTable)
      .values({
        title,
        description,
        order: maxOrder + 1,
      })
      .returning();

    revalidatePath('/projects');
    revalidatePath('/dashboard/projects');

    return { success: true, project };
  } catch (err) {
    console.error('Error creating project:', err);
    return { error: 'Failed to create project' };
  }
}

/**
 * Update a project's details
 */
export async function updateProject(
  projectId: string,
  data: {
    title?: string;
    description?: string;
  },
) {
  try {
    await db
      .update(projectsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId));

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard/projects');
  } catch (err) {
    console.error('Error updating project:', err);
    throw new Error('Failed to update project');
  }
}

/**
 * Toggle project published status
 */
export async function toggleProjectPublished(projectId: string) {
  try {
    const project = await db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, projectId),
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await db
      .update(projectsTable)
      .set({
        isPublished: !project.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId));

    revalidatePath('/projects');
    revalidatePath('/dashboard/projects');

    return { isPublished: !project.isPublished };
  } catch (err) {
    console.error('Error toggling project published:', err);
    throw new Error('Failed to update project');
  }
}

/**
 * Delete a project and all its images
 */
export async function deleteProject(projectId: string) {
  try {
    // Get all images to delete from GCS
    const images = await db.query.projectImagesTable.findMany({
      where: eq(projectImagesTable.projectId, projectId),
    });

    // Delete images from GCS
    for (const image of images) {
      try {
        await deleteFile(image.url);
      } catch (err) {
        console.error('Error deleting image from GCS:', err);
        // Continue even if GCS delete fails
      }
    }

    // Delete project (cascade will delete images from DB)
    await db.delete(projectsTable).where(eq(projectsTable.id, projectId));

    revalidatePath('/projects');
    revalidatePath('/dashboard/projects');
  } catch (err) {
    console.error('Error deleting project:', err);
    throw new Error('Failed to delete project');
  }
}

/**
 * Delete a single project image
 */
export async function deleteProjectImage(imageId: string) {
  try {
    const image = await db.query.projectImagesTable.findFirst({
      where: eq(projectImagesTable.id, imageId),
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Delete from GCS
    try {
      await deleteFile(image.url);
    } catch (err) {
      console.error('Error deleting image from GCS:', err);
    }

    // Delete from DB
    await db
      .delete(projectImagesTable)
      .where(eq(projectImagesTable.id, imageId));

    revalidatePath('/projects');
    revalidatePath(`/projects/${image.projectId}`);
    revalidatePath('/dashboard/projects');
  } catch (err) {
    console.error('Error deleting project image:', err);
    throw new Error('Failed to delete image');
  }
}

/**
 * Reorder project images
 */
export async function reorderProjectImages(
  projectId: string,
  imageIds: string[],
) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < imageIds.length; i++) {
        await tx
          .update(projectImagesTable)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(projectImagesTable.id, imageIds[i]));
      }
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/dashboard/projects');
  } catch (err) {
    console.error('Error reordering project images:', err);
    throw new Error('Failed to reorder images');
  }
}

/**
 * Reorder projects
 */
export async function reorderProjects(projectIds: string[]) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < projectIds.length; i++) {
        await tx
          .update(projectsTable)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(projectsTable.id, projectIds[i]));
      }
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard/projects');
  } catch (err) {
    console.error('Error reordering projects:', err);
    throw new Error('Failed to reorder projects');
  }
}

/**
 * Get signed URL for a project image (callable from client components)
 */
export async function getProjectImageUrl(
  gcsPath: string,
  expiresInMinutes: number = 60,
): Promise<string | null> {
  try {
    return await getSignedDownloadUrl(gcsPath, expiresInMinutes);
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return null;
  }
}

/**
 * Get signed URLs for multiple project images
 */
export async function getProjectImageUrls(
  gcsPaths: string[],
  expiresInMinutes: number = 60,
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};

  await Promise.all(
    gcsPaths.map(async (path) => {
      try {
        const url = await getSignedDownloadUrl(path, expiresInMinutes);
        urls[path] = url;
      } catch (err) {
        console.error('Error getting signed URL for', path, err);
      }
    }),
  );

  return urls;
}
