import type { ReactNode } from 'react';

type ConfirmDialogProps = {
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  title,
  confirmLabel,
  cancelLabel = 'Avbryt',
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    {children && <div className="mt-2 text-sm text-gray-700">{children}</div>}
    <div className="mt-4 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-md border px-3 py-2 text-sm">
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);
