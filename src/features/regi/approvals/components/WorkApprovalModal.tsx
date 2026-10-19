import React, { useState } from 'react';
import { Ban, Calendar, Check, Clock, User, X } from 'lucide-react';
import { PendingRegiApproval } from '../../../../shared/types/regi';
import { formatDate, formatDateTime } from '../../../../shared/utils/date';
import { ImagePreviewGrid } from '../../../../shared/components';

interface WorkApprovalModalProps {
  approval: PendingRegiApproval | null;
  onClose: () => void;
  onApprove: (assignmentId: string, approvalComment?: string) => Promise<void>;
  onReject: (assignmentId: string) => Promise<void>;
  isProcessing?: boolean;
}

const WorkApprovalModal: React.FC<WorkApprovalModalProps> = ({
  approval,
  onClose,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [approvalComment, setApprovalComment] = useState<string>('');

  if (!approval) return null;

  const confirmApprove = async () => {
    await onApprove(approval.id, approvalComment);
    onClose();
  };

  const confirmReject = async () => {
    await onReject(approval.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-fg">Godkjenn regi</h2>
            <p className="text-sm text-muted">
              {approval.sourceType === 'task' ? 'Oppgave' : 'Manuell registrering'} •{' '}
              {approval.category}
            </p>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-muted">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-muted rounded-md p-4">
              <div className="flex items-center space-x-2 text-sm text-muted">
                <User className="w-4 h-4" />
                <span className="font-medium">Beboer</span>
              </div>
              <div className="mt-2 text-sm text-fg">
                <div className="font-medium">{approval.userName}</div>
                {approval.userEmail && <div className="text-muted">{approval.userEmail}</div>}
              </div>
            </div>

            <div className="bg-surface-muted rounded-md p-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Timer</span>
                <span className="text-fg">{approval.hours.toFixed(2)} t</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Utført</span>
                <span className="text-fg">{formatDate(approval.date)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Registrert</span>
                <span className="text-fg">{formatDateTime(approval.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-fg">Tittel</div>
            <div className="text-sm text-fg">{approval.title || '-'}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-fg">Beskrivelse</div>
            <div className="text-sm text-fg whitespace-pre-wrap">
              {approval.description || 'Ingen beskrivelse.'}
            </div>
          </div>

          <ImagePreviewGrid paths={approval.imagePaths} title="Bilder" />
        </div>

        <div className="px-6 py-4 bg-surface-muted border-t border-border rounded-b-lg">
          {mode === 'idle' && (
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted"
              >
                Lukk
              </button>
              <div className="flex space-x-3">
                <button
                  disabled={isProcessing}
                  onClick={() => setMode('reject')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-danger-fg bg-danger rounded-md hover:bg-danger-hover disabled:opacity-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Avvis
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setMode('approve')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-success-fg bg-success rounded-md hover:bg-success/90 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Godkjenn
                </button>
              </div>
            </div>
          )}

          {mode === 'approve' && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Godkjenn denne registreringen?</p>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">
                  Kommentar (valgfritt)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                  className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="F.eks. 'OK, ser bra ut.'"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('idle')}
                  className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted"
                >
                  Avbryt
                </button>
                <button
                  disabled={isProcessing}
                  onClick={confirmApprove}
                  className="px-4 py-2 text-sm font-medium text-success-fg bg-success rounded-md hover:bg-success/90 disabled:opacity-50"
                >
                  Godkjenn
                </button>
              </div>
            </div>
          )}

          {mode === 'reject' && (
            <div className="space-y-3">
              <p className="text-sm text-muted">Avvis denne registreringen?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('idle')}
                  className="px-4 py-2 text-sm font-medium text-muted bg-surface border border-input rounded-md hover:bg-surface-muted"
                >
                  Avbryt
                </button>
                <button
                  disabled={isProcessing}
                  onClick={confirmReject}
                  className="px-4 py-2 text-sm font-medium text-danger-fg bg-danger rounded-md hover:bg-danger-hover disabled:opacity-50"
                >
                  Avvis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkApprovalModal;
