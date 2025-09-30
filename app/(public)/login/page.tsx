import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className='flex h-screen w-full items-center justify-center px-10'>
      <Card className='w-full max-w-xl'>
        <CardHeader>
          <CardTitle className='text-center text-2xl'>Welcome Back!</CardTitle>
          <CardDescription className='text-md text-center'>
            Login to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
