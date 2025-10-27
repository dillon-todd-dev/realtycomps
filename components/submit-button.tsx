import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SubmitButton({
  text,
  isLoading,
  styles,
}: {
  text: string;
  isLoading: boolean;
  styles?: string;
}) {
  return (
    <Button className={cn('w-full', styles)} type='submit' disabled={isLoading}>
      {isLoading ? <Loader2 className='size-4 animate-spin' /> : text}
    </Button>
  );
}
