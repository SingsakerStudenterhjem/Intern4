import React from 'react';
import { PageLayout } from '../../../../shared/components';
import WorkApprovalList from '../components/WorkApprovalList';

const WorkApprovalsPage: React.FC = () => {
  return (
    <PageLayout title="Godkjenning" description="Godkjenn eller avvis innsendte regitimer.">
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <WorkApprovalList />
      </section>
    </PageLayout>
  );
};

export default WorkApprovalsPage;
