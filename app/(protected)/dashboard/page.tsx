import { requireUser } from '@/lib/session';
import PageHeader from '@/components/page-header';
import {
  getTemplatesByDynamicCategory,
  getUserDocuments,
  getAllUserDocuments,
  getUserProperties,
} from '@/actions/documents';
import { FileText, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DocumentListItem from '@/components/documents/document-list-item';
import UploadDocumentModal from '@/components/documents/upload-document-modal';
import { Separator } from '@/components/ui/separator';

export default async function DocumentsPage() {
  const user = await requireUser();
  const isAdmin = user.role === 'ROLE_ADMIN';

  const [templatesByCategory, userDocsByProperty, userProperties] =
    await Promise.all([
      getTemplatesByDynamicCategory(),
      getUserDocuments(user.id),
      getUserProperties(),
    ]);

  // Only fetch all user docs if admin
  const allUserDocs = isAdmin ? await getAllUserDocuments() : [];

  return (
    <>
      <PageHeader
        title="Documents"
        description="Download templates and manage your files"
        action={
          isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/templates">
                <Settings className="h-4 w-4 mr-2" />
                Manage Templates
              </Link>
            </Button>
          )
        }
      />

      <div className="p-4 md:p-6 space-y-8">
        {/* Templates Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Templates</h2>
          </div>

          {templatesByCategory.length === 0 ||
          templatesByCategory.every((tc) => tc.documents.length === 0) ? (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No templates available yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {templatesByCategory
                .filter((tc) => tc.documents.length > 0)
                .map(({ category, documents }) => (
                  <div key={category.id}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {category.name}
                    </h3>
                    <div className="grid gap-3">
                      {documents.map((doc) => (
                        <DocumentListItem key={doc.id} document={doc} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <Separator />

        {/* My Files Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Files</h2>
            {userProperties.length > 0 && (
              <UploadDocumentModal properties={userProperties} />
            )}
          </div>

          {userProperties.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Add a property first to upload documents
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/properties/create">Add Property</Link>
              </Button>
            </div>
          ) : userDocsByProperty.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No documents uploaded yet
              </p>
              <UploadDocumentModal properties={userProperties} />
            </div>
          ) : (
            <div className="space-y-6">
              {userDocsByProperty.map(({ property, documents }) => (
                <div key={property.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">
                      {property.address}, {property.city} {property.state}
                    </h3>
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
        </section>

        {/* Admin: All User Files */}
        {isAdmin && allUserDocs.length > 0 && (
          <>
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All User Files</h2>
                <span className="text-sm text-muted-foreground">
                  Admin view
                </span>
              </div>

              <div className="grid gap-3">
                {allUserDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                          {doc.user?.firstName} {doc.user?.lastName}
                        </span>
                        {doc.property && (
                          <span className="text-xs text-muted-foreground">
                            {doc.property.address}
                          </span>
                        )}
                      </div>
                      <DocumentListItem document={doc} showDelete />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
