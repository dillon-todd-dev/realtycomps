'use client';

import { changePassword } from '@/actions/settings';
import { useActionState, useEffect, useRef } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

export default function PasswordForm() {
  const [state, action, isLoading] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-sm font-medium">
          Current Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            name="currentPassword"
            id="currentPassword"
            required
            placeholder="Enter current password"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm font-medium">
          New Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            name="newPassword"
            id="newPassword"
            required
            minLength={8}
            placeholder="Enter new password"
            className="pl-10 h-11"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm New Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            required
            minLength={8}
            placeholder="Confirm new password"
            className="pl-10 h-11"
          />
        </div>
      </div>

      <SubmitButton
        text="Change Password"
        isLoading={isLoading}
        styles="w-full h-11"
      />
    </form>
  );
}
