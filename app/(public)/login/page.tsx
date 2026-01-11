import LoginForm from './LoginForm';

export default async function LoginPage() {
  return (
    <div className='flex h-[calc(100vh-4rem)] w-full items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Heading */}
        <h1 className='mb-2 text-center text-3xl font-bold'>Welcome Back!</h1>

        {/* Subtitle */}
        <p className='text-muted-foreground mb-8 text-center'>
          Login to your account to continue
        </p>

        {/* Form */}
        <LoginForm />
      </div>
    </div>
  );
}
