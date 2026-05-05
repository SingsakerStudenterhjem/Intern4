import { alcoholNavigation } from './alcohol/navigation';
import { helgaNavigation } from './helga/navigation';
import { receptionNavigation } from './reception/navigation';
import { regiNavigation } from './regi/navigation';
import { residentNavigation } from './residents/navigation';
import { shiftNavigation } from './shifts/navigation';
import { taskNavigation } from './tasks/navigation';
import { userNavigation } from './users/navigation';
import { vervNavigation } from './verv/navigation';
import { wineCellarNavigation } from './wine-cellar/navigation';

export const featureNavigation = [
  ...taskNavigation,
  ...residentNavigation,
  ...shiftNavigation,
  ...regiNavigation,
  ...vervNavigation,
  ...alcoholNavigation,
  ...wineCellarNavigation,
  ...helgaNavigation,
  ...userNavigation,
  ...receptionNavigation,
];
