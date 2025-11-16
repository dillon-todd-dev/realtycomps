'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { searchSaleComparables, toggleComparable } from '@/actions/comparables';
import { toast } from 'sonner';

type Comparable = {
  id: string;
  evaluationId: string;
  address: string;
  subdivision: string;
  bedrooms: number;
  bathrooms: string;
  garageSpaces: number;
  yearBuilt: number;
  squareFootage: number;
  listPrice: string;
  salePrice: string;
  closeDate: Date;
  daysOnMarket: number;
  type: 'SALE' | 'RENT';
  included: boolean;
};

interface ComparablesProps {
  evaluationId: string;
  propertyAddress: string;
  initialComparables?: Comparable[];
}

export default function Comparables({
  evaluationId,
  initialComparables = [],
  propertyAddress,
}: ComparablesProps) {
  const [comparables, setComparables] =
    useState<Comparable[]>(initialComparables);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(initialComparables.length > 0);

  async function handleSearch(formData: FormData) {
    startTransition(async () => {
      try {
        const results = await searchSaleComparables({
          evaluationId,
          address: propertyAddress,
          maxRadius: Number(formData.get('maxRadius')),
          minBeds: Number(formData.get('minBeds')) || undefined,
          maxBeds: Number(formData.get('maxBeds')) || undefined,
          minBaths: Number(formData.get('minBaths')) || undefined,
          maxBaths: Number(formData.get('maxBaths')) || undefined,
          minSquareFootage:
            Number(formData.get('minSquareFootage')) || undefined,
          maxSquareFootage:
            Number(formData.get('maxSquareFootage')) || undefined,
          daysOld: Number(formData.get('daysOld')) || 365,
          type: formData.get('type') as 'SALE' | 'RENT',
        });

        setComparables(results);
        setHasSearched(true);
        toast.success(`Found ${results.length} comparable properties`);
      } catch (error) {
        console.error('Failed to search comparables:', error);
        toast.error('Failed to search for comparables');
      }
    });
  }

  async function handleToggleInclude(
    comparableId: string,
    currentState: boolean
  ) {
    // Optimistic update
    setComparables((prev) =>
      prev.map((comp) =>
        comp.id === comparableId ? { ...comp, included: !currentState } : comp
      )
    );

    try {
      await toggleComparable(comparableId, !currentState);
    } catch (error) {
      // Revert on error
      setComparables((prev) =>
        prev.map((comp) =>
          comp.id === comparableId ? { ...comp, included: currentState } : comp
        )
      );
      toast.error('Failed to update comparable');
    }
  }

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparable Properties</CardTitle>
        <p className='text-sm text-muted-foreground mt-1'>
          Search for similar properties to analyze market values
        </p>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Search Form */}
        <form action={handleSearch} className='space-y-4'>
          {/* First Row: Radius, Min/Max Beds, Min/Max Baths */}
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='maxRadius'>Max Radius (miles)</Label>
              <Input
                id='maxRadius'
                name='maxRadius'
                type='number'
                step='0.1'
                defaultValue='5'
                placeholder='5'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='minBeds'>Min Beds</Label>
              <Input
                id='minBeds'
                name='minBeds'
                type='number'
                placeholder='Any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='maxBeds'>Max Beds</Label>
              <Input
                id='maxBeds'
                name='maxBeds'
                type='number'
                placeholder='Any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='minBaths'>Min Baths</Label>
              <Input
                id='minBaths'
                name='minBaths'
                type='number'
                step='0.5'
                placeholder='Any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='maxBaths'>Max Baths</Label>
              <Input
                id='maxBaths'
                name='maxBaths'
                type='number'
                step='0.5'
                placeholder='Any'
              />
            </div>
          </div>

          {/* Second Row: Min/Max Sq Ft, Days Old, Type */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='minSquareFootage'>Min Sq Ft</Label>
              <Input
                id='minSquareFootage'
                name='minSquareFootage'
                type='number'
                placeholder='Any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='maxSquareFootage'>Max Sq Ft</Label>
              <Input
                id='maxSquareFootage'
                name='maxSquareFootage'
                type='number'
                placeholder='Any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='daysOld'>Max Days Old</Label>
              <Input
                id='daysOld'
                name='daysOld'
                type='number'
                defaultValue='365'
                placeholder='365'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Type</Label>
              <select
                id='type'
                name='type'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                defaultValue='SALE'
              >
                <option value='SALE'>Sales</option>
                <option value='RENT'>Rentals</option>
              </select>
            </div>
          </div>

          <Button type='submit' disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Searching...
              </>
            ) : (
              <>
                <Search className='mr-2 h-4 w-4' />
                Search Comparables
              </>
            )}
          </Button>
        </form>

        {/* Results Table */}
        {hasSearched && (
          <>
            <div className='flex items-center justify-between border-t pt-4'>
              <div>
                <h3 className='text-sm font-semibold'>
                  {comparables.length} Comparables Found
                </h3>
                <p className='text-xs text-muted-foreground mt-1'>
                  {comparables.filter((c) => c.included).length} included in
                  analysis
                </p>
              </div>
            </div>

            {comparables.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No comparable properties found. Try adjusting your search
                criteria.
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>Include</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Subdivision</TableHead>
                        <TableHead className='text-center'>Beds</TableHead>
                        <TableHead className='text-center'>Baths</TableHead>
                        <TableHead className='text-center'>Garage</TableHead>
                        <TableHead className='text-center'>Built</TableHead>
                        <TableHead className='text-right'>Sq Ft</TableHead>
                        <TableHead className='text-center'>Listed</TableHead>
                        <TableHead className='text-center'>Sold</TableHead>
                        <TableHead className='text-center'>
                          Close Date
                        </TableHead>
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
                            <div className='whitespace-nowrap'>
                              {comp.address}
                            </div>
                          </TableCell>
                          <TableCell
                            className={!comp.included ? 'line-through' : ''}
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
                            className={`text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.garageSpaces || '—'}
                          </TableCell>
                          <TableCell
                            className={`text-center ${
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
                            className={`text-center font-semibold ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.closeDate.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
