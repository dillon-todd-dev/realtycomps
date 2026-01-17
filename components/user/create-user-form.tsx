'use client';

import { createUserByAdmin } from '@/actions/users';
import { useActionState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, User, Shield } from 'lucide-react';

export default function CreateUserForm() {
  const router = useRouter();
  const [state, action, isLoading] = useActionState(
    createUserByAdmin,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push('/dashboard/users');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Invite a New User</h2>
        <p className="text-muted-foreground mt-2">
          They&apos;ll receive an email invitation to set up their account
        </p>
      </div>

      <form action={action} className="space-y-6">
        {/* Email */}
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
              placeholder="user@example.com"
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* First and Last Name */}
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
              placeholder="Doe"
              className="h-11"
            />
          </div>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Role
          </Label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Select name="role" defaultValue="ROLE_USER">
              <SelectTrigger className="pl-10 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROLE_USER">User</SelectItem>
                <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Admins can manage users and access all system settings
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <SubmitButton
            text="Send Invitation"
            isLoading={isLoading}
            styles="w-full h-11"
          />
        </div>
      </form>
    </div>
  );
}
