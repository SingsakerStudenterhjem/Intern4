import React, { useEffect, useState } from 'react';
import { Ban, Calendar, Check, Clock, User, MessageCircle } from 'lucide-react';
import { PendingRegiApproval } from '../../../../server/dao/regiDAO';

interface RegiApprovalDetailCardProps {
  approval: PendingRegiApproval;
  onApprove: (assignmentId: string) => Promise<void>;
  onReject: (assignmentId: string) => Promise<void>;
  onComment: (assignmentId: string, comment: string) => Promise<void>;
  isProcessing?: boolean;
}

const RegiApprovalDetailCard: React.FC<RegiApprovalDetailCardProps> = ({
  approval,
  onApprove,
  onReject,
  onComment,
  isProcessing = false,
}) => {
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject' | 'comment'>('idle');
  const [comment, setComment] = useState<string>('');

  useEffect(() => {
    setMode('idle');
    setComment('');
  }, [approval.id]);

  const formatDateTime = (value: any) => {
    if (!value) return '-';
    if (value?.seconds) return new Date(value.seconds * 1000).toLocaleString('no-NO');
    if (typeof value === 'string') return new Date(value).toLocaleString('no-NO');
    if (value instanceof Date) return value.toLocaleString('no-NO');
    return '-';
  };

  const confirmApprove = async () => {
    await onApprove(approval.id);
  };

  const confirmReject = async () => {
    await onReject(approval.id);
  };

  const confirmComment = async () => {
    await onComment(approval.id, comment);
    setComment('');
    setMode('idle');
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Godkjenn regi</h2>
        <p className="text-sm text-gray-600">{approval.category}</p>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-sm p-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span className="font-medium">Beboer</span>
            </div>
            <div className="mt-2 text-sm text-gray-900">
              <div className="font-medium">{approval.userName}</div>
              {approval.userEmail && <div className="text-gray-600">{approval.userEmail}</div>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-sm p-4 space-y-2">
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
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-sm">
        {mode === 'idle' && (
          <div className="flex justify-end space-x-3">
            <button
              disabled={isProcessing}
              onClick={() => setMode('approve')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-sm hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Godkjenn
            </button>
            <button
              disabled={isProcessing}
              onClick={() => setMode('reject')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-sm hover:bg-red-700 disabled:opacity-50"
            >
              <Ban className="w-4 h-4 mr-2" />
              Avvis
            </button>
            <button
              disabled={isProcessing}
              onClick={() => setMode('comment')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Kommenter
            </button>
          </div>
        )}

        {mode === 'approve' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Godkjenn denne registreringen?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMode('idle')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                disabled={isProcessing}
                onClick={confirmApprove}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-sm hover:bg-green-700 disabled:opacity-50"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                disabled={isProcessing}
                onClick={confirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-sm hover:bg-red-700 disabled:opacity-50"
              >
                Avvis
              </button>
            </div>
          </div>
        )}
        {mode == 'comment' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Avvis denne registreringen?</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kommenter</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="F.eks. 'OK, ser bra ut.'"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMode('idle')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                disabled={isProcessing}
                onClick={confirmComment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Kommenter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegiApprovalDetailCard;
