export default function DashboardHeader({ name }: { name: string }) {
  return (
    <header className='mb-5 flex flex-col items-start justify-between gap-5 sm:mb-10 lg:flex-row lg:items-end'>
      <div>
        <h2 className='text-dark-400 text-2xl font-semibold'>{name}</h2>
        <p className='text-base text-slate-500'>
          Manage all of your properties and evaluations here
        </p>
      </div>
    </header>
  );
}
