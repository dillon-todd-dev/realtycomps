'use client';

import { updateProfile } from '@/actions/settings';
import { useActionState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

type ProfileFormProps = {
  user: UserType;
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, action, isLoading] = useActionState(updateProfile, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="firstName"
              id="firstName"
              required
              defaultValue={user.firstName}
              placeholder="John"
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <Input
            type="text"
            name="lastName"
            id="lastName"
            required
            defaultValue={user.lastName}
            placeholder="Doe"
            className="h-11"
          />
        </div>
      </div>

      <SubmitButton
        text="Save Changes"
        isLoading={isLoading}
        styles="w-full h-11"
      />
    </form>
  );
}
