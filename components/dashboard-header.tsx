'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {title && (
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-medium">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              {description}
            </p>
          )}
        </div>
      )}

      {action && <div className="ml-auto">{action}</div>}
    </header>
  );
}
