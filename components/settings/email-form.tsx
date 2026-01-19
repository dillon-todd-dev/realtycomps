'use client';

import { updateEmail } from '@/actions/settings';
import { useActionState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import type { User } from '@/lib/types';

type EmailFormProps = {
  user: User;
};

export default function EmailForm({ user }: EmailFormProps) {
  const [state, action, isLoading] = useActionState(updateEmail, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            name="email"
            id="email"
            required
            defaultValue={user.email}
            placeholder="user@example.com"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <SubmitButton
        text="Update Email"
        isLoading={isLoading}
        styles="w-full h-11"
      />
    </form>
  );
}
