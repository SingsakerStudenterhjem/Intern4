import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export const PageHeader = ({ title, actions, children }: PageHeaderProps) => (
  <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {children}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
);
