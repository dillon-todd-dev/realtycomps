'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useTransition } from 'react';
import { searchSaleComparables, toggleComparable } from '@/actions/comparables';
import { toast } from 'sonner';
import Image from 'next/image';
import { SelectInput } from '../select-input';
import { ComparableWithImages } from '@/lib/types';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface ComparablesProps {
  evaluationId: string;
  propertyId: string;
  propertyAddress: string | null;
  latitude?: string | null;
  longitude?: string | null;
  initialComparables?: ComparableWithImages[];
  title: string;
  compType: 'SALE' | 'RENT';
}

export default function Comparables({
  evaluationId,
  propertyId,
  initialComparables = [],
  propertyAddress,
  latitude,
  longitude,
  title,
  compType,
}: ComparablesProps) {
  const [comparables, setComparables] =
    useState<ComparableWithImages[]>(initialComparables);
  const [isPending, startTransition] = useTransition();
  const [selectedComparable, setSelectedComparable] =
    useState<ComparableWithImages | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  async function handleSearch(formData: FormData) {
    try {
      const results = await searchSaleComparables({
        evaluationId,
        propertyId,
        address: propertyAddress || '',
        latitude,
        longitude,
        maxRadius: Number(formData.get('maxRadius')),
        minBeds: Number(formData.get('minBeds')) || undefined,
        maxBeds: Number(formData.get('maxBeds')) || undefined,
        minBaths: Number(formData.get('minBaths')) || undefined,
        maxBaths: Number(formData.get('maxBaths')) || undefined,
        minSquareFootage: Number(formData.get('minSquareFootage')) || undefined,
        maxSquareFootage: Number(formData.get('maxSquareFootage')) || undefined,
        daysOld: Number(formData.get('daysOld')) || 365,
        type: compType,
      });

      setComparables(results);
      toast.success(`Found ${results.length} comparable properties`);
    } catch (error) {
      console.error('Failed to search comparables:', error);
      toast.error('Failed to search for comparables');
    }
  }

  async function handleToggleInclude(
    comparableId: string,
    currentState: boolean,
  ) {
    const newState = !currentState;

    setComparables((prev) =>
      prev.map((comp) =>
        comp.id === comparableId ? { ...comp, included: newState } : comp,
      ),
    );

    try {
      await toggleComparable(comparableId, newState);
      toast.success(newState ? 'Comparable included' : 'Comparable excluded');
    } catch (error) {
      console.error('Failed to update comparable:', error);
      setComparables((prev) =>
        prev.map((comp) =>
          comp.id === comparableId ? { ...comp, included: currentState } : comp,
        ),
      );
      toast.error('Failed to update comparable');
    }
  }

  function handleViewDetails(comparable: ComparableWithImages) {
    setSelectedComparable(comparable);
    setDetailModalOpen(true);
  }

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString()}`;
  };

  const includedComps = comparables.filter((c) => c.included);
  const includedCount = includedComps.length;

  // Calculate averages for included comps
  const averages = includedCount > 0
    ? {
        avgPrice:
          includedComps.reduce((sum, c) => sum + parseFloat(c.salePrice), 0) /
          includedCount,
        avgPricePerSqFt:
          includedComps.reduce(
            (sum, c) => sum + parseFloat(c.salePrice) / c.squareFootage,
            0,
          ) / includedCount,
      }
    : null;

  return (
    <>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {comparables.length > 0
                ? `${includedCount} of ${comparables.length} included in analysis`
                : 'Search for similar properties to analyze market values'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-4 w-4 mr-2" />
            Search
            {searchOpen ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Collapsible Search Form */}
        <Collapsible open={searchOpen} onOpenChange={setSearchOpen}>
          <CollapsibleContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(
                  async () => await handleSearch(new FormData(e.currentTarget)),
                );
              }}
              className="p-4 bg-muted/50 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRadius" className="text-xs">
                    Radius (miles)
                  </Label>
                  <SelectInput
                    id="maxRadius"
                    name="maxRadius"
                    type="number"
                    step="0.1"
                    defaultValue="5"
                    placeholder="5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBeds" className="text-xs">
                    Min Beds
                  </Label>
                  <SelectInput
                    id="minBeds"
                    name="minBeds"
                    type="number"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBeds" className="text-xs">
                    Max Beds
                  </Label>
                  <SelectInput
                    id="maxBeds"
                    name="maxBeds"
                    type="number"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBaths" className="text-xs">
                    Min Baths
                  </Label>
                  <SelectInput
                    id="minBaths"
                    name="minBaths"
                    type="number"
                    step="0.5"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBaths" className="text-xs">
                    Max Baths
                  </Label>
                  <SelectInput
                    id="maxBaths"
                    name="maxBaths"
                    type="number"
                    step="0.5"
                    placeholder="Any"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minSquareFootage" className="text-xs">
                    Min Sq Ft
                  </Label>
                  <SelectInput
                    id="minSquareFootage"
                    name="minSquareFootage"
                    type="number"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSquareFootage" className="text-xs">
                    Max Sq Ft
                  </Label>
                  <SelectInput
                    id="maxSquareFootage"
                    name="maxSquareFootage"
                    type="number"
                    placeholder="Any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daysOld" className="text-xs">
                    Max Days Old
                  </Label>
                  <SelectInput
                    id="daysOld"
                    name="daysOld"
                    type="number"
                    defaultValue="365"
                    placeholder="365"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CollapsibleContent>
        </Collapsible>

        {/* Results - Mobile Card View */}
        {comparables.length > 0 && (
          <div className="space-y-3 md:hidden">
            {comparables.map((comp) => (
              <div
                key={comp.id}
                className={`rounded-lg border bg-card p-4 transition-all ${
                  !comp.included ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={comp.included}
                    onCheckedChange={() =>
                      handleToggleInclude(comp.id, comp.included)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`font-medium text-sm ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.address}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleViewDetails(comp)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    {comp.subdivision && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {comp.subdivision}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>{comp.bedrooms} bed</span>
                      <span>{parseFloat(comp.bathrooms)} bath</span>
                      <span>{comp.squareFootage.toLocaleString()} sqft</span>
                      <span>Built {comp.yearBuilt}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Listed</p>
                        <p
                          className={`font-semibold ${
                            !comp.included ? 'line-through' : ''
                          }`}
                        >
                          {formatCurrency(comp.listPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Sold</p>
                        <p
                          className={`font-semibold ${
                            !comp.included ? 'line-through' : ''
                          }`}
                        >
                          {formatCurrency(comp.salePrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Closed</p>
                        <p className="text-sm">
                          {new Date(comp.closeDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results - Desktop Table View */}
        {comparables.length > 0 && (
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Include</TableHead>
                    <TableHead className="w-[180px]">Address</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Subdivision
                    </TableHead>
                    <TableHead className="text-center w-16">Beds</TableHead>
                    <TableHead className="text-center w-16">Baths</TableHead>
                    <TableHead className="hidden lg:table-cell text-center w-20">
                      Garage
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-center w-20">
                      Built
                    </TableHead>
                    <TableHead className="text-right w-24">Sq Ft</TableHead>
                    <TableHead className="text-center w-28">Listed</TableHead>
                    <TableHead className="text-center w-28">Sold</TableHead>
                    <TableHead className="text-center w-28">
                      Close Date
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparables.map((comp) => (
                    <TableRow
                      key={comp.id}
                      className={`${
                        !comp.included
                          ? 'opacity-40 bg-muted/50'
                          : 'hover:bg-muted/50'
                      } transition-all`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={comp.included}
                          onCheckedChange={() =>
                            handleToggleInclude(comp.id, comp.included)
                          }
                        />
                      </TableCell>
                      <TableCell
                        className={`font-medium ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        <div className="whitespace-normal break-words">
                          {comp.address}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`hidden xl:table-cell ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.subdivision || '—'}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.bedrooms}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {parseFloat(comp.bathrooms)}
                      </TableCell>
                      <TableCell
                        className={`hidden lg:table-cell text-center ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.garageSpaces || '—'}
                      </TableCell>
                      <TableCell
                        className={`hidden lg:table-cell text-center ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.yearBuilt}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {comp.squareFootage.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {formatCurrency(comp.listPrice)}
                      </TableCell>
                      <TableCell
                        className={`text-center font-semibold ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {formatCurrency(comp.salePrice)}
                      </TableCell>
                      <TableCell
                        className={`text-center ${
                          !comp.included ? 'line-through' : ''
                        }`}
                      >
                        {new Date(comp.closeDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(comp)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Averages Display */}
        {averages && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Avg {compType === 'SALE' ? 'Sale' : 'Rent'} Price
              </div>
              <div className="text-2xl font-bold">
                ${averages.avgPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Avg Price / Sq Ft
              </div>
              <div className="text-2xl font-bold">
                ${averages.avgPricePerSqFt.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          {selectedComparable && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl pr-8">
                  {selectedComparable.address}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 overflow-hidden">
                {/* Images Carousel */}
                {selectedComparable.images &&
                  selectedComparable.images.length > 0 && (
                    <div className="w-full">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {selectedComparable.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                                <Image
                                  src={image.url}
                                  alt={
                                    image.description ||
                                    `Property image ${index + 1}`
                                  }
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 1000px"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-0" />
                        <CarouselNext className="right-0" />
                      </Carousel>
                    </div>
                  )}

                {/* Property Details - Pills style */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {selectedComparable.bedrooms}
                    </span>
                    <span className="text-muted-foreground">beds</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {parseFloat(selectedComparable.bathrooms)}
                    </span>
                    <span className="text-muted-foreground">baths</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {selectedComparable.squareFootage.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">sqft</span>
                  </div>
                  {selectedComparable.lotSize && (
                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                      <span className="font-medium">
                        {Number(selectedComparable.lotSize).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">lot sqft</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="text-muted-foreground">Built</span>
                    <span className="font-medium">
                      {selectedComparable.yearBuilt}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {selectedComparable.garageSpaces}
                    </span>
                    <span className="text-muted-foreground">garage</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                    <span className="font-medium">
                      {selectedComparable.daysOnMarket}
                    </span>
                    <span className="text-muted-foreground">DOM</span>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      List Price
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedComparable.listPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Sale Price
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedComparable.salePrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Close Date
                    </div>
                    <div className="text-2xl font-bold">
                      {new Date(
                        selectedComparable.closeDate,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      selectedComparable.included ? 'default' : 'secondary'
                    }
                  >
                    {selectedComparable.included
                      ? 'Included in Analysis'
                      : 'Excluded'}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleToggleInclude(
                        selectedComparable.id,
                        selectedComparable.included,
                      );
                      setSelectedComparable({
                        ...selectedComparable,
                        included: !selectedComparable.included,
                      });
                    }}
                  >
                    {selectedComparable.included
                      ? 'Exclude from Analysis'
                      : 'Include in Analysis'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
