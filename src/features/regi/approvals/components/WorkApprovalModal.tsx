import React, { useState } from 'react';
import { Ban, Calendar, Check, Clock, User, X } from 'lucide-react';
import { PendingRegiApproval } from '../../../../shared/types/regi';
import { formatDateTime } from '../../../../shared/utils/date';
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
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Godkjenn regi</h2>
            <p className="text-sm text-gray-600">
              {approval.sourceType === 'task' ? 'Oppgave' : 'Manuell registrering'} •{' '}
              {approval.category}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span className="font-medium">Beboer</span>
              </div>
              <div className="mt-2 text-sm text-gray-900">
                <div className="font-medium">{approval.userName}</div>
                {approval.userEmail && <div className="text-gray-600">{approval.userEmail}</div>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Timer</span>
                <span className="text-gray-900">{approval.hours.toFixed(2)} t</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Registrert</span>
                <span className="text-gray-900">{formatDateTime(approval.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Tittel</div>
            <div className="text-sm text-gray-800">{approval.title || '-'}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Beskrivelse</div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {approval.description || 'Ingen beskrivelse.'}
            </div>
          </div>

          <ImagePreviewGrid paths={approval.imagePaths} title="Bilder" />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {mode === 'idle' && (
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Lukk
              </button>
              <div className="flex space-x-3">
                <button
                  disabled={isProcessing}
                  onClick={() => setMode('reject')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Avvis
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setMode('approve')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Godkjenn
                </button>
              </div>
            </div>
          )}

          {mode === 'approve' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Godkjenn denne registreringen?</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kommentar (valgfritt)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="F.eks. 'OK, ser bra ut.'"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('idle')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  disabled={isProcessing}
                  onClick={confirmApprove}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Godkjenn
                </button>
              </div>
            </div>
          )}

          {mode === 'reject' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Avvis denne registreringen?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('idle')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  disabled={isProcessing}
                  onClick={confirmReject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
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
