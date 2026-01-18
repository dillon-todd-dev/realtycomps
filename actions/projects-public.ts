'use server';

import { db } from '@/db/drizzle';
import { projectsTable, projectImagesTable } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export type ProjectWithImages = typeof projectsTable.$inferSelect & {
  images: (typeof projectImagesTable.$inferSelect)[];
};

/**
 * Get all published projects with their first image (for public listing)
 */
export async function getPublishedProjects(): Promise<ProjectWithImages[]> {
  const projects = await db.query.projectsTable.findMany({
    where: eq(projectsTable.isPublished, true),
    with: {
      images: {
        orderBy: [asc(projectImagesTable.order)],
      },
    },
    orderBy: [asc(projectsTable.order)],
  });

  return projects;
}

/**
 * Get a single project by ID with all images (for public detail page)
 */
export async function getProjectById(
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

  // Only return if published (or could be accessed by ID for sharing)
  if (!project || !project.isPublished) {
    return null;
  }

  return project;
}
