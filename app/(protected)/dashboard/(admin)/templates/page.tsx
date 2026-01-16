import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import { getTemplatesByCategory } from '@/actions/documents';
import { getCategoryLabel } from '@/lib/document-utils';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DocumentListItem from '@/components/documents/document-list-item';
import UploadTemplateModal from '@/components/documents/upload-template-modal';

export default async function TemplateManagementPage() {
  await requireAdmin();

  const templatesByCategory = await getTemplatesByCategory();

  return (
    <>
      <PageHeader
        title="Manage Templates"
        description="Upload and manage document templates for all users"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Link>
            </Button>
            <UploadTemplateModal />
          </div>
        }
      />

      <div className="p-4 md:p-6">
        {templatesByCategory.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your first template to make it available to all users
            </p>
            <UploadTemplateModal />
          </div>
        ) : (
          <div className="space-y-8">
            {templatesByCategory.map(({ category, documents }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {getCategoryLabel(category)}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {documents.length} template{documents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-3">
                  {documents.map((doc) => (
                    <DocumentListItem
                      key={doc.id}
                      document={doc}
                      showDelete
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
