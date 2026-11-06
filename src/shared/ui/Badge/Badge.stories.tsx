import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  args: { children: 'Neutral' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Info: Story = { args: { tone: 'info', children: 'Info' } };
export const Success: Story = { args: { tone: 'success', icon: '✓', children: 'On track' } };
export const Warning: Story = { args: { tone: 'warning', icon: '⚠', children: 'Skill gap' } };
export const Critical: Story = { args: { tone: 'critical', icon: '⛔', children: 'Dependency cycle' } };
