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
      ? 'bg-green-100 text-green-800'
      : log.status === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">{log.title || 'Regioppføring'}</h2>
            <p className="text-sm text-gray-600">
              {log.sourceType === 'task' ? 'Oppgavebasert registrering' : 'Manuell registrering'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClassName}`}
            >
              {statusLabel}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-md bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Dato utført</span>
                <span className="text-gray-900">{formatDate(log.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Registrert</span>
                <span className="text-gray-900">{formatLogDateTime(log.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-3 rounded-md bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Timer</span>
                <span className="text-gray-900">{log.hours.toFixed(2)} t</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Type</span>
                <span className="text-gray-900">{log.type}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <FileText className="h-4 w-4" />
              Beskrivelse
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-800">
              {log.description || 'Ingen beskrivelse.'}
            </div>
          </div>

          <ImagePreviewGrid paths={log.imagePaths} title="Bilder" />

          {log.reviewerComment && (
            <div className="space-y-2 rounded-md border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                <MessageSquare className="h-4 w-4" />
                Kommentar fra regisjef
              </div>
              <div className="whitespace-pre-wrap text-sm text-blue-900">{log.reviewerComment}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkLogDetailsModal;
