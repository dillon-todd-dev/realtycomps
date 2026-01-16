'use client';

import DealTermsForm from '@/components/evaluation/forms/deal-terms-form';
import HardMoneyFinancingForm from '@/components/evaluation/forms/hard-money-financing-form';
import Comparables from '@/components/evaluation/comparables';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Download,
  MapPin,
  Ruler,
  Square,
} from 'lucide-react';
import { EvaluationWithRelations } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface EvaluationDetailViewProps {
  evaluation: EvaluationWithRelations;
}

export default function EvaluationDetailView({
  evaluation,
}: EvaluationDetailViewProps) {
  const saleComps = evaluation.comparables.filter(
    (comp) => comp.type === 'SALE',
  );
  const rentComps = evaluation.comparables.filter(
    (comp) => comp.type === 'RENT',
  );

  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const fullAddress = [
    evaluation.property.address,
    evaluation.property.city,
    evaluation.property.state,
    evaluation.property.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const bathrooms = evaluation.property.bathrooms
    ? parseFloat(evaluation.property.bathrooms)
    : null;
  const lotSize = evaluation.property.lotSize
    ? Number(evaluation.property.lotSize)
    : null;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h1 className="text-sm font-medium truncate">Investment Evaluation</h1>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {evaluation.property.address || 'Property Analysis'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
            title="Export to PDF"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/properties/${evaluation.property.id}`}>
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-8">
        {/* Property Summary - No card, just clean display */}
        <div className="space-y-4">
          {fullAddress && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-lg">{fullAddress}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {evaluation.property.bedrooms && (
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{evaluation.property.bedrooms}</span>
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
            {evaluation.property.livingArea && (
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {evaluation.property.livingArea.toLocaleString()}
                </span>
                <span className="text-muted-foreground">sqft</span>
              </div>
            )}
            {evaluation.property.yearBuilt && (
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Built</span>
                <span className="font-medium">{evaluation.property.yearBuilt}</span>
              </div>
            )}
            {lotSize && (
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{lotSize.toLocaleString()}</span>
                <span className="text-muted-foreground">sqft lot</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Sale Comps */}
        <Comparables
          evaluationId={evaluation.id}
          propertyId={evaluation.propertyId}
          initialComparables={saleComps || []}
          propertyAddress={evaluation.property.address}
          latitude={evaluation.property.latitude}
          longitude={evaluation.property.longitude}
          title="Sale Comps"
          compType="SALE"
        />

        <Separator />

        {/* Rent Comps */}
        <Comparables
          evaluationId={evaluation.id}
          propertyId={evaluation.propertyId}
          initialComparables={rentComps || []}
          propertyAddress={evaluation.property.address}
          latitude={evaluation.property.latitude}
          longitude={evaluation.property.longitude}
          title="Rent Comps"
          compType="RENT"
        />

        <Separator />

        {/* Deal Terms */}
        <DealTermsForm evaluation={evaluation} />

        <Separator />

        {/* Financing Analysis */}
        <HardMoneyFinancingForm evaluation={evaluation} />
      </div>
    </>
  );
}
