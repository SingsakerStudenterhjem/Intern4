import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  children?: ReactNode;
};

export const EmptyState = ({ title, children }: EmptyStateProps) => (
  <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
    <p className="font-medium text-gray-900">{title}</p>
    {children && <div className="mt-1 text-gray-600">{children}</div>}
  </div>
);
