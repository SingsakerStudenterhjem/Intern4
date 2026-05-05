import type { ReactNode } from 'react';

type StatusMessageProps = {
  tone?: 'info' | 'success' | 'error';
  children: ReactNode;
};

const toneClasses = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export const StatusMessage = ({ tone = 'info', children }: StatusMessageProps) => (
  <div className={`rounded-md border p-3 text-sm ${toneClasses[tone]}`}>{children}</div>
);
