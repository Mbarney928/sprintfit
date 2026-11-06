import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { Skeleton } from '../Skeleton/Skeleton';
import { Card } from './Card';

const meta = {
  title: 'Shared/Card',
  component: Card,
  args: {
    title: 'Sprint settings',
    description: 'Working days drive every capacity number.',
    children: <p>Card content goes here.</p>,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: (
      <Button size="sm" variant="secondary">
        Add member
      </Button>
    ),
  },
};
export const Loading: Story = {
  args: { children: <Skeleton height="4rem" /> },
};
export const Empty: Story = {
  args: { children: <EmptyState title="No team members yet" description="Add people to see capacity." /> },
};
