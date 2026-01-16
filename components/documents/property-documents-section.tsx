'use client';

import { Document, Property } from '@/lib/types';
import { FileText, Upload } from 'lucide-react';
import DocumentListItem from './document-list-item';
import UploadDocumentModal from './upload-document-modal';
import { Button } from '@/components/ui/button';

interface PropertyDocumentsSectionProps {
  documents: Document[];
  property: Property;
}

export default function PropertyDocumentsSection({
  documents,
  property,
}: PropertyDocumentsSectionProps) {
  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-xl font-semibold'>Documents</h2>
          <p className='text-sm text-muted-foreground'>
            Files related to this property
          </p>
        </div>
        <UploadDocumentModal
          properties={[property]}
          defaultPropertyId={property.id}
          trigger={
            <Button variant='outline'>
              <Upload className='h-4 w-4 mr-2' />
              Upload Document
            </Button>
          }
        />
      </div>

      {documents.length === 0 ? (
        <div className='text-center py-8 border rounded-lg bg-muted/50'>
          <FileText className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
          <p className='text-sm text-muted-foreground mb-3'>
            No documents uploaded yet
          </p>
          <UploadDocumentModal
            properties={[property]}
            defaultPropertyId={property.id}
          />
        </div>
      ) : (
        <div className='grid gap-3'>
          {documents.map((doc) => (
            <DocumentListItem key={doc.id} document={doc} showDelete />
          ))}
        </div>
      )}
    </div>
  );
}
