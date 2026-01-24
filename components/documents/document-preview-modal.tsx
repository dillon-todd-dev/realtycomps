'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Document } from '@/lib/types';
import { Download, Loader2, FileX } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isPreviewable(fileType: string): boolean {
  return fileType === 'application/pdf' || fileType.startsWith('image/');
}

function isImage(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export default function DocumentPreviewModal({
  document,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreviewUrl = useCallback(async () => {
    if (!document) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/download/${document.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get preview URL');
      }
      const { url } = await response.json();
      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  }, [document]);

  useEffect(() => {
    if (open && document) {
      fetchPreviewUrl();
    } else {
      setPreviewUrl(null);
      setError(null);
    }
  }, [open, document, fetchPreviewUrl]);

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  if (!document) return null;

  const canPreview = isPreviewable(document.fileType);
  const isImageFile = isImage(document.fileType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-7xl w-[95vw] h-[90vh] flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='truncate pr-8'>{document.name}</DialogTitle>
        </DialogHeader>

        <div className='flex-1 min-h-0 flex flex-col'>
          {isLoading ? (
            <div className='flex-1 flex items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : error ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-4'>
              <FileX className='h-12 w-12 text-muted-foreground' />
              <p className='text-muted-foreground'>{error}</p>
              <Button onClick={fetchPreviewUrl}>Try Again</Button>
            </div>
          ) : !canPreview ? (
            <div className='flex-1 flex flex-col items-center justify-center gap-4'>
              <FileX className='h-12 w-12 text-muted-foreground' />
              <p className='text-muted-foreground text-center'>
                Preview is not available for this file type.
                <br />
                <span className='text-sm'>({document.fileType})</span>
              </p>
              <Button onClick={handleDownload} disabled={!previewUrl}>
                <Download className='h-4 w-4 mr-2' />
                Download to View
              </Button>
            </div>
          ) : previewUrl ? (
            <div className='flex-1 min-h-0 bg-muted rounded-lg overflow-hidden'>
              {isImageFile ? (
                <div className='w-full h-full flex items-center justify-center p-4'>
                  <img
                    src={previewUrl}
                    alt={document.name}
                    className='max-w-full max-h-full object-contain'
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className='w-full h-full border-0'
                  title={document.name}
                />
              )}
            </div>
          ) : null}
        </div>

        {previewUrl && canPreview && (
          <div className='flex-shrink-0 flex justify-end pt-4 border-t'>
            <Button variant='outline' onClick={handleDownload}>
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
