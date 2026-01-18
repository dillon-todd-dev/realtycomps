import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/actions/projects-public';
import { getSignedDownloadUrl } from '@/lib/gcs';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import ProjectGallery from '@/components/projects/project-gallery';

export const revalidate = 60; // Revalidate every 60 seconds

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  // Get signed URLs for all images
  const imagesWithUrls = await Promise.all(
    project.images.map(async (image) => {
      try {
        const url = await getSignedDownloadUrl(image.url, 60);
        return { ...image, signedUrl: url };
      } catch (err) {
        console.error('Error getting signed URL:', err);
        return { ...image, signedUrl: null };
      }
    }),
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header with back link */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-16 z-10">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Title and Description */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {project.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Image Gallery */}
        {imagesWithUrls.length === 0 ? (
          <div className="border rounded-xl p-12 text-center bg-muted/30">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No images available for this project.
            </p>
          </div>
        ) : (
          <ProjectGallery images={imagesWithUrls} projectTitle={project.title} />
        )}
      </div>
    </div>
  );
}
