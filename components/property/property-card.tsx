import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Home, MapPin } from 'lucide-react';
import { PropertyWithImages } from '@/lib/types';

export default function PropertyCard({
  property,
}: {
  property: PropertyWithImages;
}) {
  const parseDecimal = (value: string | null) => {
    if (!value) return null;
    return parseFloat(value);
  };

  const price = parseDecimal(property.currentPrice);
  const bathrooms = parseDecimal(property.bathrooms);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden p-0 gap-0">
      <Link href={`/dashboard/properties/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0].url}
              alt={property.images[0].alt || 'Property image'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Price badge */}
          {price && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs sm:text-sm font-semibold">
                ${price.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          {property.address && (
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="text-sm line-clamp-2 sm:line-clamp-1">
                {property.address}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            {property.bedrooms && bathrooms ? (
              <span>
                {property.bedrooms} bed &bull; {bathrooms} bath
              </span>
            ) : (
              <span />
            )}

            {property.livingArea && (
              <span>{property.livingArea.toLocaleString()} sqft</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
