import type { Priority, Skill } from '@/shared/api';

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Skill as it reads mid-sentence: "needs 10h of QA work". */
export const SKILL_NOUN: Record<Skill, string> = {
  frontend: 'frontend',
  backend: 'backend',
  qa: 'QA',
  design: 'design',
};

export const SKILL_LABEL: Record<Skill, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  qa: 'QA',
  design: 'Design',
};
