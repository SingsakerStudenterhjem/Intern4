import React from 'react';
import { Calendar, Clock, FileText, MessageSquare, Tag, X } from 'lucide-react';
import { RegiLogWithId } from '../../../../shared/types/regi';
import { ImagePreviewGrid } from '../../../../shared/components';
import { formatDate } from '../../../../shared/utils/date';

type WorkLogDetailsModalProps = {
  log: RegiLogWithId | null;
  onClose: () => void;
};

const formatLogDateTime = (value: RegiLogWithId['date'] | RegiLogWithId['createdAt']) =>
  value.toLocaleString('no-NO');

const WorkLogDetailsModal: React.FC<WorkLogDetailsModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const statusLabel =
    log.status === 'approved' ? 'Godkjent' : log.status === 'rejected' ? 'Avvist' : 'Venter';
  const statusClassName =
    log.status === 'approved'
      ? 'bg-success-subtle text-success-subtle-fg'
      : log.status === 'rejected'
        ? 'bg-danger-subtle text-danger-subtle-fg'
        : 'bg-warning-subtle text-warning-subtle-fg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-fg">{log.title || 'Regioppføring'}</h2>
            <p className="text-sm text-muted">
              {log.sourceType === 'task' ? 'Oppgavebasert registrering' : 'Manuell registrering'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClassName}`}
            >
              {statusLabel}
            </span>
            <button onClick={onClose} className="text-subtle hover:text-muted">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-md bg-surface-muted p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Dato utført</span>
                <span className="text-fg">{formatDate(log.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Registrert</span>
                <span className="text-fg">{formatLogDateTime(log.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-3 rounded-md bg-surface-muted p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Timer</span>
                <span className="text-fg">{log.hours.toFixed(2)} t</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Type</span>
                <span className="text-fg">{log.type}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-fg">
              <FileText className="h-4 w-4" />
              Beskrivelse
            </div>
            <div className="whitespace-pre-wrap text-sm text-fg">
              {log.description || 'Ingen beskrivelse.'}
            </div>
          </div>

          <ImagePreviewGrid paths={log.imagePaths} title="Bilder" />

          {log.reviewerComment && (
            <div className="space-y-2 rounded-md border border-primary/25 bg-primary-subtle p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-subtle-fg">
                <MessageSquare className="h-4 w-4" />
                Kommentar fra regisjef
              </div>
              <div className="whitespace-pre-wrap text-sm text-primary-subtle-fg">
                {log.reviewerComment}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkLogDetailsModal;
