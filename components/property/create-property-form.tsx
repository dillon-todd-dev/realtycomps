'use client';

import { useActionState, useEffect, useState } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { createPropertyAction } from '@/actions/properties';
import { useRouter } from 'next/navigation';
import AutocompleteInput from '../autocomplete-input';
import { useDebounce } from '@/hooks/use-debounce';
import { autocomplete, getPlaceDetails } from '@/lib/google';
import { SelectInput } from '../select-input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search } from 'lucide-react';

interface FormData {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface ManualFormData {
  bedrooms: string;
  bathrooms: string;
  livingArea: string;
  yearBuilt: string;
  lotSize: string;
}

export default function CreatePropertyForm() {
  const router = useRouter();
  const [state, action, isLoading] = useActionState(
    createPropertyAction,
    undefined,
  );
  const [placeQueryTrigger, setPlaceQueryTrigger] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [suggestions, setSuggestions] = useState<
    { value: string; label: string }[]
  >([]);
  const [formData, setFormData] = useState<FormData>({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: undefined,
    longitude: undefined,
  });
  const [manualFormData, setManualFormData] = useState<ManualFormData>({
    bedrooms: '',
    bathrooms: '',
    livingArea: '',
    yearBuilt: '',
    lotSize: '',
  });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue);

  useEffect(() => {
    if (debouncedSearchValue.length > 0) {
      const fetchSuggestions = async () => {
        try {
          const results = await autocomplete(debouncedSearchValue);
          setSuggestions(results);
        } catch (err) {
          console.error('Error fetching autocomplete suggestions:', err);
        }
      };
      fetchSuggestions();
    }
  }, [debouncedSearchValue]);

  useEffect(() => {
    if (selectedValue && placeQueryTrigger) {
      const fetchPlaceDetails = async () => {
        try {
          const res = await getPlaceDetails(selectedValue);
          setFormData(res);
        } catch (err) {
          console.error('Error fetching place details:', err);
        }
      };
      fetchPlaceDetails();
    }
  }, [selectedValue, placeQueryTrigger]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push('/dashboard/properties');
    } else if (state?.error) {
      toast.error(state.error);
    } else if (state?.notFound) {
      // Property not found in MLS - show manual entry form
      setShowManualEntry(true);
      if (state.addressData) {
        setFormData(state.addressData);
      }
    }
  }, [state, router]);

  const handleTryDifferentAddress = () => {
    setShowManualEntry(false);
    setFormData({ address: '', city: '', state: '', postalCode: '' });
    setManualFormData({
      bedrooms: '',
      bathrooms: '',
      livingArea: '',
      yearBuilt: '',
      lotSize: '',
    });
    setSearchValue('');
    setSelectedValue('');
  };

  return (
    <div className='w-full max-w-2xl'>
      {showManualEntry ? (
        // Manual Entry Form - keep in a card since it has more content
        <Card>
          <CardContent className='pt-6'>
            <div className='mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4'>
              <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600' />
              <div>
                <p className='font-medium text-amber-800'>
                  Property not found in MLS database
                </p>
                <p className='text-sm text-amber-700'>
                  Please enter the property details manually below.
                </p>
              </div>
            </div>

            <form action={action} className='space-y-6'>
              <input type='hidden' name='manualEntry' value='true' />
              <input
                type='hidden'
                name='latitude'
                value={formData.latitude}
              />
              <input
                type='hidden'
                name='longitude'
                value={formData.longitude}
              />

              {/* Address Fields (read-only display) */}
              <div className='rounded-lg border bg-muted/50 p-4'>
                <p className='mb-1 text-sm font-medium text-muted-foreground'>
                  Address
                </p>
                <p className='text-lg'>
                  {formData.address}, {formData.city}, {formData.state}{' '}
                  {formData.postalCode}
                </p>
                <input type='hidden' name='address' value={formData.address} />
                <input type='hidden' name='city' value={formData.city} />
                <input type='hidden' name='state' value={formData.state} />
                <input
                  type='hidden'
                  name='postalCode'
                  value={formData.postalCode}
                />
              </div>

              {/* Manual Entry Fields */}
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='bedrooms'>Bedrooms</Label>
                  <SelectInput
                    type='number'
                    name='bedrooms'
                    id='bedrooms'
                    placeholder='3'
                    value={manualFormData.bedrooms}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        bedrooms: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='bathrooms'>Bathrooms</Label>
                  <SelectInput
                    type='number'
                    name='bathrooms'
                    id='bathrooms'
                    placeholder='2.5'
                    step='0.5'
                    value={manualFormData.bathrooms}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        bathrooms: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='livingArea'>Square Footage</Label>
                  <SelectInput
                    type='number'
                    name='livingArea'
                    id='livingArea'
                    placeholder='1800'
                    value={manualFormData.livingArea}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        livingArea: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='yearBuilt'>Year Built</Label>
                  <SelectInput
                    type='number'
                    name='yearBuilt'
                    id='yearBuilt'
                    placeholder='1995'
                    value={manualFormData.yearBuilt}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        yearBuilt: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2 sm:col-span-2'>
                  <Label htmlFor='lotSize'>Lot Size (sq ft)</Label>
                  <SelectInput
                    type='number'
                    name='lotSize'
                    id='lotSize'
                    placeholder='5000'
                    value={manualFormData.lotSize}
                    onChange={(e) =>
                      setManualFormData((prev) => ({
                        ...prev,
                        lotSize: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className='flex flex-wrap gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleTryDifferentAddress}
                >
                  Try Different Address
                </Button>
                <SubmitButton text='Add Property' isLoading={isLoading} />
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        // Clean search-focused view
        <div className='space-y-8'>
          <div className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <Search className='h-6 w-6 text-primary' />
            </div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Add a Property
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Search for an address to get started
            </p>
          </div>

          <AutocompleteInput
            placeholder='Enter a property address...'
            items={suggestions ?? []}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            selectedValue={selectedValue}
            onSelectedValueChange={setSelectedValue}
            dataFetchOnSelectionChange={setPlaceQueryTrigger}
          />

          {formData.address && (
            <Card>
              <CardContent className='pt-6'>
                <form action={action} className='space-y-4'>
                  <input
                    type='hidden'
                    name='latitude'
                    value={formData.latitude}
                  />
                  <input
                    type='hidden'
                    name='longitude'
                    value={formData.longitude}
                  />
                  <input
                    type='hidden'
                    name='address'
                    value={formData.address}
                  />
                  <input type='hidden' name='city' value={formData.city} />
                  <input type='hidden' name='state' value={formData.state} />
                  <input
                    type='hidden'
                    name='postalCode'
                    value={formData.postalCode}
                  />

                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Selected Address
                    </p>
                    <p className='mt-1 text-lg font-medium'>
                      {formData.address}
                    </p>
                    <p className='text-muted-foreground'>
                      {formData.city}, {formData.state} {formData.postalCode}
                    </p>
                  </div>

                  <SubmitButton
                    text='Add Property'
                    isLoading={isLoading}
                    styles='w-full'
                  />
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
