'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Ruler,
  Calculator,
  ArrowLeft,
  Trash,
  Home,
  Pencil,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Document, Evaluation, PropertyWithImages } from '@/lib/types';
import { Button } from '../ui/button';
import EvaluationListItemCard from '../evaluation/evaluation-list-item';
import { createEvaluation } from '@/actions/evaluations';
import Link from 'next/link';
import { deleteProperty } from '@/actions/properties';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import PropertyDocumentsSection from '@/components/documents/property-documents-section';
import EditPropertyModal from '@/components/property/edit-property-modal';

interface PropertyDetailViewProps {
  property: PropertyWithImages;
  evaluations?: Evaluation[];
  documents?: Document[];
}

export default function PropertyDetailView({
  property,
  evaluations = [],
  documents = [],
}: PropertyDetailViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const images = property.images || [];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const parseDecimal = (value: string | null) => {
    if (!value) return null;
    return parseFloat(value);
  };

  const price = parseDecimal(property.currentPrice);
  const bathrooms = parseDecimal(property.bathrooms);
  const lotSize = parseDecimal(property.lotSize);

  const fullAddress = [
    property.address,
    property.city,
    property.state,
    property.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-20 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h1 className="text-sm font-medium truncate">Property Details</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {property.address}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditModalOpen(true)}
          >
            <Pencil className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteProperty(property.id)}
          >
            <Trash className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/properties">
              <ArrowLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Image Carousel - Full width, no card */}
      <div className="relative bg-muted">
        {images.length > 0 ? (
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="relative aspect-[16/9] md:aspect-[21/9]">
                    <Image
                      src={image.url}
                      alt={image.alt || 'Property image'}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4 z-10" />
                <CarouselNext className="right-4 z-10" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full z-10">
                  {current} / {count}
                </div>
              </>
            )}
          </Carousel>
        ) : (
          <div className="aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 hidden md:block pointer-events-none">
            <div className="flex gap-2 justify-center">
              {images.slice(0, 6).map((image, index) => (
                <button
                  key={`thumb-${image.id}`}
                  onClick={() => api?.scrollTo(index)}
                  className={`relative w-16 h-12 rounded overflow-hidden transition-all pointer-events-auto ${
                    current === index + 1
                      ? 'ring-2 ring-white'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
              {images.length > 6 && (
                <div className="w-16 h-12 rounded bg-black/50 flex items-center justify-center text-white text-sm pointer-events-auto">
                  +{images.length - 6}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-8">
        {/* Property Header - Price & Address */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            {price && (
              <div className="text-3xl md:text-4xl font-bold">
                ${price.toLocaleString()}
              </div>
            )}
            {fullAddress && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-lg">{fullAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Property Stats - Horizontal pills/badges style */}
        <div className="flex flex-wrap gap-3">
          {property.bedrooms && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{property.bedrooms}</span>
              <span className="text-muted-foreground">beds</span>
            </div>
          )}
          {bathrooms && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bathrooms}</span>
              <span className="text-muted-foreground">baths</span>
            </div>
          )}
          {property.livingArea && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {property.livingArea.toLocaleString()}
              </span>
              <span className="text-muted-foreground">sqft</span>
            </div>
          )}
          {property.yearBuilt && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Built</span>
              <span className="font-medium">{property.yearBuilt}</span>
            </div>
          )}
          {lotSize && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{lotSize.toLocaleString()}</span>
              <span className="text-muted-foreground">sqft lot</span>
            </div>
          )}
          {property.subdivision && (
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{property.subdivision}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Investment Evaluations */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Investment Evaluations</h2>
              <p className="text-sm text-muted-foreground">
                Analyze this property&apos;s investment potential
              </p>
            </div>
            <Button
              onClick={() =>
                createEvaluation({
                  propertyId: property.id,
                  userId: property.userId,
                })
              }
            >
              <Calculator className="h-4 w-4 mr-2" />
              Create Evaluation
            </Button>
          </div>

          {evaluations?.length === 0 ? (
            <Card className="p-0">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No evaluations yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Create your first investment evaluation to analyze this
                    property&apos;s potential ROI, cash flow, and profitability.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {evaluations.map((evaluation) => (
                <EvaluationListItemCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  propertyId={property.id}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Property Documents */}
        <PropertyDocumentsSection documents={documents} property={property} />
      </div>

      <EditPropertyModal
        property={property}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  );
}
