import { z } from 'zod';

/** The API contract. Every value read from storage or a form is parsed through these schemas. */

export const SKILLS = ['frontend', 'backend', 'qa', 'design'] as const;
export const SkillSchema = z.enum(SKILLS);
export type Skill = z.infer<typeof SkillSchema>;

/** Highest priority first; the index is the rank used when ordering work. */
export const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export const PrioritySchema = z.enum(PRIORITIES);
export type Priority = z.infer<typeof PrioritySchema>;

const id = z.string().min(1).max(64);
/** Numbers from form inputs: blank or non-numeric values get a readable message. */
const num = () => z.number({ error: 'Enter a number' });

export const SprintSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(60, 'Use at most 60 characters'),
  workingDays: num().int('Whole days only').min(1, 'At least 1 day').max(20, 'At most 20 days'),
});
export type Sprint = z.infer<typeof SprintSchema>;

export const MemberInputSchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(60, 'Use at most 60 characters'),
  skill: SkillSchema,
  hoursPerDay: num().min(1, 'At least 1 hour').max(12, 'At most 12 hours'),
  focusFactor: num().min(0.3, 'At least 30%').max(1, 'At most 100%'),
  ptoDays: num().int('Whole days only').min(0, 'Cannot be negative').max(20, 'At most 20 days'),
  onCallDays: num().int('Whole days only').min(0, 'Cannot be negative').max(20, 'At most 20 days'),
});
export type MemberInput = z.infer<typeof MemberInputSchema>;

export const MemberSchema = MemberInputSchema.extend({ id });
export type Member = z.infer<typeof MemberSchema>;

export const WorkItemInputSchema = z.object({
  title: z.string().trim().min(3, 'Use at least 3 characters').max(120, 'Use at most 120 characters'),
  estimateHours: num().min(1, 'At least 1 hour').max(80, 'Split items larger than 80 hours'),
  priority: PrioritySchema,
  skill: SkillSchema,
  dependsOn: z.array(id).max(10, 'At most 10 dependencies'),
});
export type WorkItemInput = z.infer<typeof WorkItemInputSchema>;

export const WorkItemSchema = WorkItemInputSchema.extend({ id });
export type WorkItem = z.infer<typeof WorkItemSchema>;

export const WORKSPACE_VERSION = 2;

export const WorkspaceSchema = z.object({
  version: z.literal(WORKSPACE_VERSION),
  sprint: SprintSchema,
  members: z.array(MemberSchema).max(50),
  items: z.array(WorkItemSchema).max(500),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;
