import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WorkApprovalList from '../approvals/components/WorkApprovalList';
import Registatus from '../status/components/Registatus';
import GrantRegiForm from '../granting/components/GrantRegiForm';
import RegiLogsPanel from '../logs/components/RegiLogsPanel';
import { useWorkApprovals } from '../approvals/hooks/useWorkApprovals';
import { useAuth } from '../../../app/providers/AuthContext';
import { getCategories } from '../../../server/dao/categoriesDAO';
import { REGI_PATHS } from '../paths';
import { PageLayout } from '../../../shared/layouts';
import { Card, SectionTabs } from '../../../shared/components';

const TABS = [
  { key: 'godkjenning', label: 'Godkjenning', path: REGI_PATHS.REGIGODKJENNING },
  { key: 'registatus', label: 'Registatus', path: REGI_PATHS.REGISTATUS },
  { key: 'gi-regi', label: 'Gi regi', path: REGI_PATHS.GI_REGI },
  { key: 'logg', label: 'Logg', path: REGI_PATHS.REGILOGS },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const WorkManagerPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const approvals = useWorkApprovals(user, authLoading);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  // /regisjef itself shows the first tab.
  const activeTab: TabKey = TABS.find((tab) => tab.path === pathname)?.key ?? 'godkjenning';

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((categories) => {
        if (mounted) {
          setCategoryColors(
            Object.fromEntries(categories.map((category) => [category.name, category.color]))
          );
        }
      })
      .catch((error) => console.error('Kunne ikke laste kategorier', error));
    return () => {
      mounted = false;
    };
  }, []);

  const tabs = useMemo(
    () =>
      TABS.map((tab) => ({
        key: tab.key,
        label: tab.label,
        count:
          tab.key === 'godkjenning' && !approvals.loading ? approvals.approvals.length : undefined,
      })),
    [approvals.loading, approvals.approvals.length]
  );

  return (
    <PageLayout
      title="Regisjef"
      description="Godkjenn innsendte timer, følg med på registatus og gi regi til beboere."
    >
      <SectionTabs
        label="Regisjef"
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => navigate(TABS.find((tab) => tab.key === key)!.path)}
      />

      <div role="tabpanel" aria-label={TABS.find((tab) => tab.key === activeTab)?.label}>
        {activeTab === 'godkjenning' && (
          <WorkApprovalList {...approvals} categoryColors={categoryColors} />
        )}
        {activeTab === 'registatus' && <Registatus />}
        {activeTab === 'gi-regi' && (
          <Card>
            <GrantRegiForm />
          </Card>
        )}
        {activeTab === 'logg' && <RegiLogsPanel categoryColors={categoryColors} />}
      </div>
    </PageLayout>
  );
};

export default WorkManagerPage;
