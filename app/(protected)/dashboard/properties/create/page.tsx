import { requireUser } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CreatePropertyForm from '@/components/property/create-property-form';
import PageHeader from '@/components/page-header';

export default async function AddPropertyPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        title="Add Property"
        description="Create a new property listing"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/properties">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        }
      />
      <div className="flex justify-center px-4 md:px-6 py-8 md:py-12">
        <CreatePropertyForm />
      </div>
    </>
  );
}
