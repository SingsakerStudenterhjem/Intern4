import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import RegiApprovalDetailCard from '../../components/regi/WorkManager/RegiApprovalDetailCard';
import {
  approveRegiLog,
  commentRegiLog,
  getPendingRegiApprovals,
  PendingRegiApproval,
  rejectRegiLog,
} from '../../../server/dao/regiDAO';

const WorkApprovalReviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [queue, setQueue] = useState<PendingRegiApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPendingRegiApprovals();
        if (mounted) setQueue(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError('Kunne ikke laste godkjenninger.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentIndex = useMemo(() => {
    if (!id) return 0;
    const idx = queue.findIndex((a) => a.id === id);
    return idx === -1 ? 0 : idx;
  }, [queue, id]);

  const current = queue[currentIndex];

  const goToIndex = (index: number) => {
    const next = queue[index];
    if (next) {
      navigate(ROUTES.REGIGODKJENNING_REVIEW.replace(':id', next.id), { replace: true });
    } else {
      navigate(ROUTES.REGISJEF);
    }
  };

  const handleApprove = async (assignmentId: string) => {
    if (!user) return;
    try {
      setProcessingId(assignmentId);
      await approveRegiLog(assignmentId, user.id);
      const remaining = queue.filter((a) => a.id !== assignmentId);
      setQueue(remaining);
      goToIndex(currentIndex >= remaining.length ? remaining.length - 1 : currentIndex);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke godkjenne.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    try {
      setProcessingId(assignmentId);
      await rejectRegiLog(assignmentId);
      const remaining = queue.filter((a) => a.id !== assignmentId);
      setQueue(remaining);
      goToIndex(currentIndex >= remaining.length ? remaining.length - 1 : currentIndex);
    } catch (e) {
      console.error(e);
      setError('Kunne ikke avvise.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComment = async (assignmentId: string, comment: string): Promise<void> => {
    try {
      setProcessingId(assignmentId);
      await commentRegiLog(assignmentId, comment);
    } catch (e) {
      console.log(e);
      setError('Kunne ikke kommentere.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-4">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-navy-600 uppercase">Regisjef</p>
            <Link
              to={ROUTES.REGISJEF}
              className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Tilbake til liste
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gjennomgang av regi</h1>
          {!loading && queue.length > 0 && (
            <p className="text-gray-600">
              {currentIndex + 1} av {queue.length} ventende registreringer
            </p>
          )}
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && <div className="text-gray-600">Laster...</div>}

        {!loading && queue.length === 0 && (
          <div className="p-6 bg-white border border-gray-200 rounded-sm shadow-sm text-center">
            <p className="text-gray-700 font-medium">
              Ferdig — ingen flere ventende registreringer.
            </p>
            <Link
              to={ROUTES.REGISJEF}
              className="inline-flex items-center mt-3 text-sm font-medium text-navy-600 hover:text-navy-700"
            >
              Tilbake til liste
            </Link>
          </div>
        )}

        {!loading && current && (
          <RegiApprovalDetailCard
            approval={current}
            onApprove={handleApprove}
            onReject={handleReject}
            onComment={handleComment}
            isProcessing={processingId === current.id}
          />
        )}
      </div>
    </div>
  );
};

export default WorkApprovalReviewPage;
