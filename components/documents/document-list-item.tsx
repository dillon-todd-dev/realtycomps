'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FileText, FileSpreadsheet, FileImage, File, Download, Trash2, Loader2, Eye } from 'lucide-react';
import { Document } from '@/lib/types';
import { formatFileSize } from '@/lib/document-utils';
import { deleteDocument } from '@/actions/documents';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DocumentPreviewModal from './document-preview-modal';

interface DocumentListItemProps {
  document: Document;
  showDelete?: boolean;
}

function getFileIconComponent(fileType: string) {
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('word') || fileType.includes('document')) return FileText;
  if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
  if (fileType.includes('image')) return FileImage;
  return File;
}

export default function DocumentListItem({
  document,
  showDelete = false,
}: DocumentListItemProps) {
  const IconComponent = getFileIconComponent(document.fileType);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/download/${document.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get download URL');
      }
      const { url } = await response.json();
      // Open the signed URL in a new tab
      window.open(url, '_blank');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to download file',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(document.id);
      toast.success('Document deleted');
      setDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete document',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
        <IconComponent className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{document.name}</h3>
        {document.description && (
          <p className="text-sm text-muted-foreground truncate">
            {document.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {document.fileName} &middot; {formatFileSize(document.fileSize)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewOpen(true)}
        >
          <Eye className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">View</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">
            {isDownloading ? 'Loading...' : 'Download'}
          </span>
        </Button>
        {showDelete && (
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{document.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <DocumentPreviewModal
        document={document}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
