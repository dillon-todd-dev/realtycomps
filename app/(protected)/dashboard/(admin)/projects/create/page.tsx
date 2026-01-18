import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import ProjectForm from '@/components/projects/project-form';

export default async function CreateProjectPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader title="Create Project" description="Add a new project to showcase" />
      <div className="p-4 md:p-6 flex justify-center">
        <ProjectForm />
      </div>
    </>
  );
}
