import React from 'react';
import { cn } from '../../utils/cn';

interface AdminPageHeaderProps {
  moduleName?: React.ReactNode;
  pageName: React.ReactNode;
  pageDescription?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  moduleName,
  pageName,
  pageDescription,
  action,
  className
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", className)}>
      <div>
        {moduleName && (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
            {moduleName}
          </p>
        )}
        <h1 className="mt-2 text-[34px] font-bold tracking-[-0.04em] text-coffee leading-[1.1]">
          {pageName}
        </h1>
        {pageDescription && (
          <p className="mt-2 max-w-3xl text-sm text-muted font-body">
            {pageDescription}
          </p>
        )}
      </div>
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
