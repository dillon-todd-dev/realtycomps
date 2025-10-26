import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoginForm from './LoginForm';

export default async function LoginPage() {
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
