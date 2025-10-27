interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className='flex h-14 items-center justify-between border-b bg-background px-6'>
      <div className='flex flex-col justify-center'>
        <h1 className='text-lg font-semibold text-foreground'>{title}</h1>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
