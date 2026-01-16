import { Storage } from '@google-cloud/storage';
import { ENV } from '@/lib/env';

// Initialize Google Cloud Storage
const storage = new Storage();
export const bucket = storage.bucket(ENV.GCS_BUCKET_NAME);

/**
 * Upload a file to Google Cloud Storage
 */
export async function uploadFile(
  buffer: Buffer,
  gcsPath: string,
  contentType: string,
): Promise<string> {
  const file = bucket.file(gcsPath);

  await file.save(buffer, {
    metadata: {
      contentType,
    },
  });

  // Return the GCS path (not a public URL)
  return gcsPath;
}

/**
 * Delete a file from Google Cloud Storage
 */
export async function deleteFile(gcsPath: string): Promise<void> {
  const file = bucket.file(gcsPath);
  await file.delete();
}

/**
 * Generate a signed URL for downloading a file
 * The URL is valid for the specified duration (default: 15 minutes)
 */
export async function getSignedDownloadUrl(
  gcsPath: string,
  expiresInMinutes: number = 15,
): Promise<string> {
  const file = bucket.file(gcsPath);

  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return signedUrl;
}

/**
 * Extract GCS path from stored URL/path
 * Handles both old public URLs and new GCS paths
 */
export function extractGcsPath(urlOrPath: string): string {
  // If it's a full GCS URL, extract the path
  const gcsUrlPrefix = `https://storage.googleapis.com/${ENV.GCS_BUCKET_NAME}/`;
  if (urlOrPath.startsWith(gcsUrlPrefix)) {
    return urlOrPath.replace(gcsUrlPrefix, '');
  }

  // If it starts with a slash, remove it
  if (urlOrPath.startsWith('/')) {
    return urlOrPath.slice(1);
  }

  // Otherwise, assume it's already a GCS path
  return urlOrPath;
}
