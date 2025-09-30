import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SubmitButton({
  text,
  isLoading,
}: {
  text: string;
  isLoading: boolean;
}) {
  return (
    <Button className='w-full' type='submit' disabled={isLoading}>
      {isLoading ? <Loader2 className='size-4 animate-spin' /> : text}
    </Button>
  );
}
