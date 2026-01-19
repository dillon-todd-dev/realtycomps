'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ProjectWithImages,
  updateProject,
  deleteProjectImage,
  reorderProjectImages,
  getProjectImageUrl,
} from '@/actions/projects';
import { toast } from 'sonner';
import {
  Loader2,
  X,
  Upload,
  ImageIcon,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

type ExistingImage = ProjectWithImages['images'][number];

interface EditProjectModalProps {
  project: ProjectWithImages;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditProjectModal({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
  });
  // Existing images from the database (ordered locally)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(
    project.images,
  );
  // Original order to detect changes
  const [originalImageOrder, setOriginalImageOrder] = useState<string[]>(
    project.images.map((img) => img.id),
  );
  // IDs of existing images marked for deletion
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
  // New images to upload on save
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when project changes or modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        title: project.title,
        description: project.description,
      });
      setExistingImages(project.images);
      setOriginalImageOrder(project.images.map((img) => img.id));
      setImagesToDelete(new Set());
      setPendingImages([]);
    }
  }, [open, project]);

  // Fetch signed URLs for existing images
  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const image of existingImages) {
        const url = await getProjectImageUrl(image.url, 60);
        if (url) {
          urls[image.id] = url;
        }
      }
      setImageUrls(urls);
    };
    fetchImageUrls();
  }, [existingImages]);

  // Clean up pending image previews when modal closes
  useEffect(() => {
    if (!open) {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
    }
  }, [open, pendingImages]);

  // Check if image order has changed
  const hasOrderChanged = () => {
    const currentOrder = existingImages
      .filter((img) => !imagesToDelete.has(img.id))
      .map((img) => img.id);
    const originalFiltered = originalImageOrder.filter(
      (id) => !imagesToDelete.has(id),
    );
    if (currentOrder.length !== originalFiltered.length) return true;
    return currentOrder.some((id, index) => id !== originalFiltered[index]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadErrors = 0;

    try {
      // 1. Update project details
      await updateProject(project.id, {
        title: formData.title,
        description: formData.description,
      });
    } catch (error) {
      console.error('Failed to update project details:', error);
      toast.error('Failed to update project details');
      setIsSubmitting(false);
      return;
    }

    // 2. Delete images that were marked for deletion
    for (const imageId of imagesToDelete) {
      try {
        await deleteProjectImage(imageId);
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }

    // 3. Reorder existing images if order changed
    if (hasOrderChanged()) {
      try {
        const newOrder = existingImages
          .filter((img) => !imagesToDelete.has(img.id))
          .map((img) => img.id);
        await reorderProjectImages(project.id, newOrder);
      } catch (error) {
        console.error('Failed to reorder images:', error);
        // Continue anyway, reordering is not critical
      }
    }

    // 4. Upload new images
    for (const pendingImage of pendingImages) {
      try {
        const uploadData = new FormData();
        uploadData.append('file', pendingImage.file);
        uploadData.append('projectId', project.id);

        const response = await fetch('/api/upload/project-image', {
          method: 'POST',
          body: uploadData,
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to upload image:', error);
          uploadErrors++;
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        uploadErrors++;
      }
    }

    // Clean up previews
    pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));

    if (uploadErrors > 0) {
      toast.error(
        `Failed to upload ${uploadErrors} image${uploadErrors > 1 ? 's' : ''}`,
      );
    } else {
      toast.success('Project updated');
    }

    onOpenChange(false);
    onSuccess();
    setIsSubmitting(false);
  };

  const handleMarkForDeletion = (imageId: string) => {
    setImagesToDelete((prev) => new Set([...prev, imageId]));
  };

  const handleUndoDeletion = (imageId: string) => {
    setImagesToDelete((prev) => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });
  };

  const handleMoveExistingImage = (fromIndex: number, toIndex: number) => {
    const visibleImages = existingImages.filter(
      (img) => !imagesToDelete.has(img.id),
    );
    if (toIndex < 0 || toIndex >= visibleImages.length) return;

    // Get the actual indices in the full array
    const fromImage = visibleImages[fromIndex];
    const toImage = visibleImages[toIndex];
    const actualFromIndex = existingImages.findIndex(
      (img) => img.id === fromImage.id,
    );
    const actualToIndex = existingImages.findIndex(
      (img) => img.id === toImage.id,
    );

    setExistingImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(actualFromIndex, 1);
      newImages.splice(actualToIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        newImages.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        });
      }
    }

    setPendingImages((prev) => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleMovePendingImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pendingImages.length) return;
    setPendingImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  // Calculate visible images (existing minus deleted)
  const visibleExistingImages = existingImages.filter(
    (img) => !imagesToDelete.has(img.id),
  );
  const totalImageCount = visibleExistingImages.length + pendingImages.length;
  const hasChanges =
    formData.title !== project.title ||
    formData.description !== project.description ||
    imagesToDelete.size > 0 ||
    pendingImages.length > 0 ||
    hasOrderChanged();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              required
            />
          </div>

          {/* Images Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Images ({totalImageCount})</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='h-4 w-4 mr-2' />
                Add Images
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/gif,image/webp'
                multiple
                onChange={handleFileSelect}
                className='hidden'
              />
            </div>

            {totalImageCount === 0 ? (
              <div className='border border-dashed rounded-lg p-8 text-center'>
                <ImageIcon className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
                <p className='text-sm text-muted-foreground'>
                  No images yet. Click &quot;Add Images&quot; to upload.
                </p>
              </div>
            ) : (
              <>
                {/* Existing Images */}
                {visibleExistingImages.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      Current images (hover to reorder)
                    </p>
                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
                      {visibleExistingImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative group aspect-square rounded-lg overflow-hidden bg-muted ${
                            index === 0
                              ? 'ring-2 ring-primary ring-offset-2'
                              : ''
                          }`}
                        >
                          {imageUrls[image.id] ? (
                            <Image
                              src={imageUrls[image.id]}
                              alt={image.alt || 'Project image'}
                              fill
                              className='object-cover'
                              sizes='(max-width: 640px) 33vw, 25vw'
                            />
                          ) : (
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                            </div>
                          )}
                          {index === 0 && (
                            <div className='absolute top-1 left-1 p-1 rounded-full bg-primary text-primary-foreground'>
                              <Star className='h-3 w-3 fill-current' />
                            </div>
                          )}
                          {/* Reorder controls - always visible */}
                          {visibleExistingImages.length > 1 && (
                            <div className='absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-2'>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveExistingImage(index, index - 1);
                                }}
                                disabled={index === 0}
                                className='p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                                title='Move left'
                              >
                                <ChevronLeft className='h-4 w-4' />
                              </button>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveExistingImage(index, index + 1);
                                }}
                                disabled={
                                  index === visibleExistingImages.length - 1
                                }
                                className='p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                                title='Move right'
                              >
                                <ChevronRight className='h-4 w-4' />
                              </button>
                            </div>
                          )}
                          <button
                            type='button'
                            onClick={() => handleMarkForDeletion(image.id)}
                            className='absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Images */}
                {pendingImages.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      New images (will be uploaded on save)
                    </p>
                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-3'>
                      {pendingImages.map((image, index) => (
                        <div
                          key={image.id}
                          className='relative group aspect-square rounded-lg overflow-hidden bg-muted border-2 border-dashed border-primary/50'
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.preview}
                            alt={`New image ${index + 1}`}
                            className='w-full h-full object-cover'
                          />
                          {/* Reorder controls - always visible */}
                          {pendingImages.length > 1 && (
                            <div className='absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-2'>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePendingImage(index, index - 1);
                                }}
                                disabled={index === 0}
                                className='p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                                title='Move left'
                              >
                                <ChevronLeft className='h-4 w-4' />
                              </button>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePendingImage(index, index + 1);
                                }}
                                disabled={index === pendingImages.length - 1}
                                className='p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                                title='Move right'
                              >
                                <ChevronRight className='h-4 w-4' />
                              </button>
                            </div>
                          )}
                          <button
                            type='button'
                            onClick={() => handleRemovePendingImage(image.id)}
                            className='absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deleted images that can be restored */}
                {imagesToDelete.size > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs text-muted-foreground'>
                      Images to delete (click to restore)
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {existingImages
                        .filter((img) => imagesToDelete.has(img.id))
                        .map((image) => (
                          <button
                            key={image.id}
                            type='button'
                            onClick={() => handleUndoDeletion(image.id)}
                            className='relative w-12 h-12 rounded opacity-50 hover:opacity-75 transition-opacity overflow-hidden'
                          >
                            {imageUrls[image.id] ? (
                              <Image
                                src={imageUrls[image.id]}
                                alt='Deleted image'
                                fill
                                className='object-cover'
                                sizes='48px'
                              />
                            ) : (
                              <div className='w-full h-full bg-muted' />
                            )}
                            <div className='absolute inset-0 bg-destructive/30' />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {visibleExistingImages.length > 0 && (
                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                    <Star className='h-3 w-3' />
                    First image is the thumbnail
                  </p>
                )}
              </>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
