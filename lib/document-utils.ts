import { DocumentCategory } from '@/lib/types';

export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    CONTRACT: 'Contracts & Agreements',
    DISCLOSURE: 'Disclosures',
    MARKETING: 'Marketing Materials',
    FINANCIAL: 'Financial Documents',
    OTHER: 'Other Documents',
  };
  return labels[category];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'doc';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'xls';
  if (fileType.includes('image')) return 'image';
  return 'file';
}
