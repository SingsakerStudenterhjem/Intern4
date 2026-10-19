import React from 'react';
import { PageLayout } from '../../../../shared/layouts';
import WorkApprovalList from '../components/WorkApprovalList';

const WorkApprovalsPage: React.FC = () => {
  return (
    <PageLayout title="Godkjenning" description="Godkjenn eller avvis innsendte regitimer.">
      <section className="bg-surface border border-border rounded-xl shadow-sm p-5">
        <WorkApprovalList />
      </section>
    </PageLayout>
  );
};

export default WorkApprovalsPage;
