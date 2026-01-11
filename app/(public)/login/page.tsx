import LoginForm from './LoginForm';

export default async function LoginPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        {/* Heading */}
        <h1 className='mb-2 text-center text-2xl font-bold sm:text-3xl'>Welcome Back!</h1>

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
