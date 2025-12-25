'use client';

import { useActionState, useEffect, useState } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPropertyAction } from '@/actions/properties';
import { useRouter } from 'next/navigation';
import AutocompleteInput from '../autocomplete-input';
import { useDebounce } from '@/hooks/use-debounce';
import { autocomplete, getPlaceDetails } from '@/lib/google';
import { SelectInput } from '../select-input';

interface FormData {
  address: string;
  city: string;
  state: string;
  postalCode: string;
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
  });
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
          console.log(res);
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
    }
  }, [state, router]);

  return (
    <div className='w-full max-w-4xl'>
      <Card>
        <CardHeader>
          <CardTitle>Property Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AutocompleteInput
            placeholder='Search...'
            items={suggestions ?? []}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            selectedValue={selectedValue}
            onSelectedValueChange={setSelectedValue}
            dataFetchOnSelectionChange={setPlaceQueryTrigger}
          />
          <div className='relative flex items-center my-6'>
            <div className='flex-grow border-t border-gray-300'></div>
            <span className='flex-shrink mx-4 text-gray-600'>or</span>
            <div className='flex-grow border-t border-gray-300'></div>
          </div>
          <form action={action} className=' space-y-8'>
            <div className='space-y-3'>
              <Label htmlFor='address' className='text-base font-medium'>
                Address
              </Label>
              <SelectInput
                type='text'
                name='address'
                id='address'
                required
                placeholder='123 Main Street'
                className='h-12 text-base'
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            <div className='space-y-3'>
              <Label htmlFor='city' className='text-base font-medium'>
                City
              </Label>
              <SelectInput
                type='text'
                name='city'
                id='city'
                required
                placeholder='Houston'
                className='h-12 text-base'
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>

            <div className='space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='space-y-3'>
                <Label htmlFor='state' className='text-base font-medium'>
                  State
                </Label>
                <SelectInput
                  type='text'
                  name='state'
                  id='state'
                  required
                  placeholder='TX'
                  className='h-12 text-base'
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='space-y-3 max-w-md'>
                <Label htmlFor='postalCode' className='text-base font-medium'>
                  Postal Code
                </Label>
                <SelectInput
                  type='text'
                  name='postalCode'
                  id='postalCode'
                  required
                  placeholder='77346'
                  className='h-12 text-base'
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className='pt-6'>
              <SubmitButton
                text='Add Property'
                isLoading={isLoading}
                styles='h-12 px-8 text-base min-w-48'
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
