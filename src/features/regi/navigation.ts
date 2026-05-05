import type { FeatureNavItem, PermissionCheck } from '../../shared/types/feature';
import { canApproveWork } from './permissions';
import { REGI_PATHS } from './paths';
import { TASK_PATHS } from '../tasks/paths';

const canAccessRegiManager: PermissionCheck = ({ user }) => canApproveWork(user?.role);

export const regiNavigation: FeatureNavItem[] = [
  {
    key: 'regi',
    label: 'Regi',
    children: [
      {
        key: 'regi-tasks',
        label: 'Oppgaver',
        to: TASK_PATHS.TASKS,
      },
      {
        key: 'my-regi',
        label: 'Min regi',
        to: REGI_PATHS.REGI,
      },
      {
        key: 'regi-manager',
        label: 'Regisjef',
        to: REGI_PATHS.REGISJEF,
        canAccess: canAccessRegiManager,
      },
      {
        key: 'regi-logs',
        label: 'Regilogger',
        to: REGI_PATHS.REGILOGS,
        canAccess: canAccessRegiManager,
      },
    ],
  },
];
