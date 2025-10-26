import SetPasswordForm from '@/components/set-password-form';
import { db } from '@/db/drizzle';
import { userInvitationsTable } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export default async function SetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const invitation = await db.query.userInvitationsTable.findFirst({
    where: and(
      eq(userInvitationsTable.token, params.token),
      eq(userInvitationsTable.used, false),
      gt(userInvitationsTable.expiresAt, new Date()),
    ),
    with: { user: true },
  });

  if (!invitation) {
    notFound();
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
        <div>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            Welcome to RealtyComps
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Please set your password to activate your account
          </p>
          <p className='mt-1 text-center text-sm text-gray-500'>
            {invitation.user?.email}
          </p>
        </div>

        <SetPasswordForm token={params.token} />
      </div>
    </div>
  );
}
