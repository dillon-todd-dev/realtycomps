'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/select-input';
import { PropertyWithImages } from '@/lib/types';
import { updateProperty } from '@/actions/properties';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface EditPropertyModalProps {
  property: PropertyWithImages;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPropertyModal({
  property,
  open,
  onOpenChange,
}: EditPropertyModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    postalCode: property.postalCode || '',
    subdivision: property.subdivision || '',
    bedrooms: property.bedrooms?.toString() || '',
    bathrooms: property.bathrooms || '',
    livingArea: property.livingArea?.toString() || '',
    yearBuilt: property.yearBuilt?.toString() || '',
    lotSize: property.lotSize || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProperty(property.id, {
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        subdivision: formData.subdivision || undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms || null,
        livingArea: formData.livingArea ? parseInt(formData.livingArea) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        lotSize: formData.lotSize || null,
      });

      toast.success('Property updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update property',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <SelectInput
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-2">
                  <Label htmlFor="city">City</Label>
                  <SelectInput
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Houston"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <SelectInput
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="TX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Zip Code</Label>
                  <SelectInput
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="77001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdivision">Subdivision</Label>
                <SelectInput
                  type="text"
                  id="subdivision"
                  value={formData.subdivision}
                  onChange={(e) => handleChange('subdivision', e.target.value)}
                  placeholder="Oak Hills"
                />
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Property Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <SelectInput
                  type="number"
                  id="bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <SelectInput
                  type="number"
                  id="bathrooms"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                  placeholder="2.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="livingArea">Square Footage</Label>
                <SelectInput
                  type="number"
                  id="livingArea"
                  value={formData.livingArea}
                  onChange={(e) => handleChange('livingArea', e.target.value)}
                  placeholder="1800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <SelectInput
                  type="number"
                  id="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={(e) => handleChange('yearBuilt', e.target.value)}
                  placeholder="1995"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-2">
                <Label htmlFor="lotSize">Lot Size (sq ft)</Label>
                <SelectInput
                  type="number"
                  id="lotSize"
                  value={formData.lotSize}
                  onChange={(e) => handleChange('lotSize', e.target.value)}
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
