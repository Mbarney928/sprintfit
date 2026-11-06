import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  args: { title: 'Backlog', description: 'Estimates, priorities and dependencies feed the plan.' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = { args: { actions: <Button>Add item</Button> } };
