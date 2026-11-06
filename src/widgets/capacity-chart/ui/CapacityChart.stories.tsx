import type { Meta, StoryObj } from '@storybook/react-vite';

import { planSprint } from '@/features/plan-sprint';
import { createSeedWorkspace } from '@/shared/api';

import { CapacityChart } from './CapacityChart';

const demo = planSprint(createSeedWorkspace());

const meta = {
  title: 'Widgets/CapacityChart',
  component: CapacityChart,
  args: { loads: demo.loads },
} satisfies Meta<typeof CapacityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DemoTeam: Story = {};
export const Empty: Story = { args: { loads: [] } };
export const SinglePerson: Story = { args: { loads: demo.loads.slice(0, 1) } };
