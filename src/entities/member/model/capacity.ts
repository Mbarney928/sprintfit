import type { Member, Sprint } from '@/shared/api';

/** Share of an on-call day still available for planned work. */
export const ON_CALL_AVAILABILITY = 0.5;

/**
 * Plannable hours for a member this sprint:
 * (working days − PTO − half of each on-call day) × hours per day × focus factor.
 * Focus factor accounts for meetings, reviews and interruptions. Rounded down to 0.5h.
 */
export function memberCapacity(member: Member, sprint: Sprint): number {
  const availableDays = Math.max(0, sprint.workingDays - member.ptoDays - member.onCallDays * (1 - ON_CALL_AVAILABILITY));
  const hours = availableDays * member.hoursPerDay * member.focusFactor;
  return Math.floor(hours * 2) / 2;
}
