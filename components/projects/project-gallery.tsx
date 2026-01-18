'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageWithUrl {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  signedUrl: string | null;
}

interface ProjectGalleryProps {
  images: ImageWithUrl[];
  projectTitle: string;
}

export default function ProjectGallery({
  images,
  projectTitle,
}: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const validImages = images.filter((img) => img.signedUrl);

  const handlePrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === 0 ? validImages.length - 1 : (prev ?? 0) - 1,
    );
  }, [selectedIndex, validImages.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === validImages.length - 1 ? 0 : (prev ?? 0) + 1,
    );
  }, [selectedIndex, validImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setSelectedIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrevious, handleNext]);

  if (validImages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Simple grid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {validImages.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setSelectedIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.signedUrl!}
              alt={image.alt || `${projectTitle} - ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          {selectedIndex !== null && (
            <div className="relative w-full h-[90vh] flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation Buttons */}
              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="absolute left-4 z-50 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="absolute right-4 z-50 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="relative max-w-full max-h-full p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={validImages[selectedIndex].signedUrl!}
                  alt={
                    validImages[selectedIndex].alt ||
                    `${projectTitle} - ${selectedIndex + 1}`
                  }
                  className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg"
                />
              </div>

              {/* Thumbnail strip at bottom */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white/70 text-sm mr-2">
                    {selectedIndex + 1} / {validImages.length}
                  </span>
                  <div className="flex gap-1.5">
                    {validImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedIndex
                            ? 'bg-white'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
