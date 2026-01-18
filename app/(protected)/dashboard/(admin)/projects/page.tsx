import { requireAdmin } from '@/lib/session';
import { getProjects } from '@/actions/projects';
import ProjectsDataTable from '@/components/projects/projects-data-table';

export default async function ProjectsPage() {
  await requireAdmin();

  const initialData = await getProjects({ page: 1, pageSize: 10 });

  return <ProjectsDataTable initialData={initialData} />;
}
