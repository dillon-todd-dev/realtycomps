import Link from 'next/link';
import { getPublishedProjects } from '@/actions/projects-public';
import { getSignedDownloadUrl } from '@/lib/gcs';
import { ImageIcon } from 'lucide-react';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  // Get signed URLs for first image of each project
  const projectsWithImages = await Promise.all(
    projects.map(async (project) => {
      let imageUrl: string | null = null;
      if (project.images.length > 0) {
        try {
          imageUrl = await getSignedDownloadUrl(project.images[0].url, 60);
        } catch (err) {
          console.error('Error getting signed URL:', err);
        }
      }
      return { ...project, imageUrl };
    }),
  );

  return (
    <div className='min-h-[calc(100vh-4rem)] px-4 py-12'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl font-bold sm:text-4xl lg:text-5xl mb-4'>
            Recent Projects
          </h1>
          <p className='text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto'>
            Take a look at some of our recent general contracting work. From
            kitchen renovations to complete home additions, we bring quality
            craftsmanship to every project.
          </p>
        </div>

        {/* Projects Grid */}
        {projectsWithImages.length === 0 ? (
          <div className='text-center py-16'>
            <ImageIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <p className='text-muted-foreground'>
              No projects to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {projectsWithImages.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className='group overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-shadow'
              >
                <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
                  {project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground'>
                      <ImageIcon className='h-8 w-8' />
                    </div>
                  )}
                </div>
                <div className='p-4'>
                  <h3 className='font-semibold text-lg mb-1 group-hover:text-primary transition-colors'>
                    {project.title}
                  </h3>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {project.description}
                  </p>
                  {project.images.length > 1 && (
                    <p className='text-xs text-muted-foreground mt-2'>
                      {project.images.length} photos
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
