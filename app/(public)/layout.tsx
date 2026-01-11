import { PublicNavbar } from '@/components/public-navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar />
      <div className='pt-16'>{children}</div>
    </>
  );
}
