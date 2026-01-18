'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/actions/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, X, ImageIcon, FolderOpen, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

export default function ProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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

  const handleRemoveImage = (index: number) => {
    setPendingImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pendingImages.length) return;
    setPendingImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Create the project first
      const result = await createProject(formData);

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      if (!result.project) {
        toast.error('Failed to create project');
        setIsSubmitting(false);
        return;
      }

      // Upload images
      for (const pendingImage of pendingImages) {
        const imageFormData = new FormData();
        imageFormData.append('file', pendingImage.file);
        imageFormData.append('projectId', result.project.id);

        const response = await fetch('/api/upload/project-image', {
          method: 'POST',
          body: imageFormData,
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Failed to upload image:', error);
          // Continue with other images even if one fails
        }
      }

      // Clean up previews
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));

      toast.success('Project created successfully');
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
          <FolderOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Create New Project</h2>
        <p className="text-muted-foreground mt-2">
          Add a project to showcase on the public Recent Projects page
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Kitchen Renovation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the project, scope of work, and any notable features..."
            rows={4}
            required
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <Label>Project Images</Label>

          {/* Upload Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload images
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF, or WebP (max 10MB each)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image Previews */}
          {pendingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {pendingImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative group aspect-square rounded-lg overflow-hidden bg-muted ${
                    index === 0 ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Thumbnail indicator */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 p-1 rounded-full bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  )}
                  {/* Reorder controls - always visible */}
                  {pendingImages.length > 1 && (
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(index, index - 1);
                        }}
                        disabled={index === 0}
                        className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(index, index + 1);
                        }}
                        disabled={index === pendingImages.length - 1}
                        className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pendingImages.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" />
              First image will be used as the thumbnail. Hover to reorder.
            </p>
          )}

          {pendingImages.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>No images selected</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/dashboard/projects')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
