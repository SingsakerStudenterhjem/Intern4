import { getRequiredRegiHoursForRole } from '../../app/constants/regiRequirements';
import { RegiLogWithId } from '../../shared/types/regi';
import { getSemesterStart } from '../../shared/utils/semester';

export type RegiSummary = {
  approved: number;
  pending: number;
  required: number;
  remaining: number;
};

// Only work performed this semester counts towards this semester's requirement.
export const summarizeSemesterRegi = (
  logs: RegiLogWithId[],
  role: string | undefined,
  now: Date = new Date()
): RegiSummary => {
  const start = getSemesterStart(now);
  const thisSemester = logs.filter((log) => log.date >= start);
  const sum = (status: RegiLogWithId['status']) =>
    thisSemester
      .filter((log) => log.status === status)
      .reduce((total, log) => total + log.hours, 0);

  const approved = sum('approved');
  const required = getRequiredRegiHoursForRole(role);

  return {
    approved,
    pending: sum('pending'),
    required,
    remaining: Math.max(required - approved, 0),
  };
};
