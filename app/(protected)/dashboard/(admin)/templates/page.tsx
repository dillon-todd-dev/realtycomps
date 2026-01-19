import { requireAdmin } from '@/lib/session';
import PageHeader from '@/components/page-header';
import { getTemplatesByDynamicCategory } from '@/actions/documents';
import { FileText, ArrowLeft, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DocumentListItem from '@/components/documents/document-list-item';
import UploadTemplateModal from '@/components/documents/upload-template-modal';
import {
  CategoryFormModal,
  CategoryActions,
} from '@/components/documents/category-management';
import { getTemplateCategories } from '@/actions/template-categories';

export default async function TemplateManagementPage() {
  await requireAdmin();

  const [templatesByCategory, categories] = await Promise.all([
    getTemplatesByDynamicCategory(),
    getTemplateCategories(),
  ]);

  const hasCategories = categories.length > 0;

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
            <CategoryFormModal mode="create" />
          </div>
        }
      />

      <div className="p-4 md:p-6">
        {!hasCategories ? (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first category to start organizing templates
            </p>
            <CategoryFormModal mode="create" />
          </div>
        ) : (
          <div className="space-y-8">
            {templatesByCategory.map(({ category, documents }) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      ({documents.length} template
                      {documents.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CategoryActions category={category} />
                    <UploadTemplateModal
                      categoryId={category.id}
                      categoryName={category.name}
                    />
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg bg-muted/30">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No templates in this category yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {documents.map((doc) => (
                      <DocumentListItem
                        key={doc.id}
                        document={doc}
                        showDelete
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
